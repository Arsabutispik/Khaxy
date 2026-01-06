import { StageInstance, ChannelType, EmbedBuilder, AuditLogEvent } from "discord.js";
import { GuildWithLogs } from "@repo/database";
import { returnWebhook, WebhookType } from "@utils";
import { logger } from "@lib";

export async function logStageInstanceUpdate(oldStageInstance: StageInstance | null, newStageInstance: StageInstance, guildConfig: GuildWithLogs) {
  if (!newStageInstance.guild) return;
  const t = newStageInstance.client.i18next.getFixedT(guildConfig.language, "events", "stageInstanceUpdate");
  if (!guildConfig.logConfig?.stageLogsChannelId) return;
  const logChannel = newStageInstance.guild.channels.cache.get(guildConfig.logConfig.stageLogsChannelId);
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
  const webhook = await returnWebhook(newStageInstance.client, logChannel, newStageInstance.guild.id, guildConfig, {
    id: guildConfig.logConfig.stageLogsWebhookId,
    type: WebhookType.STAGE_LOGS,
  });
  if(webhook) {
    await webhook.send({ embeds }).catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send stageInstanceUpdate embed in ${newStageInstance.guild?.name} (${newStageInstance.guild?.id})`,
        channelId: logChannel.id,
      });
    });
  }
}