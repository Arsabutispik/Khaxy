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
  StringSelectMenuInteraction,
} from "discord.js";
import { i18n, TFunction } from "i18next";
import { Config } from "@lib";
import { InfractionType } from "@constants";
import type { guilds as Guilds } from "@prisma/client";
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
  execute(interaction: ChatInputCommandInteraction<"cached">): unknown;
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
  | "member_role_id"
  | "male_role_id"
  | "female_role_id"
  | "colour_id_of_the_day"
  | "mute_role_id"
  | "dj_role_id"
  | "staff_role_id"
  | "unverified_role_id";