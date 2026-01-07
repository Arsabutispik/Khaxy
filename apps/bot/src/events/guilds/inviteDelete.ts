import { EventBase } from "@types";
import { Events, InviteGuild } from "discord.js";
import { logInviteDelete } from "@utils";
import { getOrCreateGuild } from "@repo/database";

export default {
  name: Events.InviteDelete,
  once: false,
  async execute(invite) {
    if (!invite.guild || invite.guild instanceof InviteGuild) return;
    const guildConfig = await getOrCreateGuild(invite.guild.id);
    if (!guildConfig) return;
    await logInviteDelete(invite, guildConfig);
  },
} satisfies EventBase<Events.InviteDelete>;
