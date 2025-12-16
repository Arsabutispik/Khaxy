import { prisma } from "../client";
import { Prisma, PunishmentAction, type Punishment } from "@prisma/client";

/**
 * Gets all active punishments for a user (e.g., Muted + Banned).
 */
export async function getPunishmentsByUser(
  guildId: string,
  userId: string,
): Promise<Punishment[]> {
  return prisma.punishment.findMany({
    where: {
      guildId,
      userId,
    },
  });
}

/**
 * Gets a specific active punishment.
 * Example: Check if a user is currently MUTED.
 */
export async function getPunishment(
  guildId: string,
  userId: string,
  type: PunishmentAction, // Enum
): Promise<Punishment | null> {
  return prisma.punishment.findUnique({
    where: {
      // Prisma generates this name based on the @@unique constraint
      guildId_userId_type: {
        guildId,
        userId,
        type,
      },
    },
  });
}

/**
 * Fetches all punishments that have passed their expiration date.
 * Used by the cron job to unmute/unban people.
 */
export async function getExpiredPunishments(): Promise<Punishment[]> {
  return prisma.punishment.findMany({
    where: {
      expiresAt: {
        lt: new Date(), // "Less Than" now
      },
    },
  });
}

/**
 * Creates a new active punishment (e.g., Muting a user).
 * Fails if the user is already muted (due to Unique Constraint).
 */
export async function createPunishment(
  guildId: string,
  userId: string,
  staffId: string,
  type: PunishmentAction,
  expiresAt: Date,
  previousRoles: string[] = [], // Default to empty array
): Promise<Punishment> {
  return prisma.punishment.create({
    data: {
      guildId,
      userId,
      staffId,
      type,
      expiresAt,
      previousRoles, // Stores their roles so you can give them back after unmute
    },
  });
}

/**
 * Updates an existing punishment (e.g., Extending a Mute duration).
 */
export async function updatePunishment(
  guildId: string,
  userId: string,
  type: PunishmentAction,
  data: Prisma.PunishmentUpdateInput,
): Promise<Punishment> {
  return prisma.punishment.update({
    where: {
      guildId_userId_type: {
        guildId,
        userId,
        type,
      },
    },
    data,
  });
}

/**
 * Removes a specific punishment (e.g., Unmuting a user manually).
 */
export async function deletePunishment(
  guildId: string,
  userId: string,
  type: PunishmentAction,
): Promise<void> {
  await prisma.punishment.delete({
    where: {
      guildId_userId_type: {
        guildId,
        userId,
        type,
      },
    },
  });
}

/**
 * Bulk delete used by the Cron Job after it has processed the unmutes.
 * Accepts an array of Database IDs (Int) to be safe.
 */
export async function deletePunishmentsById(ids: number[]): Promise<void> {
  if (ids.length === 0) return;

  await prisma.punishment.deleteMany({
    where: {
      id: { in: ids },
    },
  });
}
