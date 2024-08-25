import {commandBase} from "../../../@types/types";
import {PermissionsBitField} from "discord.js";
import openMailsSchema from "../../schemas/openMailsSchema.js";
import _ from "lodash";
import {handleErrors} from "../../utils/utils.js";

export default {
    name: "reply",
    description: "Replies to a message",
    category: "Moderation",
    aliases: ["r"],
    usage: "reply <message>",
    examples: "reply Hello!",
    async execute({client, message, args}) {
        if (!message.member!.permissions.has(PermissionsBitField.Flags.ManageMessages, true)) return message.channel.send({
            content: client.handleLanguages("REPLY_NO_PERMISSION", client, message.guildId!),
        });
        if(!args.length) return message.channel.send(client.handleLanguages("REPLY_NO_MESSAGE", client, message.guildId!));
        const config = client.guildsConfig.get(message.guildId!);
        if (!config) return message.channel.send(client.handleLanguages("SERVER_HAS_NO_CONFIGURATION", client, message.guildId!))
        const lang = config.config.language;
        if (!await openMailsSchema.exists({channelID: message.channel!.id})) return message.channel.send(client.handleLanguages("REPLY_NOT_A_MAIL_CHANNEL", client, message.guildId!));
        const openMail = await openMailsSchema.findOne({channelID: message.channel!.id});
        const user = await client.users.fetch(openMail!.userID);
        const msg = `**(${_.startCase(_.capitalize(message.member!.roles.highest.name))}) ${message.author.username}:** ${args.join(" ")}\n${message.attachments.map(a => a.url).join("\n")}`;
        if (msg.length > 2000) return message.channel.send(client.handleLanguages("REPLY_TOO_LONG", client, message.guildId!));
        try {
            await user.send(msg);
            await message.channel.send(`\`${openMail!.messageCount.modMessageCount + 1}\` ${msg}`);
            await openMailsSchema.updateOne({channelID: message.channel.id}, {
                $inc: {"messageCount.modMessageCount": 1}, $push: {
                    messages: {
                        $each: [
                            `[${new Date().toLocaleString([lang, "en-US"], {timeZone: "UTC"})}] [COMMAND] [${message.author.username}] ${message.content}`,
                            `[${new Date().toLocaleString([lang, "en-US"], {timeZone: "UTC"})}] [TO USER] [${message.author.username}] (${_.startCase(_.capitalize(message.member!.roles.highest.name))}) ${message.author.username}: ${args.join(" ")}${message.attachments.size ? "\n": ""}${message.attachments.map(a => a.url).join("\n")}`
                        ]
                    }
                }
            });
        } catch (error) {
            await handleErrors(client, error, 'reply.ts', message)
        }
        await message.delete();
    }
} as commandBase;