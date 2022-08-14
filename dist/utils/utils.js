const consoleColors = {
    "SUCCESS": "\u001b[32m",
    "WARNING": "\u001b[33m",
    "ERROR": "\u001b[31m"
};
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
export { log, randomRange, msToTime, chunkSubstr, sleep };
//# sourceMappingURL=utils.js.map