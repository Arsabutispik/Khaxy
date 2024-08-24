import { ActionRowBuilder, ChannelType, ComponentType, PermissionsBitField, StringSelectMenuBuilder, } from "discord.js";
import bumpLeaderboardSchema from "../schemas/bumpLeaderboardSchema.js";
import openMailsSchema from "../schemas/openMailsSchema.js";
import { bumpLeaderboard, handleErrors, replaceMassString } from "../utils/utils.js";
import humanizeDuration from "humanize-duration";
import _ from "lodash";
import * as process from "node:process";
export default async (client, message) => {
    if (message.channel.type === ChannelType.DM) {
        if (message.author.bot)
            return;
        if (await openMailsSchema.exists({ userID: message.author.id })) {
            const mail = await openMailsSchema.findOne({ userID: message.author.id });
            if (!mail) {
                await message.author.send("The mail was not found. Please try again later.");
                return;
            }
            const guild = client.guilds.cache.get(mail.guildID);
            if (!guild) {
                await message.author.send("The guild was not found. Please try again later.");
                return;
            }
            const guildConfig = client.guildsConfig.get(guild.id);
            if (!guildConfig) {
                await message.author.send("The guild config was not found. Please try again later.");
                return;
            }
            const threadChannel = guild.channels.cache.get(mail.channelID);
            if (!threadChannel) {
                await message.author.send("The thread channel was not found. Please try again later.");
                return;
            }
            const member = await guild.members.fetch(message.author.id);
            if (!member) {
                await message.author.send("You were not found in the guild. Please try again later.");
                return;
            }
            if (`**[${message.author.username}]:** ${message.content}\n${message.attachments?.map((attachment) => attachment.url).join("\n")}`.length > 2000) {
                await message.author.send("Your message is too long. Keep it under 2000 characters. Remember, your username will be added to the message.");
                return;
            }
            const lang = guildConfig.config.language;
            `[${new Date().toLocaleString([lang, "en-US"], { timeZone: "UTC" })}] [FROM USER] [${message.author.username}] ${message.content}\n${message.attachments?.map((attachment) => attachment.url).join("\n")}`;
            await threadChannel.send(`**[${message.author.username}]:** ${message.content}\n${message.attachments?.map((attachment) => attachment.url).join("\n")}`);
            await openMailsSchema.findOneAndUpdate({
                guildID: guild.id,
                userID: message.author.id,
            }, {
                guildID: guild.id,
                userID: message.author.id,
                channelID: threadChannel.id,
                $push: {
                    messages: `[${new Date().toLocaleString([lang, "en-US"], { timeZone: "UTC" })}] [FROM USER] [${message.author.username}] ${message.content}\n${message.attachments?.map((attachment) => attachment.url).join("\n")}`
                },
                $inc: {
                    "messageCount.userMessageCount": 1
                }
            }, {
                upsert: true,
            });
        }
        else {
            if (`**[${message.author.username}]:** ${message.content}\n${message.attachments?.map((attachment) => attachment.url).join("\n")}`.length > 2000) {
                await message.author.send("Your message is too long. Keep it under 2000 characters. Remember, your username will be added to the message.");
                return;
            }
            const commonGuilds = client.guilds.cache.filter(async (guild) => await guild.members.fetch(message.author.id) && client.guildsConfig.get(guild.id)?.config.modmail);
            if (commonGuilds.size === 0)
                return;
            const stringSelection = new StringSelectMenuBuilder()
                .setCustomId("modmailGuildSelection")
                .setPlaceholder("Select a server to send a modmail message to")
                .addOptions(commonGuilds.map((guild) => ({
                label: guild.name,
                value: guild.id,
            })));
            const actionRow = new ActionRowBuilder().addComponents(stringSelection);
            const msg = await message.author.send({
                content: "Select a server to send a modmail message to",
                components: [actionRow]
            });
            const filter = (interaction) => interaction.user.id === message.author.id;
            try {
                const collector = await msg.awaitMessageComponent({
                    filter,
                    time: 60000,
                    componentType: ComponentType.StringSelect
                });
                const guild = client.guilds.cache.get(collector.values[0]);
                if (!guild) {
                    await message.author.send("The selected guild was not found. Please try again later.");
                    return;
                }
                const guildConfig = client.guildsConfig.get(guild.id);
                if (!guildConfig) {
                    await message.author.send("Guild config for the selected guild was not found. Please try again later.");
                    return;
                }
                const modmail = guildConfig.config.modmail;
                const parent = guild.channels.cache.get(modmail.category);
                if (!parent) {
                    await message.author.send("The modmail category was not found. Please try again later.");
                    return;
                }
                const threadChannel = await guild.channels.create({
                    name: Math.random().toString(36).slice(2),
                    parent: parent.id,
                    type: ChannelType.GuildText,
                    topic: `Modmail thread created by ${message.author.tag}`,
                    permissionOverwrites: [
                        {
                            id: guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel],
                        },
                        ...guildConfig.config.staffRole.map((role) => ({
                            id: role,
                            allow: [PermissionsBitField.Flags.ViewChannel],
                        })),
                    ],
                });
                const member = guild.members.cache.get(message.author.id);
                if (!member) {
                    await message.author.send("You were not found in the selected guild. Please try again later.");
                    return;
                }
                const messages = [];
                const lang = guildConfig.config.language;
                const botThreadMessage = await threadChannel.send(replaceMassString(client.handleLanguages("MOD_MAIL_THREAD_CREATED", client, guild.id), {
                    "{accountAge}": humanizeDuration(Date.now() - message.author.createdTimestamp, {
                        largest: 2,
                        round: true,
                        language: lang,
                        fallbacks: ["en"]
                    }),
                    "{id}": message.author.id,
                    "{username}": message.author.username,
                    "{userMention}": message.author.toString(),
                    "{joinDate}": humanizeDuration(Date.now() - member.joinedTimestamp, {
                        largest: 2,
                        round: true,
                        language: lang,
                        fallbacks: ["en"]
                    }),
                }));
                messages.push(`[${new Date().toLocaleString([lang, "en-US"], { timeZone: "UTC" })}] [BOT] ${botThreadMessage.content}`);
                messages.push(`[${new Date().toLocaleString([lang, "en-US"], { timeZone: "UTC" })}] [FROM USER] [${message.author.username}] ${message.content}${message.attachments.size ? "\n" : ""}${message.attachments?.map((attachment) => attachment.url).join("\n")}`);
                await threadChannel.send(`**[${message.author.username}]:** ${message.content}\n${message.attachments?.map((attachment) => attachment.url).join("\n")}`);
                await collector.reply(guildConfig.config.modmail.newThreadMessage || "Your modmail thread has been created. Please wait for a staff member to respond.");
                if (process.env.npm_lifecycle_event !== "test") {
                    await message.react(client.config.Emojis.mailSent);
                }
                await threadChannel.send(`${client.config.Emojis.gearSpinning} **${client.user.username}:** ${guildConfig.config.modmail.newThreadMessage || "Your modmail thread has been created. Please wait for a staff member to respond."}`);
                messages.push(`[${new Date().toLocaleString([lang, "en-US"], { timeZone: "UTC" })}] [BOT TO USER] ${guildConfig.config.modmail.newThreadMessage || "Your modmail thread has been created. Please wait for a staff member to respond."}`);
                await openMailsSchema.findOneAndUpdate({
                    guildID: guild.id,
                    userID: message.author.id,
                }, {
                    guildID: guild.id,
                    userID: message.author.id,
                    channelID: threadChannel.id,
                    messages: messages,
                    $inc: {
                        "messageCount.userMessageCount": 1
                    },
                    threadNumber: guildConfig.config.modmail.tickets
                }, {
                    upsert: true,
                });
            }
            catch (error) {
                await handleErrors(client, error, "messageCreate event", message);
            }
        }
        return;
    }
    const config = client.guildsConfig.get(message.guild.id);
    if (!config)
        return;
    const leaderboardChannel = config.config.bumpLeaderboardChannel;
    if (message.interaction && message.interaction.commandName === "bump" && message.author.id === "302050872383242240" && message.channel.id === leaderboardChannel) {
        const results = await bumpLeaderboardSchema.findOne({ guildID: message.guild.id });
        if (results) {
            const user = results.users.find((result) => result.userID === message.interaction.user.id);
            if (user) {
                user.bumps++;
            }
            else {
                results.users.push({
                    userID: message.interaction.user.id,
                    bumps: 1
                });
            }
            await bumpLeaderboardSchema.findOneAndUpdate({
                guildID: message.guild.id,
            }, {
                $set: {
                    users: results.users,
                },
            });
        }
        else {
            await bumpLeaderboardSchema.findOneAndUpdate({
                guildID: message.guild.id,
            }, {
                users: [{
                        userID: message.interaction.user.id,
                        bumps: 1,
                    }],
            }, {
                upsert: true,
                timestamps: true,
            });
        }
        await message.delete();
        const result = await bumpLeaderboard(client, message.guild.id, message.interaction.user);
        if (result && result.error) {
            message.channel.send({ content: "An error occurred while updating the leaderboard. Please try again later.\nError: " + result.error });
        }
    }
    else if (message.channel.id === leaderboardChannel && message.author.id !== client.user.id) {
        await message.delete();
    }
    if (message.content.startsWith("!!") && await openMailsSchema.exists({ channelID: message.channel.id })) {
        const sargs = message.content.slice(2).trim().split(/ +/g);
        const snippet = sargs.shift()?.toLowerCase();
        if (!snippet)
            return;
        const guildConfig = client.guildsConfig.get(message.guild.id);
        if (!guildConfig)
            return;
        const snippetMessage = guildConfig.config.modmail.snippets.find((s) => s.name === snippet);
        if (!snippetMessage)
            return;
        const openMail = await openMailsSchema.findOne({ channelID: message.channel.id });
        if (!openMail)
            return;
        const user = await client.users.fetch(openMail.userID);
        const msg = `**(${_.startCase(_.capitalize(message.member.roles.highest.name))}) ${message.author.username}:** ${snippetMessage.message}`;
        if (msg.length > 2000)
            return message.channel.send(client.handleLanguages("REPLY_TOO_LONG", client, message.guild.id));
        try {
            await user.send(msg);
            await message.channel.send(`\`${openMail.messageCount.modMessageCount + 1}\` ${msg}`);
            await openMailsSchema.updateOne({ channelID: message.channel.id }, {
                $push: {
                    messages: {
                        $each: [
                            `[${new Date().toLocaleString([guildConfig.config.language, "en-US"], { timeZone: "UTC" })}] [COMMAND] [${message.author.username}] ${message.content}`,
                            `[${new Date().toLocaleString([guildConfig.config.language, "en-US"], { timeZone: "UTC" })}] [TO USER] [${message.author.username}] (${_.startCase(_.capitalize(message.member.roles.highest.name))}) ${message.author.username}: ${snippetMessage.message}`
                        ]
                    }
                }, $inc: {
                    "messageCount.modMessageCount": 1
                }
            });
        }
        catch (error) {
            await handleErrors(client, error, 'messageCreate event', message);
        }
        await message.delete();
    }
    const prefix = "!";
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const commandName = args.shift()?.toLowerCase();
    const cmd = client.commands.get(commandName);
    if (!cmd && await openMailsSchema.exists({ channelID: message.channel.id }) && !message.author.bot && !message.content.startsWith("!!")) {
        await openMailsSchema.findOneAndUpdate({ channelID: message.channel.id }, {
            $push: {
                messages: {
                    $each: [
                        `[${new Date().toLocaleString([config.config.language, "en-US"], { timeZone: "UTC" })}] [CHAT] [${message.author.username}] (${_.startCase(_.capitalize(message.member.roles.highest.name))}) ${message.author.username}: ${message.content}${message.attachments.size ? "\n" : ""}${message.attachments.map(a => a.url).join("\n")}`
                    ]
                }
            },
            $inc: {
                "messageCount.internalMessageCount": 1
            }
        });
    }
    if (!cmd)
        return;
    try {
        cmd.execute({
            client,
            message,
            args
        });
    }
    catch (error) {
        await handleErrors(client, error, "messageCreate event", message);
    }
};
//# sourceMappingURL=messageCreate.js.map