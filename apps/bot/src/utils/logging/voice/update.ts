import { AuditLogEvent, ChannelType, VoiceState } from "discord.js";
import { GuildWithLogs, updateGuildConfig } from "@repo/database";
import { returnWebhook, WebhookType } from "@utils";
import { logger } from "@lib";
import { getVoiceAuditExecutor } from "./utils.js";
import * as Embeds from "./voiceEmbeds.js";

export async function logVoiceStateUpdate(oldState: VoiceState, newState: VoiceState, guildConfig: GuildWithLogs) {
  // 1. Validation
  if (!guildConfig.logConfig?.voiceLogsChannelId) return;

  const logChannel = newState.guild.channels.cache.get(guildConfig.logConfig.voiceLogsChannelId);
  if (logChannel?.type !== ChannelType.GuildText) return;

  const webhook = await returnWebhook(newState.client, logChannel, newState.guild.id, guildConfig, {
    id: guildConfig.logConfig.voiceLogsWebhookId,
    type: WebhookType.VOICE_LOGS,
  });

  if (!webhook) return;

  const t = newState.client.i18next.getFixedT(guildConfig.language, "loggers", "voiceStateEvents");
  let embed = null;

  // ========================================================================
  // CASE 1: JOIN
  // ========================================================================
  if (!oldState.channelId && newState.channelId) {
    embed = Embeds.buildVoiceJoinEmbed(newState, t);
  }

  // ========================================================================
  // CASE 2: LEAVE
  // ========================================================================
  else if (oldState.channelId && !newState.channelId) {
    // Check if kicked
    const auditResult = await getVoiceAuditExecutor(
      oldState.guild,
      AuditLogEvent.MemberDisconnect,
      guildConfig.logConfig.voiceAuditLeaveLogsId ? guildConfig.logConfig.voiceAuditLeaveLogsId : undefined,
      guildConfig.logConfig.voiceAuditLeaveLogsCount,
    );

    if (auditResult) {
      await updateGuildConfig(oldState.guild.id, {
        logConfig: {
          update: {
            voiceAuditLeaveLogsId: auditResult.entryId,
            voiceAuditLeaveLogsCount: auditResult.entryCount,
          },
        },
      });
    }

    embed = Embeds.buildVoiceLeaveEmbed(oldState, auditResult?.executor || null, t);
  }

  // ========================================================================
  // CASE 3: MOVE
  // ========================================================================
  else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
    // Check if moved by moderator
    const auditResult = await getVoiceAuditExecutor(
      oldState.guild,
      AuditLogEvent.MemberMove,
      guildConfig.logConfig.voiceAuditMoveLogsId ? guildConfig.logConfig.voiceAuditMoveLogsId : undefined,
      guildConfig.logConfig.voiceAuditMoveLogsCount,
    );

    if (auditResult) {
      await updateGuildConfig(oldState.guild.id, {
        logConfig: {
          update: {
            voiceAuditMoveLogsId: auditResult.entryId,
            voiceAuditMoveLogsCount: auditResult.entryCount,
          },
        },
      });
    }

    embed = Embeds.buildVoiceMoveEmbed(oldState, newState, auditResult?.executor || null, t);
  }

  // ========================================================================
  // SEND
  // ========================================================================
  if (embed) {
    await webhook.send({ embeds: [embed] }).catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send voiceStateUpdate embed in ${newState.guild.name} (${newState.guild.id})`,
        channelId: logChannel.id,
      });
    });
  }
}
