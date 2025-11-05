import {
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  ChatInputCommandInteraction,
  ComponentType,
  MessageComponentInteraction,
  MessageFlagsBitField,
  ModalBuilder,
  ModalSubmitInteraction,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import type { guilds as Guilds } from "@prisma/client";
import type { TFunction } from "i18next";
import { toStringId, trimString } from "@utils";
import { getGuildConfig, updateGuildConfig } from "@database";

export async function registerConfig(interaction: ChatInputCommandInteraction<"cached">) {
  const client = interaction.client;
  const guildConfig = await getGuildConfig(interaction.guildId);
  if (!guildConfig) {
    await interaction.reply({
      content: "Unexpected database error. This should not have happened. Please contact the bot developers",
      flags: MessageFlagsBitField.Flags.Ephemeral,
    });
    return;
  }
  const t = client.i18next.getFixedT(guildConfig.language, null, "register_config");
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("register_config")
    .setMinValues(1)
    .setMaxValues(1)
    .setOptions([
      {
        label: t("register_join_channel_id.label"),
        value: "register_join_channel",
        description: t("register_join_channel_id.description"),
        emoji: "📝",
      },
      {
        label: t("register_channel_id.label"),
        value: "register_channel",
        description: t("register_channel_id.description"),
        emoji: "📝",
      },
      {
        label: t("register_join_message.label"),
        value: "register_join_message",
        description: t("register_join_message.description"),
        emoji: "📝",
      },
      {
        label: t("register_clear_channel.label"),
        value: "register_clear_channel",
        description: t("register_clear_channel.description"),
        emoji: "📝",
      },
    ]);
  const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(selectMenu);
  const reply = await interaction.reply({
    content: t("initial"),
    components: [actionRow],
    flags: MessageFlagsBitField.Flags.Ephemeral,
    withResponse: true,
  });
  const filter = (i: MessageComponentInteraction) =>
    i.user.id === interaction.user.id && i.customId === "register_config";
  let messageComponent;
  try {
    messageComponent = await reply.resource!.message!.awaitMessageComponent({
      filter,
      componentType: ComponentType.StringSelect,
      time: 1000 * 60 * 5,
    });
  } catch {
    await reply.resource!.message!.edit({ content: t("timeout"), components: [] }).catch(() => null);
    return;
  }
  switch (messageComponent.values[0]) {
    case "register_join_channel":
      await dynamicChannel("register_join_channel_id", messageComponent, guildConfig, t);
      break;
    case "register_channel":
      await dynamicChannel("register_channel_id", messageComponent, guildConfig, t);
      break;
    case "register_join_message":
      await dynamicMessage("register_join_message", messageComponent, guildConfig, t);
      break;
    case "register_clear_channel":
      await registerClearChannel(messageComponent, guildConfig, t);
      break;
  }
}
export async function dynamicChannel(
  channel:
    | "register_join_channel_id"
    | "register_channel_id"
    | "join_channel_id"
    | "leave_channel_id"
    | "mod_logs_channel_id"
    | "mod_mail_channel_id"
    | "bump_leaderboard_channel_id"
    | "message_logs_channel_id"
    | "guild_member_logs_channel_id"
    | "guild_logs_channel_id"
    | "voice_logs_channel_id"
    | "channel_logs_channel_id"
    | "emoji_logs_channel_id"
    | "role_logs_channel_id"
    | "sticker_logs_channel_id"
    | "event_logs_channel_id"
    | "invite_logs_channel_id"
    | "poll_logs_channel_id"
    | "stage_logs_channel_id"
    | "soundboard_logs_channel_id"
    | "thread_logs_channel_id"
    | "webhook_logs_channel_id",
  interaction: StringSelectMenuInteraction<"cached">,
  data: Guilds,
  t: TFunction,
) {
  await interaction.deferUpdate();
  const selectMenu = new ChannelSelectMenuBuilder()
    .setCustomId(channel)
    .setMaxValues(1)
    .setMinValues(0)
    .setChannelTypes(ChannelType.GuildText);
  if (data[channel]) {
    selectMenu.setDefaultChannels(toStringId(data[channel]));
  }
  const actionRow = new ActionRowBuilder<ChannelSelectMenuBuilder>().setComponents(selectMenu);
  const result = await interaction.editReply({
    content: t("channel_initial"),
    components: [actionRow],
  });
  const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id && i.customId === channel;
  let messageComponent;
  try {
    messageComponent = await result.awaitMessageComponent({
      filter,
      componentType: ComponentType.ChannelSelect,
      time: 1000 * 60 * 5,
    });
  } catch {
    await result.edit({
      content: t("timeout"),
      components: [],
    });
    return;
  }
  await messageComponent.deferUpdate();
  if (messageComponent.values.length === 0) {
    await updateGuildConfig(messageComponent.guildId, {
      [channel]: null,
    });
    await messageComponent.editReply({
      content: t(`${channel}.unset`),
      components: [],
    });
  } else {
    await updateGuildConfig(messageComponent.guildId, {
      [channel]: messageComponent.values[0],
    });
    await messageComponent.editReply({
      content: t(`${channel}.set`, {
        channel: messageComponent.guild.channels.cache.get(messageComponent.values[0])!.toString(),
      }),
      components: [],
    });
  }
}

export async function dynamicMessage(
  message: "register_join_message" | "join_message" | "leave_message" | "mod_mail_message",
  interaction: StringSelectMenuInteraction<"cached">,
  data: Guilds,
  t: TFunction,
) {
  const textComponent = new TextInputBuilder()
    .setCustomId(message)
    .setMaxLength(1500)
    .setLabel(t(`${message}.label`))
    .setRequired(false)
    .setStyle(TextInputStyle.Paragraph);
  if (data[message]) {
    textComponent.setPlaceholder(trimString(data[message], 97));
  }
  const actionRow = new ActionRowBuilder<TextInputBuilder>().setComponents(textComponent);
  const modal = new ModalBuilder()
    .setCustomId(message)
    .setTitle(t(`${message}.title`))
    .setComponents(actionRow);
  await interaction.showModal(modal);
  const filter = (i: ModalSubmitInteraction) => i.user.id === interaction.user.id && i.customId === message;
  let messageComponent;
  try {
    messageComponent = await interaction.awaitModalSubmit({
      filter,
      time: 1000 * 60 * 5,
    });
  } catch {
    await interaction.editReply({
      content: t("timeout"),
      components: [],
    });
    return;
  }
  await messageComponent.deferUpdate();
  const defaultValueMap = {
    mod_mail_message: "Thank you for your message! Our mod team will reply to you here as soon as possible.",
    [message]: null,
  };
  const input = messageComponent.fields.getTextInputValue(message);
  const defaults = input === "" ? defaultValueMap[message] : input;
  await updateGuildConfig(messageComponent.guildId, {
    [message]: defaults,
  });
  await messageComponent.editReply({
    content: t(`${message}.set`),
    components: [],
  });
}

async function registerClearChannel(interaction: StringSelectMenuInteraction<"cached">, data: Guilds, t: TFunction) {
  await interaction.deferUpdate();
  if (data.register_channel_clear) {
    await updateGuildConfig(interaction.guildId, {
      register_channel_clear: false,
    });
    await interaction.editReply({
      content: t("register_clear_channel.unset"),
      components: [],
    });
  } else {
    await updateGuildConfig(interaction.guildId, {
      register_channel_clear: true,
    });
    await interaction.editReply({
      content: t("register_clear_channel.set"),
      components: [],
    });
  }
}
