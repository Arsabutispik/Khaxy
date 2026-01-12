import { ChannelType, EmbedBuilder } from "discord.js";
import { returnWebhook, WebhookType, LogBanOptions } from "@utils";
import { logger } from "@lib";

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
