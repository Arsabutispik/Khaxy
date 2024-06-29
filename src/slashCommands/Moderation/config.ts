import {slashCommandBase} from "../../types";
import {
    GuildMember, MessageComponentInteraction, PermissionsBitField,
    SlashCommandBuilder, ComponentType
} from "discord.js";
import {replaceMassString} from "../../utils/utils.js";
import {registerConfig, welcomeConfig, moderationConfig, roleConfig} from "../../utils/configFunctions.js";
export default {
    help: {
        name: "config",
        description: "Sunucu için gerekli ayarları değiştirmeye yarar.",
        usage: "config [ayar]",
        examples: ["config", "config register", "config moderation"],
        category: "Moderasyon"
    },
    data: new SlashCommandBuilder()
        .setName("config")
        .setDescription("Change the necessary settings for the server.")
        .setDescriptionLocalizations({
            tr: "Sunucu için gerekli ayarları değiştirmeye yarar."
        })
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .setDMPermission(false)
        .addStringOption(option => {
            return option
                .setName("setting")
                .setNameLocalizations({
                    tr: "ayar"
                })
                .setDescription("Setting to be changed.")
                .setDescriptionLocalizations({
                    tr: "Değiştirilecek ayar."
                })
                .setRequired(false)
                .addChoices({
                    name: "Register Settings",
                    value: "register"
                }, {
                    name: "Welcome-Leave Settings",
                    value: "welcome-leave"
                }, {
                    name: "Moderation Settings",
                    value: "moderation"
                }, {
                    name: "Role Settings",
                    value: "role"
                })
        }),
    execute: async ({interaction, client}) => {
        const guildConfig = client.guildsConfig.get(interaction.guild!.id)!
        const setting = interaction.options.getString("setting") as "register" | "welcome-leave" | "moderation" | "role" | undefined
        if(!(interaction.member as GuildMember).permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({content: client.handleLanguages("CONFIG_NO_PERMS", client, interaction.guild!.id), ephemeral: true});
        if (!setting) {
            await interaction.reply(client.handleLanguages("CONFIG_MESSAGE", client, interaction.guild!.id))
            const msg = await interaction.fetchReply()
            const filter = (i: MessageComponentInteraction) => i.customId === "config" && i.user.id === interaction.user.id
            const collector = msg.createMessageComponentCollector({filter, componentType: ComponentType.StringSelect,time: 60000})
            collector.on("collect", async i => {
                const setting = i.values[0] as "register" | "welcome-leave" | "moderation" | "role"
                if(setting === "register") {
                    const registerMessage = client.handleLanguages("CONFIG_REGISTER_MESSAGE", client, interaction.guild!.id)

                    for (const embeds of registerMessage.embeds ) {
                        let x=Math.round(0xffffff * Math.random()).toString(16);
                        let y=(6-x.length);
                        let z="000000";
                        let z1 = z.substring(0,y);
                        embeds.color = Number(`0x${z1 + x}`)
                        for (const values of embeds.fields as [{ "name": string, "value": string }]) {
                            values.value = replaceMassString(values.value, {
                                "{registerChannel}": guildConfig.config.registerChannel ? `<#${guildConfig.config.registerChannel}>` : "N/A",
                                "{registerMessage}": guildConfig.config.registerMessage ? "<a:checkmark:1017704018287546388>" : "<a:wrong:1197091816282001468>",
                                "{registerWelcomeChannel}": guildConfig.config.registerWelcomeChannel ? `<#${guildConfig.config.registerWelcomeChannel}>` : "N/A",
                                "{registerChannelClear}": guildConfig.config.registerChannelClear ? "<a:checkmark:1017704018287546388>" : "<a:wrong:1197091816282001468>",
                                "{registerMessageClear}": guildConfig.config.registerMessageClear ? "<a:checkmark:1017704018287546388>" : "<a:wrong:1197091816282001468>"
                            })!
                            Object.assign(embeds.fields, values)
                        }
                    }
                    await i.update(registerMessage)
                } else if(setting === "welcome-leave") {
                    const welcomeLeaveMessage = client.handleLanguages("CONFIG_WELCOME_LEAVE_MESSAGE", client, interaction.guild!.id)
                    for (const embeds of welcomeLeaveMessage.embeds as [{ "fields": [{ "name": string, "value": string }], "color": number }] ) {
                        let x = Math.round(0xffffff * Math.random()).toString(16);
                        let y = (6 - x.length);
                        let z = "000000";
                        let z1 = z.substring(0, y);
                        embeds.color = Number(`0x${z1 + x}`)
                        for (const values of embeds.fields as [{ "name": string, "value": string }]) {
                            values.value = replaceMassString(values.value, {
                                "{welcomeMessage}": guildConfig.config.welcomeMessage ? "<a:checkmark:1017704018287546388>" : "<a:wrong:1197091816282001468>",
                                "{welcomeChannel}": guildConfig.config.welcomeChannel ? `<#${guildConfig.config.welcomeChannel}>` : "N/A",
                                "{leaveMessage}": guildConfig.config.leaveMessage ? "<a:checkmark:1017704018287546388>" : "<a:wrong:1197091816282001468>",
                                "{leaveChannel}": guildConfig.config.leaveChannel ? `<#${guildConfig.config.leaveChannel}>` : "N/A"
                            })!
                            Object.assign(embeds.fields, values)
                        }
                    }
                    await i.update(welcomeLeaveMessage)
                } else if(setting === "moderation") {
                    const moderationMessage = client.handleLanguages("CONFIG_MODERATION_MESSAGE", client, interaction.guild!.id)
                    for (const embeds of moderationMessage.embeds as [{ "fields": [{ "name": string, "value": string }], "color": number }] ) {
                        let x = Math.round(0xffffff * Math.random()).toString(16);
                        let y = (6 - x.length);
                        let z = "000000";
                        let z1 = z.substring(0, y);
                        embeds.color = Number(`0x${z1 + x}`)
                        for (const values of embeds.fields as [{ "name": string, "value": string }]) {
                            values.value = replaceMassString(values.value, {
                                "{modlogChannel}": guildConfig.config.modlogChannel ? `<#${guildConfig.config.modlogChannel}>` : "N/A",
                                "{muteGetAllRoles}": guildConfig.config.muteGetAllRoles ? "<a:checkmark:1017704018287546388>" : "<a:wrong:1197091816282001468>",
                                "{staffRole}": guildConfig.config.staffRole.length > 0 ? guildConfig.config.staffRole.map(x => `<@&${x}>`).join(", ") : "N/A",
                                "{modmailChannel}": guildConfig.config.modmail.logChannel ? `<#${guildConfig.config.modmail.logChannel}>` : "N/A"
                            })!
                            Object.assign(embeds.fields, values)
                        }
                    }
                    await i.update(moderationMessage)
                } else if(setting === "role") {
                    const roleMessage = client.handleLanguages("CONFIG_ROLE_MESSAGE", client, interaction.guild!.id)
                    for (const embeds of roleMessage.embeds as [{ "fields": [{ "name": string, "value": string }], "color": number }] ) {
                        let x = Math.round(0xffffff * Math.random()).toString(16);
                        let y = (6 - x.length);
                        let z = "000000";
                        let z1 = z.substring(0, y);
                        embeds.color = Number(`0x${z1 + x}`)
                        for (const values of embeds.fields as [{ "name": string, "value": string }]) {
                            values.value = replaceMassString(values.value, {
                                "{registerRole}": `👩: ${guildConfig.config.femaleRole ? `<@&${guildConfig.config.femaleRole}>` : "N/A"}\n👨: ${guildConfig.config.maleRole ? `<@&${guildConfig.config.maleRole}>` : "N/A"}`,
                                "{memberRole}": guildConfig.config.memberRole ? `<@&${guildConfig.config.memberRole}>` : "N/A",
                                "{muteRole}": guildConfig.config.muteRole ? `<@&${guildConfig.config.muteRole}>` : "N/A",
                                "{colorOfTheDay}": guildConfig.config.roleOfTheDay ? `<@&${guildConfig.config.roleOfTheDay}>` : "N/A",
                                "{djRole}": guildConfig.config.djRole ? `<@&${guildConfig.config.djRole}>` : "N/A"
                            })!
                            Object.assign(embeds.fields, values)
                        }
                    }
                    await i.update(roleMessage)
                }
            })
            return
        }
        switch (setting) {
            case "register":
                await registerConfig(interaction, client)
                break
            case "welcome-leave":
                await welcomeConfig(interaction, client)
                break
            case "moderation":
                await moderationConfig(interaction, client)
                break
            case "role":
                await roleConfig(interaction, client)
                break
        }
    }
} as slashCommandBase