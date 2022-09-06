import { Client, Collection, MessageEmbed } from "discord.js";
import config from './config.json' assert { type: 'json' };
import { registerCommands, registerEvents } from "./utils/registery.js";
import { log } from "./utils/utils.js";
import mongoose from "mongoose";
import checkPunishments from "./utils/checkPunishments.js";
import { Manager } from "erela.js";
import { LavasfyClient } from "lavasfy";
import Spotify from "erela.js-spotify";
import prettyMilliseconds from "pretty-ms";
import deezer from "erela.js-deezer";
import facebook from "erela.js-facebook";
import apple from "erela.js-apple";
const client = new Client({ intents: 32767, partials: ['MESSAGE', 'CHANNEL', 'USER', 'REACTION'] });
client.config = (await import("./botconfig.js")).default;
(async () => {
    client.commands = new Collection();
    client.categories = new Collection();
    const nodes = [
        {
            identifier: client.config.Lavalink.id,
            host: client.config.Lavalink.host,
            port: client.config.Lavalink.port,
            password: client.config.Lavalink.pass,
            secure: client.config.Lavalink.secure,
            retryAmount: client.config.Lavalink.retryAmount,
            retryDelay: client.config.Lavalink.retryDelay,
        }
    ];
    client.Lavasfy = new LavasfyClient({
        clientID: "73955b6660ef46798fc0881b036f0623",
        clientSecret: "8443f5c681aa43b39cb30881a2cd6275",
        audioOnlyResults: true,
        playlistLoadLimit: 3,
        autoResolve: true,
        useSpotifyMetadata: true,
    }, [
        {
            id: client.config.Lavalink.id,
            host: client.config.Lavalink.host,
            port: client.config.Lavalink.port,
            password: client.config.Lavalink.pass,
            secure: client.config.Lavalink.secure,
        },
    ]);
    client.manager = new Manager({
        nodes,
        plugins: [
            new Spotify({
                clientID: client.config.Spotify.clientID,
                clientSecret: client.config.Spotify.clientSecret
            }),
            new deezer({}),
            new facebook(),
            new apple()
        ],
        send: (id, payload) => {
            const guild = client.guilds.cache.get(id);
            if (guild)
                guild.shard.send(payload);
        }
    });
    try {
        await mongoose.connect(config.MONGODB_URI);
        log("SUCCESS", "src/index.ts", "Connected to the database.");
    }
    catch (e) {
        log("ERROR", "src/index.ts", `Error connecting to the database: ${e.message}`);
        process.exit(1);
    }
    try {
        await client.login(config.TOKEN);
        log("SUCCESS", "src/index.ts", `${client.user.tag} Olarak giriş yapıldı.`);
    }
    catch (e) {
        log("ERROR", "src/index.ts", `Bağlanırken Hata: ${e.message}`);
    }
    await checkPunishments(client);
})();
client.once("ready", async () => {
    await registerEvents(client, "../events");
    await registerCommands(client, "../commands");
    client.manager.init(client.user.id);
    log("SUCCESS", "src/events/ready.ts", "Bot başarıyla aktif edildi.");
});
client.on("raw", d => client.manager.updateVoiceState(d));
process.on("uncaughtException", async (error) => {
    const owner = await client.users.fetch("903233069245419560");
    const errorEmbed = new MessageEmbed()
        .setTitle(`HATA! ${error.name}`)
        .setDescription(error.message)
        .setColor("RED");
    owner?.send({ embeds: [errorEmbed] });
    console.log(error);
});
client.manager.on("nodeConnect", node => {
    log("SUCCESS", "src/index.ts", `Node ${node.options.identifier} bağlandı.`);
});
client.manager.on("nodeError", async (node, error) => {
    const owner = await client.users.fetch("903233069245419560");
    const errorEmbed = new MessageEmbed()
        .setTitle(`HATA -> Node "${node.options.identifier}! ${error.name}`)
        .setDescription(error.message)
        .setColor("RED");
    owner?.send({ embeds: [errorEmbed] });
    console.log(error);
});
client.manager.on("trackStart", async (player, track) => {
    let TrackStartedEmbed = new MessageEmbed()
        .setAuthor({ name: `Şimdi Çalıyor ♪`, iconURL: client.config.IconURL })
        .setThumbnail(player.queue.current.displayThumbnail())
        .setDescription(`[${track.title}](${track.uri})`)
        .addField("Şarkıyı Talep Eden", `${track.requester}`, true)
        .addField("Süre", `\`${prettyMilliseconds(track.duration, { colonNotation: true, })}\``, true)
        .setColor("RANDOM");
    await client.channels.cache.get(player.textChannel).send({ embeds: [TrackStartedEmbed] });
});
client.manager.on("queueEnd", (player) => {
    let QueueEmbed = new MessageEmbed()
        .setAuthor({ name: "Şarkı Listesi Bitti", iconURL: client.config.IconURL })
        .setColor("RANDOM")
        .setTimestamp();
    client.channels.cache.get(player.textChannel).send({ embeds: [QueueEmbed] });
    if (!client.config["24/7"])
        player.destroy();
});
//# sourceMappingURL=index.js.map