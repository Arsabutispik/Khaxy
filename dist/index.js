import { ActivityType, Client, Collection, EmbedBuilder, Partials, IntentsBitField } from "discord.js";
import config from './config.json' assert { type: 'json' };
import { registerEvents, registerSlashCommands } from "./utils/registery.js";
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
import guildSchema from "./schemas/guildSchema.js";
import colorOfTheDay from "./utils/colorOfTheDay.js";
import cron from "node-cron";
const intents = new IntentsBitField()
    .add([IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildBans,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.GuildMessageTyping,
    IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.DirectMessageReactions,
    IntentsBitField.Flags.DirectMessageTyping,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildWebhooks,
    IntentsBitField.Flags.GuildInvites,
    IntentsBitField.Flags.GuildScheduledEvents,
    IntentsBitField.Flags.GuildMessageTyping,
    IntentsBitField.Flags.GuildIntegrations,
    IntentsBitField.Flags.GuildEmojisAndStickers]);
const client = new Client({ intents, partials: [Partials.Message, Partials.Channel, Partials.User, Partials.Reaction] });
client.config = (await import("./botconfig.js")).default;
(async () => {
    client.commands = new Collection();
    client.categories = new Collection();
    client.slashCommands = new Collection();
    client.guildsConfig = new Collection();
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
        await mongoose.set("strictQuery", true);
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
})();
client.once("ready", async () => {
    await registerEvents(client, "../events");
    await registerSlashCommands(client, "../slashCommands");
    client.manager.init(client.user.id);
    const guildData = await guildSchema.find();
    for (const data of guildData) {
        client.guildsConfig.set(data.guildID, (await data).toJSON());
    }
    await checkPunishments(client);
    cron.schedule("0 0 * * *", async () => {
        await colorOfTheDay(client);
    }, {
        timezone: "Europe/Istanbul"
    });
    log("SUCCESS", "src/events/ready.ts", "Bot başarıyla aktif edildi.");
    const messages = [
        {
            message: `${client.users.cache.size} Kutsal ruhu gözetliyorum 👁‍🗨`, type: ActivityType.Watching
        },
        {
            message: `/invite beni sunucuna davet et veya destek sunucumuza katıl.`, type: ActivityType.Playing
        },
        {
            message: `${client.guilds.cache.size}👑 Kutsal sunucu korumam altında.`, type: ActivityType.Watching
        },
        {
            message: "/play Kutsal müzik dinlemeye ne dersin?", type: ActivityType.Listening
        }
    ];
    const status = messages[Math.floor(Math.random() * messages.length)];
    client.updateGuildConfig = async ({ guildId, config }) => {
        try {
            const update = await guildSchema.findOneAndUpdate({
                guildID: guildId
            }, config, {
                new: true,
                upsert: true
            });
            client.guildsConfig.delete(guildId);
            client.guildsConfig.set(guildId, update.toObject());
        }
        catch (e) {
            console.log(e);
        }
    };
    client.user.setActivity(status.message, { type: status.type });
    setInterval(() => {
        messages[0] = { message: `${client.users.cache.size} Kutsal ruhu gözetliyorum 👁‍🗨`, type: ActivityType.Watching };
        messages[2] = { message: `${client.guilds.cache.size}👑 Kutsal sunucu korumam altında.`, type: ActivityType.Watching };
        const status = messages[Math.floor(Math.random() * messages.length)];
        client.user.setActivity(status.message, { type: status.type });
    }, 60000);
});
client.on("raw", d => client.manager.updateVoiceState(d));
process.on("uncaughtException", async (error) => {
    const owner = await client.users.fetch("903233069245419560");
    const errorEmbed = new EmbedBuilder()
        .setTitle(`HATA! ${error.name}`)
        .setDescription(error.message)
        .setColor("Red");
    owner?.send({ embeds: [errorEmbed] });
    console.log(error);
});
client.manager.on("nodeConnect", node => {
    log("SUCCESS", "src/index.ts", `Node ${node.options.identifier} bağlandı.`);
});
client.manager.on("nodeError", async (node, error) => {
    const owner = await client.users.fetch("903233069245419560");
    const errorEmbed = new EmbedBuilder()
        .setTitle(`HATA -> Node "${node.options.identifier}! ${error.name}`)
        .setDescription(error.message)
        .setColor("Red");
    owner?.send({ embeds: [errorEmbed] });
    console.log(error);
});
client.manager.on("trackStart", async (player, track) => {
    let TrackStartedEmbed = new EmbedBuilder()
        .setAuthor({ name: `Şimdi Çalıyor ♪`, iconURL: client.config.IconURL })
        .setThumbnail(player.queue.current.displayThumbnail())
        .setDescription(`[${track.title}](${track.uri})`)
        .addFields({
        name: "Şarkıyı Talep Eden",
        value: `${track.requester}`,
        inline: true
    }, {
        name: "Şarkı Süresi",
        value: `\`${prettyMilliseconds(track.duration, { colonNotation: true, })}\``,
        inline: true
    })
        .setColor("Random");
    const channel = await client.channels.fetch(player.textChannel);
    await channel.send({ embeds: [TrackStartedEmbed] });
});
client.manager.on("queueEnd", async (player) => {
    let QueueEmbed = new EmbedBuilder()
        .setAuthor({ name: "Şarkı Listesi Bitti", iconURL: client.config.IconURL })
        .setColor("Random")
        .setTimestamp();
    const channel = await client.channels.fetch(player.textChannel);
    setTimeout(async () => {
        if (!player.queue.current && !client.config["24/7"] || !player) {
            await channel.send({ embeds: [QueueEmbed] });
            await player.destroy();
        }
    }, 1000 * 60 * 5);
});
//# sourceMappingURL=index.js.map