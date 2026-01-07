import dayjs, { Dayjs } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import "dayjs/locale/en.js";
import "dayjs/locale/tr.js";
import { ChannelType, Client, Guild, User } from "discord.js";
import type { PartialUser } from "discord.js";
import { logger } from "@lib";
import { returnWebhook, WebhookType } from "@utils";
import { getOrCreateGuild, updateGuildConfig } from "@repo/database";

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

export async function modLog(
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
  let guildConfig = await getOrCreateGuild(guild.id);
  const t = client.i18next.getFixedT(guildConfig.language);
  const caseNumber = caseID || guildConfig.caseId;
  // Update the case ID in the database if the action is not "CHANGES"
  if (action !== "CHANGES") {
    try {
      await updateGuildConfig(guild.id, { caseId: caseNumber + 1 });
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
  if (!guildConfig.logConfig?.modLogsChannelId) return;

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
      message += t("mod_log.mute", {
        moderator,
        user,
        reason,
        duration: dayjs(duration).locale(guildConfig.language).fromNow(true),
      });
      break;
    case "TIMED_BAN":
      message += t("mod_log.timed_ban", {
        moderator,
        user,
        reason,
        duration: dayjs(duration).locale(guildConfig.language).fromNow(true),
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
        duration: dayjs(duration).locale(guildConfig.language).fromNow(true),
      });
      break;
    case "TIMEOUT":
      message += t("mod_log.timeout", {
        moderator,
        user,
        reason,
        duration: dayjs(duration).locale(guildConfig.language).fromNow(true),
      });
      break;
    case "UNMUTE":
      message += t("mod_log.unmute", { moderator, user, reason });
      break;
  }

  const channel = guild.channels.cache.get(guildConfig.logConfig.modLogsChannelId);
  if (channel && channel.type === ChannelType.GuildText) {
    const webhook = await returnWebhook(client, channel, guild.id, guildConfig, {
      id: guildConfig.logConfig.modLogsWebhookId,
      type: WebhookType.MOD_LOGS,
    });
    if (webhook)
      await webhook.send({ content: message }).catch((error) => {
        logger.log({
          level: "error",
          message: `Error sending mod log webhook in ${guild.name} (${guild.id})`,
          error: error,
        });
      });
  }
}
