import { Client, Collection, MessageEmbed } from "discord.js";
import config from './config.json' assert { type: 'json' };
import { registerCommands, registerEvents } from "./utils/registery.js";
import { log } from "./utils/utils.js";
import mongoose from "mongoose";
const client = new Client({ intents: 32767, partials: ['MESSAGE', 'CHANNEL', 'USER', 'REACTION'] });
(async () => {
    client.commands = new Collection();
    client.categories = new Collection();
    await registerEvents(client, "../events");
    await registerCommands(client, "../commands");
    try {
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
process.on("uncaughtException", async (error) => {
    const owner = await client.users.fetch("903233069245419560");
    const errorEmbed = new MessageEmbed()
        .setTitle(`HATA! ${error.name}`)
        .setDescription(error.message)
        .setColor("RED");
    owner?.send({ embeds: [errorEmbed] });
    console.log(error);
});
//# sourceMappingURL=index.js.map