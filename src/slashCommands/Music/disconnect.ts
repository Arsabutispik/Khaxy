import { slashCommandBase } from "../../../@types/types";
import { GuildMember, SlashCommandBuilder } from "discord.js";
import { useQueue } from "discord-player";
export default {
  help: {
    name: "disconnect",
    description: "Botu ses kanalından atar.",
    usage: "disconnect",
    examples: ["disconnect"],
    category: "Müzik",
  },
  data: new SlashCommandBuilder()
    .setName("disconnect")
    .setDescription("Makes the bot leave the voice channel")
    .setDescriptionLocalizations({
      tr: "Botu ses kanalından atar.",
    })
    .setDMPermission(false),
  execute: async ({ client, interaction }) => {
    const player = useQueue(interaction.guild!.id);
    if (!(interaction.member as GuildMember).voice.channel) {
      await interaction.reply(client.handleLanguages("USER_NOT_IN_VOICE", client, interaction.guildId!));
      return;
    }
    if (!player) {
      await interaction.reply(client.handleLanguages("BOT_NOT_PLAYING", client, interaction.guildId!));
      return;
    }
    const voiceStateUsers = (interaction.member as GuildMember).voice
      .channel!.members.filter((member) => !member.user.bot)
      .filter((member) => !member.roles.cache.has("798592379204010024"))
      .filter((member) => !member.voice.selfDeaf!)
      .filter((member) => !member.voice.serverDeaf!)
      .filter((member) => !(member.id === interaction.user.id));
    if (voiceStateUsers.size > 0) {
      if (!(interaction.member as GuildMember).permissions.has("Administrator")) {
        if (
          !(interaction.member as GuildMember).roles.cache.has(
            client.guildsConfig.get(interaction.guild!.id)!.config.djRole,
          )
        ) {
          await interaction.reply(client.handleLanguages("VOICE_NOT_ENOUGH_PERMS", client, interaction.guildId!));
          return;
        } else {
          await interaction.reply(client.handleLanguages("DISCONNECT_SUCCESS", client, interaction.guildId!));
          const message = await interaction.fetchReply();
          await message.react(client.allEmojis.get(client.config.Emojis.confirm)!.format);
          player.delete();
          return;
        }
      } else {
        await interaction.reply(client.handleLanguages("DISCONNECT_SUCCESS", client, interaction.guildId!));
        const message = await interaction.fetchReply();
        await message.react(client.allEmojis.get(client.config.Emojis.confirm)!.format);
        player.delete();
        return;
      }
    }
    await interaction.reply(client.handleLanguages("DISCONNECT_SUCCESS", client, interaction.guildId!));
    const message = await interaction.fetchReply();
    await message.react(client.allEmojis.get(client.config.Emojis.confirm)!.format);
    player.delete();
  },
} as slashCommandBase;
