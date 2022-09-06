import { MessageButton, MessageActionRow } from "discord.js";
const consoleColors = {
    "SUCCESS": "\u001b[32m",
    "WARNING": "\u001b[33m",
    "ERROR": "\u001b[31m"
};
const nextPage = new MessageButton()
    .setCustomId("next")
    .setEmoji("▶️")
    .setStyle("PRIMARY")
    .setDisabled(false);
const prevPage = new MessageButton()
    .setCustomId("prev")
    .setEmoji("◀️")
    .setStyle("PRIMARY")
    .setDisabled(false);
const lastPage = new MessageButton()
    .setCustomId("last")
    .setEmoji("⏩")
    .setStyle("PRIMARY")
    .setDisabled(false);
const firstPage = new MessageButton()
    .setCustomId("first")
    .setEmoji("⏪")
    .setStyle("PRIMARY")
    .setDisabled(false);
const closePage = new MessageButton()
    .setCustomId("close")
    .setEmoji("✖️")
    .setStyle("DANGER")
    .setDisabled(false);
const row = new MessageActionRow()
    .addComponents(lastPage, nextPage, closePage, prevPage, firstPage);
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
        chunks[i] = str.substr(o, size);
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
    const currPage = await message.channel.send({ embeds: [pages[page].setFooter({ text: `Sayfa ${page + 1} / ${pages.length}` })], components: [row] });
    const filter = (button) => (button.user.id === message.author.id) && (button.customId === "next" || button.customId === "prev" || button.customId === "close" || button.customId === "first" || button.customId === "last");
    const collector = currPage.createMessageComponentCollector({ filter, time: timeout });
    collector.on("collect", async (button) => {
        if (button.customId === "close")
            return collector.stop();
        if (button.customId === "prev") {
            page = page > 0 ? --page : pages.length - 1;
        }
        else if (button.customId === "next") {
            page = page + 1 < pages.length ? ++page : 0;
        }
        else if (button.customId === "first") {
            page = 0;
        }
        else if (button.customId === "last") {
            page = pages.length - 1;
        }
        await currPage.edit({ embeds: [pages[page].setFooter({ text: `Sayfa ${page + 1} / ${pages.length}` })], components: [row] });
    });
    collector.on("end", async () => {
        await currPage.edit({ components: [] });
    });
}
export { log, randomRange, msToTime, chunkSubstr, sleep, paginate };
//# sourceMappingURL=utils.js.map