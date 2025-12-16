import {
  ChatInputCommandInteraction,
  Collection,
  SlashCommandBuilder,
  ClientEvents,
  Awaitable,
  Guild,
  Snowflake,
  Webhook,
  WebhookType,
} from "discord.js";
import { i18n } from "i18next";
import { Config } from "src/lib/index.js";
import { InfractionType } from "src/constants/index.js";
import { GuildWithLogs } from "@repo/database";

declare module "discord.js" {
  interface Client {
    slashCommands: Collection<string, SlashCommandBase>;
    i18next: i18n;
    allEmojis: Collection<string, { name: string; format: string; id?: string }>;
    config: typeof Config;
    webhooks: Collection<string, Webhook<WebhookType.Incoming | WebhookType.ChannelFollower> | undefined>;
  }
}
export interface SlashCommandBase {
  memberPermissions?: bigint[];
  clientPermissions?: bigint[];
  data?: SlashCommandBuilder;
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
  | "register_join_channel_id"
  | "register_channel_id"
  | "join_channel_id"
  | "leave_channel_id"
  | "mod_logs_channel_id"
  | "mod_mail_channel_id"
  | "bump_leaderboard_channel_id"
  | "message_logs_channel_id"
  | "guild_member_logs_channel_id"
  | "guild_logs_channel_id"
  | "voice_logs_channel_id"
  | "channel_logs_channel_id"
  | "emoji_logs_channel_id"
  | "role_logs_channel_id"
  | "sticker_logs_channel_id"
  | "event_logs_channel_id"
  | "invite_logs_channel_id"
  | "poll_logs_channel_id"
  | "stage_logs_channel_id"
  | "soundboard_logs_channel_id"
  | "thread_logs_channel_id"
  | "webhook_logs_channel_id";

export type RoleType =
  | "memberRoleId"
  | "maleRoleId"
  | "femaleRoleId"
  | "colourIdOfTheDay"
  | "muteRoleId"
  | "djRoleId"
  | "staffRoleId"
  | "unverifiedRoleId";
