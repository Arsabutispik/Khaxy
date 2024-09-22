import { SlashCommandBuilder } from "discord.js";
import { useQueue } from "discord-player";
export default {
  help: {
    name: "resume",
    description: "Müziği devam ettirir.",
    usage: "resume",
    examples: ["resume"],
    category: "Müzik",
  },
  data: new SlashCommandBuilder()
    .setName("resume")
    .setNameLocalizations({
      tr: "devam",
    })
    .setDescription("Resumes the music")
    .setDescriptionLocalizations({
      tr: "Müziği devam ettirir.",
    })
    .setDMPermission(false),
  execute: async ({ client, interaction }) => {
    const player = useQueue(interaction.guild.id);
    if (!interaction.member.voice.channel) {
      await interaction.reply(client.handleLanguages("USER_NOT_IN_VOICE", client, interaction.guildId));
      return;
    }
    if (!player) {
      await interaction.reply(client.handleLanguages("BOT_NOT_PLAYING", client, interaction.guildId));
      return;
    }
    if (!player.node.isPlaying()) {
      await interaction.reply(client.handleLanguages("RESUME_ALREADY_RESUMED", client, interaction.guildId));
      return;
    }
    const voiceStateUsers = interaction.member.voice.channel.members
      .filter((member) => !member.user.bot)
      .filter((member) => !member.roles.cache.has("798592379204010024"))
      .filter((member) => !member.voice.selfDeaf)
      .filter((member) => !member.voice.serverDeaf)
      .filter((member) => !(member.id === interaction.user.id));
    if (voiceStateUsers.size > 0) {
      if (!interaction.member.permissions.has("Administrator")) {
        if (!interaction.member.roles.cache.has(client.guildsConfig.get(interaction.guild.id).config.djRole)) {
          await interaction.reply(client.handleLanguages("VOICE_NOT_ENOUGH_PERMS", client, interaction.guildId));
          return;
        } else {
          player.node.resume();
          await interaction.reply(client.handleLanguages("RESUME_SUCCESS", client, interaction.guildId));
          const message = await interaction.fetchReply();
          await message.react(client.allEmojis.get(client.config.Emojis.confirm).format);
          return;
        }
      } else {
        player.node.resume();
        await interaction.reply(client.handleLanguages("RESUME_SUCCESS", client, interaction.guildId));
        const message = await interaction.fetchReply();
        await message.react(client.allEmojis.get(client.config.Emojis.confirm).format);
        return;
      }
    }
    player.node.resume();
    await interaction.reply(client.handleLanguages("RESUME_SUCCESS", client, interaction.guildId));
    const message = await interaction.fetchReply();
    await message.react(client.allEmojis.get(client.config.Emojis.confirm).format);
  },
};
//# sourceMappingURL=resume.js.map
