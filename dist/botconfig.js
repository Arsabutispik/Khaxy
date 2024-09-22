import "dotenv/config.js";
import { log } from "./utils/utils.js";
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
    mailSent: "1277019710147264542",
    confirm: "1278053289992392795",
    reject: "1278053315334111353",
    ban: "1278053275429634162",
    forceban: "1278053258492907591",
  },
};
export async function loadEmojis(client, emojiObject) {
  try {
    const emojis = await client.application?.emojis.fetch();
    if (!emojis) {
      log("ERROR", "src/botconfig.ts", "No emojis found.");
      for (const emoji of emojiObject) {
        client.allEmojis.set(emoji.id, {
          name: emoji.name,
          format: emoji.fallBack,
        });
      }
      return;
    }
    for (const emoji of emojiObject) {
      const fetchedEmoji = emojis.find((e) => e.id === emoji.id);
      if (!fetchedEmoji) {
        log("ERROR", "src/botconfig.ts", `Emoji not found: ${emoji.name}`);
        client.allEmojis.set(emoji.id, {
          name: emoji.name,
          format: emoji.fallBack,
        });
      } else {
        if (fetchedEmoji.animated) {
          client.allEmojis.set(emoji.id, {
            name: emoji.name,
            format: `<a:${fetchedEmoji.name}:${fetchedEmoji.id}>`,
          });
        } else {
          client.allEmojis.set(emoji.id, {
            name: emoji.name,
            format: `<:${fetchedEmoji.name}:${fetchedEmoji.id}>`,
          });
        }
      }
    }
  } catch (e) {
    log("ERROR", "src/botconfig.ts", `Error fetching emojis: ${e.message}`);
  }
}
//# sourceMappingURL=botconfig.js.map
