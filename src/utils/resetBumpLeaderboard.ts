import { KhaxyClient } from "../../@types/types";
import bumpLeaderboardSchema from "../schemas/bumpLeaderboardSchema.js";
import { bumpLeaderboard, log } from "./utils.js";
import cronjobsSchema from "../schemas/cronjobsSchema.js";
import { DateTime } from "luxon";
export default async (client: KhaxyClient) => {
  const guilds = await bumpLeaderboardSchema.find();
  for (const guild of guilds) {
    const winner = guild.users.sort((a, b) => b.bumps - a.bumps)[0];
    const totalBumps = guild.users.reduce((acc, user) => acc + user.bumps, 0);
    await bumpLeaderboardSchema.findOneAndUpdate(
      { guildID: guild.guildID },
      {
        winner: {
          user: {
            userID: winner.userID,
            bumps: winner.bumps,
          },
          totalBumps: totalBumps,
        },
        $unset: { users: [] },
      },
    );

    await cronjobsSchema.findOneAndUpdate(
      { guildID: guild.guildID },
      {
        $pull: {
          cronjobs: {
            name: "resetBumpLeaderboardCron",
          },
        },
      },
    );
    await cronjobsSchema.findOneAndUpdate(
      { guildID: guild.guildID },
      {
        $push: {
          cronjobs: {
            name: "resetBumpLeaderboardCron",
            time: DateTime.now().plus({ days: 30 }).toJSDate(),
          },
        },
      },
    );
    const result = await bumpLeaderboard(client, guild.guildID);
    if (result && result.error) {
      log("ERROR", "src/utlis/resetBumpLeaderBoard.ts", `Failed to reset bump leaderboard for guild ${guild.guildID}`);
    }
  }
};

async function specificGuildBumpLeaderboardUpdate(client: KhaxyClient, guildId: string) {
  const guild = await bumpLeaderboardSchema.findOne({ guildID: guildId });
  if (!guild) return;
  const winner = guild.users.sort((a, b) => b.bumps - a.bumps)[0];
  const totalBumps = guild.users.reduce((acc, user) => acc + user.bumps, 0);
  await bumpLeaderboardSchema.findOneAndUpdate(
    { guildID: guild.guildID },
    {
      winner: {
        user: {
          userID: winner.userID,
          bumps: winner.bumps,
        },
        totalBumps: totalBumps,
      },
      $unset: { users: [] },
    },
  );
  cronjobsSchema.findOneAndUpdate(
    { guildID: guildId },
    {
      $pull: {
        cronjobs: {
          name: "resetBumpLeaderboardCron",
        },
      },
    },
  );
  await cronjobsSchema.findOneAndUpdate(
    { guildID: guildId },
    {
      $push: {
        cronjobs: {
          name: "resetBumpLeaderboardCron",
          time: DateTime.now().plus({ days: 30 }).toJSDate(),
        },
      },
    },
  );
  const result = await bumpLeaderboard(client, guildId);
  if (result && result.error) {
    log("ERROR", "src/utlis/resetBumpLeaderBoard.ts", `Failed to reset bump leaderboard for guild ${guildId}`);
  }
}

export { specificGuildBumpLeaderboardUpdate };
