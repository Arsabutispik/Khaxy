import { prisma } from "apps/bot/src/database/index.js";
import { Prisma, type Infraction, InfractionType } from "../index.js";

/**
 * Gets a specific infraction using the composite key.
 */
export async function getInfraction(
  guildId: string,
  caseId: number,
): Promise<Infraction | null> {
  return prisma.infraction.findUnique({
    where: {
      guildId_caseId: {
        guildId, // No BigInt needed
        caseId,
      },
    },
  });
}

/**
 * Gets the history of a user in a specific guild.
 */
export async function getUserInfractions(
  guildId: string,
  userId: string,
): Promise<Infraction[]> {
  return prisma.infraction.findMany({
    where: {
      guildId,
      userId,
    },
    orderBy: {
      caseId: "desc",
    },
  });
}

/**
 * Creates an infraction AND increments the guild's case counter safely.
 * Uses a Transaction to ensure the case ID is perfectly synced.
 */
export async function createInfraction(
  guildId: string,
  userId: string,
  moderatorId: string,
  type: InfractionType,
  reason: string,
  expiresAt?: Date | null,
): Promise<Infraction> {
  return prisma.$transaction(async (tx) => {
    const guild = await tx.guild.update({
      where: { id: guildId },
      data: { caseId: { increment: 1 } },
      select: { caseId: true },
    });
    return tx.infraction.create({
      data: {
        guildId,
        caseId: guild.caseId,
        userId,
        moderatorId,
        type,
        reason,
        expiresAt,
      },
    });
  });
}

/**
 * Updates an infraction.
 * Uses 'update' instead of 'updateMany' because we now have a unique key.
 */
export async function updateInfraction(
  guildId: string,
  caseId: number,
  data: Prisma.InfractionUpdateInput,
): Promise<Infraction> {
  return prisma.infraction.update({
    where: {
      guildId_caseId: {
        guildId,
        caseId,
      },
    },
    data,
  });
}

/**
 * Deletes an infraction.
 */
export async function deleteInfraction(
  guildId: string,
  caseId: number,
): Promise<void> {
  await prisma.infraction.delete({
    where: {
      guildId_caseId: {
        guildId,
        caseId,
      },
    },
  });
}
