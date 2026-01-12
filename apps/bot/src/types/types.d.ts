import {
  ChatInputCommandInteraction,
  Collection,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  SlashCommandOptionsOnlyBuilder,
  ClientEvents,
  Awaitable,
  Guild,
  Snowflake,
  Webhook,
} from "discord.js";
import { i18n } from "i18next";
import { Config } from "@lib";
import { GuildWithLogs, InfractionType } from "@repo/database";

declare module "discord.js" {
  interface Client {
    slashCommands: Collection<string, SlashCommandBase>;
    i18next: i18n;
    allEmojis: Collection<string, { name: string; format: string; id?: string }>;
    config: typeof Config;
    webhooks: Collection<string, Webhook | undefined>;
  }
}
export interface SlashCommandBase {
  memberPermissions?: bigint[];
  clientPermissions?: bigint[];
  data?: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder;
  execute(interaction: ChatInputCommandInteraction<"cached">, guildData: GuildWithLogs): unknown;
}

export interface EventBase<T extends keyof ClientEvents = keyof ClientEvents> {
  name: T;
  once?: boolean;
  execute: (...args: ClientEvents[T]) => Awaitable<void>;
}

export interface infractionParameters {
  guild: Guild;
  member: Snowflake;
  moderator: Snowflake;
  type: InfractionType;
  reason: string;
}

declare module "fastify" {
  interface FastifyInstance {
    discord: import("discord.js").Client;
  }
}
export type DynamicChannelTypes =
  | "registerJoinChannelId"
  | "registerChannelId"
  | "joinChannelId"
  | "leaveChannelId"
  | "modLogsChannelId"
  | "modMailChannelId"
  | "bumpLeaderboardChannelId"
  | "messageLogsChannelId"
  | "guildMemberLogsChannelId"
  | "guildLogsChannelId"
  | "voiceLogsChannelId"
  | "channelLogsChannelId"
  | "emojiLogsChannelId"
  | "roleLogsChannelId"
  | "stickerLogsChannelId"
  | "eventLogsChannelId"
  | "inviteLogsChannelId"
  | "pollLogsChannelId"
  | "stageLogsChannelId"
  | "soundboardLogsChannelId"
  | "threadLogsChannelId"
  | "webhookLogsChannelId";

export type RoleType =
  | "memberRoleId"
  | "maleRoleId"
  | "femaleRoleId"
  | "colourIdOfTheDay"
  | "muteRoleId"
  | "djRoleId"
  | "staffRoleId"
  | "unverifiedRoleId";
