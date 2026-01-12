import { EventBase } from "@types";
import { Events } from "discord.js";
import { getOrCreateGuild } from "@repo/database";
import { logStageInstanceCreate } from "@utils";

export default {
  name: Events.StageInstanceCreate,
  once: false,
  async execute(stageInstance) {
    if(!stageInstance.guild) return;
    const guildConfig = await getOrCreateGuild(stageInstance.guild?.id);
    if (!guildConfig) return;
    await logStageInstanceCreate(stageInstance, guildConfig);
  },
} satisfies EventBase<Events.StageInstanceCreate>;
