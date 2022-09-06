import { MessageEmbed } from "discord.js";
import { TrackUtils } from "erela.js";
import prettyMilliseconds from "pretty-ms";
export default {
    name: "play",
    category: "Müzik",
    description: "Müzik çalar.",
    usage: "{prefix}play <müzik ismi>",
    examples: "{prefix}play Never Gonna Give You Up",
    execute: async ({ client, message, args }) => {
        if (!message.member.voice.channel) {
            message.channel.send("|❌| **Bir sesli kanala girmek zorundasınız**");
            return;
        }
        if (message.guild.me.voice.channel &&
            message.member.voice.channel.id !== message.guild.me.voice.channel.id) {
            message.channel.send("|❌| **Bot ile aynı kanalda olmanız gerekiyor**");
            return;
        }
        let SearchString = args.join(" ");
        if (!SearchString) {
            message.channel.send("|❌| **Bir şarkı adı/URL'si yazmalısınız.**");
            return;
        }
        let CheckNode = client.manager.nodes.get("Main");
        let Searching = await message.channel.send("<a:mag_search:1015974107097083934> Aranıyor...");
        if (!CheckNode || !CheckNode.connected) {
            message.channel.send("|❌| **Bot şu anda müzik çalamıyor.**");
            await Searching.delete();
            return;
        }
        const player = client.manager.create({
            guild: message.guild.id,
            voiceChannel: message.member.voice.channel.id,
            textChannel: message.channel.id,
            selfDeafen: true,
            volume: 100
        });
        let SongAddedEmbed = new MessageEmbed().setColor("RANDOM");
        if (!player) {
            message.channel.send("|❌| **Bir şey çalmıyor...**");
            await Searching.delete();
            return;
        }
        if (player.state != "CONNECTED")
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
                    SongAddedEmbed.addField("Sıraya Eklendi", `\`${Searched.tracks.length}\` şarkı.`, false);
                    Searching.edit({ embeds: [SongAddedEmbed] });
                }
                else if (Searched.loadType.startsWith("TRACK")) {
                    player.queue.add(TrackUtils.build(Searched.tracks[0], message.author));
                    if (!player.playing && !player.paused && !player.queue.size)
                        await player.play();
                    SongAddedEmbed.setAuthor({ iconURL: client.config.IconURL, name: "Şarkı Sıraya Eklendi" });
                    SongAddedEmbed.setDescription(`[${Searched.tracks[0].info.title}](${Searched.tracks[0].info.uri})`);
                    SongAddedEmbed.addField("Şarkı Sahibi", Searched.tracks[0].info.author, true);
                    if (player.queue.totalSize > 1)
                        SongAddedEmbed.addField("Listedeki Sırası", `${(player.queue.size)}`, true);
                    Searching.edit({ embeds: [SongAddedEmbed] });
                }
                else {
                    message.channel.send("|❌| **Bir şarkı bulunamadı.**");
                    await Searching.delete();
                    return;
                }
            }
            else {
                console.log("Burada çöker");
                let Searched = await player.search(SearchString, message.author);
                if (!player) {
                    message.channel.send("|❌| **Bir şey çalmıyor...**");
                    await Searching.delete();
                    return;
                }
                console.log(Searched);
                if (Searched.loadType === "NO_MATCHES") {
                    message.channel.send("|❌| **Bir şarkı bulunamadı.**");
                    await Searching.delete();
                    return;
                }
                else if (Searched.loadType == "PLAYLIST_LOADED") {
                    player.queue.add(Searched.tracks);
                    if (!player.playing &&
                        !player.paused &&
                        player.queue.totalSize === Searched.tracks.length)
                        await player.play();
                    SongAddedEmbed.setAuthor({ iconURL: client.config.IconURL, name: "Şarkı Listesi Sıraya Eklendi" });
                    SongAddedEmbed.setDescription(`[${Searched.playlist.name}](${SearchString})`);
                    SongAddedEmbed.addField("Sıraya Eklendi", `\`${Searched.tracks.length}\` şarkı`, false);
                    SongAddedEmbed.addField("Çalma listesi Süresi", `\`${prettyMilliseconds(Searched.playlist.duration, {
                        colonNotation: true,
                    })}\``, false);
                    Searching.edit({ embeds: [SongAddedEmbed] });
                }
                else {
                    player.queue.add(Searched.tracks[0]);
                    if (!player.playing && !player.paused && !player.queue.size)
                        await player.play();
                    SongAddedEmbed.setAuthor({ iconURL: client.config.IconURL, name: "Şarkı Sıraya Eklendi" });
                    SongAddedEmbed.setDescription(`[${Searched.tracks[0].title}](${Searched.tracks[0].uri})`);
                    SongAddedEmbed.addField("Şarkı Sahibi", Searched.tracks[0].author, true);
                    SongAddedEmbed.addField("Süresi", `\`${prettyMilliseconds(Searched.tracks[0].duration, {
                        colonNotation: true,
                    })}\``, true);
                    if (player.queue.totalSize > 1)
                        SongAddedEmbed.addField("Listedeki yeri", `${player.queue.size}`, true);
                    Searching.edit({ embeds: [SongAddedEmbed] });
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