import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  MessageFlagsBitField,
  StringSelectMenuBuilder,
} from "discord.js";
import { getGuildConfig, updateGuildConfig } from "@database";
import { toStringId } from "@utils";
import { waitForMessageComponent, dynamicChannel } from "./utils.js";

export async function logConfig(interaction: ChatInputCommandInteraction<"cached">) {
  const client = interaction.client;
  const guildConfig = await getGuildConfig(interaction.guildId!);
  if (!guildConfig) {
    await interaction.reply({
      content: "No guild config found. Running a simple command should create one.",
      flags: MessageFlagsBitField.Flags.Ephemeral,
    });
    return;
  }

  const t = client.i18next.getFixedT(guildConfig.language, null, "log_config");
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("log_config")
    .setMinValues(1)
    .setMaxValues(1)
    .setOptions([
      {
        label: t("message_logs_channel_id.label"),
        value: "message_logs_channel_id",
        description: t("message_logs_channel_id.description"),
        emoji: "📜",
      },
      {
        label: t("guild_member_logs_channel_id.label"),
        value: "guild_member_logs_channel_id",
        description: t("guild_member_logs_channel_id.description"),
        emoji: "👥",
      },
      {
        label: t("guild_logs_channel_id.label"),
        value: "guild_logs_channel_id",
        description: t("guild_logs_channel_id.description"),
        emoji: "📋",
      },
      {
        label: t("voice_logs_channel_id.label"),
        value: "voice_logs_channel_id",
        description: t("voice_logs_channel_id.description"),
        emoji: "🔊",
      },
      {
        label: t("channel_logs_channel_id.label"),
        value: "channel_logs_channel_id",
        description: t("channel_logs_channel_id.description"),
        emoji: "📂",
      },
      {
        label: t("emoji_logs_channel_id.label"),
        value: "emoji_logs_channel_id",
        description: t("emoji_logs_channel_id.description"),
        emoji: "🗳️",
      },
      {
        label: t("role_logs_channel_id.label"),
        value: "role_logs_channel_id",
        description: t("role_logs_channel_id.description"),
        emoji: "🖍️",
      },
      {
        label: t("sticker_logs_channel_id.label"),
        value: "sticker_logs_channel_id",
        description: t("sticker_logs_channel_id.description"),
        emoji: "🏷️",
      },
      {
        label: t("event_logs_channel_id.label"),
        value: "event_logs_channel_id",
        description: t("event_logs_channel_id.description"),
        emoji: "📅",
      },
      {
        label: t("invite_logs_channel_id.label"),
        value: "invite_logs_channel_id",
        description: t("invite_logs_channel_id.description"),
        emoji: "⛓️",
      },
      {
        label: t("poll_logs_channel_id.label"),
        value: "poll_logs_channel_id",
        description: t("poll_logs_channel_id.description"),
        emoji: "📊",
      },
      {
        label: t("stage_logs_channel_id.label"),
        value: "stage_logs_channel_id",
        description: t("stage_logs_channel_id.description"),
        emoji: "🎙️",
      },
      {
        label: t("soundboard_logs_channel_id.label"),
        value: "soundboard_logs_channel_id",
        description: t("soundboard_logs_channel_id.description"),
        emoji: "🎶",
      },
      {
        label: t("thread_logs_channel_id.label"),
        value: "thread_logs_channel_id",
        description: t("thread_logs_channel_id.description"),
        emoji: "🧵",
      },
      {
        label: t("webhook_logs_channel_id.label"),
        value: "webhook_logs_channel_id",
        description: t("webhook_logs_channel_id.description"),
        emoji: "🔗",
      },
    ]);
  const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(selectMenu);
  const messageComponent = await waitForMessageComponent(interaction, actionRow, t, "log_config");
  if (!messageComponent) return;
  switch (messageComponent.values[0]) {
    case "message_logs_channel_id":
      client.webhooks.delete(toStringId(guildConfig.message_logs_webhook_id));
      await updateGuildConfig(interaction.guildId, { message_logs_webhook_id: null });
      await dynamicChannel("message_logs_channel_id", messageComponent, guildConfig, t);
      break;
    case "guild_member_logs_channel_id":
      client.webhooks.delete(toStringId(guildConfig.guild_member_logs_webhook_id));
      await updateGuildConfig(interaction.guildId, { guild_member_logs_webhook_id: null });
      await dynamicChannel("guild_member_logs_channel_id", messageComponent, guildConfig, t);
      break;
    case "guild_logs_channel_id":
      client.webhooks.delete(toStringId(guildConfig.guild_logs_webhook_id));
      await updateGuildConfig(interaction.guildId, { guild_logs_webhook_id: null });
      await dynamicChannel("guild_logs_channel_id", messageComponent, guildConfig, t);
      break;
    case "voice_logs_channel_id":
      client.webhooks.delete(toStringId(guildConfig.voice_logs_webhook_id));
      await updateGuildConfig(interaction.guildId, { voice_logs_webhook_id: null });
      await dynamicChannel("voice_logs_channel_id", messageComponent, guildConfig, t);
      break;
    case "channel_logs_channel_id":
      client.webhooks.delete(toStringId(guildConfig.channel_logs_webhook_id));
      await updateGuildConfig(interaction.guildId, { channel_logs_webhook_id: null });
      await dynamicChannel("channel_logs_channel_id", messageComponent, guildConfig, t);
      break;
    case "emoji_logs_channel_id":
      client.webhooks.delete(toStringId(guildConfig.emoji_logs_webhook_id));
      await updateGuildConfig(interaction.guildId, { emoji_logs_webhook_id: null });
      await dynamicChannel("emoji_logs_channel_id", messageComponent, guildConfig, t);
      break;
    case "role_logs_channel_id":
      client.webhooks.delete(toStringId(guildConfig.role_logs_webhook_id));
      await updateGuildConfig(interaction.guildId, { role_logs_webhook_id: null });
      await dynamicChannel("role_logs_channel_id", messageComponent, guildConfig, t);
      break;
    case "sticker_logs_channel_id":
      client.webhooks.delete(toStringId(guildConfig.sticker_logs_webhook_id));
      await updateGuildConfig(interaction.guildId, { sticker_logs_webhook_id: null });
      await dynamicChannel("sticker_logs_channel_id", messageComponent, guildConfig, t);
      break;
    case "event_logs_channel_id":
      client.webhooks.delete(toStringId(guildConfig.event_logs_webhook_id));
      await updateGuildConfig(interaction.guildId, { event_logs_webhook_id: null });
      await dynamicChannel("event_logs_channel_id", messageComponent, guildConfig, t);
      break;
    case "invite_logs_channel_id":
      client.webhooks.delete(toStringId(guildConfig.invite_logs_webhook_id));
      await updateGuildConfig(interaction.guildId, { invite_logs_webhook_id: null });
      await dynamicChannel("invite_logs_channel_id", messageComponent, guildConfig, t);
      break;
    case "poll_logs_channel_id":
      client.webhooks.delete(toStringId(guildConfig.poll_logs_webhook_id));
      await updateGuildConfig(interaction.guildId, { poll_logs_webhook_id: null });
      await dynamicChannel("poll_logs_channel_id", messageComponent, guildConfig, t);
      break;
    case "stage_logs_channel_id":
      client.webhooks.delete(toStringId(guildConfig.stage_logs_webhook_id));
      await updateGuildConfig(interaction.guildId, { stage_logs_webhook_id: null });
      await dynamicChannel("stage_logs_channel_id", messageComponent, guildConfig, t);
      break;
    case "soundboard_logs_channel_id":
      client.webhooks.delete(toStringId(guildConfig.soundboard_logs_webhook_id));
      await updateGuildConfig(interaction.guildId, { soundboard_logs_webhook_id: null });
      await dynamicChannel("soundboard_logs_channel_id", messageComponent, guildConfig, t);
      break;
    case "thread_logs_channel_id":
      client.webhooks.delete(toStringId(guildConfig.thread_logs_webhook_id));
      await updateGuildConfig(interaction.guildId, { thread_logs_webhook_id: null });
      await dynamicChannel("thread_logs_channel_id", messageComponent, guildConfig, t);
      break;
    case "webhook_logs_channel_id":
      client.webhooks.delete(toStringId(guildConfig.webhook_logs_webhook_id));
      await updateGuildConfig(interaction.guildId, { webhook_logs_webhook_id: null });
      await dynamicChannel("webhook_logs_channel_id", messageComponent, guildConfig, t);
      break;
  }
}
