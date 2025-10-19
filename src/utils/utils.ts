import {
  ActivityType,
  Client,
  Collection,
  Guild,
  GuildForumTagEmoji,
  TextChannel,
  Webhook,
  WebhookType as DiscordWebhookType,
} from "discord.js";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";
import "dayjs/locale/tr.js";
import { getGuildConfig, updateGuildConfig } from "@database";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { logger } from "@lib";
dayjs.extend(relativeTime);

/**
 * Pauses execution for a specified number of milliseconds.
 *
 * @param ms - The number of milliseconds to sleep.
 * @returns A promise that resolves after the specified time.
 */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Replaces placeholders in a string with the values from an object.
 * @param template - The string with placeholders.
 * @param replacements - The object with the values to replace.
 * @returns The string with the placeholders replaced.
 */
function replacePlaceholders(template: string, replacements: Record<string, string>): string {
  return template.replace(/\{(\w+)}/g, (match, key) => {
    return key in replacements ? replacements[key] : match;
  });
}

/**
 * Returns a string of missing permissions in a human-readable format.
 * @param client - Client instance
 * @param missing - Array of missing permissions
 * @param language - The language code
 * @returns A string of missing permissions in a human-readable format.
 */
function missingPermissionsAsString(client: Client, missing: string[], language: string) {
  const t = client.i18next.getFixedT(language, "permissions");
  return missing.map((perm) => t(`permissions.${perm}`)).join(", ");
}
/**
 * Converts a bigint or string to a string.
 * @param id - The bigint or string to convert.
 * @returns The string representation of the bigint or string.
 */
function toStringId(id: bigint | string | null | undefined): string | "0" {
  if (!id) return "0";
  return id.toString();
}

dayjs.extend(duration);

/**
 * Trims a string to a specified maximum length, ensuring it does not cut off words.
 * If the string is longer than the maximum length, it will be trimmed and an ellipsis will be added.
 * @param str - The string to trim.
 * @param maxLength - The maximum length of the string.
 * @returns The trimmed string with an ellipsis if it was trimmed.
 */
function trimString(str: string, maxLength = 100): string {
  if (str.length <= maxLength) return str;
  const trimmed = str.slice(0, maxLength);
  return trimmed.slice(0, trimmed.lastIndexOf(" ")) + "...";
}
function getKeysForValue<T extends Record<string, unknown>, V>(obj: T, targetValue: V): (keyof T)[] {
  const keys: (keyof T)[] = [];

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Convert the config value to a string for comparison
      const configValueAsString = String(obj[key]);

      // Ensure the targetValue is also a string for a clean comparison
      const targetValueAsString = String(targetValue);

      if (configValueAsString === targetValueAsString) {
        keys.push(key);
      }
    }
  }

  return keys;
}
const CHANNEL_TO_WEBHOOK_MAP = {
  // Config Key (Channel ID)       :  Target Key (Webhook ID)
  message_logs_channel_id: "message_logs_webhook_id",
  guild_logs_channel_id: "guild_logs_webhook_id",
  guild_member_logs_channel_id: "guild_member_logs_webhook_id",
  channel_logs_channel_id: "channel_logs_webhook_id",
  voice_logs_channel_id: "voice_logs_webhook_id",
  emoji_logs_channel_id: "emoji_logs_webhook_id",
  role_logs_channel_id: "role_logs_webhook_id",
  sticker_logs_channel_id: "sticker_logs_webhook_id",
  event_logs_channel_id: "event_logs_webhook_id",
  invite_logs_channel_id: "invite_logs_webhook_id",
  poll_logs_channel_id: "poll_logs_webhook_id",
  stage_logs_channel_id: "stage_logs_webhook_id",
  thread_logs_channel_id: "thread_logs_webhook_id",
  webhook_logs_channel_id: "webhook_logs_webhook_id",
} as const;
export enum WebhookType {
  MESSAGE_LOGS = "message_logs_webhook_id",
  GUILD_LOGS = "guild_logs_webhook_id",
  MOD_LOGS = "mod_logs_webhook_id",
  GUILD_MEMBER_LOGS = "guild_member_logs_webhook_id",
  VOICE_LOGS = "voice_logs_webhook_id",
  CHANNEL_LOGS = "channel_logs_webhook_id",
  EMOJI_LOGS = "emoji_logs_webhook_id",
  ROLE_LOGS = "role_logs_webhook_id",
  STICKER_LOGS = "sticker_logs_webhook_id",
  EVENT_LOGS = "event_logs_webhook_id",
  INVITE_LOGS = "invite_logs_webhook_id",
  POLL_LOGS = "poll_logs_webhook_id",
  STAGE_LOGS = "stage_logs_webhook_id",
  SOUNDBOARD_LOGS = "soundboard_logs_webhook_id",
  THREAD_LOGS = "thread_logs_webhook_id",
  WEBHOOK_LOGS = "webhook_logs_webhook_id",
}
// Assuming currentConfig is the full row from the 'guilds' table
// and updateGuildConfig can take a partial object of updates.
type ConfigKey = keyof typeof CHANNEL_TO_WEBHOOK_MAP;
type WebhookKey = (typeof CHANNEL_TO_WEBHOOK_MAP)[ConfigKey];
async function returnWebhook(
  client: Client,
  channel: TextChannel,
  guildId: string,
  webhookInfo: { id: bigint | null; type: WebhookType },
): Promise<Webhook<DiscordWebhookType.Incoming | DiscordWebhookType.ChannelFollower>> {
  try {
    if (client.webhooks.has(toStringId(webhookInfo.id))) return client.webhooks.get(toStringId(webhookInfo.id))!;
    const currentConfig = await getGuildConfig(guildId);
    const webhooks = await channel
      .fetchWebhooks()
      .catch(() => new Collection<string, Webhook<DiscordWebhookType.Incoming | DiscordWebhookType.ChannelFollower>>());
    const webhookIdStr = webhookInfo.id?.toString();
    let webhook = webhookIdStr ? webhooks.get(webhookIdStr) : undefined;

    // If we cleaned up, or if the ID was null originally, create the new webhook.
    if (!webhook) {
      webhook = await channel.createWebhook({
        name: `${client.user!.username} - Logs`, // A generic name since it's shared
        avatar: client.user!.displayAvatarURL(),
      });

      // Update the database with the NEW webhook ID for the current log type.
      // The SQL trigger will then propagate this new ID to all other types
      // that share the same channel ID.
      const update: Partial<Record<WebhookType, bigint>> = {};
      const channelKeys = getKeysForValue(currentConfig as Record<string, unknown>, channel.id);

      for (const channelKey of channelKeys) {
        // Ensure the key is one that we expect to map
        if (channelKey in CHANNEL_TO_WEBHOOK_MAP) {
          // 2. Map the found channel key to the target webhook key
          const webhookKey = CHANNEL_TO_WEBHOOK_MAP[channelKey as ConfigKey];

          // 3. Update the correct webhook ID field with the new BigInt value
          update[webhookKey as WebhookKey] = BigInt(webhook.id);

          // Optional: If you also want to clear the old channel ID value, do this:
          // update[channelKey as ConfigKey] = null;
        }
      }
      await updateGuildConfig(guildId, update);
    }

    client.webhooks.set(webhook.id, webhook);
    return webhook;
  } catch (error) {
    logger.log({
      level: "error",
      error,
      message: `Failed to return or create webhook in guild ${guildId} for channel ${channel.id}`,
      channelId: channel.id,
    });
    throw error; // Re-throw after logging
  }
}

