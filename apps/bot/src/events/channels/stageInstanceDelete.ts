import { EventBase } from "@types";
import { Events } from "discord.js";
import { getOrCreateGuild } from "@repo/database";
import { logStageInstanceDelete } from "@utils";

export default {
  name: Events.StageInstanceDelete,
  once: false,
  async execute(stageInstance) {
    if (!stageInstance.guild) return;
    const guildConfig = await getOrCreateGuild(stageInstance.guild.id);
    if (!guildConfig) return;
    await logStageInstanceDelete(stageInstance, guildConfig);
  },
} satisfies EventBase<Events.StageInstanceDelete>;
