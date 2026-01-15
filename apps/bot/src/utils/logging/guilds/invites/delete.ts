import { Invite, InviteGuild, ChannelType, EmbedBuilder, AuditLogEvent } from "discord.js";
import { GuildWithLogs } from "@repo/database";
import { returnWebhook, WebhookType } from "@utils";
import { logger } from "@lib";

export async function logInviteDelete(invite: Invite, guildConfig: GuildWithLogs) {
  if (!invite.guild || invite.guild instanceof InviteGuild) return;
  const t = invite.client.i18next.getFixedT(guildConfig.language, "events", "inviteDelete");
  if (!guildConfig.logConfig?.inviteLogsChannelId) return;
  const logChannel = invite.guild.channels.cache.get(guildConfig.logConfig.inviteLogsChannelId);
  if (logChannel?.type !== ChannelType.GuildText) return;

  const embed = new EmbedBuilder()
    .setColor("Red")
    .setTitle(t(($) => $.embed.title))
    .setDescription(
      t(($) => $.embed.description, {
        invite,
      }),
    )
    .setTimestamp();
  const auditLogs = await invite.guild
    .fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.InviteCreate,
    })
    .catch(() => null);
  const logEntry = auditLogs?.entries.first();
  if (logEntry?.target?.code === invite.code) {
    embed.setFooter({
      text: logEntry.executor?.username ?? t(($) => $.unknown_executor),
      iconURL: logEntry.executor?.displayAvatarURL() ?? undefined,
    });
  }
  const webhook = await returnWebhook(invite.client, logChannel, invite.guild.id, guildConfig, {
    id: guildConfig.logConfig.inviteLogsWebhookId,
    type: WebhookType.INVITE_LOGS,
  });
  if(webhook) {
    await webhook.send({ embeds: [embed] }).catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send inviteDelete embed in ${invite.guild!.name} (${invite.guild!.id})`,
        channelId: logChannel.id,
      });
    });
  }
}