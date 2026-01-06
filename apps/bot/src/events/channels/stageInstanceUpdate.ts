import { EventBase } from "@types";
import { Events } from "discord.js";
import { getOrCreateGuild } from "@repo/database";
import { logStageInstanceUpdate } from "@utils";

export default {
  name: Events.StageInstanceUpdate,
  once: false,
  async execute(oldStageInstance, newStageInstance) {
    if (!newStageInstance.guild) return;
    const guildConfig = await getOrCreateGuild(newStageInstance.guild.id);
    if (!guildConfig) return;
    await logStageInstanceUpdate(oldStageInstance, newStageInstance, guildConfig);
  },
} satisfies EventBase<Events.StageInstanceUpdate>;
