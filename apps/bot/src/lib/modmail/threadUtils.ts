import { Message, ChannelType, PermissionsBitField, EmbedBuilder, Guild, TextChannel } from "discord.js";
import {
  getOrCreateGuild,
  createThread,
  addMessageToThread,
  cancelScheduledClose,
  ModMailAuthorType,
  ModMailSentToType,
  ModMailThread,
} from "@repo/database";
import { logger } from "@lib";
import dayjs from "dayjs";

export async function setupNewThread(message: Message, guild: Guild, promptToEdit: Message) {
  const config = await getOrCreateGuild(guild.id);
  const t = message.client.i18next.getFixedT(config.language, "events", "messageCreate.modMail");
  const member = await guild.members.fetch(message.author.id);

  const parent = guild.channels.cache.get(config.modMailParentChannelId!);
  if (!parent) return message.reply(t(($) => $.parentChannelMissing));

  const overwrites: { id: string; deny?: bigint[]; allow?: bigint[] }[] = [
    { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
  ];
  if (config.staffRoleId && guild.roles.cache.has(config.staffRoleId)) {
    overwrites.push({ id: config.staffRoleId, allow: [PermissionsBitField.Flags.ViewChannel] });
  }

  const channel = await guild.channels.create({
    name: Math.random().toString(36).slice(2),
    parent: parent.id,
    type: ChannelType.GuildText,
    topic: t(($) => $.topic, { user: message.author.tag }),
    permissionOverwrites: overwrites,
  });

  const content = `${message.content}\n${message.attachments?.map((a) => a.url).join("\n")}`;

  try {
    // FIX: Using botMsg to get the ID for the database log
    const botMsg = await channel.send(
      t(($) => $.initial, {
        user: message.author,
        account_age: dayjs(message.author.createdAt).fromNow(),
        join_date: dayjs(member.joinedAt).fromNow(),
      }),
    );

    await createThread(guild.id, message.author.id, channel.id, content);

    // Log the user's initial message
    await addMessageToThread(
      channel.id,
      content,
      message.author.id,
      ModMailAuthorType.USER,
      ModMailSentToType.THREAD,
      message.id,
    );

    // Log the bot's system message using botMsg.id
    await addMessageToThread(
      channel.id,
      config.modMailMessage,
      message.client.user.id,
      ModMailAuthorType.SYSTEM,
      ModMailSentToType.USER,
      botMsg.id,
    );

    await promptToEdit.edit({
      content: config.modMailMessage,
      embeds: [new EmbedBuilder().setTitle(t(($) => $.confirmTitle)).setColor("Green")],
      components: [],
    });

    await channel.send(`**[${message.author.tag}]**: ${content}`);
  } catch (e) {
    logger.error({ message: "Error initializing thread", error: e });
    await message.reply(t(($) => $.errorInserting));
  }
}

export async function relayToThread(message: Message, thread: ModMailThread) {
  const config = await getOrCreateGuild(thread.guildId);
  const guild = message.client.guilds.cache.get(thread.guildId);
  const channel = guild?.channels.cache.get(thread.channelId);

  if (!channel || !channel.isTextBased()) return message.reply("Channel unavailable.");

  const t = message.client.i18next.getFixedT(config.language, "events", "messageCreate.modMail");

  if (thread.scheduledCloseAt) {
    await (channel as TextChannel).send(
      t(($) => $.reopened, { user: message.author.tag, closer: thread.closerId ? `<@${thread.closerId}>` : "unknown" }),
    );
    await cancelScheduledClose(channel.id);
  }

  const content = `${message.content}\n${message.attachments?.map((a) => a.url).join("\n")}`;
  await (channel as TextChannel).send(`**[${message.author.tag}]**: ${content}`);
  await addMessageToThread(
    channel.id,
    content,
    message.author.id,
    ModMailAuthorType.USER,
    ModMailSentToType.THREAD,
    message.id,
  );
  await message.react("✅");
}
