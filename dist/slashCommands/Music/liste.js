import prettyMilliseconds from "pretty-ms";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import ProgressBar from "string-progressbar";
import _ from "lodash";
import { paginate } from "../../utils/utils.js";
import { useQueue } from "discord-player";
export default {
    help: {
        name: "liste",
        description: "Şarkı listesini gösterir.",
        usage: "liste",
        examples: ["liste"],
        category: "Müzik"
    },
    data: new SlashCommandBuilder()
        .setName("liste")
        .setDescription("Şarkı listesini gösterir.")
        .setDMPermission(false),
    async execute({ client, interaction }) {
        const player = useQueue(interaction.guild.id);
        if (!player) {
            return await interaction.reply("|❌| **Şu anda hiçbir şey çalmıyor.**");
        }
        if (player.size < 2) {
            const timestamp = player.node.getTimestamp();
            let QueueEmbed = new EmbedBuilder()
                .setAuthor({ name: "Şu Anda Çalıyor", iconURL: client.config.IconURL })
                .setColor("Random")
                .setDescription(`[${player.currentTrack.title}](${player.currentTrack.url})`)
                .addFields({
                name: "Şarkıyı Talep Eden",
                value: `${player.metadata.requestedBy}`,
                inline: true,
            }, {
                name: "Süre",
                value: `${ProgressBar.splitBar(timestamp.total.value, timestamp.current.value, 15)[0]} ${prettyMilliseconds(timestamp.current.value, { colonNotation: true })}/${prettyMilliseconds(timestamp.total.value, { colonNotation: true })}`,
                inline: true,
            })
                .setThumbnail(player.currentTrack.thumbnail);
            return await interaction.reply({ embeds: [QueueEmbed] });
        }
        const allSongs = player.tracks.map((t) => {
            return t;
        });
        const ChunkedSongs = _.chunk(allSongs, 10);
        let counter = 1;
        const pages = ChunkedSongs.map((t) => {
            const QueueEmbed = new EmbedBuilder()
                .setAuthor({ name: "Şarkı Listesi", iconURL: client.config.IconURL })
                .setColor("Random");
            let text = `**Şu anda Çalıyor** :\n[${player.currentTrack.title}](${player.currentTrack.url})\n\`${prettyMilliseconds(player.currentTrack.durationMS, {
                colonNotation: true,
            })}\` **|** Şarkıyı Talep Eden: ${player.metadata.requestedBy}\n\n**Sıradakiler:**\n`;
            for (const song of t) {
                text += `\`${counter++}.\` [${song.title}](${song.url})\n\`${prettyMilliseconds(song.durationMS, {
                    colonNotation: true,
                })}\` **|** Şarkıyı Talep Eden: ${player.currentTrack.requestedBy}\n\n`;
            }
            QueueEmbed.setDescription(text);
            return QueueEmbed;
        });
        paginate(interaction, pages, 600000);
    }
};
//# sourceMappingURL=liste.js.map