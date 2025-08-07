import type { EventBase } from "@customTypes";
import { Events } from "discord.js";
import { bumpLeaderboard, modMailMessage, toStringId } from "@utils";
import { getGuildConfig, updateBumpLeaderboard } from "@database";
export default {
  name: Events.MessageCreate,
  async execute(message) {
    await modMailMessage(message);
    if (!message.inGuild()) return;
    const guild_config = await getGuildConfig(message.guild.id);
    if (!guild_config) return;
    const leaderboard = guild_config.bump_leaderboard_channel_id;
    if (
      message.interaction &&
      message.interaction.commandName === "bump" &&
      message.author.id === "302050872383242240" &&
      message.channel.id === toStringId(leaderboard)
    ) {
      await updateBumpLeaderboard(message.guild.id, message.interaction.user.id);
      await message.delete();
      const result = await bumpLeaderboard(message.client, message.guild.id, message.interaction.user);
      if (result?.error) {
        await message.reply(result.error);
        return;
      }
    } else if (
      message.inGuild() &&
      message.channel.id === toStringId(leaderboard) &&
      message.author.id !== message.client.user!.id
    ) {
      await message.delete().catch(() => null);
      return;
    }
  },
} satisfies EventBase<Events.MessageCreate>;
