import { StageInstance, EmbedBuilder, ChannelType, AuditLogEvent } from "discord.js";
import { GuildWithLogs } from "@repo/database";
import { returnWebhook, WebhookType } from "@utils";
import { logger } from "@lib";

export async function logStageInstanceDelete(stageInstance: StageInstance, guildConfig: GuildWithLogs) {
  if(!stageInstance.guild) return;
  const t = stageInstance.client.i18next.getFixedT(guildConfig.language, "events", "stageInstanceDelete");
  if (!guildConfig.logConfig?.stageLogsChannelId) return;
  const logChannel = stageInstance.guild.channels.cache.get(guildConfig.logConfig.stageLogsChannelId);
  if (logChannel?.type !== ChannelType.GuildText) return;
  const embed = new EmbedBuilder()
    .setColor("Red")
    .setTimestamp()
    .setTitle(t(($) => $.embed.title))
    .setDescription(
      t(($) => $.embed.description, {
        stage: stageInstance,
      }),
    );
  const auditLogs = await stageInstance
    .guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.StageInstanceDelete,
    })
    .catch(() => null);
  const logEntry = auditLogs?.entries.first();
  if (logEntry?.target.id === stageInstance.id) {
    embed.setFooter({
      text: logEntry?.executor?.username || t(($) => $.unknown_executor),
      iconURL: logEntry.executor?.displayAvatarURL(),
    });
  }
  const webhook = await returnWebhook(stageInstance.client, logChannel, stageInstance.guild.id, guildConfig, {
    id: guildConfig.logConfig.stageLogsWebhookId,
    type: WebhookType.STAGE_LOGS,
  });
  if(webhook) {
    await webhook.send({ embeds: [embed] }).catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send stageInstanceDelete embed in ${stageInstance.guild?.name} (${stageInstance.guild?.id})`,
        channelId: logChannel.id,
      });
    });
  }
}