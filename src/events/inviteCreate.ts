import { EventBase } from "src/types/index.js";
import { ChannelType, EmbedBuilder, Events, InviteGuild, time, TimestampStyles } from "discord.js";
import { getGuildConfig } from "src/database/index.js";
import { returnWebhook, toStringId, WebhookType } from "src/utils/index.js";
import { logger } from "src/lib/index.js";

export default {
  name: Events.InviteCreate,
  once: false,
  async execute(invite) {
    if (!invite.guild || invite.guild instanceof InviteGuild) return;
    const guildConfig = await getGuildConfig(invite.guild.id);
    if (!guildConfig) return;
    const t = invite.client.i18next.getFixedT(guildConfig.language, "events", "inviteCreate");
    if (!guildConfig.invite_logs_channel_id) return;
    const logChannel = invite.guild.channels.cache.get(toStringId(guildConfig.invite_logs_channel_id));
    if (logChannel?.type !== ChannelType.GuildText) return;
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle(t("embed.title"))
      .setDescription(
        t("embed.description", {
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
    const webhook = await returnWebhook(invite.client, logChannel, invite.guild.id, {
      id: guildConfig.invite_logs_webhook_id,
      type: WebhookType.INVITE_LOGS,
    });
    await webhook.send({ embeds: [embed] }).catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send inviteCreate embed in ${invite.guild!.name} (${invite.guild!.id})`,
        channelId: logChannel.id,
      });
    });
  },
} satisfies EventBase<Events.InviteCreate>;
