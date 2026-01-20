import { AuditLogEvent, Guild, User } from "discord.js";
import dayjs from "dayjs";

interface VoiceAuditResult {
  executor: User;
  entryId: string;
  entryCount: number;
}

/**
 * Checks audit logs to see if a voice action (Move/Disconnect) was done by a moderator.
 * Handles Discord's "stacked" audit logs by checking ID matches and Count increments.
 */
export async function getVoiceAuditExecutor(
  guild: Guild,
  type: AuditLogEvent,
  storedId: string | undefined,
  storedCount: number | undefined,
): Promise<VoiceAuditResult | null> {
  const auditLogs = await guild.fetchAuditLogs({ limit: 1, type }).catch(() => null);

  const logEntry = auditLogs?.entries.first();

  // Early return if no entry or no executor
  if (!logEntry || !logEntry.executor) return null;

  // Calculate age of the log
  const age = Math.abs(dayjs().diff(logEntry.createdAt, "seconds"));

  // We cast to a specific shape so TS knows 'count' might exist
  const extra = logEntry.extra as { count?: number } | null;
  const currentCount = extra?.count ?? 1;

  // Case 1: Same log entry, but the count went up (Discord grouped them)
  const sameEntryUpdated = logEntry.id === storedId && currentCount > (storedCount || 0);

  // Case 2: A completely new entry created recently (< 3 seconds)
  const newRecentEntry = logEntry.id !== storedId && age < 3;

  if (sameEntryUpdated || newRecentEntry) {
    return {
      executor: logEntry.executor as User,
      entryId: logEntry.id,
      entryCount: currentCount,
    };
  }

  return null;
}
