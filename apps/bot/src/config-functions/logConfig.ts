import { ActionRowBuilder, ChatInputCommandInteraction, StringSelectMenuBuilder } from "discord.js";
import { GuildWithLogs, updateGuildLogs } from "@repo/database";
import { waitForMessageComponent, dynamicChannel } from "./utils.js";

export async function logConfig(interaction: ChatInputCommandInteraction<"cached">, guildData: GuildWithLogs) {
  const client = interaction.client;

  const t = client.i18next.getFixedT(guildData.language, null, "logConfig");
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("logConfig")
    .setMinValues(1)
    .setMaxValues(1)
    .setOptions([
      {
        label: t(($) => $.messageLogsChannelId.label),
        value: "messageLogsChannelId",
        description: t(($) => $.messageLogsChannelId.description),
        emoji: "📜",
      },
      {
        label: t(($) => $.guildMemberLogsChannelId.label),
        value: "guildMemberLogsChannelId",
        description: t(($) => $.guildMemberLogsChannelId.description),
        emoji: "👥",
      },
      {
        label: t(($) => $.guildLogsChannelId.label),
        value: "guildLogsChannelId",
        description: t(($) => $.guildLogsChannelId.description),
        emoji: "📋",
      },
      {
        label: t(($) => $.voiceLogsChannelId.label),
        value: "voiceLogsChannelId",
        description: t(($) => $.voiceLogsChannelId.description),
        emoji: "🔊",
      },
      {
        label: t(($) => $.channelLogsChannelId.label),
        value: "channelLogsChannelId",
        description: t(($) => $.channelLogsChannelId.description),
        emoji: "📂",
      },
      {
        label: t(($) => $.emojiLogsChannelId.label),
        value: "emojiLogsChannelId",
        description: t(($) => $.emojiLogsChannelId.description),
        emoji: "🗳️",
      },
      {
        label: t(($) => $.roleLogsChannelId.label),
        value: "roleLogsChannelId",
        description: t(($) => $.roleLogsChannelId.description),
        emoji: "🖍️",
      },
      {
        label: t(($) => $.stickerLogsChannelId.label),
        value: "stickerLogsChannelId",
        description: t(($) => $.stickerLogsChannelId.description),
        emoji: "🏷️",
      },
      {
        label: t(($) => $.eventLogsChannelId.label),
        value: "eventLogsChannelId",
        description: t(($) => $.eventLogsChannelId.description),
        emoji: "📅",
      },
      {
        label: t(($) => $.inviteLogsChannelId.label),
        value: "inviteLogsChannelId",
        description: t(($) => $.inviteLogsChannelId.description),
        emoji: "⛓️",
      },
      {
        label: t(($) => $.pollLogsChannelId.label),
        value: "pollLogsChannelId",
        description: t(($) => $.pollLogsChannelId.description),
        emoji: "📊",
      },
      {
        label: t(($) => $.stageLogsChannelId.label),
        value: "stageLogsChannelId",
        description: t(($) => $.stageLogsChannelId.description),
        emoji: "🎙️",
      },
      {
        label: t(($) => $.soundboardLogsChannelId.label),
        value: "soundboardLogsChannelId",
        description: t(($) => $.soundboardLogsChannelId.description),
        emoji: "🎶",
      },
      {
        label: t(($) => $.threadLogsChannelId.label),
        value: "threadLogsChannelId",
        description: t(($) => $.threadLogsChannelId.description),
        emoji: "🧵",
      },
      {
        label: t(($) => $.webhookLogsChannelId.label),
        value: "webhookLogsChannelId",
        description: t(($) => $.webhookLogsChannelId.description),
        emoji: "🔗",
      },
    ]);
  const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(selectMenu);
  const messageComponent = await waitForMessageComponent(interaction, actionRow, guildData.language, "logConfig");
  if (!messageComponent) return;
  switch (messageComponent.values[0]) {
    case "messageLogsChannelId":
      client.webhooks.delete(guildData.logConfig?.messageLogsWebhookId ?? "");
      await updateGuildLogs(interaction.guildId, { messageLogsWebhookId: null });
      //await dynamicChannel("messageLogsChannelId", messageComponent, guildData);
      break;
    case "guildMemberLogsChannelId":
      client.webhooks.delete(guildData.logConfig?.guildMemberLogsWebhookId ?? "");
      await updateGuildLogs(interaction.guildId, { guildMemberLogsWebhookId: null });
      //await dynamicChannel("guildMemberLogsChannelId", messageComponent, guildData);
      break;
    case "guildLogsChannelId":
      client.webhooks.delete(guildData.logConfig?.guildLogsWebhookId ?? "");
      await updateGuildLogs(interaction.guildId, { guildLogsWebhookId: null });
      //await dynamicChannel("guildLogsChannelId", messageComponent, guildData);
      break;
    case "voiceLogsChannelId":
      client.webhooks.delete(guildData.logConfig?.voiceLogsWebhookId ?? "");
      await updateGuildLogs(interaction.guildId, { voiceLogsWebhookId: null });
      //await dynamicChannel("voiceLogsChannelId", messageComponent, guildData);
      break;
    case "channelLogsChannelId":
      client.webhooks.delete(guildData.logConfig?.channelLogsWebhookId ?? "");
      await updateGuildLogs(interaction.guildId, { channelLogsWebhookId: null });
      //await dynamicChannel("channelLogsChannelId", messageComponent, guildData);
      break;
    case "emojiLogsChannelId":
      client.webhooks.delete(guildData.logConfig?.emojiLogsWebhookId ?? "");
      await updateGuildLogs(interaction.guildId, { emojiLogsWebhookId: null });
      //await dynamicChannel("emojiLogsChannelId", messageComponent, guildData);
      break;
    case "roleLogsChannelId":
      client.webhooks.delete(guildData.logConfig?.roleLogsWebhookId ?? "");
      await updateGuildLogs(interaction.guildId, { roleLogsWebhookId: null });
      //await dynamicChannel("roleLogsChannelId", messageComponent, guildData);
      break;
    case "stickerLogsChannelId":
      client.webhooks.delete(guildData.logConfig?.stickerLogsWebhookId ?? "");
      await updateGuildLogs(interaction.guildId, { stickerLogsWebhookId: null });
      //await dynamicChannel("stickerLogsChannelId", messageComponent, guildData);
      break;
    case "eventLogsChannelId":
      client.webhooks.delete(guildData.logConfig?.eventLogsWebhookId ?? "");
      await updateGuildLogs(interaction.guildId, { eventLogsWebhookId: null });
      //await dynamicChannel("eventLogsChannelId", messageComponent, guildData);
      break;
    case "inviteLogsChannelId":
      client.webhooks.delete(guildData.logConfig?.inviteLogsWebhookId ?? "");
      await updateGuildLogs(interaction.guildId, { inviteLogsWebhookId: null });
      //await dynamicChannel("inviteLogsChannelId", messageComponent, guildData);
      break;
    case "pollLogsChannelId":
      client.webhooks.delete(guildData.logConfig?.pollLogsWebhookId ?? "");
      await updateGuildLogs(interaction.guildId, { pollLogsWebhookId: null });
      //await dynamicChannel("pollLogsChannelId", messageComponent, guildData);
      break;
    case "stageLogsChannelId":
      client.webhooks.delete(guildData.logConfig?.stageLogsWebhookId ?? "");
      await updateGuildLogs(interaction.guildId, { stageLogsWebhookId: null });
      //await dynamicChannel("stageLogsChannelId", messageComponent, guildData);
      break;
    case "soundboardLogsChannelId":
      client.webhooks.delete(guildData.logConfig?.soundboardLogsWebhookId ?? "");
      await updateGuildLogs(interaction.guildId, { soundboardLogsWebhookId: null });
      //await dynamicChannel("soundboardLogsChannelId", messageComponent, guildData);
      break;
    case "threadLogsChannelId":
      client.webhooks.delete(guildData.logConfig?.threadLogsWebhookId ?? "");
      await updateGuildLogs(interaction.guildId, { threadLogsWebhookId: null });
      //await dynamicChannel("threadLogsChannelId", messageComponent, guildData);
      break;
    case "webhookLogsChannelId":
      client.webhooks.delete(guildData.logConfig?.webhookLogsWebhookId ?? "");
      await updateGuildLogs(interaction.guildId, { webhookLogsWebhookId: null });
      //await dynamicChannel("webhookLogsChannelId", messageComponent, guildData);
      break;
  }
}
