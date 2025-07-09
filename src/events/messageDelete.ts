import { EventBase } from "@customTypes";
import { ChannelType, EmbedBuilder, Events } from "discord.js";
import { getGuildConfig } from "@database";
import { returnWebhook, toStringId } from "@utils";

export default {
  name: Events.MessageDelete,
  async execute(message) {
    if (!message.inGuild()) return;
    if (message.partial) return; // Ignore partial messages
    if (message.author.id === message.client.user.id) return; // Ignore messages sent by the bot itself
    const guild_config = await getGuildConfig(message.guild.id);
    if (!guild_config) return;
    const channel = message.guild.channels.cache.get(toStringId(guild_config.message_logs_channel_id));
    if (!channel || channel.type !== ChannelType.GuildText) return;
    const t = message.client.i18next.getFixedT(guild_config.language, "events", "messageDelete");
    const webhook = await returnWebhook(message, channel, guild_config);
    if (message.author.id === webhook.id) return;
    const embed = new EmbedBuilder()
      .setTitle(t("embed.title"))
      .setColor("Red")
      .setDescription(t("embed.description", { message }))
      .setTimestamp();
    if (message.content) {
      embed.addFields({ name: t("embed.fields.content"), value: message.content });
    }
    if (message.attachments.size > 0) {
      embed.addFields({
        name: t("embed.fields.attachments", { count: message.attachments.size }),
        value: `> ${message.attachments.map((a) => `[${a.name}](${a.url})`).join(", ")}`,
      });
    }
    await webhook!.send({
      files: message.attachments.size > 0 ? message.attachments.map((a) => a.url) : [],
      embeds: [embed],
      allowedMentions: { parse: [] }, // Prevent mentions in the log
    });
  },
} satisfies EventBase<Events.MessageDelete>;
