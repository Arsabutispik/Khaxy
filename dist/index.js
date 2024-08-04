import { ActivityType, Client, EmbedBuilder, Partials, IntentsBitField, Collection } from "discord.js";
import { registerEvents, registerSlashCommands } from "./utils/registery.js";
import { log, replaceMassString } from "./utils/utils.js";
import mongoose from "mongoose";
import checkPunishments from "./utils/checkPunishments.js";
import { Player } from "discord-player";
import prettyMilliseconds from "pretty-ms";
import guildSchema from "./schemas/guildSchema.js";
import openMails from "./schemas/openMailsSchema.js";
import colorOfTheDay from "./utils/colorOfTheDay.js";
import cron from "node-cron";
import handleLanguages from "./utils/languageHandler.js";
import "dotenv/config.js";
import resetBumpLeaderboard from "./utils/resetBumpLeaderboard.js";
import cluster from "cluster";
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.GuildVoiceStates,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.DirectMessageReactions,
        IntentsBitField.Flags.GuildModeration,
        IntentsBitField.Flags.GuildWebhooks,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildInvites,
        IntentsBitField.Flags.GuildIntegrations,
        IntentsBitField.Flags.GuildEmojisAndStickers
    ],
    partials: [Partials.Channel, Partials.User, Partials.Reaction, Partials.GuildMember, Partials.Message]
});
client.config = (await import("./botconfig.js")).default;
const player = new Player(client);
(async () => {
    client.categories = new Collection();
    client.slashCommands = new Collection();
    client.guildsConfig = new Collection();
    client.userTickets = new Collection();
    client.ticketMessages = new Collection();
    client.handleLanguages = handleLanguages;
    try {
        mongoose.set("strictQuery", true);
        if (process.env.npm_lifecycle_event === "test") {
            await mongoose.connect(process.env.TEST_MONGODB_URI);
        }
        else {
            await mongoose.connect(process.env.MONGODB_URI);
        }
        log("SUCCESS", "src/index.js", "Connected to the database.");
    }
    catch (e) {
        log("ERROR", "src/index.js", `Error connecting to the database: ${e.message}`);
        process.exit(1);
    }
    try {
        if (process.env.npm_lifecycle_event === "test") {
            await client.login(process.env.TEST_TOKEN);
        }
        else {
            await client.login(process.env.TOKEN);
        }
        log("SUCCESS", "src/index.js", `Logged in as ${client.user.tag}`);
    }
    catch (e) {
        log("ERROR", "src/index.js", `Error on connection: ${e.message}`);
        process.exit(500);
    }
})();
client.once("ready", async () => {
    await player.extractors.loadDefault(ext => ext !== "YouTubeExtractor");
    await registerEvents(client, "../events");
    await registerSlashCommands(client, "../slashCommands");
    const guildData = await guildSchema.find();
    for (const data of guildData) {
        client.guildsConfig.set(data.guildID, data.toJSON());
    }
    const openMailData = await openMails.find();
    for (const data of openMailData) {
        const guild = client.guilds.cache.get(data.guildID);
        if (!guild) {
            openMails.deleteOne({ guildID: data.guildID });
            continue;
        }
        const channel = guild.channels.cache.get(data.channelID);
        if (!channel) {
            openMails.deleteOne({ channelID: data.channelID });
            continue;
        }
        client.userTickets.set(data.userID, data.channelID);
        client.ticketMessages.set(data.channelID, data.messages);
    }
    await checkPunishments(client);
    cron.schedule("0 0 * * *", async () => {
        if (cluster.worker?.id !== 1)
            return;
        await colorOfTheDay(client);
    }, {
        timezone: "Europe/Istanbul",
        recoverMissedExecutions: true
    });
    cron.schedule("0 0 1 * *", async () => {
        if (cluster.worker?.id !== 1)
            return;
        await resetBumpLeaderboard(client);
    }, {
        timezone: "Europe/Istanbul",
        recoverMissedExecutions: true
    });
    log("SUCCESS", "src/events/ready.js", "App activated successfully.");
    const messages = [
        {
            message: `Use /invite to add me!`, type: ActivityType.Custom
        },
        {
            message: `${client.guilds.cache.size} Guilds are under my protection.`, type: ActivityType.Custom
        },
        {
            message: "/play What about listening to some music?", type: ActivityType.Custom
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
        messages[2] = { message: `${client.guilds.cache.size} Guilds are under my protection.`, type: ActivityType.Custom };
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
    const playerStartEmbed = client.handleLanguages("PLAYER_START", client, queue.metadata.channel.guildId);
    for (const embeds of playerStartEmbed.embeds) {
        let x = Math.round(0xffffff * Math.random()).toString(16);
        let y = (6 - x.length);
        let z = "000000";
        let z1 = z.substring(0, y);
        embeds.color = Number(`0x${z1 + x}`);
        embeds.description = replaceMassString(embeds.description, {
            "{track_title}": track.title,
            "{track_url}": track.url,
        });
        embeds.thumbnail.url = queue.currentTrack.thumbnail;
        embeds.author.icon_url = client.config.IconURL;
        for (const fields of embeds.fields) {
            fields.value = replaceMassString(fields.value, {
                "{requester}": queue.metadata.requestedBy,
                "{duration}": prettyMilliseconds(track.durationMS, { colonNotation: true }),
            });
            Object.assign(embeds.fields, fields);
        }
    }
    await queue.metadata.channel.send(playerStartEmbed);
});
player.events.on("emptyQueue", async (player) => {
    const emptyQueue = client.handleLanguages("PLAYER_END", client, player.guild.id);
    for (const embeds of emptyQueue.embeds) {
        let x = Math.round(0xffffff * Math.random()).toString(16);
        let y = (6 - x.length);
        let z = "000000";
        let z1 = z.substring(0, y);
        embeds.color = Number(`0x${z1 + x}`);
        embeds.author.icon_url = client.config.IconURL;
        embeds.timestamp = new Date().toISOString();
        Object.assign(emptyQueue.embeds, embeds);
    }
    await player.metadata.channel.send(emptyQueue);
});
//# sourceMappingURL=index.js.map