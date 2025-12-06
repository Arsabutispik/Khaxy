// --- GLOBAL IN-MEMORY CACHE (Server-Side) ---
// This cache is shared across all concurrent requests on the current server instance.
// In a production environment with multiple servers, this would be replaced by Redis or Memcached.
import { CachedGuilds, Guild } from "@/types/types";
import { APIChannel, APIRole } from "discord-api-types/v10";
import { guilds as Guilds } from "@repo/database";
const USER_GUILD_CACHE = new Map<string, CachedGuilds>();
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes (600 seconds)

// Helper function to check for "MANAGE_GUILD" permission
export const hasManageGuildPermission = (permissions: string) => {
  const MANAGE_GUILD_PERMISSION_BIT = 0x20;
  return (
    (parseInt(permissions) & MANAGE_GUILD_PERMISSION_BIT) ===
    MANAGE_GUILD_PERMISSION_BIT
  );
};
export async function fetchUserGuilds(
  userId: string,
  accessToken: string,
): Promise<Guild[]> {
  const cachedData = USER_GUILD_CACHE.get(userId);
  const currentTime = Date.now();

  // 1. Check if cache exists and is still fresh
  if (cachedData && currentTime - cachedData.timestamp < CACHE_DURATION_MS) {
    console.log(`[Cache Hit] Serving guilds for user ${userId} from cache.`);
    return cachedData.guilds;
  }

  // 2. Cache miss or stale: Fetch from Discord
  console.log(
    `[Cache Miss] Fetching fresh guilds for user ${userId} from Discord.`,
  );
  const res = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bearer ${accessToken}` },
    // **IMPORTANT:** Remove Next.js revalidate here. We are managing the cache manually now.
  });

  if (!res.ok) {
    console.error("Failed to fetch user guilds:", await res.text());
    // Fallback: If fetch fails but stale data exists, return stale data
    if (cachedData) return cachedData.guilds;
    return [];
  }

  const guilds: Guild[] = await res.json();

  // 3. Update cache
  USER_GUILD_CACHE.set(userId, {
    guilds: guilds,
    timestamp: currentTime,
  });

  return guilds;
}

// fetchBotGuilds remains the same, leveraging Next.js global caching (revalidate: 600)
export async function fetchBotGuilds(botToken: string): Promise<Guild[]> {
  const res = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bot ${botToken}` },
    // This bot data is non-personal and is safely cached globally by Next.js SWR mechanism
    next: { revalidate: 600 },
  });
  if (!res.ok) {
    console.error("Failed to fetch bot guilds:", await res.text());
    return [];
  }
  return res.json();
}
export async function getGuildSettings(
  guildId: string,
): Promise<{ settings: Guilds } | null> {
  const API_BASE_URL = process.env.FASTIFY_API_URL;

  const API_KEY = process.env.INTERNAL_API_KEY;

  const res = await fetch(`${API_BASE_URL}/api/guilds/${guildId}/settings`, {
    headers: {
      "x-internal-api-key": API_KEY || "",
    },
  });

  if (!res.ok) {
    console.error("Failed to fetch guild settings:", await res.text());

    return null;
  }

  return res.json();
}

export async function getGuildChannels(
  guildId: string,
): Promise<{ channels: APIChannel[] } | null> {
  const API_BASE_URL = process.env.FASTIFY_API_URL;
  const API_KEY = process.env.INTERNAL_API_KEY;

  const res = await fetch(`${API_BASE_URL}/api/guilds/${guildId}/channels`, {
    headers: {
      "x-internal-api-key": API_KEY || "",
    },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    console.error("Failed to fetch guild channels:", await res.text());
    return null;
  }
  return res.json();
}
export async function getGuildRoles(
  guildId: string,
): Promise<{ roles: APIRole[] } | null> {
  const API_BASE_URL = process.env.FASTIFY_API_URL;
  const API_KEY = process.env.INTERNAL_API_KEY;

  const res = await fetch(`${API_BASE_URL}/api/guilds/${guildId}/roles`, {
    headers: {
      "x-internal-api-key": API_KEY || "",
    },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    console.error("Failed to fetch guild roles:", await res.text());
    return null;
  }

  return res.json();
}
export async function getGuildInfo(
  guildId: string,
): Promise<{ name: string; guildId: string; memberCount: number } | null> {
  const API_BASE_URL = process.env.FASTIFY_API_URL;
  const API_KEY = process.env.INTERNAL_API_KEY;

  const res = await fetch(`${API_BASE_URL}/api/bot/guild/${guildId}`, {
    headers: {
      "x-internal-api-key": API_KEY || "",
    },
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    console.error("Failed to fetch guild info:", await res.text());
    return null;
  }

  return res.json();
}
