import { AnyThreadChannel, ChannelType, EmbedBuilder, AuditLogEvent } from "discord.js";
import { GuildWithLogs } from "@repo/database";
import { formatDuration, returnWebhook, WebhookType } from "@utils";
import { logger } from "@lib";
import { logUnhandledChanges } from "../utils.js";

export async function logThreadUpdate(
  oldThread: AnyThreadChannel,
  newThread: AnyThreadChannel,
  guildConfig: GuildWithLogs,
) {
  const t = newThread.client.i18next.getFixedT(guildConfig.language, "loggers", "threadEvents");
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
      text: logEntry.executor?.username ?? t(($) => $.unknownExecutor),
      iconURL: logEntry.executor?.displayAvatarURL() ?? undefined,
    });
  }
  if (oldThread.name !== newThread.name) {
    const embedClone = EmbedBuilder.from(embed)
      .setTitle(t(($) => $.threadUpdate.nameChange.embed.title))
      .setDescription(
        t(($) => $.threadUpdate.nameChange.embed.description, {
          thread: newThread,
          parent: {
            name: newThread.parent?.name || t(($) => $.noParentName),
            id: newThread.parentId || t(($) => $.noParentId),
          },
          old_name: oldThread.name,
          new_name: newThread.name,
        }),
      );
    embeds.push(embedClone);
  }
  if (oldThread.archived !== newThread.archived) {
    const embedClone = EmbedBuilder.from(embed);
    if (newThread.archived) {
      embedClone.setTitle(t(($) => $.threadUpdate.archive.embed.title)).setDescription(
        t(($) => $.threadUpdate.archive.embed.description, {
          thread: newThread,
          parent: {
            name: newThread.parent?.name || t(($) => $.noParentName),
            id: newThread.parentId || t(($) => $.noParentId),
          },
        }),
      );
    } else {
      embedClone.setTitle(t(($) => $.threadUpdate.unarchive.embed.title)).setDescription(
        t(($) => $.threadUpdate.unarchive.embed.description, {
          thread: newThread,
          parent: {
            name: newThread.parent?.name || t(($) => $.noParentName),
            id: newThread.parentId || t(($) => $.noParentId),
          },
        }),
      );
    }
    embeds.push(embedClone);
  }
  if (oldThread.locked !== newThread.locked) {
    const embedClone = EmbedBuilder.from(embed);
    if (newThread.locked) {
      embedClone.setTitle(t(($) => $.threadUpdate.lock.embed.title)).setDescription(
        t(($) => $.threadUpdate.lock.embed.description, {
          thread: newThread,
          parent: {
            name: newThread.parent?.name || t(($) => $.noParentName),
            id: newThread.parentId || t(($) => $.noParentId),
          },
        }),
      );
    } else {
      embedClone.setTitle(t(($) => $.threadUpdate.unlock.embed.title)).setDescription(
        t(($) => $.threadUpdate.unlock.embed.description, {
          thread: newThread,
          parent: {
            name: newThread.parent?.name || t(($) => $.noParentName),
            id: newThread.parentId || t(($) => $.noParentId),
          },
        }),
      );
    }
    embeds.push(embedClone);
  }
  if (oldThread.autoArchiveDuration !== newThread.autoArchiveDuration) {
    const embedClone = EmbedBuilder.from(embed)
      .setTitle(t(($) => $.threadUpdate.autoArchiveDurationChange.embed.title))
      .setDescription(
        t(($) => $.threadUpdate.autoArchiveDurationChange.embed.description, {
          thread: newThread,
          parent: {
            name: newThread.parent?.name || t(($) => $.noParentName),
            id: newThread.parentId || t(($) => $.noParentId),
          },
          old_duration: t(($) => $.threadAutoArchiveDuration[oldThread.autoArchiveDuration ?? "null"]),
          new_duration: t(($) => $.threadAutoArchiveDuration[newThread.autoArchiveDuration ?? "null"]),
        }),
      );
    embeds.push(embedClone);
  }
  if (oldThread.rateLimitPerUser !== newThread.rateLimitPerUser) {
    const embedClone = EmbedBuilder.from(embed)
      .setTitle(t(($) => $.threadUpdate.rateLimitChange.embed.title))
      .setDescription(
        t(($) => $.threadUpdate.rateLimitChange.embed.description, {
          thread: newThread,
          parent: {
            name: newThread.parent?.name || t(($) => $.noParentName),
            id: newThread.parentId || t(($) => $.noParentId),
          },
          old_rate_limit: formatDuration(oldThread.rateLimitPerUser! * 1000, guildConfig.language),
          new_rate_limit: formatDuration(newThread.rateLimitPerUser! * 1000, guildConfig.language),
        }),
      );
    embeds.push(embedClone);
  }
  if (embeds.length === 0) {
    logUnhandledChanges("threadUpdate", oldThread, newThread, `Thread "${newThread.name}" (${newThread.id})`, [
      "messages",
      "members",
      "guildMembers",
      "parent",
      "ownerId",
      "parentId",
      "guildId",
      "lastMessageId",
      "lastPinTimestamp",
      "messageCount",
      "memberCount",
      "totalMessageSent",
    ]);
    return;
  }
  const webhook = await returnWebhook(newThread.client, logChannel, newThread.guild.id, guildConfig, {
    id: guildConfig.logConfig.threadLogsWebhookId,
    type: WebhookType.THREAD_LOGS,
  });
  if (webhook) {
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
