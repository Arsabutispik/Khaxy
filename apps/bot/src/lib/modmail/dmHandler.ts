import {
  Message,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  ChannelType,
  Guild,
} from "discord.js";
import { getThreadsByUser, ModMailStatus, getOrCreateGuild, getBlacklistedUser } from "@repo/database";
import { relayToThread, setupNewThread } from "./threadUtils.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";

dayjs.extend(relativeTime);

export async function handleUserDM(message: Message) {
  if (message.channel.type !== ChannelType.DM) return;
  const client = message.client;
  const threads = await getThreadsByUser(message.author.id);
  const openThreads = threads.filter((thread) => thread.status === ModMailStatus.OPEN);

  if (openThreads.length > 0) {
    return relayToThread(message, openThreads[0]);
  }

  // Find valid shared guilds
  const sharedGuilds = client.guilds.cache.filter(async (guild) => {
    const config = await getOrCreateGuild(guild.id);
    return guild.members.cache.has(message.author.id) && !!config?.modMailChannelId;
  });

  if (sharedGuilds.size === 0) return;

  if (sharedGuilds.size === 1) {
    const guild = sharedGuilds.first()!;
    return handleSingleGuildFlow(message, guild);
  }

  // Multi-guild selection
  const menu = new StringSelectMenuBuilder()
    .setCustomId("guild_selection")
    .setPlaceholder("Select a server to open a mod mail thread")
    .addOptions(sharedGuilds.map((g) => ({ label: g.name, value: g.id })));

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
  const msg = await message.channel.send({
    content: "Select a server to open a mod mail thread",
    components: [row],
  });

  try {
    const interaction = await msg.awaitMessageComponent({
      filter: (i: StringSelectMenuInteraction) => i.user.id === message.author.id,
      time: 60000,
      componentType: ComponentType.StringSelect,
    });
    await interaction.deferUpdate();
    const selectedGuild = client.guilds.cache.get(interaction.values[0]);
    if (selectedGuild) await setupNewThread(message, selectedGuild, msg);
  } catch {
    await msg.edit({ content: "Selection timed out.", components: [] });
  }
}

async function handleSingleGuildFlow(message: Message, guild: Guild) {
  const config = await getOrCreateGuild(guild.id);
  const t = message.client.i18next.getFixedT(config.language, "events", "messageCreate.modMail");

  // Blacklist check
  const blacklist = await getBlacklistedUser(guild.id, message.author.id);
  if (blacklist) {
    return message.reply(
      t(($) => $.blacklisted, {
        guild: guild.name,
        reason: blacklist.reason,
        expires: blacklist.expiresAt ? dayjs(blacklist.expiresAt).fromNow() : t(($) => $.never),
      }),
    );
  }

  // Member check
  const member = await guild.members.fetch(message.author.id).catch(() => null);
  if (!member) return message.reply(t(($) => $.notMember));

  // Confirmation Prompt
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("modmail_confirm").setLabel(t(($) => $.confirm)).setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("modmail_cancel").setLabel(t(($) => $.cancel)).setStyle(ButtonStyle.Danger),
  );

  const confirmEmbed = new EmbedBuilder()
    .setTitle(t(($) => $.confirmTitle))
    .setDescription(t(($) => $.confirmDescription, { guild: guild.name }))
    .setColor("Blurple");

  const prompt = await message.reply({ embeds: [confirmEmbed], components: [row] });

  try {
    const confirmation = await prompt.awaitMessageComponent({
      filter: (i) => i.user.id === message.author.id,
      time: 30000,
      componentType: ComponentType.Button,
    });

    await confirmation.deferUpdate();
    if (confirmation.customId === "modmail_cancel") {
      return prompt.edit({
        embeds: [new EmbedBuilder().setTitle(t(($) => $.cancelledTitle)).setColor("Red")],
        components: [],
      });
    }

    await setupNewThread(message, guild, prompt);
  } catch {
    await prompt.edit({ content: t(($) => $.timeout), components: [], embeds: [] });
  }
}
