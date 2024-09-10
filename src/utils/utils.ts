import {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
  ButtonInteraction,
  ChatInputCommandInteraction,
  Snowflake,
  TextChannel,
  time,
  User,
  StringSelectMenuInteraction,
  Message,
  Guild,
} from "discord.js";
import { customObject, KhaxyClient } from "../../@types/types";
import bumpLeaderboardSchema from "../schemas/bumpLeaderboardSchema.js";
import "dotenv/config.js";

const consoleColors = {
  SUCCESS: "\u001b[32m",
  WARNING: "\u001b[33m",
  ERROR: "\u001b[31m",
};
const nextPage = new ButtonBuilder()
  .setCustomId("next")
  .setEmoji("▶️")
  .setStyle(ButtonStyle.Primary)
  .setDisabled(false);
const prevPage = new ButtonBuilder()
  .setCustomId("prev")
  .setEmoji("◀️")
  .setStyle(ButtonStyle.Primary)
  .setDisabled(false);
const lastPage = new ButtonBuilder()
  .setCustomId("last")
  .setEmoji("⏩")
  .setStyle(ButtonStyle.Primary)
  .setDisabled(false);
const firstPage = new ButtonBuilder()
  .setCustomId("first")
  .setEmoji("⏪")
  .setStyle(ButtonStyle.Primary)
  .setDisabled(false);
const closePage = new ButtonBuilder()
  .setCustomId("close")
  .setEmoji("✖️")
  .setStyle(ButtonStyle.Danger)
  .setDisabled(false);
const row = new ActionRowBuilder<ButtonBuilder>().addComponents([lastPage, nextPage, closePage, prevPage, firstPage]);
/**
 *
 * @param type - The type of the log
 * @param path - The path of the log
 * @param text - The error message
 * @returns void - Logs the message to the console
 */
function log(type: "SUCCESS" | "ERROR" | "WARNING", path: string, text: string) {
  console.log(
    `\u001b[36;1m<bot-prefab>\u001b[0m\u001b[34m [${path}]\u001b[0m - ${consoleColors[type]}${text}\u001b[0m`,
  );
}

/**
 *
 * @param min - Minimum number
 * @param max - Maximum number
 * @returns  A random number between min and max
 */
function randomRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 *
 * @param ms - Milliseconds
 * @returns  A string that shows the time in days, hours, minutes and seconds
 */
function msToTime(ms: number) {
  let day, hour, minute, seconds;
  seconds = Math.floor(ms / 1000);
  minute = Math.floor(seconds / 60);
  seconds = seconds % 60;
  hour = Math.floor(minute / 60);
  minute = minute % 60;
  day = Math.floor(hour / 24);
  hour = hour % 24;
  return day
    ? hour
      ? `${day} day ${hour} hour ${minute} minute ${seconds} second`
      : minute
        ? `${day} day ${minute} minute ${seconds} second`
        : `${day} day ${seconds} second`
    : hour
      ? `${hour} hour ${minute} minute ${seconds} second`
      : minute
        ? `${minute} minute ${seconds} second`
        : `${seconds} second`;
}

/**
 *
 * @param str - The string to be chunked
 * @param size - The size of the chunks
 * @returns  An array of strings that are chunked
 */
function chunkSubstr(str: string, size: number): string[] {
  const numChunks = Math.ceil(str.length / size);
  const chunks = new Array(numChunks);

  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substring(o, size);
  }

  return chunks;
}

/**
 *
 * @param ms - Milliseconds
 * @returns  A promise that resolves after ms milliseconds
 */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 *
 * @param message - The message to be paginated
 * @param pages - The pages to be paginated
 * @param timeout - The timeout for the pagination
 * @returns  A paginated message
 */
async function paginate(message: ChatInputCommandInteraction, pages: EmbedBuilder[], timeout: number = 60000) {
  if (!message) throw new Error("Channel is inaccessible.");
  if (!pages) throw new Error("Pages are not given.");
  let page = 0;
  await message.reply({
    embeds: [pages[page].setFooter({ text: `Page ${page + 1} / ${pages.length}` })],
    components: [row],
  });
  const currPage = await message.fetchReply();
  const filter = (button: ButtonInteraction) =>
    button.user.id === message.user.id &&
    (button.customId === "next" ||
      button.customId === "prev" ||
      button.customId === "close" ||
      button.customId === "first" ||
      button.customId === "last");
  const collector = currPage.createMessageComponentCollector({
    filter,
    time: timeout,
    componentType: ComponentType.Button,
  });
  collector.on("collect", async (button) => {
    if (button.customId === "close") return collector.stop();
    if (button.customId === "prev") {
      if (pages.length < 2) {
        await button.reply({ content: "No page available", ephemeral: true });
        return;
      }
      page = page > 0 ? --page : pages.length - 1;
    } else if (button.customId === "next") {
      if (pages.length < 2) {
        await button.reply({ content: "No page available", ephemeral: true });
        return;
      }
      page = page + 1 < pages.length ? ++page : 0;
    } else if (button.customId === "first") {
      if (pages.length < 2) {
        await button.reply({ content: "No page available", ephemeral: true });
        return;
      }
      page = 0;
    } else if (button.customId === "last") {
      if (pages.length < 2) {
        await button.reply({ content: "No page available", ephemeral: true });
        return;
      }
      page = pages.length - 1;
    }
    await currPage.edit({
      embeds: [pages[page].setFooter({ text: `Page ${page + 1} / ${pages.length}` })],
      components: [row],
    });
  });
  collector.on("end", async () => {
    await currPage.edit({ components: [] });
  });
}

