import type { EventBase } from "src/types/index.js";
import { ChannelType, EmbedBuilder, Events, time, TimestampStyles } from "discord.js";
import { bumpLeaderboard, modMailMessage, returnWebhook, toStringId, WebhookType } from "src/utils/index.js";
import { getGuildConfig, updateBumpLeaderboard } from "src/database/index.js";
import { logger } from "src/lib/index.js";

export default {
  name: Events.MessageCreate,
  async execute(message) {
    await modMailMessage(message);
    if (!message.inGuild()) return;
    const guildConfig = await getGuildConfig(message.guild.id);
    if (!guildConfig) return;
    const leaderboard = guildConfig.bump_leaderboard_channel_id;
    if (
      message.interaction &&
      message.interaction.commandName === "bump" &&
      message.author.id === "302050872383242240" &&
      message.channel.id === toStringId(leaderboard)
    ) {
      await updateBumpLeaderboard(message.guild.id, message.interaction.user.id);
      await message.delete();
      const result = await bumpLeaderboard(message.client, message.guild.id, message.interaction.user);
      if (result?.error) {
        await message.reply(result.error);
        return;
      }
    } else if (
      message.inGuild() &&
      message.channel.id === toStringId(leaderboard) &&
      message.author.id !== message.client.user!.id
    ) {
      await message.delete().catch(() => null);
      return;
    }
    if (message.inGuild() && message.poll) {
      const t = message.client.i18next.getFixedT(guildConfig.language, "events", "messageCreate");
      if (!guildConfig.poll_logs_channel_id) return;
      const logChannel = message.guild.channels.cache.get(toStringId(guildConfig.poll_logs_channel_id));
      if (logChannel?.type !== ChannelType.GuildText) return;
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle(t("poll_create.embed.title"))
        .setDescription(
          t("poll_create.embed.description", {
            message: message,
            timestamp: time(message.poll.expiresAt!, TimestampStyles.LongDateTime),
            multi_select: message.poll.allowMultiselect
              ? message.client.allEmojis.get(message.client.config.emojis.confirm.id)?.format
              : message.client.allEmojis.get(message.client.config.emojis.reject.id)?.format,
          }),
        )
        .setFields([
          {
            name: message.poll.question.text!,
            value: message.poll.answers
              .map((answer, i) => {
                return `${i}. ${answer.text}`;
              })
              .join("\n"),
          },
        ])
        .setTimestamp()
        .setFooter({
          text: message.author.username,
          iconURL: message.author.displayAvatarURL(),
        });
      const webhook = await returnWebhook(message.client, logChannel, message.guildId, {
        id: guildConfig.poll_logs_webhook_id,
        type: WebhookType.POLL_LOGS,
      });
      await webhook.send({ embeds: [embed] }).catch((error) => {
        logger.log({
          level: "error",
          error,
          message: `Failed to send pollCreate embed in ${message.guild.name} (${message.guild.id})`,
          channelId: logChannel.id,
        });
      });
    }
  },
} satisfies EventBase<Events.MessageCreate>;
