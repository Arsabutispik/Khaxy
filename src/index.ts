import {ActivityType, Client, EmbedBuilder, Partials, IntentsBitField, Collection } from "discord.js";
import config from './config.json' assert {type: 'json'};
import {HolyClient} from "./types";
import {registerEvents, registerSlashCommands} from "./utils/registery.js";
import {log} from "./utils/utils.js";
import mongoose from "mongoose";
import checkPunishments from "./utils/checkPunishments.js";
import { Player } from "discord-player";
import prettyMilliseconds from "pretty-ms";
import guildSchema from "./schemas/guildSchema.js";
import colorOfTheDay from "./utils/colorOfTheDay.js";
import cron from "node-cron";
import handleLanguages from "./utils/languageHandler.js";
import _ from "lodash";
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
        IntentsBitField.Flags.GuildEmojisAndStickers])
const client = new Client({intents, partials: [Partials.Message, Partials.Channel, Partials.User, Partials.Reaction]}) as HolyClient;
client.config = (await import("./botconfig.js")).default;
const player = new Player(client, {
    useLegacyFFmpeg: false,
    ytdlOptions: {
        quality: 'highestaudio',
        highWaterMark: 1 << 25,
        requestOptions: {
            headers: {
                cookie: "YSC=IW8mJXvPDGM; VISITOR_INFO1_LIVE=oQ9vxRNiVkw; LOGIN_INFO=AFmmF2swRQIhAKpnZDnH4ASzHG3O1Fy0nN73-xY6hsuHNeVC076RWs9jAiBioNpOnPkgSRC2Mcv7b4LpNjaOEiCuLJIalLhr0uI6Gg:QUQ3MjNmd2ZCTVBJMjVyWWhnNFdaY2VtUTFlNUwtNm92bmd0NzRTYndmaWNXZ3lHWEhkWXhEQS10THFBczRxbndJRl9hU1hyUWxDcmZtR05RSkVVeHNaOFhnVXZSeHZXaUx4UUo5VGUtVGdkY090cGpaWnE3LTNmd1BqM1c1QUM0aU9aMUpFSlJfMkM2YW9IT3YtYS1PMzhtR1Utb3ZoaGZR; HSID=A9fgXIFQxAimyo8pv; SSID=AnWnvav93Kj8dM5LW; APISID=hRbT9gZ7sFyWbWgA/AEerA-3V2ew9racbS; SAPISID=9l6PEQBMEUunPKbr/Ain3yw0xPZwHMYnaB; __Secure-1PAPISID=9l6PEQBMEUunPKbr/Ain3yw0xPZwHMYnaB; __Secure-3PAPISID=9l6PEQBMEUunPKbr/Ain3yw0xPZwHMYnaB; SID=ZwicfZ5piA2oXcImU2z5aIE8aFrJrA_4sieEj-LF-NwGkatIlIpt5UhavlhkKpL-rpnv3Q.; __Secure-1PSID=ZwicfZ5piA2oXcImU2z5aIE8aFrJrA_4sieEj-LF-NwGkatImf_UljX9geVx0bo6MFY5DQ.; __Secure-3PSID=ZwicfZ5piA2oXcImU2z5aIE8aFrJrA_4sieEj-LF-NwGkatIt3PfVxYeHUgXkooBtWaQZA.; VISITOR_PRIVACY_METADATA=CgJUUhICGgA%3D; wide=1; PREF=f6=40000080&tz=Europe.Istanbul&f7=100&f5=30000; __Secure-1PSIDTS=sidts-CjEBSAxbGZ86t2X6qPwiUBkU-hnghgcGNLzxmDmsv5jw3KG2R-0wht5VKEj5QOF3_pyzEAA; __Secure-3PSIDTS=sidts-CjEBSAxbGZ86t2X6qPwiUBkU-hnghgcGNLzxmDmsv5jw3KG2R-0wht5VKEj5QOF3_pyzEAA; SIDCC=APoG2W846Ih-OG-IGaV9-_I7larZa8Cwwl88oy-6jkYdE7ZYw1PVv_Oe9yZT0XZ3GnK0RnycZy0; __Secure-1PSIDCC=APoG2W_QW7mE-MBikssSKK07nyE6hEPlhX5MkD4U_8D6osPosA25PouLsYCS7r6_hLwJFj92Sw; __Secure-3PSIDCC=APoG2W-sV4oEst7K-p9iTHi8JPSpatjhBIP4o3YoXxSFp1HFrfxD9fU9EyUZUyNiMlNoBU6LXeE" || ''
            }
        }
    }
});
(async () => {
    client.categories = new Collection();
    client.slashCommands = new Collection();
    client.guildsConfig = new Collection();
    client.userTickets = new Collection();
    client.ticketMessages = new Collection();
    client.handleLanguages = handleLanguages;
    try {
        await mongoose.set("strictQuery", true);
        await mongoose.connect(config.MONGODB_URI);
        log("SUCCESS", "src/index.ts", "Connected to the database.");
    } catch (e) {
        log("ERROR", "src/index.ts", `Error connecting to the database: ${e.message}`);
        process.exit(1);
    }
    try {
        await client.login(config.TOKEN);
        log("SUCCESS", "src/index.ts", `Logged in as ${client.user!.tag}`);
    }
    catch (e) {
        log("ERROR", "src/index.ts", `Error on connection: ${e.message}`);
        process.exit(500)
    }

})();
client.once("ready", async () => {
    await player.extractors.loadDefault();
    await registerEvents(client, "../events");
    await registerSlashCommands(client, "../slashCommands");
    const guildData = await guildSchema.find();
    for(const data of guildData) {
        client.guildsConfig.set(data.guildID, (await data).toJSON());
    }
    await checkPunishments(client)
    cron.schedule("0 0 * * *", async () => {
      await colorOfTheDay(client)
    }, {
        timezone: "Europe/Istanbul"
    })
    log("SUCCESS", "src/events/ready.ts", "App activated successfully.");
    const messages: {message: string, type: ActivityType.Playing | ActivityType.Watching | ActivityType.Listening | undefined}[] =
        [
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
            ]

    const status = messages[Math.floor(Math.random() * messages.length)];
    client.updateGuildConfig = async ({guildId, config}) => {
        try {
            const update = await guildSchema.findOneAndUpdate({
                guildID: guildId
            }, config, {
                new: true,
                upsert: true
            })
            client.guildsConfig.delete(guildId)
            client.guildsConfig.set(guildId, update.toObject());
        } catch (e) {
            console.log(e)
        }
    }
    client.user!.setActivity(status.message, {type: status.type});
        setInterval(() => {
            messages[0] = {message: `${client.users.cache.size} Kutsal ruhu gözetliyorum 👁‍🗨`, type: ActivityType.Watching};
            messages[2] = {message: `${client.guilds.cache.size}👑 Kutsal sunucu korumam altında.`, type: ActivityType.Watching};
            const status = messages[Math.floor(Math.random() * messages.length)];
            client.user!.setActivity(status.message, {type: status.type});
        }, 60000);
});

