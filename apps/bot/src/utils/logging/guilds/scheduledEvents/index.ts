import { GuildScheduledEvent, PartialGuildScheduledEvent, PartialUser, User } from "discord.js";
import { GuildWithLogs } from "@repo/database";
import { TFunction } from "i18next";

export interface GuildScheduledEvents {
  event: GuildScheduledEvent | PartialGuildScheduledEvent;
  executor?: User | PartialUser | null;
  guildConfig: GuildWithLogs;
  t: TFunction;
}

export * from "./create.js";
export * from "./delete.js";
export * from "./update.js";
export * from "./userAdd.js";
export * from "./userRemove.js";