import { GuildScheduledEvent, PartialGuildScheduledEvent, PartialUser, User } from "discord.js";
import { GuildWithLogs } from "@repo/database";

export interface GuildScheduledEvents {
  event: GuildScheduledEvent | PartialGuildScheduledEvent;
  executor?: User | PartialUser | null;
  guildConfig: GuildWithLogs;
}

export * from "./create.js";
export * from "./delete.js";
export * from "./update.js";
export * from "./userAdd.js";
export * from "./userRemove.js";
