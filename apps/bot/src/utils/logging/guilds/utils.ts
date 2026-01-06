import { AuditLogEvent, EmbedBuilder, Guild, User, Webhook } from "discord.js";
import { logger } from "@lib";
import dayjs from "dayjs";

// Helper to send webhook embeds with error handling
export async function sendLogEmbed(webhook: Webhook, embeds: EmbedBuilder[], guild: Guild, channelId: string) {
  await webhook.send({ embeds, allowedMentions: { parse: [] } }).catch((error) => {
    logger.log({
      level: "error",
      message: `Failed to send embed in ${guild.name} (${guild.id})`,
      error,
      channelId,
    });
  });
}

/**
 * Fetches the executor for a guild update.
 * Only returns the user if the log entry was created within the last 3 seconds
 * to ensure we don't blame old actions on new events.
 */
export async function getGuildExecutor(guild: Guild): Promise<User | null> {

  const auditLogs = await guild
    .fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.GuildUpdate,
    })
    .catch(() => null);

  const logEntry = auditLogs?.entries.first();
  if (
    logEntry &&
    logEntry.executor &&
    logEntry.executor.id !== guild.client.user.id &&
    dayjs().diff(logEntry.createdAt, "seconds") < 3
  ) {
    let user = logEntry.executor;
    if (!user) return null;
    if (user.partial) user = await guild.client.users.fetch(user.id);
    return user;
  }

  return null;
}