import { log } from "../utils/utils.js";
import config from '../config.json' assert { type: 'json' };
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export default async (client, message) => {
    try {
        if (message.author.bot || message.channel.type === "DM" || message.webhookId) {
            return;
        }
        if (message.guild.id !== "778608930582036490")
            return;
        const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(config.PREFIX)})\\s*`);
        if (!prefixRegex.test(message.content))
            return;
        const [, matchedPrefix] = message.content.match(prefixRegex);
        let msgargs = message.content.slice(matchedPrefix.length).trim().split(/ +/);
        let cmdName = msgargs.shift().toLowerCase();
        if (message.mentions.has(client.user) && !cmdName) {
            message.channel.send(`Prefix'im \`${config.PREFIX}\` veya ${client.user}\nBütün komutlarımı görmek için \`${config.PREFIX}yardım\` veya \`${client.user.tag} yardım\` kullanabilirsiniz.`);
            return;
        }
        const command = client.commands.get(cmdName);
        if (!command)
            return;
        command.execute({ client: client, message: message, args: msgargs });
    }
    catch (e) {
        log("ERROR", "src/eventHandlers/message.js", e.message);
    }
};
//# sourceMappingURL=messageCreate.js.map