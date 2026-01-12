import {
  AuditLogEvent,
  CategoryChannel,
  ForumChannel,
  Guild,
  MediaChannel,
  NewsChannel,
  StageChannel,
  TextChannel,
  User,
  VoiceChannel,
} from "discord.js";
import { sleep } from "@utils";

export async function getChannelExecutor(guild: Guild, channelId: string): Promise<User | null> {
  await sleep(2000);
  const auditLogs = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.ChannelUpdate }).catch(() => null);
  const logEntry = auditLogs?.entries.first();
  if (logEntry && logEntry.target?.id === channelId) {
    let user = logEntry.executor;
    if (!user) return null;
    if (user.partial) user = await guild.client.users.fetch(user.id);
    return user;
  }
  return null;
}

export function normalizeOverwrites(
  channel: CategoryChannel | NewsChannel | StageChannel | TextChannel | VoiceChannel | ForumChannel | MediaChannel,
) {
  return channel.permissionOverwrites.cache
    .map((po) => ({
      id: po.id,
      type: po.type,
      allow: po.allow.bitfield.toString(),
      deny: po.deny.bitfield.toString(),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}
