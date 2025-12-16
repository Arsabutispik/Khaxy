import { prisma } from "apps/bot/src/database/index.js";
import { Prisma } from "../index.js";

export type GuildWithLogs = Prisma.GuildGetPayload<{
  include: { logConfig: true; punishmentConfigs: true };
}>;
export async function getOrCreateGuild(
  guildId: string,
): Promise<GuildWithLogs> {
  return await prisma.guild.upsert({
    where: { id: guildId },
    update: {},
    create: {
      id: guildId,
      logConfig: {
        create: {},
      },
    },
    include: {
      logConfig: true,
      punishmentConfigs: true,
    },
  });
}
export async function updateGuildConfig(
  guildId: string,
  config: Prisma.GuildUpdateInput,
) {
  if (Object.keys(config).length === 0) return;
  return await prisma.guild.update({
    where: { id: guildId },
    data: config,
    include: { logConfig: true },
  });
}
export async function updateGuildLogs(
  guildId: string,
  config: Prisma.GuildLogConfigUpdateInput,
) {
  if (Object.keys(config).length === 0) return;
  return await prisma.guildLogConfig.update({
    where: { guildId: guildId },
    data: config,
  });
}

export async function deleteGuildConfig(guildId: string) {
  await prisma.guild.delete({
    where: { id: guildId },
  });
}
