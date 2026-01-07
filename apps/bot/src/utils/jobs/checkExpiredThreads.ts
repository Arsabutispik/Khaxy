import { ChannelType, Client } from "discord.js";
import { modMailLog } from "@utils";
import { getExpiredThreads, getOrCreateGuild } from "@repo/database";

export async function checkExpiredThreads(client: Client) {
  const threads = await getExpiredThreads();
  for (const thread of threads) {
    const guild = client.guilds.cache.get(thread.guildId);
    if (!guild) continue;
    const guildConfig = await getOrCreateGuild(guild.id);
    if (!guildConfig) continue;
    const channel = guild.channels.cache.get(thread.channelId);
    if (!channel || channel.type !== ChannelType.GuildText) continue;
    const t = client.i18next.getFixedT(guildConfig.language, null, "mod_mail_log");
    await channel.send(t("preparing_close"));
    const user = await client.users.fetch(thread.userId).catch(() => null);
    if (!user) continue;
    await user.send(t("thread_closed_dm", { guild: guild.name }));
    const closer = await client.users.fetch(thread.closerId!);
    await modMailLog(client, channel, user, closer);
  }
}
