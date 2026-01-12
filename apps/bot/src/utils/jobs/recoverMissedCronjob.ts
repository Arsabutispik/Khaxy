import { logger } from "@lib";
import { specificGuildColorUpdate } from "@utils";
import { Client } from "discord.js";
import { getAllCronJobs } from "@repo/database";

export async function recoverMissedCronjob(client: Client) {
  // Fetch all cron jobs from the database
  const cronjobs = await getAllCronJobs();

  for (const cronjob of cronjobs) {
    // Check if the color cron job has been missed
    if (cronjob.colorTime && new Date(cronjob.colorTime).getTime() < Date.now()) {
      logger.log({
        level: "info",
        message: `Missed color cron job, recovering...`,
        discord: false,
      });
      // Recover the missed color cron job
      await specificGuildColorUpdate(client, cronjob.id);
    }
  }
}
