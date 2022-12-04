import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import prettyMilliseconds from "pretty-ms";
import ProgressBar from "string-progressbar";
export default {
    data: new SlashCommandBuilder()
        .setName("çalıyor")
        .setDescription("Şu anda çalınan şarkıyı gösterir.")
        .setDMPermission(false),
    execute: async ({ client, interaction }) => {
        const player = await client.manager.get(interaction.guild.id);
        if (!player) {
            await interaction.reply("|❌| **Bir şey çalmıyor...**");
            return;
        }
        const song = player.queue.current;
        if (!song) {
            await interaction.reply("|❌| **Bir şey çalmıyor...**");
            return;
        }
        const QueueEmbed = new EmbedBuilder()
            .setAuthor({ name: "Şu Anda Çalıyor", iconURL: client.config.IconURL })
            .setColor("Random")
            .setDescription(`[${song.title}](${song.uri})`)
            .addFields({
            name: "Şarkıyı Talep Eden",
            value: `${song.requester}`,
            inline: true,
        }, {
            name: "Süre",
            value: `${ProgressBar.splitBar(song.duration, player.position, 15)[0]} ${prettyMilliseconds(player.position, { colonNotation: true })}/${prettyMilliseconds(song.duration, { colonNotation: true })}`,
            inline: true,
        })
            .setThumbnail(player.queue.current.displayThumbnail());
        return await interaction.reply({ embeds: [QueueEmbed] });
    }
};
//# sourceMappingURL=%C3%A7al%C4%B1yor.js.map