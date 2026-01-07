import { EventBase } from "@types";
import { Events, InviteGuild } from "discord.js";
import { getOrCreateGuild } from "@repo/database";
import { logInviteCreate } from "@utils";
export default {
  name: Events.InviteCreate,
  once: false,
  async execute(invite) {
    if (!invite.guild || invite.guild instanceof InviteGuild) return;
    const guildConfig = await getOrCreateGuild(invite.guild.id);
    if (!guildConfig) return;
    await logInviteCreate(invite, guildConfig);
  },
} satisfies EventBase<Events.InviteCreate>;
