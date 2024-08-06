import colorOfTheDay from "./colorOfTheDay.js";
import resetBumpLeaderboard from "./resetBumpLeaderboard.js";
import cronjobsSchema from "../schemas/cronjobsSchema.js";
import { log } from "./utils";
async function recoverMissedCronJob(client) {
    const cronjobs = await cronjobsSchema.find();
    for (const cronjob of cronjobs) {
        for (const job of cronjob.cronjobs) {
            if (new Date(job.time).getTime() < Date.now()) {
                switch (job.name) {
                    case "colorCron":
                        log("ERROR", "src/utils/recoverMissedCronJob.ts", "Missed colorCron job, recovering...");
                        await colorOfTheDay(client);
                        break;
                    case "resetBumpLeaderboardCron":
                        log("ERROR", "src/utils/recoverMissedCronJob.ts", "Missed resetBumpLeaderboardCron job, recovering...");
                        await resetBumpLeaderboard(client);
                        break;
                }
            }
        }
    }
}
export default recoverMissedCronJob;
//# sourceMappingURL=recoverMissedCronJob.js.map