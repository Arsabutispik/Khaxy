import { ActivityType, Client, EmbedBuilder, Partials, IntentsBitField, Collection } from "discord.js";
import { KhaxyClient } from "../@types/types";
import { registerCommands, registerEvents, registerSlashCommands } from "./utils/registery.js";
import { log, replaceMassString } from "./utils/utils.js";
import mongoose from "mongoose";
import checkPunishments from "./utils/checkPunishments.js";
import { Player } from "discord-player";
import prettyMilliseconds from "pretty-ms";
import guildSchema from "./schemas/guildSchema.js";
import colorOfTheDay from "./utils/colorOfTheDay.js";
import cron from "node-cron";
import handleLanguages from "./utils/languageHandler.js";
import "dotenv/config.js";
import resetBumpLeaderboard from "./utils/resetBumpLeaderboard.js";
import recoverMissedCronJob from "./utils/recoverMissedCronJob.js";
import cluster from "cluster";
import { loadEmojis } from "./botconfig.js";
import checkUnregisteredPeople from "./utils/checkUnregisteredPeople.js";

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
    IntentsBitField.Flags.GuildEmojisAndStickers,
  ],
  partials: [Partials.Channel, Partials.User, Partials.Reaction, Partials.GuildMember, Partials.Message],
}) as KhaxyClient;
client.config = (await import("./botconfig.js")).default;
const player = new Player(client);
(async () => {
  client.commands = new Collection();
  client.categories = new Collection();
  client.slashCommands = new Collection();
  client.guildsConfig = new Collection();
  client.handleLanguages = handleLanguages;
  client.allEmojis = new Collection();
  try {
    mongoose.set("strictQuery", true);
    if (process.env.npm_lifecycle_event === "test") {
      await mongoose.connect(process.env.TEST_MONGODB_URI as string);
    } else {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }
    log("SUCCESS", "src/index.js", "Connected to the database.");
  } catch (e) {
    log("ERROR", "src/index.js", `Error connecting to the database: ${e.message}`);
    process.exit(1);
  }
  try {
    if (process.env.npm_lifecycle_event === "test") {
      await client.login(process.env.TEST_TOKEN as string);
    } else {
      await client.login(process.env.TOKEN as string);
    }
    log("SUCCESS", "src/index.js", `Logged in as ${client.user!.tag}`);
  } catch (e) {
    log("ERROR", "src/index.js", `Error on connection: ${e.message}`);
    process.exit(500);
  }
})();
cluster.on("online", (worker) => {
  log("SUCCESS", "src/index.js", `Worker ${worker.id} is online.`);
});
client.once("ready", async () => {
  const emojis: Array<{ name: string; id: string; fallBack: string }> = [
    {
      name: "searchEmoji",
      id: client.config.Emojis.searchEmoji,
      fallBack: "🔍",
    },
    {
      name: "gearSpinning",
      id: client.config.Emojis.gearSpinning,
      fallBack: "⚙️",
    },
    {
      name: "mailSent",
      id: client.config.Emojis.mailSent,
      fallBack: "📩",
    },
    {
      name: "confirm",
      id: client.config.Emojis.confirm,
      fallBack: "✅",
    },
    {
      name: "reject",
      id: client.config.Emojis.reject,
      fallBack: "❌",
    },
    {
      name: "ban",
      id: client.config.Emojis.ban,
      fallBack: "🔨",
    },
    {
      name: "forceban",
      id: client.config.Emojis.forceban,
      fallBack: "🔨",
    },
  ];
  await loadEmojis(client, emojis);
  await player.extractors.loadDefault((ext) => ext !== "YouTubeExtractor");
  await registerEvents(client, "../events");
  await registerSlashCommands(client, "../slashCommands");
  await registerCommands(client, "../messageCommands");
  const guildData = await guildSchema.find();
  for (const data of guildData) {
    client.guildsConfig.set(data.guildID, data.toJSON());
  }
  await checkPunishments(client);
  await recoverMissedCronJob(client);
  cron.schedule(
    "0 0 * * *",
    async () => {
      await colorOfTheDay(client);
    },
    {
      timezone: "Europe/Istanbul",
    },
  );
  cron.schedule(
    "0 0 1 * *",
    async () => {
      await resetBumpLeaderboard(client);
    },
    {
      timezone: "Europe/Istanbul",
    },
  );
  cron.schedule("0 0 * * *", async () => {
    await checkUnregisteredPeople(client);
  });
  log("SUCCESS", "src/events/ready.js", "App activated successfully.");
  const messages: { message: string; type: ActivityType.Custom | undefined }[] = [
    {
      message: `Use /invite to add me!`,
      type: ActivityType.Custom,
    },
    {
      message: `${client.guilds.cache.size} Guilds are under my protection.`,
      type: ActivityType.Custom,
    },
    {
      message: "/play What about listening to some music?",
      type: ActivityType.Custom,
    },
  ];

  const status = messages[Math.floor(Math.random() * messages.length)];
  client.updateGuildConfig = async ({ guildId, config }) => {
    try {
      const update = await guildSchema.findOneAndUpdate(
        {
          guildID: guildId,
        },
        config,
        {
          new: true,
          upsert: true,
        },
      );
      client.guildsConfig.delete(guildId);
      client.guildsConfig.set(guildId, update.toObject());
    } catch (e) {
      console.log(e);
    }
  };
  client.user!.setActivity(status.message, { type: status.type });
  setInterval(() => {
    messages[2] = {
      message: `${client.guilds.cache.size} Guilds are under my protection.`,
      type: ActivityType.Custom,
    };
    const status = messages[Math.floor(Math.random() * messages.length)];
    client.user!.setActivity(status.message, { type: status.type });
  }, 60000);
});

