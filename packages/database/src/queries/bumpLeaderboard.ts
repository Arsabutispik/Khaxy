import { BumpLeaderboard, prisma } from "../index.js";

/**
 * Updates a user's bump count, creating the record if it doesn't exist.
 * Uses atomic increment to prevent race conditions.
 */
export async function incrementBumpCount(
  guildId: string,
  userId: string,
): Promise<BumpLeaderboard> {
  return prisma.bumpLeaderboard.upsert({
    where: {
      guildId_userId: {
        guildId,
        userId,
      },
    },
    create: {
      guildId,
      userId,
      bumpCount: 1,
    },
    update: {
      bumpCount: {
        increment: 1,
      },
    },
  });
}

/**
 * Gets the top bumpers for a guild.
 * @param guildId The ID of the guild.
 * @param limit Defaults to 10 for leaderboards.
 */
export async function getTopBumpers(
  guildId: string,
  limit: number = 10,
): Promise<BumpLeaderboard[]> {
  return prisma.bumpLeaderboard.findMany({
    where: { guildId },
    orderBy: { bumpCount: "desc" },
    take: limit,
  });
}

/**
 * IMPROVEMENT: Replaces the old unsafe 'getBumpLeaderboard'.
 * Fetches a specific page of the leaderboard to handle large servers safely.
 */
export async function getLeaderboardPage(
  guildId: string,
  page: number = 1,
  pageSize: number = 10,
): Promise<BumpLeaderboard[]> {
  return prisma.bumpLeaderboard.findMany({
    where: { guildId },
    orderBy: { bumpCount: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
}

/**
 * Resets the leaderboard for a specific guild.
 */
export async function resetBumpLeaderboard(guildId: string): Promise<void> {
  await prisma.bumpLeaderboard.deleteMany({
    where: { guildId },
  });
}
