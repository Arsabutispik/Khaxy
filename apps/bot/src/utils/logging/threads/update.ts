import { AnyThreadChannel, ChannelType, EmbedBuilder, AuditLogEvent } from "discord.js";
import { GuildWithLogs } from "@repo/database";
import { formatDuration, returnWebhook, WebhookType } from "@utils";
import { logger } from "@lib";

export async function logThreadUpdate(oldThread: AnyThreadChannel, newThread: AnyThreadChannel, guildConfig: GuildWithLogs) {
  const t = newThread.client.i18next.getFixedT(guildConfig.language, "events", "threadUpdate");
  if (!guildConfig.logConfig?.threadLogsChannelId) return;
  const logChannel = newThread.guild.channels.cache.get(guildConfig.logConfig.threadLogsChannelId);
  if (logChannel?.type !== ChannelType.GuildText) return;
  const embed = new EmbedBuilder().setColor("Yellow").setTimestamp();
  const embeds: Array<EmbedBuilder> = [];
  const auditLogs = await newThread.guild
    .fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.ThreadUpdate,
    })
    .catch(() => null);
  const logEntry = auditLogs?.entries.first();
  if (logEntry?.target?.id === newThread.id) {
    embed.setFooter({
      text: logEntry.executor?.username ?? t("unknown_executor"),
      iconURL: logEntry.executor?.displayAvatarURL() ?? undefined,
    });
  }
  if (oldThread.name !== newThread.name) {
    const embedClone = EmbedBuilder.from(embed)
      .setTitle(t("name_change.embed.title"))
      .setDescription(
        t("name_change.embed.description", {
          thread: newThread,
          parent: newThread.parent,
          old_name: oldThread.name,
          new_name: newThread.name,
        }),
      );
    embeds.push(embedClone);
  }
  if (oldThread.archived !== newThread.archived) {
    const embedClone = EmbedBuilder.from(embed);
    if (newThread.archived) {
      embedClone.setTitle(t("archive.embed.title")).setDescription(
        t("archive.embed.description", {
          thread: newThread,
          parent: newThread.parent,
        }),
      );
    } else {
      embedClone.setTitle(t("unarchive.embed.title")).setDescription(
        t("unarchive.embed.description", {
          thread: newThread,
          parent: newThread.parent,
        }),
      );
    }
    embeds.push(embedClone);
  }
  if (oldThread.locked !== newThread.locked) {
    const embedClone = EmbedBuilder.from(embed);
    if (newThread.locked) {
      embedClone.setTitle(t("lock.embed.title")).setDescription(
        t("lock.embed.description", {
          thread: newThread,
          parent: newThread.parent,
        }),
      );
    } else {
      embedClone.setTitle(t("unlock.embed.title")).setDescription(
        t("unlock.embed.description", {
          thread: newThread,
          parent: newThread.parent,
        }),
      );
    }
    embeds.push(embedClone);
  }
  if (oldThread.autoArchiveDuration !== newThread.autoArchiveDuration) {
    const embedClone = EmbedBuilder.from(embed)
      .setTitle(t("auto_archive_duration_change.embed.title"))
      .setDescription(
        t("auto_archive_duration_change.embed.description", {
          thread: newThread,
          parent: newThread.parent,
          old_duration: t(`auto_archive_duration.${oldThread.autoArchiveDuration}`),
          new_duration: t(`auto_archive_duration.${newThread.autoArchiveDuration}`),
        }),
      );
    embeds.push(embedClone);
  }
  if (oldThread.rateLimitPerUser !== newThread.rateLimitPerUser) {
    const embedClone = EmbedBuilder.from(embed)
      .setTitle(t("rate_limit_change.embed.title"))
      .setDescription(
        t("rate_limit_change.embed.description", {
          thread: newThread,
          parent: newThread.parent,
          old_rate_limit: formatDuration(oldThread.rateLimitPerUser! * 1000, guildConfig.language),
          new_rate_limit: formatDuration(newThread.rateLimitPerUser! * 1000, guildConfig.language),
        }),
      );
    embeds.push(embedClone);
  }
  if (embeds.length === 0) return;
  const webhook = await returnWebhook(newThread.client, logChannel, newThread.guild.id, guildConfig, {
    id: guildConfig.logConfig.threadLogsWebhookId,
    type: WebhookType.THREAD_LOGS,
  });
  if(webhook) {
    await webhook.send({ embeds }).catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send threadUpdate embed in ${newThread.guild.name} (${newThread.guild.id})`,
        channelId: logChannel.id,
      });
    });
  }
}