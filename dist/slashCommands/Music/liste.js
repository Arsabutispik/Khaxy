import prettyMilliseconds from "pretty-ms";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import ProgressBar from "string-progressbar";
import _ from "lodash";
import { paginate } from "../../utils/utils.js";
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
        const player = await client.manager.get(interaction.guild.id);
        if (!player) {
            return await interaction.reply("|❌| **Şu anda hiçbir şey çalmıyor.**");
        }
        if (!player.queue || !player.queue.length || player.queue.length === 0) {
            let QueueEmbed = new EmbedBuilder()
                .setAuthor({ name: "Şu Anda Çalıyor", iconURL: client.config.IconURL })
                .setColor("Random")
                .setDescription(`[${player.queue.current.title}](${player.queue.current.uri})`)
                .addFields({
                name: "Şarkıyı Talep Eden",
                value: `${player.queue.current.requester}`,
                inline: true,
            }, {
                name: "Süre",
                value: `${ProgressBar.splitBar(player.queue.current.duration, player.position, 15)[0]} ${prettyMilliseconds(player.position, { colonNotation: true })}/${prettyMilliseconds(player.queue.current.duration, { colonNotation: true })}`,
                inline: true,
            })
                .setThumbnail(player.queue.current.displayThumbnail());
            return await interaction.reply({ embeds: [QueueEmbed] });
        }
        const allSongs = player.queue.map((t) => {
            return t;
        });
        const ChunkedSongs = _.chunk(allSongs, 10);
        let counter = 1;
        const pages = ChunkedSongs.map((t) => {
            const QueueEmbed = new EmbedBuilder()
                .setAuthor({ name: "Şarkı Listesi", iconURL: client.config.IconURL })
                .setColor("Random");
            let text = `**Şu anda Çalıyor** :\n[${player.queue.current.title}](${player.queue.current.uri})\n\`${prettyMilliseconds(player.queue.current.duration, {
                colonNotation: true,
            })}\` **|** Şarkıyı Talep Eden: ${player.queue.current.requester}\n\n**Sıradakiler:**\n`;
            for (const song of t) {
                text += `\`${counter++}.\` [${song.title}](${song.uri})\n\`${prettyMilliseconds(song.duration, {
                    colonNotation: true,
                })}\` **|** Şarkıyı Talep Eden: ${song.requester}\n\n`;
            }
            QueueEmbed.setDescription(text);
            return QueueEmbed;
        });
        paginate(interaction, pages, 600000);
    }
};
//# sourceMappingURL=liste.js.map