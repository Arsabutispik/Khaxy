import prettyMilliseconds from "pretty-ms";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import _ from "lodash";
import { paginate, replaceMassString } from "../../utils/utils.js";
import { useQueue } from "discord-player";
export default {
  help: {
    name: "liste",
    description: "Şarkı listesini gösterir.",
    usage: "liste",
    examples: ["liste"],
    category: "Müzik",
  },
  data: new SlashCommandBuilder()
    .setName("list")
    .setNameLocalizations({
      tr: "liste",
    })
    .setDescription("Shows the song list.")
    .setDescriptionLocalizations({
      tr: "Şarkı listesini gösterir.",
    })
    .setDMPermission(false),
  async execute({ client, interaction }) {
    const player = useQueue(interaction.guild.id);
    if (!player) {
      return await interaction.reply(client.handleLanguages("BOT_NOT_PLAYING", client, interaction.guildId));
    }
    if (player.size < 2) {
      const QueueEmbed = JSON.parse(JSON.stringify(client.handleLanguages("LIST_EMBED", client, interaction.guildId)));
      for (const embed of QueueEmbed.embeds) {
        embed.author.icon_url = client.config.IconURL;
        const x = Math.round(0xffffff * Math.random()).toString(16);
        const y = 6 - x.length;
        const z = "000000";
        const z1 = z.substring(0, y);
        embed.color = Number(`0x${z1 + x}`);
        embed.thumbnail.url = player.currentTrack.thumbnail;
        embed.description = replaceMassString(embed.description, {
          "{track_title}": player.currentTrack.title,
          "{track_url}": player.currentTrack.url,
        });
        console.log(embed.fields);
        for (const field of embed.fields) {
          field.value = replaceMassString(field.value, {
            "{duration}": player.node.createProgressBar({ timecodes: true }),
            "{requestedBy}":
              player.metadata.requestedBy.toString() ||
              client.handleLanguages("LIST_UNKNOWN_USER", client, interaction.guildId),
          });
        }
      }
      return await interaction.reply(QueueEmbed);
    }
    const allSongs = player.tracks.map((t) => {
      return t;
    });
    const ChunkedSongs = _.chunk(allSongs, 10);
    let counter = 1;
    const pages = ChunkedSongs.map((t) => {
      const QueueEmbed = JSON.parse(
        JSON.stringify(client.handleLanguages("LIST_PAGINATE", client, interaction.guildId)),
      );
      for (const embed of QueueEmbed.embeds) {
        embed.author.icon_url = client.config.IconURL;
        const x = Math.round(0xffffff * Math.random()).toString(16);
        const y = 6 - x.length;
        const z = "000000";
        const z1 = z.substring(0, y);
        embed.color = Number(`0x${z1 + x}`);
        embed.description = replaceMassString(embed.description, {
          "{track_title}": player.currentTrack.title,
          "{track_url}": player.currentTrack.url,
          "{track_duration}": prettyMilliseconds(player.currentTrack.durationMS, { colonNotation: true }),
          "{requestedBy}":
            player.currentTrack.requestedBy?.toString() ||
            client.handleLanguages("LIST_UNKNOWN_USER", client, interaction.guildId),
        });
        for (const song of t) {
          embed.description += replaceMassString(
            JSON.parse(JSON.stringify(client.handleLanguages("LIST_PAGINATE_TRACKS", client, interaction.guildId))),
            {
              "{index}": (counter++).toString(),
              "{track_title}": song.title,
              "{track_url}": song.url,
              "{track_duration}": prettyMilliseconds(song.durationMS, {
                colonNotation: true,
              }),
              "{requestedBy}":
                song.requestedBy?.toString() ||
                client.handleLanguages("LIST_UNKNOWN_USER", client, interaction.guildId),
            },
          );
        }
        Object.assign(embed, embed);
      }
      return new EmbedBuilder(QueueEmbed.embeds[0]);
    });
    await paginate(interaction, pages, 600000);
  },
};
//# sourceMappingURL=list.js.map
