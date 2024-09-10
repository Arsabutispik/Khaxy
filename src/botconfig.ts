import "dotenv/config.js";

export default {
  IconURL: "https://cdn.discordapp.com/attachments/933095626844037224/1016257179872923708/music-disc.gif",
  Lavalink: {
    id: "Main", //- Used for identifier. You can set this to whatever you want.
    host: "lavalink.devamop.in", //- The host name or IP of the lavalink server.
    port: 443, // The port that lavalink is listening to. This must be a number!
    pass: "DevamOP", //- The password of the lavalink server.
    secure: true, // Set this to true if the lavalink uses SSL. if not set it to false.
    retryAmount: 50, //- The amount of times to retry connecting to the node if connection got dropped.
    retryDelay: 40, //- Delay between reconnect attempts if connection is lost.
  },
  Spotify: {
    clientID: process.env.SPOTIFY_ID, //- Your spotify client id.
    clientSecret: process.env.SPOTIFY_SECRET, //- Your spotify client secret.
  },
  Emojis: {
    //Replace these with your own emoji ID's that exists in the application emojis.
    searchEmoji: "1276505335145955421",
    gearSpinning: "1276244551203557428",
    mailSent: "277019710147264542",
    confirm: "1278053289992392795",
    reject: "1278053315334111353",
    ban: "1278053275429634162",
    forceban: "1278053258492907591",
  },
};
