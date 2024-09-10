import "dotenv/config.js";
export default {
  IconURL: "https://cdn.discordapp.com/attachments/933095626844037224/1016257179872923708/music-disc.gif",
  Lavalink: {
    id: "Main",
    host: "lavalink.devamop.in",
    port: 443,
    pass: "DevamOP",
    secure: true,
    retryAmount: 50,
    retryDelay: 40,
  },
  Spotify: {
    clientID: process.env.SPOTIFY_ID,
    clientSecret: process.env.SPOTIFY_SECRET,
  },
  Emojis: {
    searchEmoji: "1276505335145955421",
    gearSpinning: "1276244551203557428",
    mailSent: "277019710147264542",
    confirm: "1278053289992392795",
    reject: "1278053315334111353",
    ban: "1278053275429634162",
    forceban: "1278053258492907591",
  },
};
//# sourceMappingURL=botconfig.js.map