process.on("uncaughtException", async (error) => {
  const owner = await client.users.fetch("903233069245419560");
  const errorEmbed = new EmbedBuilder().setTitle(`HATA! ${error.name}`).setDescription(error.message).setColor("Red");
  owner?.send({ embeds: [errorEmbed] });
  console.log(error);
});
player.events.on("playerStart", async (queue, track) => {
  const playerStartEmbed = client.handleLanguages("PLAYER_START", client, queue.metadata.channel.guildId);
  for (const embeds of playerStartEmbed.embeds) {
    const x = Math.round(0xffffff * Math.random()).toString(16);
    const y = 6 - x.length;
    const z = "000000";
    const z1 = z.substring(0, y);
    embeds.color = Number(`0x${z1 + x}`);
    embeds.description = replaceMassString(embeds.description, {
      "{track_title}": track.title,
      "{track_url}": track.url,
    })!;
    embeds.thumbnail.url = queue.currentTrack!.thumbnail;
    embeds.author.icon_url = client.config.IconURL;
    for (const fields of embeds.fields) {
      fields.value = replaceMassString(fields.value, {
        "{requester}": queue.metadata.requestedBy,
        "{duration}": prettyMilliseconds(track.durationMS, {
          colonNotation: true,
        }),
      })!;
      Object.assign(embeds.fields, fields);
    }
  }
  await queue.metadata.channel.send(playerStartEmbed);
});
player.events.on("emptyQueue", async (player) => {
  const emptyQueue = client.handleLanguages("PLAYER_END", client, player.guild.id);
  for (const embeds of emptyQueue.embeds) {
    const x = Math.round(0xffffff * Math.random()).toString(16);
    const y = 6 - x.length;
    const z = "000000";
    const z1 = z.substring(0, y);
    embeds.color = Number(`0x${z1 + x}`);
    embeds.author.icon_url = client.config.IconURL;
    embeds.timestamp = new Date().toISOString();
    Object.assign(emptyQueue.embeds, embeds);
  }
  await player.metadata.channel.send(emptyQueue);
});
