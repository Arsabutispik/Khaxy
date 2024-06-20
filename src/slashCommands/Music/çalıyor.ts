import {EmbedBuilder, SlashCommandBuilder} from "discord.js";
import {slashCommandBase} from "../../types";
import prettyMilliseconds from "pretty-ms";
import ProgressBar from "string-progressbar";
import {GuildQueue, useQueue} from "discord-player";

export default {
    help: {
        name: "çalıyor",
        description: "Şu anda çalınan şarkıyı gösterir.",
        usage: "çalıyor",
        examples: ["çalıyor"],
        category: "Müzik"
    },
    data: new SlashCommandBuilder()
        .setName("çalıyor")
        .setDescription("Şu anda çalınan şarkıyı gösterir.")
        .setDMPermission(false),
    execute: async ({ client, interaction }) => {
        const player: GuildQueue<any> | null = useQueue(interaction.guild!.id);
        if (!player){
            await interaction.reply("|❌| **Bir şey çalmıyor...**");
            return
        }

        const song = player.currentTrack;
        if(!song){
            await interaction.reply("|❌| **Bir şey çalmıyor...**");
            return
        }
        const timestamp = player.node.getTimestamp()!;
        const QueueEmbed = new EmbedBuilder()
            .setAuthor({name: "Şu Anda Çalıyor", iconURL: client.config.IconURL})
            .setColor("Random")
            .setDescription(`[${song.title}](${song.url})`)
            .addFields({
                name: "Şarkıyı Talep Eden",
                value: `${player.metadata.requestedBy}`,
                inline: true,
            }, {
                name: "Süre",
                value: `${ProgressBar.splitBar(timestamp.total.value, timestamp.current.value, 15)[0]} ${prettyMilliseconds(timestamp.current.value, {colonNotation: true})}/${prettyMilliseconds(timestamp.total.value, {colonNotation: true})}`,
                inline: true,
            })
            //@ts-ignore
            .setThumbnail(player.currentTrack!.thumbnail);
        return await interaction.reply({embeds: [QueueEmbed]});
    }
} as slashCommandBase