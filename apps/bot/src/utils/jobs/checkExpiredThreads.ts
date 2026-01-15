import { ChannelType, Client, User } from "discord.js";
import { modMailLog } from "@lib";
import { getExpiredThreads, getOrCreateGuild, closeThread } from "@repo/database";

export async function checkExpiredThreads(client: Client) {
  const threads = await getExpiredThreads();

  for (const thread of threads) {
    try {
      const guild = client.guilds.cache.get(thread.guildId);
      if (!guild) continue;

      const guildConfig = await getOrCreateGuild(guild.id);
      if (!guildConfig) continue;

      const channel = guild.channels.cache.get(thread.channelId);

      // Handle manually deleted channels
      if (!channel || channel.type !== ChannelType.GuildText) {
        // Use existing closerId if available (Mod), otherwise Bot
        const finalCloserId = thread.closerId || client.user!.id;
        await closeThread(thread.channelId, finalCloserId);
        continue;
      }

      // ============================================================
      // 1. DETERMINE THE CLOSER
      // ============================================================
      let closer: User | null = null;

      if (thread.closerId) {
        // Case A: A Moderator scheduled this (/close at:2h)
        // We stored their ID in the DB when they ran the command.
        closer = await client.users.fetch(thread.closerId).catch(() => null);
      }

      // Case B: Fallback (Mod left server, or System Auto-Close)
      if (!closer) {
        closer = client.user!;
      }

      // ============================================================
      // 2. PROCESS CLOSE
      // ============================================================
      const t = client.i18next.getFixedT(guildConfig.language, null, "modMailLog");

      const user = await client.users.fetch(thread.userId).catch(() => null);
      if (user) {
        await user.send(t(($) => $.threadClosedDm, { guild: guild.name })).catch(() => null);
      }

      // Log it using the CORRECT closer (Mod or Bot)
      await modMailLog(client, channel, user, closer);

      // Update DB to CLOSED status
      // We pass closer.id here to ensure the final record is accurate
      await closeThread(thread.channelId, closer.id);

      await channel.send(t(($) => $.preparingClose));

      setTimeout(() => {
        channel.delete().catch(() => null);
      }, 5000);
    } catch (error) {
      console.error(`Error auto-closing thread ${thread.channelId}:`, error);
    }
  }
}
