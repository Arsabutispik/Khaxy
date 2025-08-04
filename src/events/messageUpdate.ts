import { EventBase } from "@customTypes";
import { ChannelType, EmbedBuilder, Events } from "discord.js";
import { getGuildConfig, getModMailThreadByUser, updateModMailMessage } from "@database";
import { ModMailThreadStatus } from "@constants";
import { returnWebhook, toStringId, WebhookType } from "@utils";

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
      const guild_config = await getGuildConfig(toStringId(thread.guild_id));
      if (!guild_config) return;
      const t = oldMessage.client.i18next.getFixedT(guild_config.language, "events", "messageUpdate");
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
      const guild_config = await getGuildConfig(oldMessage.guild.id);
      if (!guild_config) return;
      const channel = await oldMessage.guild.channels
        .fetch(toStringId(guild_config.message_logs_channel_id))
        .catch(() => null);
      if (channel?.type !== ChannelType.GuildText) return;
      const t = oldMessage.client.i18next.getFixedT(guild_config.language, "events", "messageUpdate");
      const webhook = await returnWebhook(oldMessage.client, channel, oldMessage.guild.id, {
        id: guild_config.message_logs_webhook_id,
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
      await webhook.send({
        embeds: [embed],
        allowedMentions: { parse: [] }, // Prevent mentions in the log
      });
    }
  },
} satisfies EventBase<Events.MessageUpdate>;
