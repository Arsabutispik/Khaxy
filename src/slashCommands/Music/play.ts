import {slashCommandBase} from "../../types";
import {EmbedBuilder, GuildMember, PermissionsBitField, SlashCommandBuilder} from "discord.js";
import prettyMilliseconds from "pretty-ms";
import { useMainPlayer } from "discord-player";

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
        .setDescription("Müzik çalar.")
        .addStringOption(option => option.setName("song").setDescription("Çalmak istediğiniz şarkıyı girin.").setRequired(true))
        .setDMPermission(false),
    execute: async ({ client, interaction }) => {
        if (!(interaction.member as GuildMember).voice.channel){
            await interaction.reply({content: "|❌| **Bir sesli kanala girmek zorundasınız**", ephemeral: true})
            return
        }
        if(!(interaction.member as GuildMember).voice.channel!.permissionsFor(interaction.guild!.members.me!).has(PermissionsBitField.Flags.Connect)) {
            await interaction.reply({content: "Bulunduğun kanala katılamıyorum!", ephemeral: true})
            return
        }
        if(!(interaction.member as GuildMember).voice.channel!.permissionsFor(interaction.guild!.members.me!).has(PermissionsBitField.Flags.Speak)) {
            await interaction.reply({content: "Mhm! Mhhmhhmhm! MHHHPMHP! (Konuşma yetkim yok)", ephemeral: true})
            return
        }
        if (
            interaction.guild!.members.me!.voice.channel &&
            (interaction.member as GuildMember).voice.channel!.id !== interaction.guild!.members.me!.voice.channel.id
        ) {
            await interaction.reply({content: "|❌| **Bot ile aynı kanalda olmanız gerekiyor**", ephemeral: true})
            return
        }
        let SearchString = interaction.options.getString("song", true);
        await interaction.reply("<a:mag_search:1015974107097083934> Aranıyor...");
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
            }, fallbackSearchEngine: "youtube"
        })

        let SongAddedEmbed = new EmbedBuilder()
            .setColor("Random")
            .setAuthor({name:`Şarkı Sıraya Eklendi`, iconURL: client.config.IconURL})
            .setThumbnail(player.track.thumbnail)
            .setDescription(`[${player.track.title}](${player.track.url})`)
            .addFields([
                {
                    name: "Şarkıyı Talep Eden",
                    value: `${interaction.user}`,
                    inline: true
                },
                {
                name: "Süre",
                value: prettyMilliseconds(player.queue.currentTrack!.durationMS, {colonNotation: true}),
                inline: true
                }])
        message.channel.send({embeds: [SongAddedEmbed]})
    }
} as slashCommandBase