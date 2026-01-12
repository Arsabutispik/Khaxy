import { CONFIG_SCHEMA, DbConfigKey, RelationName } from "@constants";
import { GuildWithLogs, prisma, updateGuildLogs } from "@repo/database";

function isKeyInGroup<K extends string>(key: string, group: readonly string[]): key is K {
  return group.includes(key);
}

export function getRelation(key: DbConfigKey): RelationName {
  if (isKeyInGroup(key, CONFIG_SCHEMA.logConfig)) return "logConfig";
  if (isKeyInGroup(key, CONFIG_SCHEMA.registerConfig)) return "registerConfig";
  if (isKeyInGroup(key, CONFIG_SCHEMA.welcomeConfig)) return "welcomeConfig";
  return "root";
}

export function getCurrentValue(data: GuildWithLogs, key: DbConfigKey): string | null {
  const relation = getRelation(key);

  if (relation === "root") {
    return (data as unknown as Record<string, string | null>)[key] ?? null;
  }

  const nestedData = data[relation as keyof GuildWithLogs];

  if (!nestedData) return null;

  return (nestedData as unknown as Record<string, string | null>)[key] ?? null;
}

export async function updateConfig(guildId: string, key: DbConfigKey, value: string | null) {
  const relation = getRelation(key);

  switch (relation) {
    case "logConfig":
      // Use the existing updateGuildLogs function
      return updateGuildLogs(guildId, { [key]: value });
    case "registerConfig":
    case "welcomeConfig":
    case "root":
    default:
      // These fields are on the Guild model
      return prisma.guild.update({
        where: { id: guildId },
        data: { [key]: value },
      });
  }
}
