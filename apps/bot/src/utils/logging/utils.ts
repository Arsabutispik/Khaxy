import { logger } from "@lib";

// Keys found on almost every Discord.js structure that we never want to diff
const GLOBAL_IGNORED_KEYS = [
  "client",
  "guild",
  "parent", // often on channels
  "createdAt",
  "createdTimestamp",
  "id", // ID never changes
];

/**
 * Checks for unhandled changes between two Discord.js structures.
 * @param eventName - The name of the event (e.g., "GuildUpdate", "MemberUpdate")
 * @param oldObj - The old structure
 * @param newObj - The new structure
 * @param identifier - A string to identify the target (e.g. "Guild Name (ID)")
 * @param extraIgnoredKeys - Specific keys for this structure you want to ignore (e.g. Managers)
 */
export function logUnhandledChanges<T extends object>(
  eventName: string,
  oldObj: T,
  newObj: T,
  identifier: string,
  extraIgnoredKeys: string[] = [],
) {
  const unhandledChanges: string[] = [];
  const ignored = [...GLOBAL_IGNORED_KEYS, ...extraIgnoredKeys];

  for (const key in newObj) {
    // 1. Skip ignored keys
    if (ignored.includes(key)) continue;

    // 2. Skip functions (methods)
    if (typeof newObj[key] === "function") continue;

    // 3. Compare values
    const oldVal = oldObj[key];
    const newVal = newObj[key];

    // Strict inequality check
    if (oldVal !== newVal) {
      // Filter out double null/undefined to reduce noise
      if (!oldVal && !newVal) continue;

      // Filter out strict Deep Equal if they are objects/arrays
      if (typeof oldVal === "object" && JSON.stringify(oldVal) === JSON.stringify(newVal)) continue;

      unhandledChanges.push(key);
    }
  }

  if (unhandledChanges.length > 0) {
    logger.log({
      level: "warn",
      message: `[${eventName}] Unhandled change detected in ${identifier}. Keys changed: [${unhandledChanges.join(", ")}]`,
    });
  }
}
