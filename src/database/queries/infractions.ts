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
