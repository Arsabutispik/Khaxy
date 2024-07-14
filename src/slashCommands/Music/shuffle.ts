import {slashCommandBase} from "../../types";
import {GuildMember, SlashCommandBuilder} from "discord.js";
import {useQueue} from "discord-player"
export default {
    help: {
        name: "shuffle",
        description: "Müziği karıştırır.",
        usage: "shuffle",
        examples: ["shuffle"],
        category: "Müzik"
    },
    data: new SlashCommandBuilder()
        .setName("shuffle")
        .setNameLocalizations({
            "tr": "karıştır"
        })
        .setDescription("Shuffles the music")
        .setDescriptionLocalizations({
            "tr": "Müziği karıştırır."
        })
        .setDMPermission(false),
    execute: async ({ client, interaction }) => {
        let player = useQueue(interaction.guild!.id);

        if (!(interaction.member as GuildMember).voice.channel) {
            await interaction.reply(client.handleLanguages("USER_NOT_IN_VOICE", client, interaction.guildId!));
            return
        }
        if (!player) {
            await interaction.reply(client.handleLanguages("BOT_NOT_PLAYING", client, interaction.guildId!));
            return
        }
        const voiceStateUsers = (interaction.member as GuildMember).voice.channel!.members
            .filter(member => !member.user.bot)
            .filter(member => !member.roles.cache.has("798592379204010024"))
            .filter(member => !member.voice.selfDeaf!)
            .filter(member => !member.voice.serverDeaf!)
            .filter(member => !(member.id === interaction.user.id));
        if (voiceStateUsers.size > 0) {
            if(!(interaction.member as GuildMember).permissions.has("Administrator")) {
                if(!(interaction.member as GuildMember).roles.cache.has(client.guildsConfig.get(interaction.guild!.id)!.config.djRole)) {
                    await interaction.reply(client.handleLanguages("VOICE_NOT_ENOUGH_PERMS", client, interaction.guildId!));
                    return
                } else {
                    player.tracks.shuffle();
                    await interaction.reply(client.handleLanguages("SHUFFLE_SUCCESS", client, interaction.guildId!));
                    const message = await interaction.fetchReply()
                    await message.react("✅");
                    return
                }
            } else {
                player.tracks.shuffle();
                await interaction.reply(client.handleLanguages("SHUFFLE_SUCCESS", client, interaction.guildId!));
                const message = await interaction.fetchReply()
                await message.react("✅");
                return
            }
        }

        player.tracks.shuffle();
        await interaction.reply(client.handleLanguages("SHUFFLE_SUCCESS", client, interaction.guildId!));
        const message = await interaction.fetchReply()
        await message.react("✅");
    }
} as slashCommandBase