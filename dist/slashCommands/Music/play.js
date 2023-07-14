import { EmbedBuilder, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { TrackUtils } from "erela.js";
import prettyMilliseconds from "pretty-ms";
export default {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Müzik çalar.")
        .addStringOption(option => option.setName("song").setDescription("Çalmak istediğiniz şarkıyı girin.").setRequired(true))
        .setDMPermission(false),
    execute: async ({ client, interaction }) => {
        if (!interaction.member.voice.channel) {
            await interaction.reply({ content: "|❌| **Bir sesli kanala girmek zorundasınız**", ephemeral: true });
            return;
        }
        if (!interaction.member.voice.channel.permissionsFor(interaction.guild.members.me).has(PermissionsBitField.Flags.Connect)) {
            await interaction.reply({ content: "Bulunduğun kanala katılamıyorum!", ephemeral: true });
            return;
        }
        if (!interaction.member.voice.channel.permissionsFor(interaction.guild.members.me).has(PermissionsBitField.Flags.Speak)) {
            await interaction.reply({ content: "Mhm! Mhhmhhmhm! MHHHPMHP! (Konuşma yetkim yok)", ephemeral: true });
            return;
        }
        if (interaction.guild.members.me.voice.channel &&
            interaction.member.voice.channel.id !== interaction.guild.members.me.voice.channel.id) {
            await interaction.reply({ content: "|❌| **Bot ile aynı kanalda olmanız gerekiyor**", ephemeral: true });
            return;
        }
        let SearchString = interaction.options.getString("song", true);
        let CheckNode = client.manager.nodes.get("Main");
        await interaction.reply("<a:mag_search:1015974107097083934> Aranıyor...");
        const message = await interaction.fetchReply();
        if (!CheckNode || !CheckNode.connected) {
            message.channel.send("|❌| **Bot şu anda müzik çalamıyor.**");
            await message.delete();
            return;
        }
        const player = client.manager.create({
            guild: message.guild.id,
            voiceChannel: interaction.member.voice.channel.id,
            textChannel: message.channel.id,
            selfDeafen: true,
            volume: 100
        });
        let SongAddedEmbed = new EmbedBuilder().setColor("Random");
        if (!player) {
            message.channel.send("|❌| **Bir şey çalmıyor...**");
            await message.delete();
            return;
        }
        if (player.state !== "CONNECTED")
            await player.connect();
        try {
            if (SearchString.match(client.Lavasfy.spotifyPattern)) {
                await client.Lavasfy.requestToken();
                let node = client.Lavasfy.nodes.get("Main");
                let Searched = await node.load(SearchString);
                if (Searched.loadType === "PLAYLIST_LOADED") {
                    let songs = [];
                    for (let i = 0; i < Searched.tracks.length; i++)
                        songs.push(TrackUtils.build(Searched.tracks[i], message.author));
                    player.queue.add(songs);
                    if (!player.playing &&
                        !player.paused &&
                        player.queue.totalSize === Searched.tracks.length)
                        await player.play();
                    SongAddedEmbed.setAuthor({ iconURL: client.config.IconURL, name: "Şarkı Eklendi" });
                    SongAddedEmbed.addFields({
                        name: "Sıraya Eklendi",
                        value: `${Searched.tracks.length} şarkı sıraya eklendi.`
                    });
                    await message.edit({ embeds: [SongAddedEmbed] });
                }
                else if (Searched.loadType.startsWith("TRACK")) {
                    player.queue.add(TrackUtils.build(Searched.tracks[0], message.author));
                    if (!player.playing && !player.paused && !player.queue.size)
                        await player.play();
                    SongAddedEmbed.setAuthor({ iconURL: client.config.IconURL, name: "Şarkı Sıraya Eklendi" });
                    SongAddedEmbed.setDescription(`[${Searched.tracks[0].info.title}](${Searched.tracks[0].info.uri})`);
                    SongAddedEmbed.addFields({
                        name: "Şarkı Sahibi",
                        value: Searched.tracks[0].info.author,
                        inline: true
                    }, {
                        name: "Şarkı Süresi",
                        value: prettyMilliseconds(Searched.tracks[0].info.length, { colonNotation: true }),
                        inline: true
                    });
                    if (player.queue.totalSize > 1) {
                        SongAddedEmbed.addFields({
                            name: "Listedeki Sırası",
                            value: `${(player.queue.size)}`,
                            inline: true
                        });
                        await message.edit({ embeds: [SongAddedEmbed] });
                    }
                }
                else {
                    message.channel.send("|❌| **Bir şarkı bulunamadı.**");
                    await message.delete();
                }
            }
            else {
                let Searched = await player.search(SearchString, interaction.user);
                if (!player) {
                    message.channel.send("|❌| **Bir şey çalmıyor...**");
                    await message.delete();
                    return;
                }
                if (Searched.loadType === "NO_MATCHES") {
                    message.channel.send("|❌| **Bir şarkı bulunamadı.**");
                    await message.delete();
                }
                else if (Searched.loadType === "PLAYLIST_LOADED") {
                    player.queue.add(Searched.tracks);
                    if (!player.playing &&
                        !player.paused &&
                        player.queue.totalSize === Searched.tracks.length)
                        await player.play();
                    SongAddedEmbed.setAuthor({ iconURL: client.config.IconURL, name: "Şarkı Listesi Sıraya Eklendi" });
                    SongAddedEmbed.setDescription(`[${Searched.playlist.name}](${SearchString})`);
                    SongAddedEmbed.addFields({
                        name: "Sıraya Eklendi",
                        value: `\`${Searched.tracks.length}\` şarkı`,
                    });
                    SongAddedEmbed.addFields({
                        name: "Çalma listesi Süresi",
                        value: `\`${prettyMilliseconds(Searched.playlist.duration, {
                            colonNotation: true,
                        })}\``,
                    });
                    await message.edit({ embeds: [SongAddedEmbed] });
                }
                else {
                    player.queue.add(Searched.tracks[0]);
                    if (!player.playing && !player.paused && !player.queue.size)
                        await player.play();
                    SongAddedEmbed.setAuthor({ iconURL: client.config.IconURL, name: "Şarkı Sıraya Eklendi" });
                    SongAddedEmbed.setDescription(`[${Searched.tracks[0].title}](${Searched.tracks[0].uri})`);
                    SongAddedEmbed.addFields({
                        name: "Şarkı Sahibi",
                        value: Searched.tracks[0].author,
                        inline: true
                    });
                    SongAddedEmbed.addFields({
                        name: "Süresi",
                        value: `\`${prettyMilliseconds(Searched.tracks[0].duration, {
                            colonNotation: true,
                        })}\``,
                        inline: true
                    });
                    if (player.queue.totalSize > 1)
                        SongAddedEmbed.addFields({
                            name: "Listedeki Sırası",
                            value: `\`${player.queue.size}\``,
                            inline: true
                        });
                    await message.edit({ embeds: [SongAddedEmbed] });
                }
            }
        }
        catch (e) {
            console.log(e);
            message.channel.send("|❌| **Bir şarkı bulunamadı.**");
        }
    }
};
//# sourceMappingURL=play.js.map