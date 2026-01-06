import { EventBase } from "@types";
import { ChannelType, EmbedBuilder, Events, time, TimestampStyles } from "discord.js";
import { getGuildConfig, getModMailThreadByUser, updateModMailMessage } from "src/database/index.js";
import { ModMailThreadStatus } from "@constants";
import { returnWebhook, toStringId, WebhookType } from "@utils";
import { logger } from "@lib";

export default {
  name: Events.MessageUpdate,
  async execute(oldMessage, newMessage) {
    if (oldMessage.partial) oldMessage = await oldMessage.fetch();
    if (newMessage.partial) newMessage = await newMessage.fetch();
    // If the message is a modmail message, handle it separately
    if (oldMessage.content !== newMessage.content && !oldMessage.inGuild()) {
      if (oldMessage.author.bot) return;
      const thread = await getModMailThreadByUser(oldMessage.author.id, ModMailThreadStatus.OPEN);
      if (!thread) return;
      const guild = newMessage.client.guilds.cache.get(toStringId(thread.guild_id));
      if (!guild) return;
      const channel = await guild.channels.fetch(toStringId(thread.channel_id)).catch(() => null);
      if (!channel || !channel.isTextBased()) return;
      const guildConfig = await getGuildConfig(toStringId(thread.guild_id));
      if (!guildConfig) return;
      const t = oldMessage.client.i18next.getFixedT(guildConfig.language, "events", "messageUpdate");
      await channel.send(
        t("message_edit", {
          oldContent: oldMessage.content,
          newContent: newMessage.content,
        }),
      );
      const confirmEmoji = newMessage.client.allEmojis.get(newMessage.client.config.emojis.confirm.id);
      newMessage.reactions.cache
        .get(confirmEmoji!.id || confirmEmoji!.format)
        ?.users?.remove(newMessage.client.user.id);
      await newMessage.react(newMessage.client.allEmojis.get(newMessage.client.config.emojis.edit.id)!.format);
      await updateModMailMessage(oldMessage.id, {
        content: `**${t("message_edit", {
          oldContent: oldMessage.content,
          newContent: newMessage.content,
        })}**`,
      });
    }
    // If the message is in a guild and the content has changed, log it
    if (oldMessage.content !== newMessage.content && oldMessage.inGuild()) {
      if (oldMessage.author.id === newMessage.client.user!.id) return; // Ignore messages sent by the bot itself
      const guildConfig = await getGuildConfig(oldMessage.guild.id);
      if (!guildConfig) return;
      const logChannel = await oldMessage.guild.channels
        .fetch(toStringId(guildConfig.message_logs_channel_id))
        .catch(() => null);
      if (logChannel?.type !== ChannelType.GuildText) return;
      const t = oldMessage.client.i18next.getFixedT(guildConfig.language, "events", "messageUpdate");
      const webhook = await returnWebhook(oldMessage.client, logChannel, oldMessage.guild.id, {
        id: guildConfig.message_logs_webhook_id,
        type: WebhookType.MESSAGE_LOGS,
      });
      const embed = new EmbedBuilder()
        .setTitle(t("embed.title"))
        .setDescription(t("embed.description", { message: newMessage }))
        .setColor("Yellow")
        .addFields([
          {
            name: t("embed.fields.oldContent"),
            value: oldMessage.content,
            inline: true,
          },
          {
            name: t("embed.fields.newContent"),
            value: newMessage.content,
            inline: true,
          },
        ])
        .setTimestamp();
      await webhook
        .send({
          embeds: [embed],
          allowedMentions: { parse: [] }, // Prevent mentions in the log
        })
        .catch((error) => {
          logger.log({
            level: "error",
            error,
            message: `Failed to send messageUpdate embed in ${oldMessage.guild.name} (${oldMessage.guild.id})`,
            channelId: logChannel.id,
          });
        });
    }
    if (
      newMessage.inGuild() &&
      oldMessage.poll?.resultsFinalized !== newMessage.poll?.resultsFinalized &&
      newMessage.poll
    ) {
      const guildConfig = await getGuildConfig(newMessage.guild.id);
      if (!guildConfig) return;
      const t = newMessage.client.i18next.getFixedT(guildConfig.language, "events", "messageUpdate");
      if (!guildConfig.poll_logs_channel_id) return;
      const logChannel = newMessage.guild.channels.cache.get(toStringId(guildConfig.poll_logs_channel_id));
      if (logChannel?.type !== ChannelType.GuildText) return;
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle(t("poll_end.embed.title"))
        .setDescription(
          t("poll_end.embed.description", {
            message: newMessage,
            timestamp: time(newMessage.poll.expiresAt!, TimestampStyles.LongDateTime),
            multi_select: newMessage.poll.allowMultiselect
              ? newMessage.client.allEmojis.get(newMessage.client.config.emojis.confirm.id)?.format
              : newMessage.client.allEmojis.get(newMessage.client.config.emojis.reject.id)?.format,
          }),
        )
        .setFields([
          {
            name: newMessage.poll.question.text!,
            value: newMessage.poll.answers
              .map((answer, i) => {
                return `${i}. ${answer.text} (${answer.voteCount})`;
              })
              .join("\n"),
          },
        ])
        .setTimestamp()
        .setFooter({
          text: newMessage.author.username,
          iconURL: newMessage.author.displayAvatarURL(),
        });
      const webhook = await returnWebhook(newMessage.client, logChannel, newMessage.guildId, {
        id: guildConfig.poll_logs_webhook_id,
        type: WebhookType.POLL_LOGS,
      });
      await webhook.send({ embeds: [embed] }).catch((error) => {
        logger.log({
          level: "error",
          error,
          message: `Failed to send pollFinalize embed in ${newMessage.guild.name} (${newMessage.guild.id})`,
          channelId: logChannel.id,
        });
      });
    }
  },
} satisfies EventBase<Events.MessageUpdate>;
