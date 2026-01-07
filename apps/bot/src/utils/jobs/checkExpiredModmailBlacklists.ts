import { Client } from "discord.js";
import { getBlacklistedUsers, getOrCreateGuild, removeExpiredModmailBlacklists } from "@repo/database";
export async function CheckExpiredModmailBlacklists(client: Client) {
  const expiredBlacklists = await getBlacklistedUsers();
  if (expiredBlacklists.length === 0) return;
  for (const blacklist of expiredBlacklists) {
    const guild = client.guilds.cache.get(blacklist.guild_id.toString());
    if (!guild) continue;
    const guildConfig = await getOrCreateGuild(guild.id);
    if (!guildConfig) continue;
    const t = client.i18next.getFixedT(guildConfig.language, null, "check_expired_modmail_blacklists");
    const user = await guild.members.fetch(blacklist.user_id.toString()).catch(() => null);
    if (!user) continue;

    // Notify the user about the expiration
    await user.send(t("expired_modmail_blacklist_notification", { guild: guild.name })).catch(() => null);
  }
  await removeExpiredModmailBlacklists();
}
