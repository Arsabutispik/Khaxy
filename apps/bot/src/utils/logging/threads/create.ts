import { AnyThreadChannel, ChannelType, EmbedBuilder, time, TimestampStyles } from "discord.js";
import { GuildWithLogs } from "@repo/database";
import { returnWebhook, WebhookType } from "@utils";
import { logger } from "@lib";

export async function logThreadCreate(thread: AnyThreadChannel, guildConfig: GuildWithLogs) {
  const t = thread.client.i18next.getFixedT(guildConfig.language, "loggers", "threadEvents");
  if (!guildConfig.logConfig?.threadLogsChannelId) return;
  const logChannel = thread.guild.channels.cache.get(guildConfig.logConfig.threadLogsChannelId);
  if (logChannel?.type !== ChannelType.GuildText) return;
  const embed = new EmbedBuilder()
    .setColor("Green")
    .setTitle(t(($) => $.threadCreate.embed.title))
    .setDescription(
      t(($) => $.threadCreate.embed.description, {
        thread,
        parent: {
          name: thread.parent?.name || t(($) => $.noParentName),
          id: thread.parentId || t(($) => $.noParentId),
        },
        auto_archive_duration: t(($) => $.threadAutoArchiveDuration[thread.autoArchiveDuration ?? "null"]),
        timestamp: time(thread.createdAt || new Date(), TimestampStyles.FullDateShortTime),
      }),
    )
    .setTimestamp();
  const owner = await thread.guild.members.fetch(thread.ownerId).catch(() => null);
  if (owner) {
    embed.setFooter({
      text: owner.user.username,
      iconURL: owner.user.displayAvatarURL(),
    });
  }
  const webhook = await returnWebhook(thread.client, logChannel, thread.guild.id, guildConfig, {
    id: guildConfig.logConfig.threadLogsWebhookId,
    type: WebhookType.THREAD_LOGS,
  });
  if (webhook) {
    await webhook.send({ embeds: [embed] }).catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send threadCreate embed in ${thread.guild.name} (${thread.guild.id})`,
        channelId: logChannel.id,
      });
    });
  }
}
