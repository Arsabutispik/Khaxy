import { CONFIG_SCHEMA, DbConfigKey, RelationName } from "src/constants/index.js";
import { GuildWithLogs } from "@repo/database";

// Helper to check if a key is in a specific array (Type Guard)
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

export function getUpdatePayload(key: DbConfigKey, value: string | null) {
  const relation = getRelation(key);

  if (relation === "root") {
    return { [key]: value };
  }

  return {
    [relation]: {
      upsert: {
        create: { [key]: value },
        update: { [key]: value },
      },
    },
  };
}
