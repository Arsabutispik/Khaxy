import { prisma } from "../client.js";
import {
  ModMailStatus,
  ModMailAuthorType,
  ModMailSentToType,
  type ModMailThread,
  type ModMailMessage,
  type ModMailBlacklist,
} from "@prisma/client";

// ============================================================================
//  THREADS (Creation, Closing, Management)
// ============================================================================

/**
 * Checks if a user already has an OPEN thread in this guild.
 * Used to prevent spamming multiple tickets.
 */
export async function getOpenThread(
  guildId: string,
  userId: string,
): Promise<ModMailThread | null> {
  return prisma.modMailThread.findFirst({
    where: {
      guildId,
      userId,
      status: ModMailStatus.OPEN,
    },
    include: {
      messages: {
        orderBy: { sentAt: "asc" },
        take: 50, // Autoload recent history
      },
    },
  });
}

/**
 * Gets a thread by its Channel ID (The most common lookup in Discord events).
 */
export async function getThreadByChannelId(
  channelId: string,
): Promise<ModMailThread | null> {
  return prisma.modMailThread.findUnique({
    where: { channelId },
  });
}

/**
 * Gets all threads belonging to a specific user in a guild.
 */
export async function getThreadsByUser(
  guildId: string,
  userId: string,
): Promise<ModMailThread[]> {
  return prisma.modMailThread.findMany({
    where: {
      guildId,
      userId,
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Finds ANY open thread for a user.
 * specific for DM events where we don't know the target guild yet.
 */
export async function findAnyOpenThread(
  userId: string,
): Promise<ModMailThread | null> {
  return prisma.modMailThread.findFirst({
    where: {
      userId,
      status: ModMailStatus.OPEN,
    },
  });
}

/**
 * Creates a brand-new thread.
 * Automatically inserts the first message ("Hello, I need help") to keep data clean.
 */
export async function createThread(
  guildId: string,
  userId: string,
  channelId: string,
  initialMessageContent: string,
): Promise<ModMailThread> {
  return prisma.modMailThread.create({
    data: {
      guildId,
      userId,
      channelId,
      status: ModMailStatus.OPEN,
      messages: {
        create: {
          content: initialMessageContent,
          authorId: userId,
          authorType: ModMailAuthorType.USER,
          sentTo: ModMailSentToType.THREAD, // Goes to the staff channel
          messageId: "initial", // Placeholder ID since we don't have the Discord Msg ID yet
        },
      },
    },
  });
}

/**
 * Closes a thread immediately.
 * Sets 'closedAt' to now, and status to CLOSED.
 */
export async function closeThread(
  channelId: string,
  closerId: string,
): Promise<ModMailThread> {
  return prisma.modMailThread.update({
    where: { channelId },
    data: {
      status: ModMailStatus.CLOSED,
      closedAt: new Date(),
      closerId,
      // If it was scheduled to close later, we clear that since we are closing it NOW.
      scheduledCloseAt: null,
    },
  });
}

/**
 * Get all threads that are currently OPEN but are scheduled to close
 * at a time that has already passed.
 */
export async function getExpiredThreads() {
  return prisma.modMailThread.findMany({
    where: {
      status: ModMailStatus.OPEN, // Only look at active threads
      scheduledCloseAt: {
        not: null, // Must actually have a schedule set
        lt: new Date(), // "Less Than" now (time is in the past)
      },
    },
  });
}
// packages/database/src/modmail.ts

/**
 * Schedules a thread to close.
 */
export async function scheduleThreadClose(
  channelId: string,
  closeDate: Date,
  closerId: string,
): Promise<ModMailThread> {
  return prisma.modMailThread.update({
    where: { channelId },
    data: {
      scheduledCloseAt: closeDate,
      closerId: closerId,
    },
  });
}

/**
 * Cancels a scheduled close.
 */
export async function cancelScheduledClose(
  channelId: string,
): Promise<ModMailThread> {
  return prisma.modMailThread.update({
    where: { channelId },
    data: {
      scheduledCloseAt: null,
      closerId: null,
    },
  });
}

// ============================================================================
//  MESSAGES (Chat History)
// ============================================================================

/**
 * Adds a new message to an existing thread.
 */
export async function addMessageToThread(
  channelId: string,
  content: string,
  authorId: string,
  authorType: ModMailAuthorType,
  messageId: string,
): Promise<ModMailMessage> {
  return prisma.modMailMessage.create({
    data: {
      thread: { connect: { channelId } },
      content,
      authorId,
      authorType,
      messageId,
      sentTo:
        authorType === ModMailAuthorType.USER
          ? ModMailSentToType.THREAD
          : ModMailSentToType.USER,
    },
  });
}

/**
 * Updates the content of a logged ModMail message.
 * Uses updateMany because 'messageId' might not be unique in schema (though it should be in practice).
 */
export async function updateModMailMessage(
  discordMessageId: string,
  newContent: string,
): Promise<void> {
  await prisma.modMailMessage.updateMany({
    where: { messageId: discordMessageId },
    data: { content: newContent },
  });
}

/**
 * Fetches the transcript/history of a thread.
 */
export async function getThreadMessages(
  channelId: string,
): Promise<ModMailMessage[]> {
  return prisma.modMailMessage.findMany({
    where: { thread: { channelId } },
    orderBy: { sentAt: "asc" },
  });
}

// ============================================================================
//  BLACKLIST (Blocking Users)
// ============================================================================

/**
 * Checks if a user is currently banned from using ModMail.
 * Handles expiry logic automatically.
 */
export async function isBlacklisted(
  guildId: string,
  userId: string,
): Promise<boolean> {
  const entry = await prisma.modMailBlacklist.findFirst({
    where: {
      guildId,
      userId,
      OR: [
        { expiresAt: null }, // Permanent Blacklist
        { expiresAt: { gt: new Date() } }, // Temporary Blacklist that hasn't expired yet
      ],
    },
  });
  return !!entry; // Returns true if entry exists, false otherwise
}

export async function blacklistUser(
  guildId: string,
  userId: string,
  moderatorId: string,
  reason: string,
  expiresAt?: Date,
): Promise<ModMailBlacklist> {
  return prisma.modMailBlacklist.create({
    data: {
      guildId,
      userId,
      moderatorId,
      reason,
      expiresAt,
    },
  });
}

export async function unblacklistUser(
  guildId: string,
  userId: string,
): Promise<void> {
  // We use deleteMany just in case there are accidental duplicate entries
  await prisma.modMailBlacklist.deleteMany({
    where: {
      guildId,
      userId,
    },
  });
}

/**
 * Gets a list of blacklisted users.
 * Optional: Pass a guildId to filter by guild, otherwise returns ALL entries.
 */
export async function getBlacklistedUsers(guildId?: string) {
  return prisma.modMailBlacklist.findMany({
    where: guildId ? { guildId } : undefined, // If guildId is missing, fetch all
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Prunes (deletes) users whose ban has EXPIRED.
 * Call this function on a schedule (e.g., every hour/day).
 */
export async function removeExpiredBlacklists() {
  return prisma.modMailBlacklist.deleteMany({
    where: {
      expiresAt: {
        not: null, // Only check entries that HAVE an expiry date
        lt: new Date(), // "lt" = Less Than (Time is in the past)
      },
    },
  });
}

/**
 * DANGEROUS: Removes ALL blacklisted users for a specific guild.
 * Use this only if resetting a guild's data.
 */
export async function clearGuildBlacklist(guildId: string) {
  return prisma.modMailBlacklist.deleteMany({
    where: {
      guildId,
    },
  });
}
