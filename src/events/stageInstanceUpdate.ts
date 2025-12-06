import { EventBase } from "src/types/index.js";
import { AuditLogEvent, ChannelType, EmbedBuilder, Events } from "discord.js";
import { getGuildConfig } from "src/database/index.js";
import { returnWebhook, toStringId, WebhookType } from "src/utils/index.js";
import { logger } from "src/lib/index.js";

export default {
  name: Events.StageInstanceUpdate,
  once: false,
  async execute(oldStageInstance, newStageInstance) {
    const guildConfig = await getGuildConfig(newStageInstance.guild?.id);
    if (!guildConfig) return;
    const t = newStageInstance.client.i18next.getFixedT(guildConfig.language, "events", "stageInstanceUpdate");
    if (!guildConfig.stage_logs_channel_id) return;
    const logChannel = newStageInstance.guild?.channels.cache.get(toStringId(guildConfig.stage_logs_channel_id));
    if (logChannel?.type !== ChannelType.GuildText) return;
    const embed = new EmbedBuilder().setColor("Yellow").setTimestamp();
    const auditLogs = await newStageInstance
      .guild!.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.StageInstanceUpdate,
      })
      .catch(() => null);
    const embeds: Array<EmbedBuilder> = [];
    const logEntry = auditLogs?.entries.first();
    if (logEntry?.target.id === newStageInstance.id) {
      embed.setFooter({
        text: logEntry?.executor?.username || t("unknown_executor"),
        iconURL: logEntry.executor?.displayAvatarURL(),
      });
    }
    if (oldStageInstance?.topic !== newStageInstance.topic) {
      embed.setTitle(t("topic_change.embed.title")).setDescription(
        t("topic_change.embed.description", {
          stage: newStageInstance,
          old_topic: oldStageInstance?.topic,
          new_topic: newStageInstance.topic,
        }),
      );
      embeds.push(embed);
    }
    if (embeds.length === 0) return;
    const webhook = await returnWebhook(newStageInstance.client, logChannel, newStageInstance.guild!.id, {
      id: guildConfig.stage_logs_webhook_id,
      type: WebhookType.STAGE_LOGS,
    });
    await webhook.send({ embeds }).catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send stageInstanceUpdate embed in ${newStageInstance.guild?.name} (${newStageInstance.guild?.id})`,
        channelId: logChannel.id,
      });
    });
  },
} satisfies EventBase<Events.StageInstanceUpdate>;
