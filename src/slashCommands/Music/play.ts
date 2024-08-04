import {slashCommandBase} from "../../../@types/types";
import {GuildMember, PermissionsBitField, SlashCommandBuilder} from "discord.js";
import prettyMilliseconds from "pretty-ms";
import { useMainPlayer } from "discord-player";
import {replaceMassString} from "../../utils/utils.js";

export default {
    help: {
        name: "play",
        description: "Müzik çalar.",
        usage: "play <şarkı adı>",
        examples: ["play https://www.youtube.com/watch?v=dQw4w9WgXcQ", "play https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT?si=0b88f1a840684c49"],
        category: "Müzik"
    },
    data: new SlashCommandBuilder()
        .setName("play")
        .setNameLocalizations({
            "tr": "çal"
        })
        .setDescription("Plays a song")
        .setDescriptionLocalizations({
            "tr": "Bir şarkı çalar."
        })
        .addStringOption(option => option
            .setName("song")
            .setNameLocalizations({
                "tr": "şarkı"
            })
            .setDescription("Enter the song name or URL")
            .setDescriptionLocalizations({
                "tr": "Şarkı adını veya URL'sini girin"
            })
            .setRequired(true))
        .setDMPermission(false),
    execute: async ({ client, interaction }) => {
        if (!(interaction.member as GuildMember).voice.channel){
            await interaction.reply({content: client.handleLanguages("USER_NOT_IN_VOICE", client, interaction.guildId!), ephemeral: true})
            return
        }
        if(!(interaction.member as GuildMember).voice.channel!.permissionsFor(interaction.guild!.members.me!).has(PermissionsBitField.Flags.Connect)) {
            await interaction.reply({content: client.handleLanguages("USER_NOT_IN_THE_SAME_VOICE", client, interaction.guildId!), ephemeral: true})
            return
        }
        if(!(interaction.member as GuildMember).voice.channel!.permissionsFor(interaction.guild!.members.me!).has(PermissionsBitField.Flags.Speak)) {
            await interaction.reply({content: client.handleLanguages("PLAY_UNABLE_TO_SPEAK", client, interaction.guildId!), ephemeral: true})
            return
        }
        if (
            interaction.guild!.members.me!.voice.channel &&
            (interaction.member as GuildMember).voice.channel!.id !== interaction.guild!.members.me!.voice.channel.id
        ) {
            await interaction.reply({content: client.handleLanguages("USER_NOT_IN_THE_SAME_VOICE", client, interaction.guildId!), ephemeral: true})
            return
        }
        let SearchString = interaction.options.getString("song", true);
        if(SearchString.match(new RegExp("^((?:https?:)?\\/\\/)?((?:www|m)\\.)?(youtube(?:-nocookie)?\\.com|youtu.be)(\\/(?:[\\w\\-]+\\?v=|embed\\/|live\\/|v\\/)?)([\\w\\-]+)(\\S+)?$"))) {
            return await interaction.reply(client.handleLanguages("PLAY_YOUTUBE_LINK", client, interaction.guildId!));
        }
        await interaction.reply(client.handleLanguages("PLAY_SEARCHING", client, interaction.guildId!));
        const message = await interaction.fetchReply()
        const player = await useMainPlayer()!.play((interaction.member as GuildMember).voice.channel!, SearchString, {
            nodeOptions: {
                leaveOnEmpty: true,
                leaveOnEnd: true,
                leaveOnEndCooldown: 1000 * 60 * 5,
                selfDeaf: true,
                metadata: {
                    channel: interaction.channel,
                    client: interaction.guild?.members.me,
                    requestedBy: interaction.user
                }
            }, fallbackSearchEngine: "soundcloud"
        })

        let SongAddedEmbed = JSON.parse(JSON.stringify(client.handleLanguages("PLAY_EMBED", client, interaction.guildId!)))
        for(const embed of SongAddedEmbed.embeds) {
            embed.author.icon_url = client.config.IconURL
            embed.description = replaceMassString(embed.description, {
                "{track_title}": player.track.title,
                "{track_url}": player.track.url,
            })!
            embed.thumbnail.url = player.track.thumbnail
            for(const field of embed.fields) {
                field.value = replaceMassString(field.value, {
                    "{requestedBy}": interaction.user.toString(),
                    "{duration}": prettyMilliseconds(player.queue.currentTrack!.durationMS, {colonNotation: true})
                })!
            }
        }
        await message.edit(SongAddedEmbed)
    }
} as slashCommandBase