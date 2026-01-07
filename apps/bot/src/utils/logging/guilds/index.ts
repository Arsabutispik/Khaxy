import {
  Guild,
  GuildMember,
  PartialGuildMember,
  PartialUser,
  User,
} from "discord.js";
import { GuildWithLogs } from "@repo/database";
import { TFunction } from "i18next";

export interface LogBanOptions {
  guild: Guild;
  user: User;
  reason: string;
  executor?: User | PartialUser | null;
  guildConfig: GuildWithLogs;
  t: TFunction;
}
interface BaseLogOptions {
  guildConfig: GuildWithLogs;
  t: TFunction;
}

interface ManualLogOptions extends BaseLogOptions {
  executor?: User | PartialUser | null;
  reason?: string;
}

export interface LogKickOptions extends ManualLogOptions {
  member: GuildMember | PartialGuildMember;
  isAKick?: boolean;
}

export interface LogMemberUpdateOptions extends BaseLogOptions {
  oldMember: GuildMember | PartialGuildMember;
  newMember: GuildMember;
}

export interface LogActionOptions extends ManualLogOptions {
  member: GuildMember;
  action: "timeout" | "removeTimeout" | "rolesUpdate" | "nicknameChange";
  addedRoles?: string[];
  removedRoles?: string[];
  oldNickname?: string;
  newNickname?: string;
  timeoutUntil?: Date;
}

export * from "./auditLogs/index.js";
export * from "./invites/index.js";
export * from "./scheduledEvents/index.js";
export * from "./soundboardEvents/index.js";
export * from "./banAdd.js";
export * from "./banRemove.js";
export * from "./memberKick.js";
export * from "./memberUpdate.js";
export * from "./update.js";
export * from "./utils.js";