import { slashCommandBase } from "../../../@types/types";
import { GuildMember, SlashCommandBuilder } from "discord.js";
import { useQueue } from "discord-player";
export default {
  help: {
    name: "pause",
    description: "Müziği duraklatır.",
    usage: "pause",
    examples: ["pause"],
    category: "Müzik",
  },
  data: new SlashCommandBuilder()
    .setName("pause")
    .setNameLocalizations({
      tr: "duraklat",
    })
    .setDescription("Pauses the music")
    .setDescriptionLocalizations({
      tr: "Müziği duraklatır.",
    })
    .setDMPermission(false),
  execute: async ({ client, interaction }) => {
    const player = useQueue(interaction.guild!.id);
    if (!(interaction.member as GuildMember).voice.channel) {
      await interaction.reply(client.handleLanguages("USER_NOT_IN_VOICE", client, interaction.guild!.id));
      return;
    }
    if (!player) {
      await interaction.reply(client.handleLanguages("BOT_NOT_PLAYING", client, interaction.guild!.id));
      return;
    }
    if (player.node.isPaused()) {
      await interaction.reply(client.handleLanguages("PAUSE_ALREADY_PAUSED", client, interaction.guild!.id));
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
          await interaction.reply(client.handleLanguages("VOICE_NOT_ENOUGH_PERMS", client, interaction.guild!.id));
          return;
        } else {
          player.node.pause();
          await interaction.reply(client.handleLanguages("PAUSE_SUCCESS", client, interaction.guild!.id));
          const message = await interaction.fetchReply();
          await message.react(client.allEmojis.get(client.config.Emojis.confirm)!.format);
          return;
        }
      } else {
        player.node.pause();
        await interaction.reply(client.handleLanguages("PAUSE_SUCCESS", client, interaction.guild!.id));
        const message = await interaction.fetchReply();
        await message.react(client.allEmojis.get(client.config.Emojis.confirm)!.format);
        return;
      }
    }
    player.node.pause();
    await interaction.reply(client.handleLanguages("PAUSE_SUCCESS", client, interaction.guild!.id));
    const message = await interaction.fetchReply();
    await message.react(client.allEmojis.get(client.config.Emojis.confirm)!.format);
  },
} as slashCommandBase;
