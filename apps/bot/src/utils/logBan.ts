import { ChannelType, EmbedBuilder, type Guild, PartialUser, type User } from "discord.js";
import { returnWebhook, WebhookType } from "./index.js";
import { logger } from "src/lib/index.js";
import type { GuildWithLogs } from "@repo/database";
import type { TFunction } from "i18next";

interface LogBanOptions {
  guild: Guild;
  user: User;
  reason: string;
  executor?: User | PartialUser | null;
  guildConfig: GuildWithLogs;
  t: TFunction;
}

export async function logBanAdd({ guild, user, reason, executor, guildConfig, t }: LogBanOptions) {
  if (!guildConfig.logConfig?.guildLogsChannelId) return;

  const logChannel = guild.channels.cache.get(guildConfig.logConfig.guildLogsChannelId);
  if (logChannel?.type !== ChannelType.GuildText) return;

  const webhook = await returnWebhook(guild.client, logChannel, guild.id, guildConfig, {
    id: guildConfig.logConfig.guildLogsWebhookId,
    type: WebhookType.GUILD_LOGS,
  });
  if (!webhook) return;

  const embed = new EmbedBuilder()
    .setTitle(t("embed.title"))
    .setColor("Red")
    .setThumbnail(user.displayAvatarURL())
    .setTimestamp()
    .setDescription(t("embed.description", { user }))
    .addFields([{ name: t("embed.fields.reason"), value: reason }])
    .setFooter({
      text: executor?.tag || t("unknown_executor"),
      iconURL: executor?.displayAvatarURL() || undefined,
    });

  await webhook.send({ embeds: [embed], allowedMentions: { parse: [] } }).catch((error) => {
    logger.log({
      level: "error",
      message: `Failed to send ban log in ${guild.name} (${guild.id})`,
      error,
      channelId: logChannel.id,
    });
  });
}

export async function logBanRemove({ guild, user, reason, executor, guildConfig, t }: LogBanOptions) {
  if (!guildConfig.logConfig?.guildLogsChannelId) return;
  const logChannel = guild.channels.cache.get(guildConfig.logConfig.guildLogsChannelId);
  if (logChannel?.type !== ChannelType.GuildText) return;
  const webhook = await returnWebhook(guild.client, logChannel, guild.id, guildConfig, {
    id: guildConfig.logConfig.guildLogsWebhookId,
    type: WebhookType.GUILD_LOGS,
  });
  const embed = new EmbedBuilder()
    .setTitle(t("embed.title"))
    .setColor("Green")
    .setThumbnail(user.displayAvatarURL())
    .setDescription(t("embed.description", { user: user }))
    .setFooter({
      text: executor?.tag || t("unknown_executor"),
      iconURL: executor?.displayAvatarURL() || undefined,
    })
    .setTimestamp()
    .addFields([
      {
        name: t("embed.fields.reason"),
        value: reason || t("no_reason"),
      },
    ]);
  if (!webhook) return;
  await webhook
    .send({
      embeds: [embed],
      allowedMentions: { parse: [] }, // Prevent mentions in the log
    })
    .catch((error) => {
      logger.log({
        level: "error",
        message: `Failed to send guildBanRemove embed in ${guild.name} (${guild.id})`,
        error,
        channelId: logChannel.id,
      });
    });
}
