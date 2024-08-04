import { SlashCommandBuilder } from "discord.js";
import prettyMilliseconds from "pretty-ms";
import ProgressBar from "string-progressbar";
import { useQueue } from "discord-player";
import { replaceMassString } from "../../utils/utils.js";
export default {
    help: {
        name: "çalıyor",
        description: "Şu anda çalınan şarkıyı gösterir.",
        usage: "çalıyor",
        examples: ["çalıyor"],
        category: "Müzik"
    },
    data: new SlashCommandBuilder()
        .setName("playing")
        .setNameLocalizations({
        "tr": "çalıyor",
    })
        .setDescription("Shows the currently playing song.")
        .setDescriptionLocalizations({
        "tr": "Şu anda çalınan şarkıyı gösterir."
    })
        .setDMPermission(false),
    execute: async ({ client, interaction }) => {
        const player = useQueue(interaction.guild.id);
        if (!player) {
            await interaction.reply(client.handleLanguages("BOT_NOT_PLAYING", client, interaction.guildId));
            return;
        }
        const song = player.currentTrack;
        if (!song) {
            await interaction.reply(client.handleLanguages("BOT_NOT_PLAYING", client, interaction.guildId));
            return;
        }
        const timestamp = player.node.getTimestamp(true);
        const { embeds } = JSON.parse(JSON.stringify(client.handleLanguages("PLAYING_EMBED", client, interaction.guildId)));
        embeds[0].author.icon_url = client.config.IconURL;
        let x = Math.round(0xffffff * Math.random()).toString(16);
        let y = (6 - x.length);
        let z = "000000";
        let z1 = z.substring(0, y);
        embeds[0].color = Number(`0x${z1 + x}`);
        embeds[0].thumbnail.url = song.thumbnail;
        embeds[0].description = replaceMassString(embeds[0].description, {
            "{track_title}": song.title,
            "{track_url}": song.url,
        });
        for (const field of embeds[0].fields) {
            field.value = replaceMassString(field.value, {
                "{requestedBy}": player.metadata.requestedBy?.toString() || client.handleLanguages("LIST_UNKNOWN_USER", client, interaction.guildId),
                "{duration}": `${ProgressBar.splitBar(timestamp.total.value, timestamp.current.value, 15)[0]} ${prettyMilliseconds(timestamp.current.value, { colonNotation: true })}/${prettyMilliseconds(timestamp.total.value, { colonNotation: true })}`
            });
        }
        return await interaction.reply({ embeds });
    }
};
//# sourceMappingURL=playing.js.map