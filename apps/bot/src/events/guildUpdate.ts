import { Events } from "discord.js";
import { EventBase } from "@types";
import { getOrCreateGuild } from "@repo/database";
import { logGuildUpdate } from "../utils/logging/guilds/update.js";

export default {
  name: Events.GuildUpdate,
  once: false,
  async execute(oldGuild, newGuild) {
    const guildConfig = await getOrCreateGuild(newGuild.id);
    if (!guildConfig) return;
    await logGuildUpdate(oldGuild, newGuild, guildConfig);
  },
} satisfies EventBase<Events.GuildUpdate>;