interface ActivityMessage {
  type: ActivityType;
  message: string;
  reload?: boolean;
}
/**
 * Formats a message by replacing placeholders with values from an object.
 * @param messages - The messages to format.
 * @param values - The object containing values to replace in the message.
 * @returns The formatted message string.
 */
function updateReloadableMessages(messages: ActivityMessage[], values: Record<string, string>): ActivityMessage[] {
  return messages.map((msg) => {
    if (!msg.reload) return msg;

    // Rebuild message with current values
    const formattedMessage = replacePlaceholders(msg.message, values);
    return {
      ...msg,
      message: formattedMessage,
    };
  });
}
function formatUpdatedTagEmoji(guild: Guild, emoji: GuildForumTagEmoji | string | null | undefined): string {
  if (!emoji) return "N/A";

  // Unicode emoji
  if (typeof emoji === "string") return emoji;

  // Custom guild emoji
  if (emoji.id) {
    const guildEmoji = guild.emojis.cache.get(emoji.id);
    if (guildEmoji) return `<:${guildEmoji.name}:${guildEmoji.id}>`;
    return `<:${emoji.name ?? "unknown"}:${emoji.id}>`; // fallback
  }

  // Unicode fallback (name)
  if (emoji.name) return emoji.name;

  return "N/A";
}

const secondsMap: Record<string, string> = {
  en: "seconds",
  tr: "saniye",
};

function formatUnit(value: number, unit: "s" | "m" | "h", locale = dayjs.locale()) {
  const lang = locale.split("-")[0];
  const rel = dayjs.Ls[lang]?.relativeTime;
  if (!rel) throw new Error(`Missing relativeTime for locale: ${locale}`);

  if (unit === "s") {
    const word = secondsMap[lang] ?? secondsMap["en"];
    return `${value} ${word}`;
  }

  if (value === 1) {
    const template = rel[unit];
    if (!template) throw new Error(`Missing template for ${unit}`);
    return template.replace(/^\D+/, "1");
  } else {
    const key = (unit + unit) as keyof typeof rel;
    const template = rel[key];
    if (!template) throw new Error(`Missing template for ${key}`);
    return template.replace("%d", String(value));
  }
}

function formatDuration(ms: number, locale = dayjs.locale()) {
  const d = dayjs.duration(ms);
  const parts: string[] = [];

  if (d.hours()) parts.push(formatUnit(d.hours(), "h", locale));
  if (d.minutes()) parts.push(formatUnit(d.minutes(), "m", locale));
  if (d.seconds()) parts.push(formatUnit(d.seconds(), "s", locale));

  return parts.join(", ");
}

export {
  sleep,
  missingPermissionsAsString,
  replacePlaceholders,
  toStringId,
  formatDuration,
  trimString,
  returnWebhook,
  updateReloadableMessages,
  formatUpdatedTagEmoji,
};
