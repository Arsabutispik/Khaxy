import { prisma } from "src/database/index.js";
import { PunishmentAction } from "@prisma/client";
export async function getGuildPunishmentConfig(guildId: string, level: number) {
  return await prisma.guild_punishment_config.findUnique({
    where: {
      guild_id_level: {
        // Using the composite key
        guild_id: BigInt(guildId),
        level: level,
      },
    },
  });
}
export async function setGuildPunishmentConfig(
  guildId: string,
  level: number,
  action: PunishmentAction,
  duration?: number,
) {
  return await prisma.guild_punishment_config.upsert({
    where: {
      guild_id_level: {
        guild_id: BigInt(guildId),
        level: level,
      },
    },
    create: {
      guild_id: BigInt(guildId),
      level: level,
      action: action,
      duration: duration,
    },
    update: {
      action: action,
      duration: duration,
    },
  });
}

export async function deleteGuildPunishmentConfig(guildId: string, level: number) {
  return await prisma.guild_punishment_config.deleteMany({
    where: {
      guild_id: BigInt(guildId),
      level: level,
    },
  });
}
