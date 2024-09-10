import { specificGuildColorUpdate } from "./colorOfTheDay.js";
import { specificGuildBumpLeaderboardUpdate } from "./resetBumpLeaderboard.js";
import cronjobsSchema from "../schemas/cronjobsSchema.js";
import { log } from "./utils.js";
export default async (client) => {
  const cronjobs = await cronjobsSchema.find();
  for (const cronjob of cronjobs) {
    for (const job of cronjob.cronjobs) {
      if (new Date(job.time).getTime() < Date.now()) {
        switch (job.name) {
          case "colorCron":
            log("ERROR", "src/utils/recoverMissedCronJob.ts", "Missed colorCron job, recovering...");
            await specificGuildColorUpdate(client, cronjob.guildID);
            break;
          case "resetBumpLeaderboardCron":
            log("ERROR", "src/utils/recoverMissedCronJob.ts", "Missed resetBumpLeaderboardCron job, recovering...");
            await specificGuildBumpLeaderboardUpdate(client, cronjob.guildID);
            break;
        }
      }
    }
  }
};
//# sourceMappingURL=recoverMissedCronJob.js.map
