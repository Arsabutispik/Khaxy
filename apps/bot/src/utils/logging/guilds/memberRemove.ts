import { ChannelType, EmbedBuilder } from "discord.js";
import { formatDuration, returnWebhook, WebhookType, sendLogEmbed, LogKickOptions } from "@utils";
export async function logMemberLeave({ member, reason, executor, guildConfig, isAKick }: LogKickOptions) {
  const channelId = guildConfig.logConfig?.guildLogsChannelId;
  if (!channelId) return;
  if (member.guild.bans.cache.has(member.user.id)) return;

  const logChannel = member.guild.channels.cache.get(channelId);
  if (logChannel?.type !== ChannelType.GuildText) return;

  const webhook = await returnWebhook(member.client, logChannel, member.guild.id, guildConfig, {
    id: guildConfig.logConfig?.guildLogsWebhookId,
    type: WebhookType.GUILD_LOGS,
  });
  if (!webhook) return;
  const t = member.client.i18next.getFixedT(guildConfig.language, "loggers", "memberEvents");
  const embed = new EmbedBuilder()
    .setTitle(isAKick ? t(($) => $.memberRemove.embed.titleKicked) : t(($) => $.memberRemove.embed.title))
    .setColor("Red")
    .setThumbnail(member.user.displayAvatarURL())
    .setDescription(
      t(($) => $.memberRemove.embed.description, {
        user: member.user,
        member_count: member.guild.memberCount.toString(),
        timestamp: member.joinedTimestamp
          ? formatDuration(Date.now() - member.joinedTimestamp, guildConfig.language)
          : t(($) => $.memberRemove.joinDateUnknown),
      }),
    )
    .setTimestamp();

  if (isAKick) {
    embed
      .setFooter({
        text: executor?.tag || t(($) => $.unknownExecutor),
        iconURL: executor?.displayAvatarURL(),
      })
      .addFields([
        { name: t(($) => $.memberRemove.embed.fields.reason), value: reason || t(($) => $.memberRemove.noReason) },
      ]);
  }

  await sendLogEmbed(webhook, [embed], member.guild, logChannel.id);
}
