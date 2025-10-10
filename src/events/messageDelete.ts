import { EventBase } from "@customTypes";
import { ChannelType, EmbedBuilder, Events, time, TimestampStyles } from "discord.js";
import { getGuildConfig } from "@database";
import { returnWebhook, toStringId, WebhookType } from "@utils";
import { logger } from "@lib";

export default {
  name: Events.MessageDelete,
  async execute(message) {
    if (!message.inGuild()) return;
    if (message.partial) return; // Ignore partial messages
    if (message.author.id === message.client.user.id) return; // Ignore messages sent by the bot itself
    if (message.author.bot && !message.content.length) return; // Ignore bot messages without content
    const guildConfig = await getGuildConfig(message.guild.id);
    if (!guildConfig) return;
    if (message.content) {
      const logChannel = await message.guild.channels
        .fetch(toStringId(guildConfig.message_logs_channel_id))
        .catch(() => null);
      if (!logChannel || logChannel.type !== ChannelType.GuildText) return;

      const t = message.client.i18next.getFixedT(guildConfig.language, "events", "messageDelete");

      const webhook = await returnWebhook(message.client, logChannel, message.guild.id, {
        id: guildConfig.message_logs_webhook_id,
        type: WebhookType.MESSAGE_LOGS,
      });

      if (message.author.id === webhook.id) return;

      const embed = new EmbedBuilder()
        .setTitle(t("embed.title"))
        .setColor("Red")
        .setDescription(
          t("embed.description", { message, timestamp: time(message.createdAt, TimestampStyles.RelativeTime) }),
        )
        .setTimestamp();

      if (message.content) {
        embed.addFields({ name: t("embed.fields.content"), value: message.content });
      }
      function getMaxFileSize(premiumTier: number): number {
        switch (premiumTier) {
          case 3: // Tier 3
            return 100 * 1024 * 1024; // 100MB
          case 2: // Tier 2
            return 50 * 1024 * 1024; // 50MB
          case 1: // Tier 1
          default: // Tier 0
            return 8 * 1024 * 1024; // 8MB
        }
      }
      // Constants
      const MAX_FILE_SIZE = getMaxFileSize(message.guild.premiumTier);
      const MAX_EMBED_ATTACHMENTS_LENGTH = 1024; // Max embed field length for attachments

      // Filter attachments: skip files > 8MB
      const attachments = [...message.attachments.values()];
      const filteredAttachments = attachments.filter((a) => {
        if (a.size > MAX_FILE_SIZE) {
          logger.log({
            level: "warn",
            message: `Skipped attachment ${a.name} due to size (${(a.size / 1024 / 1024).toFixed(2)}MB) exceeding ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(2)}MB limit.`,
            discord: false,
          });
          return false;
        }
        return true;
      });

      // Add attachment links to embed, truncated to MAX_EMBED_ATTACHMENTS_LENGTH
      if (filteredAttachments.length > 0) {
        const links: string[] = [];
        let currentLength = 0;

        for (const a of filteredAttachments) {
          const link = `[${a.name}](${a.url})`;
          if (currentLength + link.length + 2 > MAX_EMBED_ATTACHMENTS_LENGTH) break; // +2 for ", "
          links.push(link);
          currentLength += link.length + 2;
        }

        const remaining = filteredAttachments.length - links.length;
        const suffix = remaining > 0 ? ", [...]" : "";
        embed.addFields({
          name: t("embed.fields.attachments", { count: filteredAttachments.length }),
          value: `> ${links.join(", ")}${suffix}`,
        });
      }

      // If there were skipped files, mention them in the embed
      const skippedFiles = attachments.filter((a) => a.size > MAX_FILE_SIZE);
      if (skippedFiles.length > 0) {
        embed.addFields({
          name: t("skipped_files"),
          value: "> " + skippedFiles.map((f) => `${f.name} (${(f.size / 1024 / 1024).toFixed(2)}MB)`).join(", "),
        });
      }

      // Split filtered attachments into batches under 8MB total size
      const maxBytes = MAX_FILE_SIZE; // 8MB
      const batches: string[][] = [];
      let currentBatch: string[] = [];
      let currentSize = 0;

      for (const a of filteredAttachments) {
        if (currentSize + a.size > maxBytes) {
          batches.push(currentBatch);
          currentBatch = [];
          currentSize = 0;
        }
        currentBatch.push(a.url);
        currentSize += a.size;
      }
      if (currentBatch.length > 0) batches.push(currentBatch);

      // Send first batch with embed
      let sentMessage;
      try {
        sentMessage = await webhook.send({
          files: batches[0] || [],
          embeds: [embed],
          allowedMentions: { parse: [] },
        });
      } catch (error) {
        logger.log({
          level: "error",
          message: `Failed to send message delete log for guild ${message.guild.id}: ${error.message}`,
          error,
        });
        return;
      }

      // Send follow-up messages for remaining batches, referencing first message
      for (let i = 1; i < batches.length; i++) {
        const batch = batches[i];
        try {
          await webhook.send({
            content: `[Batch ${i + 1}/${batches.length}](${sentMessage.url})`,
            files: batch,
            allowedMentions: { parse: [] },
          });
        } catch (error) {
          logger.log({
            level: "error",
            message: `Failed to send batch ${i + 1} for message delete log in guild ${message.guild.id}: ${error.message}`,
            error,
          });
        }
      }
    }
    if (message.poll) {
      const t = message.client.i18next.getFixedT(guildConfig.language, "events", "messageDelete");
      if (!guildConfig.poll_logs_channel_id) return;
      const logChannel = message.guild.channels.cache.get(toStringId(guildConfig.poll_logs_channel_id));
      if (logChannel?.type !== ChannelType.GuildText) return;
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle(t("poll_delete.embed.title"))
        .setDescription(
          t("poll_delete.embed.description", {
            message: message,
            timestamp: time(message.poll.expiresAt!, TimestampStyles.LongDateTime),
            multi_select: message.poll.allowMultiselect
              ? message.client.allEmojis.get(message.client.config.emojis.confirm.id)?.format
              : message.client.allEmojis.get(message.client.config.emojis.reject.id)?.format,
            finalized: message.poll.resultsFinalized
              ? message.client.allEmojis.get(message.client.config.emojis.confirm.id)?.format
              : message.client.allEmojis.get(message.client.config.emojis.reject.id)?.format,
          }),
        )
        .setFields([
          {
            name: message.poll.question.text!,
            value: message.poll.answers
              .map((answer, i) => {
                return `${i}. ${answer.text} ${message.poll?.resultsFinalized ? `(${answer.voteCount})` : ""}`;
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
          message: `Failed to send pollDelete embed in ${message.guild.name} (${message.guild.id})`,
          channelId: logChannel.id,
        });
      });
    }
  },
} satisfies EventBase<Events.MessageDelete>;
