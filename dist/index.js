import { ActivityType, Client, EmbedBuilder, Partials, IntentsBitField, Collection } from "discord.js";
import config from './config.json' assert { type: 'json' };
import { registerEvents, registerSlashCommands } from "./utils/registery.js";
import { log } from "./utils/utils.js";
import mongoose from "mongoose";
import checkPunishments from "./utils/checkPunishments.js";
import { Player } from "discord-player";
import prettyMilliseconds from "pretty-ms";
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
const player = new Player(client);
(async () => {
    client.categories = new Collection();
    client.slashCommands = new Collection();
    client.guildsConfig = new Collection();
    client.userTickets = new Collection();
    client.ticketMessages = new Collection();
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
    await player.extractors.loadDefault();
    await registerEvents(client, "../events");
    await registerSlashCommands(client, "../slashCommands");
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
process.on("uncaughtException", async (error) => {
    const owner = await client.users.fetch("903233069245419560");
    const errorEmbed = new EmbedBuilder()
        .setTitle(`HATA! ${error.name}`)
        .setDescription(error.message)
        .setColor("Red");
    owner?.send({ embeds: [errorEmbed] });
    console.log(error);
});
player.events.on("playerStart", async (queue, track) => {
    let TrackStartedEmbed = new EmbedBuilder()
        .setAuthor({ name: `Şimdi Çalıyor ♪`, iconURL: client.config.IconURL })
        .setThumbnail(queue.currentTrack.thumbnail)
        .setDescription(`[${track.title}](${track.url})`)
        .addFields({
        name: "Şarkıyı Talep Eden",
        value: `${queue.metadata.requestedBy}`,
        inline: true
    }, {
        name: "Şarkı Süresi",
        value: `\`${prettyMilliseconds(track.durationMS, { colonNotation: true, })}\``,
        inline: true
    })
        .setColor("Random");
    await queue.metadata.channel.send({ embeds: [TrackStartedEmbed] });
});
player.events.on("emptyQueue", async (player) => {
    let QueueEmbed = new EmbedBuilder()
        .setAuthor({ name: "Şarkı Listesi Bitti", iconURL: client.config.IconURL })
        .setColor("Random")
        .setTimestamp();
    await player.metadata.channel.send({ embeds: [QueueEmbed] });
});
//# sourceMappingURL=index.js.map