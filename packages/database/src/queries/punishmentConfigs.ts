import { prisma } from "apps/bot/src/database/index.js";
import type { GuildPunishmentConfig, PunishmentAction } from "../index.js";

/**
 * Gets a single specific rule (e.g., "What happens at Warn #3?").
 */
export async function getPunishmentRule(
  guildId: string,
  level: number,
): Promise<GuildPunishmentConfig | null> {
  return prisma.guildPunishmentConfig.findUnique({
    where: {
      guildId_level: {
        guildId,
        level,
      },
    },
  });
}
export async function getGuildPunishmentRules(
  guildId: string,
): Promise<GuildPunishmentConfig[]> {
  return prisma.guildPunishmentConfig.findMany({
    where: { guildId },
    orderBy: { level: "asc" }, // Logic usually requires processing level 1, then 2, etc.
  });
}

/**
 * Sets or Updates a rule.
 */
export async function setPunishmentRule(
  guildId: string,
  level: number,
  action: PunishmentAction,
  duration?: number | null, // Duration can be explicitly null
): Promise<GuildPunishmentConfig> {
  return prisma.guildPunishmentConfig.upsert({
    where: {
      guildId_level: {
        guildId,
        level,
      },
    },
    create: {
      guildId,
      level,
      action,
      duration,
    },
    update: {
      action,
      duration,
    },
  });
}

/**
 * Deletes a specific rule.
 * Uses delete() instead of deleteMany() because the Composite ID guarantees uniqueness.
 */
export async function deletePunishmentRule(
  guildId: string,
  level: number,
): Promise<void> {
  await prisma.guildPunishmentConfig.delete({
    where: {
      guildId_level: {
        guildId,
        level,
      },
    },
  });
}
