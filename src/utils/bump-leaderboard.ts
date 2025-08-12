import { ChannelType, Client, time, User } from "discord.js";
import { toStringId } from "@utils";
import {
  getBumpLeaderboard,
  getGuildConfig,
  getGuilds,
  resetBumpLeaderboard as resetBumpLeaderboardDatabase,
  updateGuildConfig,
} from "@database";

export async function bumpLeaderboard(client: Client, guildId: string, lastBump?: User) {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) return;
  const guildConfig = await getGuildConfig(guildId);
  if (!guildConfig) return;
  const channel = guild.channels.cache.get(toStringId(guildConfig.bump_leaderboard_channel_id));
  if (!channel || channel.type !== ChannelType.GuildText) return;
  const bumps = await getBumpLeaderboard(guildId);
  if (bumps.length === 0) return;
  const leaderboard = bumps
    .map((row) => ({
      user: row.user_id,
      bump_count: row.bump_count,
    }))
    .sort((a, b) => b.bump_count - a.bump_count)
    .slice(0, 10);
  const messages = await channel.messages.fetch();
  const message = messages.first();
  const t = client.i18next.getFixedT(guildConfig.language, null, "bump_leaderboard");
  if (message) {
    if (message.author.id !== client.user?.id) {
      return { error: t("message_not_sent_by_bot") };
    }
    let initial = t("initial");
    let count = 1;
    for (const leader of leaderboard) {
      initial += `\n${count}. <@${leader.user}> - ${leader.bump_count} bumps`;
      count++;
    }
    if (lastBump) {
      initial += `\n${t("last_bump", { user: lastBump.toString(), time: time(new Date(), "R") })}`;
    }
    if (guildConfig.last_bump_winner) {
      initial += `\n\n${t("last_winner", { user: `<@${guildConfig.last_bump_winner}>`, count: guildConfig.last_bump_winner_count || 0, total_bumps: guildConfig.last_bump_winner_total_count })}`;
    }
    await message.edit(initial);
  } else {
    let initial = t("initial");
    let count = 1;
    for (const leader of leaderboard) {
      initial += `\n${count}. <@${leader.user}> - ${leader.bump_count} bumps`;
      count++;
    }
    if (lastBump) {
      initial += `\n${t("last_bump", { user: lastBump, time: time(new Date(), "R") })}`;
    }
    if (guildConfig.last_bump_winner) {
      initial += `\n\n${t("last_winner", { user: `<@${guildConfig.last_bump_winner}>`, count: guildConfig.last_bump_winner_count || 0, total_bumps: guildConfig.last_bump_winner_total_count })}`;
    }
    await channel.send(initial);
  }
}

export async function resetBumpLeaderboard(client: Client) {
  const guildConfigs = await getGuilds();
  for (const guildConfig of guildConfigs) {
    const leaderboard = await getBumpLeaderboard(toStringId(guildConfig.id));
    const winner = leaderboard.sort((a, b) => b.bump_count - a.bump_count)[0];
    const total_bumps = leaderboard.reduce((acc, row) => acc + row.bump_count, 0);
    await updateGuildConfig(toStringId(guildConfig.id), {
      last_bump_winner: toStringId(winner?.user_id) || null,
      last_bump_winner_count: winner?.bump_count || 0,
      last_bump_winner_total_count: total_bumps || 0,
    });
    await bumpLeaderboard(client, toStringId(guildConfig.id));
    await resetBumpLeaderboardDatabase(toStringId(guildConfig.id));
  }
}
