import { ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } from "discord.js";
const consoleColors = {
    "SUCCESS": "\u001b[32m",
    "WARNING": "\u001b[33m",
    "ERROR": "\u001b[31m"
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
const row = new ActionRowBuilder()
    .addComponents([lastPage, nextPage, closePage, prevPage, firstPage]);
function log(type, path, text) {
    console.log(`\u001b[36;1m<bot-prefab>\u001b[0m\u001b[34m [${path}]\u001b[0m - ${consoleColors[type]}${text}\u001b[0m`);
}
function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function msToTime(ms) {
    let day, hour, minute, seconds;
    seconds = Math.floor(ms / 1000);
    minute = Math.floor(seconds / 60);
    seconds = seconds % 60;
    hour = Math.floor(minute / 60);
    minute = minute % 60;
    day = Math.floor(hour / 24);
    hour = hour % 24;
    return day ?
        (hour ?
            (`${day} gün ${hour} saat ${minute} dakika ${seconds}saniye`) :
            (minute ?
                (`${day} gün ${minute} dakika ${seconds} saniye`) :
                (`${day} gün ${seconds} saniye`))) :
        (hour ?
            (`${hour} saat ${minute} dakika ${seconds} saniye`) :
            (minute ?
                (`${minute} dakika ${seconds} saniye`) :
                (`${seconds} saniye`)));
}
function chunkSubstr(str, size) {
    const numChunks = Math.ceil(str.length / size);
    const chunks = new Array(numChunks);
    for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
        chunks[i] = str.substring(o, size);
    }
    return chunks;
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function paginate(message, pages, timeout = 60000) {
    if (!message)
        throw new Error("Channel is inaccessible.");
    if (!pages)
        throw new Error("Pages are not given.");
    let page = 0;
    await message.reply({ embeds: [pages[page].setFooter({ text: `Sayfa ${page + 1} / ${pages.length}` })], components: [row] });
    const currPage = await message.fetchReply();
    const filter = (button) => (button.user.id === message.user.id) && (button.customId === "next" || button.customId === "prev" || button.customId === "close" || button.customId === "first" || button.customId === "last");
    const collector = currPage.createMessageComponentCollector({ filter, time: timeout, componentType: ComponentType.Button });
    collector.on("collect", async (button) => {
        if (button.customId === "close")
            return collector.stop();
        if (button.customId === "prev") {
            if (pages.length < 2) {
                await button.reply({ content: "Sayfa yok.", ephemeral: true });
                return;
            }
            page = page > 0 ? --page : pages.length - 1;
        }
        else if (button.customId === "next") {
            if (pages.length < 2) {
                await button.reply({ content: "Sayfa yok.", ephemeral: true });
                return;
            }
            page = page + 1 < pages.length ? ++page : 0;
        }
        else if (button.customId === "first") {
            if (pages.length < 2) {
                await button.reply({ content: "Sayfa yok.", ephemeral: true });
                return;
            }
            page = 0;
        }
        else if (button.customId === "last") {
            if (pages.length < 2) {
                await button.reply({ content: "Sayfa yok.", ephemeral: true });
                return;
            }
            page = pages.length - 1;
        }
        await currPage.edit({ embeds: [pages[page].setFooter({ text: `Sayfa ${page + 1} / ${pages.length}` })], components: [row] });
    });
    collector.on("end", async () => {
        await currPage.edit({ components: [] });
    });
}
function replaceMassString(text, replace) {
    for (const [key, value] of Object.entries(replace)) {
        text = text.replace(new RegExp(key, "g"), value);
    }
    return text;
}
function daysToMilliseconds(days) {
    return days * 24 * 60 * 60 * 1000;
}
export { log, randomRange, msToTime, chunkSubstr, sleep, paginate, replaceMassString, daysToMilliseconds };
//# sourceMappingURL=utils.js.map