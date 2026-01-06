import { ChannelType, EmbedBuilder } from "discord.js";
import { LogBanOptions, returnWebhook, WebhookType } from "@utils";
import { logger } from "@lib";

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
