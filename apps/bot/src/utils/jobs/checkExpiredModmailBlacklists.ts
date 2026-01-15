import { Client } from "discord.js";
import { getBlacklistedUsers, getOrCreateGuild, removeExpiredBlacklists } from "@repo/database";
export async function CheckExpiredModmailBlacklists(client: Client) {
  const expiredBlacklists = await getBlacklistedUsers();
  if (expiredBlacklists.length === 0) return;
  for (const blacklist of expiredBlacklists) {
    const guild = client.guilds.cache.get(blacklist.guildId);
    if (!guild) continue;
    const guildConfig = await getOrCreateGuild(guild.id);
    if (!guildConfig) continue;
    const t = client.i18next.getFixedT(guildConfig.language, null, "checkExpiredModmailBlacklists");
    const user = await guild.members.fetch(blacklist.userId.toString()).catch(() => null);
    if (!user) continue;

    // Notify the user about the expiration
    await user.send(t(($) => $.expiredModmailBlacklistNotification, { guild: guild.name })).catch(() => null);
  }
  await removeExpiredBlacklists();
}
