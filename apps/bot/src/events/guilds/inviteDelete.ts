import { EventBase } from "@types";
import { AuditLogEvent, ChannelType, EmbedBuilder, Events, InviteGuild } from "discord.js";
import { getGuildConfig } from "src/database/index.js";
import { returnWebhook, toStringId, WebhookType } from "@utils";
import { logger } from "@lib";

export default {
  name: Events.InviteDelete,
  once: false,
  async execute(invite) {
    if (!invite.guild || invite.guild instanceof InviteGuild) return;
    const guildConfig = await getGuildConfig(invite.guild.id);
    if (!guildConfig) return;
    const t = invite.client.i18next.getFixedT(guildConfig.language, "events", "inviteDelete");
    if (!guildConfig.invite_logs_channel_id) return;
    const logChannel = invite.guild.channels.cache.get(toStringId(guildConfig.invite_logs_channel_id));
    if (logChannel?.type !== ChannelType.GuildText) return;

    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle(t("embed.title"))
      .setDescription(
        t("embed.description", {
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
        text: logEntry.executor?.username ?? t("unknown_executor"),
        iconURL: logEntry.executor?.displayAvatarURL() ?? undefined,
      });
    }
    const webhook = await returnWebhook(invite.client, logChannel, invite.guild.id, {
      id: guildConfig.emoji_logs_webhook_id,
      type: WebhookType.INVITE_LOGS,
    });
    await webhook.send({ embeds: [embed] }).catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send inviteDelete embed in ${invite.guild!.name} (${invite.guild!.id})`,
        channelId: logChannel.id,
      });
    });
  },
} satisfies EventBase<Events.InviteDelete>;
