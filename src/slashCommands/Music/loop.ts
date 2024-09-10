import { GuildMember, SlashCommandBuilder } from "discord.js";
import { slashCommandBase } from "../../../@types/types";
import { useQueue } from "discord-player";
export default {
  help: {
    name: "loop",
    description: "Şarkıyı tekrarlar.",
    usage: "loop",
    examples: ["loop"],
    category: "Müzik",
  },
  data: new SlashCommandBuilder()
    .setName("loop")
    .setNameLocalizations({
      tr: "tekrarla",
    })
    .setDescription("Loops the current track")
    .setDescriptionLocalizations({
      tr: "Şarkıyı tekrarlar.",
    })
    .setDMPermission(false),
  async execute({ client, interaction }) {
    const player = useQueue(interaction.guild!.id);
    if (!player) {
      return await interaction.reply(client.handleLanguages("BOT_NOT_PLAYING", client, interaction.guild!.id));
    }
    if (!(interaction.member as GuildMember).voice.channel) {
      return await interaction.reply(client.handleLanguages("USER_NOT_IN_VOICE", client, interaction.guild!.id));
    }
    if (
      interaction.guild!.members.me!.voice.channel &&
      (interaction.member as GuildMember).voice.channel!.id !== interaction.guild!.members.me!.voice.channel.id
    ) {
      return await interaction.reply(
        client.handleLanguages("USER_NOT_IN_THE_SAME_VOICE", client, interaction.guild!.id),
      );
    }
    if (!player.currentTrack) {
      return await interaction.reply(client.handleLanguages("BOT_NOT_PLAYING", client, interaction.guild!.id));
    }
    if (player.repeatMode !== 1 && player.repeatMode !== 0) {
      await interaction.reply(client.handleLanguages("LOOP_ANOTHER_MODE_ENABLED", client, interaction.guild!.id));
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
          if (player.repeatMode === 1) {
            player.setRepeatMode(0);
            await interaction.reply(client.handleLanguages("LOOP_MODE_OFF", client, interaction.guild!.id));
            return;
          } else {
            player.setRepeatMode(1);
            await interaction.reply(client.handleLanguages("LOOP_MODE_ON", client, interaction.guild!.id));
            return;
          }
        }
      } else {
        if (player.repeatMode === 1) {
          player.setRepeatMode(0);
          await interaction.reply(client.handleLanguages("LOOP_MODE_OFF", client, interaction.guild!.id));
          return;
        } else {
          player.setRepeatMode(1);
          await interaction.reply(client.handleLanguages("LOOP_MODE_ON", client, interaction.guild!.id));
          return;
        }
      }
    }
    if (player.repeatMode === 1) {
      player.setRepeatMode(0);
      await interaction.reply(client.handleLanguages("LOOP_MODE_OFF", client, interaction.guild!.id));
      return;
    } else {
      player.setRepeatMode(1);
      await interaction.reply(client.handleLanguages("LOOP_MODE_ON", client, interaction.guild!.id));
      return;
    }
  },
} as slashCommandBase;
