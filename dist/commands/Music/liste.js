import prettyMilliseconds from "pretty-ms";
import { MessageEmbed } from "discord.js";
import ProgressBar from "string-progressbar";
import _ from "lodash";
import { paginate } from "../../utils/utils";
export default {
    name: "liste",
    description: "Müzik listesini gösterir.",
    category: "Müzik",
    examples: "{prefix}liste",
    usage: "{prefix}liste",
    async execute({ client, message }) {
        const player = await client.manager.get(message.guild.id);
        if (!player) {
            return message.channel.send("|❌| **Şu anda hiçbir şey çalmıyor.**");
        }
        if (!player.queue || !player.queue.length || player.queue.length === 0) {
            let QueueEmbed = new MessageEmbed()
                .setAuthor({ name: "Şu Anda Çalıyor", iconURL: client.config.IconURL })
                .setColor("RANDOM")
                .setDescription(`[${player.queue.current.title}](${player.queue.current.uri})`)
                .addField("Şarkıyı Talep Eden", `${player.queue.current.requester}`, true)
                .addField("Süre", `${ProgressBar.splitBar(player.queue.current.duration, player.position, 15)[0]} ${prettyMilliseconds(player.position, { colonNotation: true })}/${prettyMilliseconds(player.queue.current.duration, { colonNotation: true })}`, false)
                .setThumbnail(player.queue.current.displayThumbnail());
            return message.channel.send({ embeds: [QueueEmbed] });
        }
        const allSongs = player.queue.map((t) => {
            return t;
        });
        const ChunkedSongs = _.chunk(allSongs, 10);
        let counter = 1;
        const pages = ChunkedSongs.map((t) => {
            const QueueEmbed = new MessageEmbed()
                .setAuthor({ name: "Şarkı Listesi", iconURL: client.config.IconURL })
                .setColor("RANDOM");
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
        paginate(message, pages, 600000);
    }
};
//# sourceMappingURL=liste.js.map