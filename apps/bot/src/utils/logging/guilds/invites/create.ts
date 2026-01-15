import { Invite, ChannelType, EmbedBuilder, time, TimestampStyles, InviteGuild } from "discord.js";
import { GuildWithLogs } from "@repo/database";
import { returnWebhook, WebhookType } from "@utils";
import { logger } from "@lib";

export async function logInviteCreate(invite: Invite, guildConfig: GuildWithLogs) {
  if (!invite.guild || invite.guild instanceof InviteGuild) return;
  const t = invite.client.i18next.getFixedT(guildConfig.language, "events", "inviteCreate");
  if (!guildConfig.logConfig?.inviteLogsChannelId) return;
  const logChannel = invite.guild.channels.cache.get(guildConfig.logConfig.inviteLogsChannelId);
  if (logChannel?.type !== ChannelType.GuildText) return;
  const embed = new EmbedBuilder()
    .setColor("Green")
    .setTitle(t(($) => $.embed.title))
    .setDescription(
      t(($) => $.embed.description, {
        invite,
        timestamp:
          invite.maxAge && invite.maxAge > 0
            ? time(new Date(Date.now() + invite.maxAge * 1000), TimestampStyles.RelativeTime)
            : invite.client.allEmojis.get(invite.client.config.emojis.infinity.id)?.format,
        usage:
          invite.maxUses && invite.maxUses > 0
            ? invite.maxUses
            : invite.client.allEmojis.get(invite.client.config.emojis.infinity.id)?.format,
      }),
    )
    .setTimestamp();
  if (invite.inviter) {
    embed.setFooter({
      text: invite.inviter.username,
      iconURL: invite.inviter.displayAvatarURL(),
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
        message: `Failed to send inviteCreate embed in ${invite.guild!.name} (${invite.guild!.id})`,
        channelId: logChannel.id,
      });
    });
  }
}