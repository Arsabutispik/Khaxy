import { CachedGuilds, Guild, SafeChannel, SafeRole } from "@/types/types";
import { GuildWithLogs } from "@repo/database";

const USER_GUILD_CACHE = new Map<string, CachedGuilds>();
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes (600 seconds)

// --- CENTRALIZED API CLIENT ---
const API_BASE_URL = process.env.FASTIFY_API_URL;
const API_KEY = process.env.INTERNAL_API_KEY;

// Validate env vars at module load (fail fast in development)
if (!API_BASE_URL || !API_KEY) {
  console.warn(
    "[API Client] Missing FASTIFY_API_URL or INTERNAL_API_KEY environment variables",
  );
}

interface ApiRequestOptions {
  revalidate?: number | false;
  tags?: string[];
}

class BotApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "BotApiError";
    this.statusCode = statusCode;
  }
}

/**
 * Centralized fetch wrapper for bot API calls
 */
async function botApiFetch<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T | null> {
  if (!API_BASE_URL || !API_KEY) {
    console.error("[API Client] Missing API configuration");
    return null;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        "x-internal-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      next:
        options.revalidate !== undefined
          ? { revalidate: options.revalidate, tags: options.tags }
          : undefined,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(
        `[API Client] ${endpoint} failed (${res.status}):`,
        errorText,
      );

      // Throw for specific error handling if needed
      if (res.status === 401) {
        throw new BotApiError("Unauthorized - check API key", 401);
      }
      if (res.status === 404) {
        return null; // Not found is a valid "no data" response
      }

      throw new BotApiError(errorText || "Unknown error", res.status);
    }

    return res.json() as Promise<T>;
  } catch (err) {
    if (err instanceof BotApiError) {
      throw err;
    }
    console.error(`[API Client] Network error for ${endpoint}:`, err);
    return null;
  }
}

/**
 * Check if the bot API is healthy
 */
export async function checkBotApiHealth(): Promise<boolean> {
  if (!API_BASE_URL) return false;

  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Get bot status information
 */
export async function getBotStatus(): Promise<{
  status: string;
  username: string | null;
  guildCount: number;
  uptime: number | null;
} | null> {
  return botApiFetch("/api/bot/status", { revalidate: 60 });
}

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
): Promise<{ guildId: string; settings: GuildWithLogs } | null> {
  return botApiFetch(`/api/guilds/${guildId}/settings`);
}

export async function getGuildChannels(
  guildId: string,
): Promise<{ guildId: string; channels: SafeChannel[] } | null> {
  return botApiFetch(`/api/guilds/${guildId}/channels`, { revalidate: 300 });
}

export async function getGuildRoles(
  guildId: string,
): Promise<{ guildId: string; roles: SafeRole[] } | null> {
  return botApiFetch(`/api/guilds/${guildId}/roles`, { revalidate: 300 });
}
export async function getGuildInfo(guildId: string): Promise<{
  id: string;
  name: string;
  memberCount: number;
  botNickname: string | null;
  botAvatar: string | null;
  botUsername: string | null;
  botGlobalAvatar: string | null;
} | null> {
  return botApiFetch(`/api/bot/guild/${guildId}`, { revalidate: 60 });
}

export async function updateBotProfile(
  guildId: string,
  data: { nickname?: string | null; avatar?: string | null },
): Promise<{
  success: boolean;
  nickname: string | null;
  avatar: string | null;
} | null> {
  if (!API_BASE_URL || !API_KEY) {
    console.error("[API Client] Missing API configuration");
    return null;
  }

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/bot/guild/${guildId}/profile`,
      {
        method: "POST",
        headers: {
          "x-internal-api-key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error(
        `[API Client] updateBotProfile failed (${res.status}):`,
        errorText,
      );
      return null;
    }

    return res.json();
  } catch (err) {
    console.error("[API Client] Network error for updateBotProfile:", err);
    return null;
  }
}
