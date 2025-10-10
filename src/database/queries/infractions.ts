import { prisma } from "@database";
import { Prisma } from "@prisma/client";
export async function getInfraction(guildId: string, caseId: number) {
  return prisma.infractions.findFirst({
    where: {
      guild_id: BigInt(guildId),
      case_id: caseId,
    },
  });
}

export async function getUserInfractions(guildId: string, userId: string) {
  return prisma.infractions.findMany({
    where: {
      guild_id: BigInt(guildId),
      user_id: BigInt(userId),
    },
    orderBy: {
      case_id: "desc",
    },
  });
}
export async function getActivePunishments(guildId: string, userId: string) {
  return await prisma.infractions.count({
    where: {
      guild_id: BigInt(guildId),
      user_id: BigInt(userId),
      OR: [
        {
          // Condition 1: The infraction is temporary and has not expired.
          expires_at: {
            gt: new Date(),
          },
        },
        {
          // Condition 2: The infraction is permanent (never expires).
          expires_at: null,
        },
      ],
    },
  });
}
export async function createInfraction(data: Omit<Prisma.infractionsCreateInput, "id">) {
  await prisma.infractions.create({
    data,
  });
}

export async function updateInfraction(guildId: string, caseId: number, data: Prisma.infractionsUpdateInput) {
  await prisma.infractions.updateMany({
    where: {
      guild_id: BigInt(guildId),
      case_id: caseId,
    },
    data,
  });
}

export async function deleteInfraction(guildId: string, caseId: number) {
  await prisma.infractions.deleteMany({
    where: {
      guild_id: BigInt(guildId),
      case_id: caseId,
    },
  });
}
