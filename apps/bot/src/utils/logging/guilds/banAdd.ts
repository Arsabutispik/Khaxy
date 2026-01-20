import { ChannelType, EmbedBuilder } from "discord.js";
import { LogBanOptions, returnWebhook, WebhookType } from "@utils";
import { logger } from "@lib";

export async function logBanAdd({ guild, user, reason, executor, guildConfig }: LogBanOptions) {
  if (!guildConfig.logConfig?.guildLogsChannelId) return;

  const logChannel = guild.channels.cache.get(guildConfig.logConfig.guildLogsChannelId);
  if (logChannel?.type !== ChannelType.GuildText) return;

  const webhook = await returnWebhook(guild.client, logChannel, guild.id, guildConfig, {
    id: guildConfig.logConfig.guildLogsWebhookId,
    type: WebhookType.GUILD_LOGS,
  });
  if (!webhook) return;
  const t = guild.client.i18next.getFixedT(guildConfig.language, "loggers", "guildBanEvents");
  const embed = new EmbedBuilder()
    .setTitle(t(($) => $.banAdd.embed.title))
    .setColor("Red")
    .setThumbnail(user.displayAvatarURL())
    .setTimestamp()
    .setDescription(t(($) => $.banAdd.embed.description, { user }))
    .addFields([{ name: t(($) => $.banAdd.embed.fields.reason), value: reason }])
    .setFooter({
      text: executor?.tag || t(($) => $.unknownExecutor),
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
