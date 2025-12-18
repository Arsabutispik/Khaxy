import { EventBase } from "src/types/index.js";
import {
  AuditLogEvent,
  ChannelType,
  EmbedBuilder,
  Events,
  Guild,
  TextChannel,
  Webhook,
  GuildAuditLogsEntry,
} from "discord.js";
import { getOrCreateGuild, GuildWithLogs } from "@repo/database";
import { returnWebhook, sleep, WebhookType } from "src/utils/index.js";
import { logger } from "src/lib/index.js";

export default {
  name: Events.GuildAuditLogEntryCreate,
  once: false,
  async execute(entry, guild) {
    await sleep(2000); // Wait 2 seconds to ensure audit log entry is fully propagated
    const guildConfig = await getOrCreateGuild(guild.id);
    if (!guildConfig) return;
    await logAuditLogEntryCreate(entry, guild, guildConfig);
  },
} satisfies EventBase<Events.GuildAuditLogEntryCreate>;

async function logAuditLogEntryCreate(entry: GuildAuditLogsEntry, guild: Guild, guildConfig: GuildWithLogs) {
  if (!guildConfig.logConfig?.webhookLogsChannelId) return;
  const t = guild.client.i18next.getFixedT(guildConfig.language, "events", "guildAuditLogEntryCreate");
  const logChannel = guild.channels.cache.get(guildConfig.logConfig.webhookLogsChannelId);
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
    // Clean up cached webhook if it exists
    guild.client.webhooks.delete((entry.target as Webhook).id);
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
  const webhook = await returnWebhook(guild.client, logChannel, guild.id, guildConfig, {
    id: guildConfig.logConfig.webhookLogsWebhookId,
    type: WebhookType.WEBHOOK_LOGS,
  });
  if (!webhook) return;
  await webhook.send({ embeds }).catch((error) => {
    logger.log({
      level: "error",
      error,
      message: `Failed to send guildAuditLogEntryCreate embed in ${guild.name} (${guild.id})`,
      channelId: logChannel.id,
    });
  });
}
