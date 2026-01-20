import { ChannelType, EmbedBuilder } from "discord.js";
import { returnWebhook, WebhookType, LogBanOptions } from "@utils";
import { logger } from "@lib";

export async function logBanRemove({ guild, user, reason, executor, guildConfig }: LogBanOptions) {
  if (!guildConfig.logConfig?.guildLogsChannelId) return;
  const logChannel = guild.channels.cache.get(guildConfig.logConfig.guildLogsChannelId);
  if (logChannel?.type !== ChannelType.GuildText) return;
  const webhook = await returnWebhook(guild.client, logChannel, guild.id, guildConfig, {
    id: guildConfig.logConfig.guildLogsWebhookId,
    type: WebhookType.GUILD_LOGS,
  });
  const t = guild.client.i18next.getFixedT(guildConfig.language, "loggers", "guildBanEvents");
  const embed = new EmbedBuilder()
    .setTitle(t(($) => $.banRemove.embed.title))
    .setColor("Green")
    .setThumbnail(user.displayAvatarURL())
    .setDescription(t(($) => $.banRemove.embed.description, { user: user }))
    .setFooter({
      text: executor?.tag || t(($) => $.unknownExecutor),
      iconURL: executor?.displayAvatarURL() || undefined,
    })
    .setTimestamp()
    .addFields([
      {
        name: t(($) => $.banRemove.embed.fields.reason),
        value: reason || t(($) => $.noReason),
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
