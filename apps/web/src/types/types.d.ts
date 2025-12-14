export type Guild = {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
};

export type CachedGuilds = {
  guilds: Guild[];
  timestamp: number;
};

// Type for sanitized role from bot API
export interface SafeRole {
  id: string;
  name: string;
  color: number;
  position: number;
  hoist: boolean;
  permissions: string;
}

// Type for sanitized channel from bot API
export interface SafeChannel {
  id: string;
  name: string;
  type: number;
  parentId: string | null;
}

// Re-export guilds type from database package
export type { guilds as Guilds } from "@repo/database";
