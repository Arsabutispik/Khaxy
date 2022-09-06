import { MessageEmbed } from "discord.js";
import prettyMilliseconds from "pretty-ms";
import ProgressBar from "string-progressbar";
export default {
    name: "çalıyor",
    category: "Müzik",
    description: "Komut kullanıldığında çalan şarkıyı gösterir.",
    usage: "{prefix}çalıyor",
    examples: "{prefix}çalıyor",
    execute: async ({ client, message }) => {
        const player = await client.manager.get(message.guild.id);
        if (!player) {
            message.channel.send("|❌| **Bir şey çalmıyor...**");
            return;
        }
        const song = player.queue.current;
        if (!song) {
            message.channel.send("|❌| **Bir şey çalmıyor...**");
            return;
        }
        const QueueEmbed = new MessageEmbed()
            .setAuthor({ name: "Şu Anda Çalıyor", iconURL: client.config.IconURL })
            .setColor("RANDOM")
            .setDescription(`[${song.title}](${song.uri})`)
            .addField("Requested by", `${song.requester}`, true)
            .addField("Süre", `${ProgressBar.splitBar(song.duration, player.position, 15)[0]} ${prettyMilliseconds(player.position, { colonNotation: true })}/${prettyMilliseconds(song.duration, { colonNotation: true })}`, false)
            .setThumbnail(player.queue.current.displayThumbnail());
        return message.channel.send({ embeds: [QueueEmbed] });
    }
};
//# sourceMappingURL=%C3%A7al%C4%B1yor.js.map