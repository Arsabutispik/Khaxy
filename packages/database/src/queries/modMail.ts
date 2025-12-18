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
 * Schedules a thread to close in the future (e.g., "Closing in 15 minutes due to inactivity").
 */
export async function scheduleThreadClose(
  channelId: string,
  closeDate: Date,
): Promise<ModMailThread> {
  return prisma.modMailThread.update({
    where: { channelId },
    data: {
      scheduledCloseAt: closeDate,
    },
  });
}

/**
 * Cancels a scheduled close (e.g., User replied, so we keep it open).
 */
export async function cancelScheduledClose(
  channelId: string,
): Promise<ModMailThread> {
  return prisma.modMailThread.update({
    where: { channelId },
    data: {
      scheduledCloseAt: null,
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
