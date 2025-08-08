import dayjs, { Dayjs } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import "dayjs/locale/en.js";
import "dayjs/locale/tr.js";
import { ChannelType, Client, Guild, User } from "discord.js";
import type { PartialUser } from "discord.js";
import { logger } from "@lib";
import { returnWebhook, toStringId, WebhookType } from "@utils";
import { createGuildConfig, getGuildConfig, updateGuildConfig } from "@database";

// Define the possible actions for the mod log
type actions =
  | "WARNING"
  | "BAN"
  | "KICK"
  | "MUTE"
  | "TIMED_BAN"
  | "CHANGES"
  | "UNBAN"
  | "BAN_EXPIRED"
  | "TIMEOUT"
  | "UNMUTE";

export async function modlog(
  data: {
    guild: Guild;
    user: User | PartialUser | null;
    action: actions;
    moderator: User | PartialUser | string | null;
    reason?: string;
    duration?: Dayjs;
    caseID?: number;
  },
  client: Client,
) {
  const { guild, user, action, moderator, reason, duration, caseID } = data;
  // Fetch guild configuration from the database
  let guild_data = await getGuildConfig(guild.id);
  // If no guild configuration is found, create a new one
  if (!guild_data) {
    try {
      logger.log({
        level: "warning",
        message: `No guild config found for ${guild.id}. Creating a new one.`,
        discord: false,
      });
      await createGuildConfig(guild.id, {});
      logger.log({
        level: "info",
        message: `Guild config for ${guild.id} created successfully.`,
        discord: false,
      });
      guild_data = await getGuildConfig(guild.id);
      if (!guild_data) {
        logger.log({
          level: "error",
          message: `Failed to create guild config for ${guild.id}`,
          discord: false,
        });
        return;
      }
    } catch (error) {
      logger.log({
        level: "error",
        message: `Error creating guild config for ${guild.id}`,
        error: error,
        meta: {
          guildID: guild.id,
        },
      });
      return;
    }
  }
  const lang = guild_data.language || "en-GB";
  const t = client.i18next.getFixedT(lang);
  const caseNumber = caseID || guild_data.case_id;
  // Update the case ID in the database if the action is not "CHANGES"
  if (action !== "CHANGES") {
    try {
      await updateGuildConfig(guild.id, { case_id: caseNumber + 1 });
    } catch (error) {
      logger.log({
        level: "error",
        message: "Error updating case ID",
        error: error,
        meta: {
          guildID: guild.id,
          oldCaseNumber: caseNumber,
        },
      });
      return { message: t("mod_log.function_errors.case_id_error"), type: "ERROR" };
    }
  }
  // If mod log channel is not configured, exit the function
  if (!guild_data.mod_log_channel_id) return;

  let message = `<t:${Math.floor(Date.now() / 1000)}> \`[${caseNumber}]\``;

  dayjs.extend(relativeTime);

  // Construct the log message based on the action
  switch (action) {
    case "WARNING":
      message += t("mod_log.warning", { moderator, user, reason });
      break;
    case "BAN":
      message += t("mod_log.ban", {
        moderator,
        user,
        reason,
        emoji: client.allEmojis.get(client.config.emojis.ban.id)?.format,
      });
      break;
    case "KICK":
      message += t("mod_log.kick", { moderator, user, reason });
      break;
    case "MUTE":
      message += t("mod_log.mute", { moderator, user, reason, duration: dayjs(duration).locale(lang).fromNow(true) });
      break;
    case "TIMED_BAN":
      message += t("mod_log.timed_ban", {
        moderator,
        user,
        reason,
        duration: dayjs(duration).locale(lang).fromNow(true),
        emoji: client.allEmojis.get(client.config.emojis.ban.id)?.format,
      });
      break;
    case "CHANGES":
      message += t("mod_log.changes", {
        moderator,
        user,
        reason,
        case: caseID,
        time: `${Math.floor(Date.now() / 1000)}`,
      });
      break;
    case "UNBAN":
      message += t("mod_log.unban", { moderator, user, reason });
      break;
    case "BAN_EXPIRED":
      message += t("mod_log.ban_expired", {
        moderator,
        user,
        reason,
        duration: dayjs(duration).locale(lang).fromNow(true),
      });
      break;
    case "TIMEOUT":
      message += t("mod_log.timeout", {
        moderator,
        user,
        reason,
        duration: dayjs(duration).locale(lang).fromNow(true),
      });
      break;
    case "UNMUTE":
      message += t("mod_log.unmute", { moderator, user, reason });
      break;
  }

  try {
    // Fetch the mod log channel and send the log message
    const channel = await guild.channels.fetch(toStringId(guild_data.mod_log_channel_id));
    if (channel && channel.type === ChannelType.GuildText) {
      const webhook = await returnWebhook(client, channel, guild.id, {
        id: guild_data.mod_logs_webhook_id,
        type: WebhookType.MOD_LOGS,
      });
      await webhook.send({ content: message });
    }
  } catch (error) {
    logger.log({
      level: "error",
      message: `Modlog channel for ${guild.name} (${guild.id}) not found. Deleting the modlog channel id from the database...`,
      error: error,
    });
    try {
      await updateGuildConfig(guild.id, { mod_log_channel_id: null });
      logger.log({
        level: "info",
        message: `Modlog channel ID deleted for ${guild.name} (${guild.id})`,
        discord: false,
      });
    } catch (error) {
      logger.log({
        level: "error",
        message: `Error deleting modlog channel ID for ${guild.name} (${guild.id})`,
        error: error,
      });
    }
    return { message: t("mod_log.function_errors.channel_not_found"), type: "ERROR" };
  }
}