/**
 *
 * @param text - The text to be replaced
 * @param replace - The object to be replaced
 * @returns  A string that is replaced
 */
function replaceMassString(text: string, replace: customObject) {
  if (!text) return null;
  for (const [key, value] of Object.entries(replace)) {
    text = text.replace(new RegExp(key, "g"), value);
  }
  return text;
}

/**
 *
 * @param days - The days to be converted to seconds
 * @returns  A number that is converted from days to seconds
 */
function daysToSeconds(days: number): number {
  // 👇️        hour  min  sec  ms
  return days * 24 * 60 * 60;
}

/**
 *
 * @param array - The array to be shuffled
 * @returns  A shuffled array
 */
const arrayShuffle = function (array: Array<any>) {
  for (let i = 0, length = array.length, swap = 0, temp = ""; i < length; i++) {
    swap = Math.floor(Math.random() * (i + 1));
    temp = array[swap];
    array[swap] = array[i];
    array[i] = temp;
  }
  return array;
};

/**
 *
 * @param values - The values to be chosen
 * @param chances - The chances of the values
 * @returns  A value that is chosen by the chances
 */
const percentageChance = function (values: Array<any>, chances: number[]) {
  const pool: Array<any> = [];
  for (let i = 0; i < chances.length; i++) {
    for (let i2 = 0; i2 < chances[i]; i2++) {
      pool.push(i);
    }
  }
  return values[arrayShuffle(pool)["0"]];
};

async function bumpLeaderboard(client: KhaxyClient, guildID: Snowflake, lastBump?: User) {
  const guild = client.guilds.cache.get(guildID);
  if (!guild) return;
  const guildConfig = client.guildsConfig.get(guildID);
  if (!guildConfig) return;
  const channel = guild.channels.cache.get(guildConfig.config.bumpLeaderboardChannel) as TextChannel;
  if (!channel) return;
  const result = await bumpLeaderboardSchema.findOne({ guildID: guildID }).sort({ bumps: -1 }).limit(10);
  if (!result) return;
  const messages = await channel.messages.fetch();
  const message = messages.first();
  if (message) {
    if (message.author.id !== client.user!.id) {
      log("WARNING", "src/utils.ts", "bumpLeaderboard: The message is not sent by the bot. Aborting the task");
      return { error: "The message is not sent by the bot. Aborting the task" };
    }
    let leaderBoardMessage = client.handleLanguages("BUMP_LEADERBOARD_MESSAGE", client, guildID);
    let count = 1;
    result.users
      .sort((a, b) => b.bumps - a.bumps)
      .forEach((user) => {
        leaderBoardMessage += `\n${count}. <@${user.userID}> - **${user.bumps}** bumps`;
        count++;
      });
    if (lastBump) {
      leaderBoardMessage += `\n\n${replaceMassString(
        client.handleLanguages("BUMP_LEADERBOARD_LAST_BUMP", client, guildID),
        {
          "{time}": time(new Date(), "R"),
          "{user}": lastBump.toString(),
        },
      )}`;
    }
    if (result.winner?.totalBumps) {
      leaderBoardMessage += `\n\n${replaceMassString(
        client.handleLanguages("BUMP_LEADERBOARD_LAST_MONTH_WINNER", client, guildID),
        {
          "{totalBump}": result.winner.totalBumps!.toString(),
          "{user}": guild.members.cache.get(result.winner.user!.userID!)?.toString() || "Unknown User",
          "{count}": result.winner.user!.bumps!.toString(),
        },
      )}`;
    }
    await message.edit({ content: leaderBoardMessage });
  } else if (!message) {
    let leaderBoardMessage = `\n\n${client.handleLanguages("BUMP_LEADERBOARD_MESSAGE", client, guildID)}`;
    let count = 1;
    result.users
      .sort((a, b) => b.bumps - a.bumps)
      .forEach((user) => {
        leaderBoardMessage += `\n${count}. <@${user.userID}> - **${user.bumps}** bumps`;
        count++;
      });

    if (lastBump) {
      leaderBoardMessage += `\n\n${replaceMassString(
        client.handleLanguages("BUMP_LEADERBOARD_LAST_BUMP", client, guildID),
        {
          "{time}": time(new Date(), "R"),
          "{user}": lastBump.toString(),
        },
      )}`;
    }
    if (result.winner?.totalBumps) {
      leaderBoardMessage += `\n\n${replaceMassString(
        client.handleLanguages("BUMP_LEADERBOARD_LAST_MONTH_WINNER", client, guildID),
        {
          "{totalBump}": result.winner.totalBumps!.toString(),
          "{user}": guild.members.cache.get(result.winner.user!.userID!)?.toString() || "Unknown User",
          "{count}": result.winner.user!.bumps!.toString(),
        },
      )}`;
    }
    await channel.send({ content: leaderBoardMessage });
  }
}

