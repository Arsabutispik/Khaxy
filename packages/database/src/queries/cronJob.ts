import { Prisma, prisma, type CronJob } from "../index.js";

export async function getAllCronJobs(): Promise<CronJob[]> {
  return prisma.cronJob.findMany();
}

export async function getActiveCronJobs(): Promise<CronJob[]> {
  return prisma.cronJob.findMany({
    where: {
      OR: [
        { colorTime: { not: null } },
        { unregisteredPeopleTime: { not: null } },
      ],
    },
  });
}

export async function getCronJob(guildId: string): Promise<CronJob | null> {
  return prisma.cronJob.findUnique({
    where: { id: guildId },
  });
}

/**
 * @param guildId - The ID of the guild (mapped to 'id' in DB)
 * @param data - The fields to update (colorTime, etc.)
 */
export async function saveCronJob(
  guildId: string,
  data: Prisma.CronJobUpdateInput,
): Promise<CronJob> {
  return prisma.cronJob.upsert({
    where: { id: guildId },
    create: {
      ...(data as Prisma.CronJobCreateInput),
      id: guildId,
    },
    update: data,
  });
}

/**
 * Deletes a cron configuration entirely.
 */
export async function deleteCronJob(guildId: string): Promise<void> {
  await prisma.cronJob.delete({
    where: { id: guildId },
  });
}
