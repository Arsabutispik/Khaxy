import type { SlashCommandBase } from "@types";
import {
  ChannelType,
  InteractionContextType,
  MessageFlags,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { logger } from "@lib";
import {
  createThread,
  addMessageToThread,
  getOpenThread,
  ModMailStatus,
  ModMailAuthorType,
  ModMailSentToType,
} from "@repo/database";
export default {
  memberPermissions: [PermissionsBitField.Flags.ManageMessages],
  clientPermissions: [PermissionsBitField.Flags.ManageChannels],
  data: new SlashCommandBuilder()
    .setName("newthread")
    .setNameLocalizations({
      tr: "yeni-modmail",
    })
    .setDescription("Create a new thread for moderation messages.")
    .setDescriptionLocalizations({
      tr: "Moderatör mesajları için yeni bir kanal oluştur.",
    })
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
    .addUserOption((option) =>
      option
        .setName("user")
        .setNameLocalizations({
          tr: "kullanıcı",
        })
        .setDescription("The user to create a thread for.")
        .setDescriptionLocalizations({
          tr: "Bir kanal oluşturulacak kullanıcı.",
        })
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setNameLocalizations({
          tr: "mesaj",
        })
        .setDescription("The message to send to the user.")
        .setDescriptionLocalizations({
          tr: "Kullanıcıya gönderilecek mesaj.",
        })
        .setRequired(true),
    ),
  async execute(interaction, guildConfig) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const user = interaction.options.getUser("user", true);
    const t = interaction.client.i18next.getFixedT(guildConfig.language, "commands", "newthread");
    const member = interaction.guild.members.cache.get(user.id);
    if (!member) {
      return interaction.editReply({
        content: t(($) => $.user_not_in_guild),
      });
    }
    const modmailChannel = guildConfig.modMailChannelId
      ? interaction.guild.channels.cache.get(guildConfig.modMailChannelId)
      : undefined;
    if (!modmailChannel) {
      return interaction.editReply({
        content: t(($) => $.no_modmail_channel),
      });
    }
    if (!modmailChannel.isTextBased()) {
      return interaction.editReply({
        content: t(($) => $.modmail_channel_not_text),
      });
    }
    if (modmailChannel.parent?.id !== guildConfig.modMailParentChannelId) {
      return interaction.editReply({
        content: t(($) => $.modmail_channel_not_in_parent),
      });
    }
    const modMailThread = await getOpenThread(interaction.guildId, user.id);
    if (modMailThread) {
      return interaction.editReply({
        content: t(($) => $.thread_already_exists),
      });
    }
    const permissionOverwrites = [{ id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] }];

    if (guildConfig.staffRoleId && interaction.guild.roles.cache.has(guildConfig.staffRoleId)) {
      permissionOverwrites.push({
        id: guildConfig.staffRoleId,
        // @ts-expect-error - This is a valid permission bitfield
        allow: [PermissionsBitField.Flags.ViewChannel],
      });
    }
    const channel = await interaction.guild.channels
      .create({
        name: Math.random().toString(36).slice(2),
        parent: guildConfig.modMailParentChannelId,
        type: ChannelType.GuildText,
        topic: t(($) => $.topic, { user: user.tag }),
        permissionOverwrites: permissionOverwrites,
      })
      .catch(() => {
        interaction.editReply({
          content: t(($) => $.channel_create_failed),
        });
        return null;
      });
    if (!channel) return;
    const message = interaction.options.getString("message", true);
    let dm;
    try {
      dm = await user.send(t(($) => $.message, { message, guild: interaction.guild.name, user: interaction.user.tag }));
    } catch {
      await interaction.editReply({
        content: t(($) => $.dm_failed),
      });
      await channel.delete();
      return;
    }
    dayjs.extend(relativeTime);
    const botMessage = await channel
      .send(
        t(($) => $.initial, {
          user,
          account_age: dayjs(user.createdAt).fromNow(),
          join_date: dayjs(member.joinedAt).fromNow(),
        }),
      )
      .catch(() => {
        interaction.editReply({
          content: t(($) => $.message_send_failed),
        });
        user.send(t(($) => $.message_send_failed));
        channel.delete();
        return null;
      });
    if (!botMessage) return;
    await channel.send(
      `${t(($) => $.created_by, { user: interaction.user.tag })} \`1\` **[${interaction.user.tag}]:** ${message}`,
    );
    try {
      await createThread(interaction.guildId, user.id, channel.id, message);
      await addMessageToThread(
        channel.id,
        message,
        interaction.user.id,
        ModMailAuthorType.STAFF,
        ModMailSentToType.USER,
        dm.id,
      );
      await addMessageToThread(
        channel.id,
        botMessage.content,
        interaction.client.user.id,
        ModMailAuthorType.SYSTEM,
        ModMailSentToType.THREAD,
        botMessage.id,
      );
      await interaction.editReply({
        content: t(($) => $.thread_created, { channel: channel.toString() }),
      });
      await addMessageToThread(
        channel.id,
        t(($) => $.thread_created, { channel: channel.toString() }),
        interaction.user.id,
        ModMailAuthorType.SYSTEM,
        ModMailSentToType.THREAD,
        interaction.id,
      );
    } catch (e) {
      logger.log({
        level: "error",
        error: e,
        message: `Failed to insert mod mail thread into database for user ${user.id} in guild ${interaction.guildId}`,
      });
      await interaction.editReply({
        content: t(($) => $.db_error),
      });
      await user.send(t(($) => $.db_error));
      await channel.delete();
    }
  },
} as SlashCommandBase;
