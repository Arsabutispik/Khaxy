import { prisma } from "@database";

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