async function handleErrors(
  client: KhaxyClient,
  error: Error,
  path: string,
  interaction: ChatInputCommandInteraction | StringSelectMenuInteraction | ButtonInteraction | Message | Guild,
): Promise<void> {
  log("ERROR", path, error.message);
  console.error(error);
  const channel = client.channels.cache.get(process.env.ERROR_LOG_CHANNEL as string) as TextChannel;
  if (!channel) return;
  if (interaction instanceof Message) {
    if (error.message.includes("time")) {
      await interaction.reply({
        content: client.handleLanguages("ERROR_TIME", client, interaction.guildId!),
      });
      return;
    }
    const errorEmbed = new EmbedBuilder()
      .setTitle("Error")
      .setDescription(`An error occurred in the path: ${path}`)
      .addFields(
        {
          name: "Error",
          value: error.message,
        },
        {
          name: "Stack Trace",
          value: `\`\`\`${error.stack}\`\`\``,
        },
        {
          name: "Interaction",
          value: `${interaction.author.toString()}`,
        },
      )
      .setColor("Red")
      .setTimestamp();
    const webhooks = await channel.fetchWebhooks();
    let webhook = webhooks.first();
    if (!webhook) {
      webhook = await channel.createWebhook({
        name: `${client.user!.username} Error Logger`,
        avatar: client.user!.displayAvatarURL(),
        reason: "Error Logger",
      });
    }
    await webhook.send({ embeds: [errorEmbed] });
    await interaction.reply({
      content: client.handleLanguages("ERROR_MESSAGE", client, interaction.guildId!),
    });
  } else if (interaction instanceof Guild) {
    const errorEmbed = new EmbedBuilder()
      .setTitle("Error")
      .setDescription(`An error occurred in the path: ${path}`)
      .addFields(
        {
          name: "Error",
          value: error.message,
        },
        {
          name: "Stack Trace",
          value: `\`\`\`${error.stack}\`\`\``,
        },
        {
          name: "Interaction",
          value: `${interaction.name}`,
        },
      )
      .setColor("Red")
      .setTimestamp();
    const webhooks = await channel.fetchWebhooks();
    let webhook = webhooks.first();
    if (!webhook) {
      webhook = await channel.createWebhook({
        name: `${client.user!.username} Error Logger`,
        avatar: client.user!.displayAvatarURL(),
        reason: "Error Logger",
      });
    }
    await webhook.send({ embeds: [errorEmbed] });
  } else {
    if (error.message.includes("time")) {
      if (interaction.replied) {
        await interaction.followUp({
          content: client.handleLanguages("ERROR_TIME", client, interaction.guildId!),
          ephemeral: true,
        });
        return;
      }
      await interaction?.reply({
        content: client.handleLanguages("ERROR_TIME", client, interaction.guildId!),
        ephemeral: true,
      });
      return;
    }
    const errorEmbed = new EmbedBuilder()
      .setTitle("Error")
      .setDescription(`An error occurred in the path: ${path}`)
      .addFields(
        {
          name: "Error",
          value: error.message,
        },
        {
          name: "Stack Trace",
          value: `\`\`\`${error.stack}\`\`\``,
        },
        {
          name: "Interaction",
          value: `${interaction.isChatInputCommand() ? `Command: ${interaction.commandName}` : "Other Type of Interaction"}\nUser: ${interaction.user.toString()}`,
        },
      )
      .setColor("Red")
      .setTimestamp();
    const webhooks = await channel.fetchWebhooks();
    let webhook = webhooks.first();
    if (!webhook) {
      webhook = await channel.createWebhook({
        name: `${client.user!.username} Error Logger`,
        avatar: client.user!.displayAvatarURL(),
        reason: "Error Logger",
      });
    }
    await webhook.send({ embeds: [errorEmbed] });
    if (interaction.replied) {
      await interaction.followUp({
        content: client.handleLanguages("ERROR_MESSAGE", client, interaction.guildId!),
        ephemeral: true,
      });
      return;
    }
    await interaction?.reply({
      content: client.handleLanguages("ERROR_MESSAGE", client, interaction.guildId!),
      ephemeral: true,
    });
  }
}
export {
  log,
  randomRange,
  msToTime,
  chunkSubstr,
  sleep,
  paginate,
  replaceMassString,
  daysToSeconds,
  percentageChance,
  bumpLeaderboard,
  handleErrors,
};
