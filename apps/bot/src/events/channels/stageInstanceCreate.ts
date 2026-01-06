import { EventBase } from "@types";
import { AuditLogEvent, ChannelType, EmbedBuilder, Events } from "discord.js";
import { getGuildConfig } from "src/database/index.js";
import { returnWebhook, toStringId, WebhookType } from "@utils";
import { logger } from "@lib";

export default {
  name: Events.StageInstanceCreate,
  once: false,
  async execute(stageInstance) {
    const guildConfig = await getGuildConfig(stageInstance.guild?.id);
    if (!guildConfig) return;
    const t = stageInstance.client.i18next.getFixedT(guildConfig.language, "events", "stageInstanceCreate");
    if (!guildConfig.stage_logs_channel_id) return;
    const logChannel = stageInstance.guild?.channels.cache.get(toStringId(guildConfig.stage_logs_channel_id));
    if (logChannel?.type !== ChannelType.GuildText) return;
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTimestamp()
      .setTitle(t("embed.title"))
      .setDescription(
        t("embed.description", {
          stage: stageInstance,
        }),
      );
    const auditLogs = await stageInstance
      .guild!.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.StageInstanceCreate,
      })
      .catch(() => null);
    const logEntry = auditLogs?.entries.first();
    if (logEntry?.target.id === stageInstance.id) {
      embed.setFooter({
        text: logEntry?.executor?.username || t("unknown_executor"),
        iconURL: logEntry.executor?.displayAvatarURL(),
      });
    }
    const webhook = await returnWebhook(stageInstance.client, logChannel, stageInstance.guild!.id, {
      id: guildConfig.stage_logs_webhook_id,
      type: WebhookType.STAGE_LOGS,
    });
    await webhook.send({ embeds: [embed] }).catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send stageInstanceCreate embed in ${stageInstance.guild?.name} (${stageInstance.guild?.id})`,
        channelId: logChannel.id,
      });
    });
  },
} satisfies EventBase<Events.StageInstanceCreate>;
