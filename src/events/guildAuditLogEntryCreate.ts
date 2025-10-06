import { EventBase } from "@customTypes";
import { AuditLogEvent, ChannelType, EmbedBuilder, Events, Guild, TextChannel, Webhook } from "discord.js";
import { getGuildConfig } from "@database";
import { returnWebhook, sleep, toStringId, WebhookType } from "@utils";
import { logger } from "@lib";

export default {
  name: Events.GuildAuditLogEntryCreate,
  once: false,
  async execute(entry, guild) {
    await sleep(2000); // Wait 2 seconds to ensure audit log entry is fully propagated
    const guildConfig = await getGuildConfig(guild.id);
    if (!guildConfig) return;
    const t = guild.client.i18next.getFixedT(guildConfig.language, "events", "guildAuditLogEntryCreate");
    if (!guildConfig.webhook_logs_channel_id) return;
    const logChannel = guild.channels.cache.get(toStringId(guildConfig.webhook_logs_channel_id));
    if (logChannel?.type !== ChannelType.GuildText) return;
    const embeds: Array<EmbedBuilder> = [];
    function getChannelFromTarget(guild: Guild, target: unknown): TextChannel | undefined {
      if (target instanceof Webhook && target.channelId) {
        const channel = guild.channels.cache.get(target.channelId);
        if (channel?.type === ChannelType.GuildText) return channel;
      }
      return undefined;
    }
    if (entry.action === AuditLogEvent.WebhookCreate) {
      const targetChannel = getChannelFromTarget(guild, entry.target);
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle(t("webhook_create.embed.title"))
        .setDescription(
          t("webhook_create.embed.description", {
            executor: entry.executor,
            webhook: entry.target,
            channel: targetChannel,
          }),
        )
        .setTimestamp()
        .setFooter({
          text: entry.executor?.username ?? t("unknown_executor"),
          iconURL: entry.executor?.displayAvatarURL() ?? undefined,
        });
      embeds.push(embed);
    }
    if (entry.action === AuditLogEvent.WebhookDelete) {
      const targetChannel = getChannelFromTarget(guild, entry.target);
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle(t("webhook_delete.embed.title"))
        .setDescription(
          t("webhook_delete.embed.description", {
            executor: entry.executor,
            webhook: entry.target,
            channel: targetChannel,
          }),
        )
        .setTimestamp()
        .setFooter({
          text: entry.executor?.username ?? t("unknown_executor"),
          iconURL: entry.executor?.displayAvatarURL() ?? undefined,
        });
      embeds.push(embed);
    }
    if (embeds.length === 0) return;
    console.log(guildConfig.webhook_logs_webhook_id);
    const webhook = await returnWebhook(guild.client, logChannel, guild.id, {
      id: guildConfig.webhook_logs_webhook_id,
      type: WebhookType.WEBHOOK_LOGS,
    });
    await webhook.send({ embeds }).catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send guildAuditLogEntryCreate embed in ${guild.name} (${guild.id})`,
        channelId: logChannel.id,
      });
    });
  },
} satisfies EventBase<Events.GuildAuditLogEntryCreate>;
