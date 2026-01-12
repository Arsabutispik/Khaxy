import { Prisma, prisma, type CronJob } from "../index.js";

export async function getAllCronJobs(): Promise<CronJob[]> {
  return prisma.cronJob.findMany();
}

export async function getActiveCronJobs(): Promise<CronJob[]> {
  return prisma.cronJob.findMany({
    where: {
      OR: [
        { colorTime: { not: null } },
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
 * Updates a cron job setting, creating the row if it doesn't exist.
 */
export async function updateCronJob(
  guildId: string,
  data: Prisma.CronJobUpdateInput,
): Promise<CronJob> {
  return prisma.cronJob.upsert({
    where: { id: guildId },
    // If updating, just apply the changes
    update: data,
    // If creating, we MUST ensure the object is valid.
    // We spread 'data' but we must ensure it matches CreateInput structure.
    // If your schema has other required fields, provide defaults here!
    create: {
      id: guildId,
      ...(data as any), // 'any' is safer here than a direct type cast if you are sure data contains scalars
    },
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
