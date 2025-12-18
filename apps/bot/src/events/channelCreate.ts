import { EventBase } from "src/types/index.js";
import {
  AuditLogEvent,
  ChannelType,
  EmbedBuilder,
  Events,
  NonThreadGuildBasedChannel,
  time,
  TimestampStyles,
} from "discord.js";
import { getOrCreateGuild, GuildWithLogs } from "@repo/database";
import { returnWebhook, sleep, WebhookType } from "src/utils/index.js";
import { logger } from "src/lib/index.js";

export default {
  name: Events.ChannelCreate,
  once: false,
  async execute(channel) {
    const guildConfig = await getOrCreateGuild(channel.guildId);
    if (!guildConfig) return;
    await logChannelCreate(channel, guildConfig);
  },
} satisfies EventBase<Events.ChannelCreate>;

async function logChannelCreate(channel: NonThreadGuildBasedChannel, guildConfig: GuildWithLogs) {
  if (!guildConfig.logConfig?.channelLogsChannelId) return;
  const t = channel.client.i18next.getFixedT(guildConfig.language, "events", "channelCreate");
  const logChannel = channel.guild.channels.cache.get(guildConfig.logConfig?.channelLogsChannelId);
  if (logChannel?.type !== ChannelType.GuildText) return;

  await sleep(2000); // Wait for 2 seconds to ensure audit logs are updated

  const auditLogs = await channel.guild
    .fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.ChannelCreate,
    })
    .catch(() => null);

  const logEntry = auditLogs?.entries.first();
  const executor = logEntry && logEntry.target?.id === channel.id ? logEntry.executor : null;

  const embed = new EmbedBuilder()
    .setColor("Green")
    .setTitle(t("embed.title"))
    .setDescription(
      t("embed.description", {
        channel: channel.toString(), // Explicitly stringify to <#ID>
        channel_type: t(`channel_types.${channel.type}`),
        timestamp: time(channel.createdAt, TimestampStyles.LongDateShortTime),
      }),
    )
    .setThumbnail(channel.guild.iconURL() ?? null)
    .setTimestamp()
    .setFooter({
      text: executor?.tag ?? t("unknown_executor"),
      iconURL: executor?.displayAvatarURL() ?? undefined,
    });

  const webhook = await returnWebhook(channel.client, logChannel, channel.guildId, guildConfig, {
    id: guildConfig.logConfig.channelLogsWebhookId,
    type: WebhookType.CHANNEL_LOGS,
  });
  if (!webhook) return;
  await webhook
    .send({
      embeds: [embed],
    })
    .catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send channelCreate embed in ${channel.guild.name} (${channel.guild.id})`,
        channel: logChannel.id,
      });
    });
}