process.on("uncaughtException", async(error) => {
    const owner = await client.users.fetch("903233069245419560")
    const errorEmbed = new EmbedBuilder()
        .setTitle(`HATA! ${error.name}`)
        .setDescription(error.message)
        .setColor("Red")
    owner?.send({embeds: [errorEmbed]})
    console.log(error)
})
player.events.on("playerStart", async (queue, track) => {
    let TrackStartedEmbed = new EmbedBuilder()
        .setAuthor({name:`Şimdi Çalıyor ♪`, iconURL: client.config.IconURL})
        // @ts-ignore
        .setThumbnail(queue.currentTrack!.thumbnail)
        .setDescription(`[${track.title}](${track.url})`)
        .addFields({
            name: "Şarkıyı Talep Eden",
            value: `${queue.metadata.requestedBy}`,
            inline: true
        }, {
            name: "Şarkı Süresi",
            value: `\`${prettyMilliseconds(track.durationMS, {colonNotation: true,})}\``,
            inline: true
        })
        .setColor("Random");
    await queue.metadata.channel.send({embeds: [TrackStartedEmbed]});
})
player.events.on("emptyQueue", async(player) => {
        let QueueEmbed = new EmbedBuilder()
            .setAuthor({name: "Şarkı Listesi Bitti", iconURL: client.config.IconURL})
            .setColor("Random")
            .setTimestamp();
        await player.metadata.channel.send({embeds: [QueueEmbed]});
});