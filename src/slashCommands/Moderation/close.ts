import {slashCommandBase} from "../../../@types/types";
import {
    SlashCommandBuilder,
    PermissionsBitField,
    TextChannel,
    GuildMember,
    ChannelType
} from "discord.js";
import fs from "fs/promises";
import {handleErrors} from "../../utils/utils.js";
import openMailsSchema from "../../schemas/openMailsSchema.js";
export default {
    help: {
        name: "kapat",
        description: "Aktif bir modmaili kapatır.",
        usage: "kapat",
        examples: ["kapat"],
        category: "Moderasyon",
    },
    data: new SlashCommandBuilder()
        .setName("closemail")
        .setNameLocalizations({
            "tr": "mailkapat"
            })
        .setDMPermission(false)
        .setDescription("Closes an active modmail")
        .setDescriptionLocalizations({
            "tr": "Aktif bir modmaili kapatır."
            })
        .addStringOption(option => option
            .setName("channelid")
            .setNameLocalizations({
                "tr": "kanalid"
            })
            .setDescription("The channel ID of the modmail to close. If not provided, it will try to close the current channel.")
            .setDescriptionLocalizations({
                "tr": "Kapatılacak modmailin kanal IDsi. Verilmediyse, mevcut kanalı kapatmaya çalışacaktır."
            }))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),
    async execute({client, interaction}) {
        if(!(interaction.member as GuildMember).permissions.has(PermissionsBitField.Flags.ManageMessages)) return interaction.reply({content: client.handleLanguages("CLOSEMAIL_NO_PERMS", client, interaction.guild!.id), ephemeral: true});
        const channel = interaction.options.getString("channelId") || interaction.channelId;
        const guildConfig = client.guildsConfig.get(interaction.guildId!);
        if(!guildConfig) return interaction.reply(client.handleLanguages("SERVER_HAS_NO_CONFIGURATION", client, interaction.guild!.id));
        if(!await openMailsSchema.exists({channelID: channel})) return interaction.reply({content: client.handleLanguages("CLOSEMAIL_NOT_MODMAIL", client, interaction.guild!.id), ephemeral: true});
        const openMail = await openMailsSchema.findOne({channelID: channel});
        await interaction.reply({content: client.handleLanguages("CLOSEMAIL_CLOSE", client, interaction.guild!.id)});
        let messages = openMail!.messages
        const lang = guildConfig.config.language;
        messages.push(`[${new Date().toLocaleString([lang, "en-US"], {timeZone: "UTC"})}] [COMMAND] [${interaction.user.username}] ${interaction.commandName} ${interaction.options.getString("channelId") ? interaction.options.getString("channelId") : ""}`)
        messages.push(`[${new Date().toLocaleString([lang, "en-US"], {timeZone: "UTC"})}] [BOT] ${client.handleLanguages("CLOSEMAIL_CLOSE", client, interaction.guild!.id)}`)
        let logChannel = interaction.guild!.channels.cache.get(guildConfig.config.modmail.logChannel) as TextChannel;
        if(!logChannel) {
            try {
                logChannel = await interaction.guild!.channels.create({
                    name: "modmail-logs",
                    type: ChannelType.GuildText,
                    parent: client.guildsConfig.get(interaction.guildId!)!.config.modmail.category,
                })
                await interaction.reply({content: client.handleLanguages("CLOSEMAIL_LOG_CHANNEL_CREATED", client, interaction.guild!.id), ephemeral: true});
                messages.push(`[${new Date().toLocaleString([lang, "en-US"], {timeZone: "UTC"})}] [BOT] ${client.handleLanguages("CLOSEMAIL_LOG_CHANNEL_CREATED", client, interaction.guild!.id)}`)
            } catch (error) {
                await handleErrors(client, error, "close.ts", interaction);
            }
        }
        const mailUser = await client.users.fetch(openMail!.userID);
        await fs.mkdir("./logs", { recursive: true });
        await fs.writeFile(`./logs/${openMail!.userID}.txt`, `# Modmail thread #${guildConfig.config.modmail.tickets} with ${mailUser.username} (${mailUser.id}) started at ${new Date(openMail!.createdAt).toLocaleString([lang, "en-US"], {timeZone: "UTC"})}. All times are in UTC+0.\n\n${messages.join("\n")}`);
        //
        if(logChannel) {
            await logChannel.send({content: `Modmail thread #${guildConfig.config.modmail.tickets} with ${mailUser.username} (${mailUser.id}) was closed by ${interaction.user.username}\n**${openMail!.messageCount.userMessageCount}** message from the user, **${openMail!.messageCount.modMessageCount}** messages to the user and **${openMail!.messageCount.internalMessageCount}** internal chat messages.`,
                files: [`./logs/${openMail!.userID}.txt`]
            });
        }
        if(interaction.guild!.members.me?.permissionsIn(interaction.channel as TextChannel).has(PermissionsBitField.Flags.ManageChannels)) {
            interaction.channel!.delete();
        } else {
            interaction.channel!.send({content: client.handleLanguages("CLOSEMAIL_NO_PERM_TO_DELETE", client, interaction.guild!.id)});
        }
        try {
            const userDM = await client.users.fetch(openMail!.userID);
            await userDM.send(client.handleLanguages("CLOSEMAIL_NOTIFY", client, interaction.guild!.id));
            await fs.rm("./logs", {recursive: true, force: true});
            await client.updateGuildConfig({guildId: interaction.guildId!,
                config: {
                    modmail: {
                        tickets: guildConfig.config.modmail.tickets + 1,
                    }
                }
            });
        } catch (error) {
            await handleErrors(client, error, "close.ts", interaction);
        }
    }
} as slashCommandBase;