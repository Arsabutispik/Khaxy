import { ComponentType, PermissionsBitField, ChannelType } from "discord.js";
import { handleErrors } from "./utils.js";
async function registerConfig(interaction, client) {
    const SelectMenu = client.handleLanguages("REGISTER_CONFIG_PROMPT", client, interaction.guildId);
    await interaction.reply(SelectMenu);
    const selectMsg = await interaction.fetchReply();
    const selectFilter = (i) => i.user.id === interaction.user.id;
    try {
        const selectCollector = await selectMsg.awaitMessageComponent({
            filter: selectFilter,
            componentType: ComponentType.SelectMenu,
            time: 60000
        });
        if (selectCollector.customId === "registerConfig") {
            switch (selectCollector.values[0]) {
                case "registerChannel":
                    await registerChannel(selectCollector, client);
                    break;
                case "registerMessage":
                    await registerMessage(selectCollector, client);
                    break;
                case "registerWelcomeChannel":
                    await registerMessageChannel(selectCollector, client);
                    break;
                case "registerMessageClear":
                    await registerMessageClear(selectCollector, client);
                    break;
                case "registerChannelClear":
                    await registerChannelClear(selectCollector, client);
                    break;
            }
        }
    }
    catch (error) {
        await handleErrors(client, error, "configFunctions.ts", interaction);
    }
}
async function registerChannel(interaction, client) {
    const raw = client.handleLanguages("REGISTER_CHANNEL_PROMPT", client, interaction.guildId);
    raw.components[0].components[0].default_values.shift();
    const registerChannel = client.guildsConfig.get(interaction.guild.id)?.config.registerChannel;
    if (registerChannel) {
        raw.components[0].components[0].default_values.push({
            "id": registerChannel,
            "type": "channel"
        });
    }
    await interaction.reply(raw);
    const msg = await interaction.fetchReply();
    const filter = (i) => i.user.id === interaction.user.id;
    try {
        const collector = await msg.awaitMessageComponent({
            filter: filter,
            componentType: ComponentType.ChannelSelect,
            time: 60000
        });
        if (collector) {
            const data = collector.values[0];
            const channel = interaction.guild.channels.cache.get(data);
            const config = {
                $set: {
                    "config.registerChannel": channel.id
                }
            };
            await client.updateGuildConfig({ guildId: interaction.guild.id, config });
            await collector.reply({
                content: client.handleLanguages("REGISTER_CHANNEL_SUCCESS", client, interaction.guildId),
                ephemeral: true
            });
        }
    }
    catch (error) {
        await handleErrors(client, error, "configFunctions.ts", interaction);
    }
}
async function registerMessage(interaction, client) {
    if (client.guildsConfig.get(interaction.guild.id)?.config.registerMessage) {
        const raw = client.handleLanguages("REGISTER_MESSAGE_ALREADY_SETUP", client, interaction.guildId);
        await interaction.reply(raw);
        const msg = await interaction.fetchReply();
        const buttonFilter = (i) => (i.customId === "staffRoleReject" || i.customId === "staffRoleAccept" || i.customId === "staffRoleDelete") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({
                filter: buttonFilter,
                componentType: ComponentType.Button,
                time: 60000
            });
            if (collector) {
                if (collector.customId === "registerMessageReject") {
                    await collector.reply({
                        content: client.handleLanguages("REGISTER_MESSAGE_CANCEL", client, interaction.guildId),
                        components: [],
                        ephemeral: true
                    });
                }
                else if (collector.customId === "registerMessageRoleAccept") {
                    const modal = client.handleLanguages("REGISTER_MESSAGE_MODAL", client, interaction.guildId);
                    await collector.reply(client.handleLanguages("REGISTER_MESSAGE_SETUP", client, interaction.guildId));
                    const msg = await collector.fetchReply();
                    const buttonFilter = (i) => (i.customId === "registerMessage") && (i.user.id === interaction.user.id);
                    try {
                        const collector = await msg.awaitMessageComponent({
                            filter: buttonFilter,
                            componentType: ComponentType.Button,
                            time: 60000
                        });
                        if (collector) {
                            await collector.showModal(modal);
                            const filter = (i) => i.customId === "registerMessage" && i.user.id === interaction.user.id;
                            try {
                                const collector = await interaction.awaitModalSubmit({ filter, time: 60000 });
                                const data = collector.fields.getTextInputValue("registerMessage");
                                const config = {
                                    $set: {
                                        "config.registerMessage": data
                                    }
                                };
                                await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                                await collector.reply({
                                    content: client.handleLanguages("REGISTER_MESSAGE_SUCCESS", client, interaction.guildId),
                                    ephemeral: true
                                });
                            }
                            catch (e) {
                                await collector.reply({
                                    content: client.handleLanguages("REGISTER_MESSAGE_ERROR_OR_EXPIRED", client, interaction.guildId),
                                    ephemeral: true
                                });
                                console.log(e);
                            }
                        }
                    }
                    catch (e) {
                        await interaction.followUp({
                            content: client.handleLanguages("REGISTER_MESSAGE_ERROR_OR_EXPIRED", client, interaction.guildId),
                            ephemeral: true
                        });
                        console.log(e);
                    }
                }
                else if (collector.customId === "registerMessageDelete") {
                    const config = {
                        $set: {
                            "config.registerMessage": null
                        }
                    };
                    await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                    await collector.reply({
                        content: client.handleLanguages("REGISTER_MESSAGE_DELETED", client, interaction.guildId),
                        ephemeral: true
                    });
                }
            }
        }
        catch (error) {
            await handleErrors(client, error, "configFunctions.ts", interaction);
        }
    }
    else {
        const modal = client.handleLanguages("REGISTER_MESSAGE_MODAL", client, interaction.guildId);
        await interaction.reply(client.handleLanguages("REGISTER_MESSAGE_SETUP", client, interaction.guildId));
        const msg = await interaction.fetchReply();
        const buttonFilter = (i) => (i.customId === "registerMessage") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({
                filter: buttonFilter,
                componentType: ComponentType.Button,
                time: 60000
            });
            if (collector) {
                await collector.showModal(modal);
                const filter = (i) => i.customId === "registerMessage" && i.user.id === interaction.user.id;
                try {
                    const collector = await interaction.awaitModalSubmit({ filter, time: 60000 });
                    const data = collector.fields.getTextInputValue("registerMessage");
                    const config = {
                        $set: {
                            "config.registerMessage": data
                        }
                    };
                    await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                    await collector.reply({
                        content: client.handleLanguages("REGISTER_MESSAGE_SUCCESS", client, interaction.guildId),
                        ephemeral: true
                    });
                }
                catch (e) {
                    await collector.reply({
                        content: client.handleLanguages("REGISTER_MESSAGE_ERROR_OR_EXPIRED", client, interaction.guildId),
                        ephemeral: true
                    });
                    console.log(e);
                }
            }
        }
        catch (error) {
            await handleErrors(client, error, "configFunctions.ts", interaction);
        }
    }
}
async function registerMessageChannel(interaction, client) {
    const raw = client.handleLanguages("REGISTER_MESSAGE_CHANNEL_PROMPT", client, interaction.guildId);
    raw.components[0].components[0].default_values.shift();
    const registerChannel = client.guildsConfig.get(interaction.guild.id)?.config.registerWelcomeChannel;
    if (registerChannel) {
        raw.components[0].components[0].default_values.push({
            "id": registerChannel,
            "type": "channel"
        });
    }
    await interaction.reply(raw);
    const msg = await interaction.fetchReply();
    const filter = (i) => i.user.id === interaction.user.id;
    try {
        const collector = await msg.awaitMessageComponent({
            filter: filter,
            componentType: ComponentType.ChannelSelect,
            time: 60000
        });
        if (collector) {
            const data = collector.values[0];
            const channel = interaction.guild.channels.cache.get(data);
            const config = {
                $set: {
                    "config.registerWelcomeChannel": channel.id
                }
            };
            await client.updateGuildConfig({ guildId: interaction.guild.id, config });
            await collector.reply({
                content: client.handleLanguages("REGISTER_MESSAGE_CHANNEL_SUCCESS", client, interaction.guildId),
                ephemeral: true
            });
        }
    }
    catch (error) {
        await handleErrors(client, error, "configFunctions.ts", interaction);
    }
}
async function registerMessageClear(interaction, client) {
    if (!client.guildsConfig.get(interaction.guild.id)?.config.registerMessageClear) {
        const config = {
            $set: {
                "config.registerMessageClear": true
            }
        };
        await client.updateGuildConfig({ guildId: interaction.guild.id, config });
        await interaction.reply({
            content: client.handleLanguages("REGISTER_MESSAGE_DELETE_TRUE", client, interaction.guildId),
            ephemeral: true
        });
    }
    else {
        const config = {
            $set: {
                "config.registerMessageClear": false
            }
        };
        await client.updateGuildConfig({ guildId: interaction.guild.id, config });
        await interaction.reply({
            content: client.handleLanguages("REGISTER_MESSAGE_DELETE_FALSE", client, interaction.guildId),
            ephemeral: true
        });
    }
}
async function registerChannelClear(interaction, client) {
    if (!client.guildsConfig.get(interaction.guild.id)?.config.registerChannelClear) {
        const config = {
            $set: {
                "config.registerChannelClear": true
            }
        };
        await client.updateGuildConfig({ guildId: interaction.guild.id, config });
        await interaction.reply({
            content: client.handleLanguages("REGISTER_CHANNEL_DELETE_TRUE", client, interaction.guildId),
            ephemeral: true
        });
    }
    else {
        const config = {
            $set: {
                "config.registerChannelClear": false
            }
        };
        await client.updateGuildConfig({ guildId: interaction.guild.id, config });
        await interaction.reply({
            content: client.handleLanguages("REGISTER_CHANNEL_DELETE_TRUE", client, interaction.guildId),
            ephemeral: true
        });
    }
}
async function welcomeConfig(interaction, client) {
    await interaction.reply(client.handleLanguages("WELCOME_CONFIG_PROMPT", client, interaction.guildId));
    const msg = await interaction.fetchReply();
    const filter = (i) => i.customId === "welcomeConfig" && i.user.id === interaction.user.id;
    try {
        const collector = await msg.awaitMessageComponent({
            filter,
            componentType: ComponentType.SelectMenu,
            time: 60000
        });
        if (collector) {
            switch (collector.values[0]) {
                case "welcomeChannel":
                    await welcomeChannel(collector, client);
                    break;
                case "welcomeMessage":
                    await welcomeMessage(collector, client);
                    break;
                case "goodbyeChannel":
                    await goodbyeChannel(collector, client);
                    break;
                case "goodbyeMessage":
                    await goodbyeMessage(collector, client);
                    break;
            }
        }
    }
    catch (error) {
        await handleErrors(client, error, "configFunctions.ts", interaction);
    }
}
async function welcomeChannel(interaction, client) {
    const raw = client.handleLanguages("WELCOME_CHANNEL_PROMPT", client, interaction.guildId);
    raw.components[0].components[0].default_values.shift();
    const welcomeChannel = client.guildsConfig.get(interaction.guild.id)?.config.welcomeChannel;
    if (welcomeChannel) {
        raw.components[0].components[0].default_values.push({
            "id": welcomeChannel,
            "type": "channel"
        });
    }
    await interaction.reply(raw);
    const msg = await interaction.fetchReply();
    const filter = (i) => i.user.id === interaction.user.id;
    try {
        const collector = await msg.awaitMessageComponent({
            filter: filter,
            componentType: ComponentType.ChannelSelect,
            time: 60000
        });
        if (collector) {
            const data = collector.values[0];
            const channel = interaction.guild.channels.cache.get(data);
            const config = {
                $set: {
                    "config.welcomeChannel": channel.id
                }
            };
            await client.updateGuildConfig({ guildId: interaction.guild.id, config });
            await collector.reply({
                content: client.handleLanguages("WELCOME_CHANNEL_SUCCESS", client, interaction.guildId),
                ephemeral: true
            });
        }
    }
    catch (error) {
        await handleErrors(client, error, "configFunctions.ts", interaction);
    }
}
async function welcomeMessage(interaction, client) {
    if (client.guildsConfig.get(interaction.guild.id)?.config.welcomeMessage) {
        await interaction.reply(client.handleLanguages("WELCOME_MESSAGE_ALREADY_SETUP", client, interaction.guildId));
        const msg = await interaction.fetchReply();
        const buttonFilter = (i) => (i.customId === "welcomeMessageReject" || i.customId === "welcomeMessageAccept" || i.customId === "welcomeMessageDelete") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({
                filter: buttonFilter,
                componentType: ComponentType.Button,
                time: 60000
            });
            if (collector.customId === "welcomeMessageReject") {
                await collector.reply({
                    content: client.handleLanguages("WELCOME_MESSAGE_CANCEL", client, interaction.guildId),
                    ephemeral: true
                });
            }
            else if (collector.customId === "welcomeMessageAccept") {
                await collector.reply(client.handleLanguages("WELCOME_MESSAGE_SETUP", client, interaction.guildId));
                const msg = await collector.fetchReply();
                const buttonFilter = (i) => (i.customId === "welcomeMessage") && (i.user.id === interaction.user.id);
                try {
                    const modalcollector = await msg.awaitMessageComponent({
                        filter: buttonFilter,
                        componentType: ComponentType.Button,
                        time: 60000
                    });
                    if (modalcollector) {
                        await modalcollector.showModal(client.handleLanguages("WELCOME_MESSAGE_MODAL", client, interaction.guildId));
                        const filter = (i) => i.customId === "welcomeMessage" && i.user.id === interaction.user.id;
                        try {
                            const collector = await modalcollector.awaitModalSubmit({ filter, time: 60000 });
                            const data = collector.fields.getTextInputValue("welcomeMessage");
                            const config = {
                                $set: {
                                    "config.welcomeMessage": data
                                }
                            };
                            await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                            await collector.reply({
                                content: client.handleLanguages("WELCOME_MESSAGE_SUCCESS", client, interaction.guildId),
                                ephemeral: true
                            });
                        }
                        catch (error) {
                            await handleErrors(client, error, "configFunctions.ts", interaction);
                        }
                    }
                }
                catch (error) {
                    await handleErrors(client, error, "configFunctions.ts", interaction);
                }
            }
            else if (collector.customId === "welcomeMessageDelete") {
                const config = {
                    $set: {
                        "config.welcomeMessage": null
                    }
                };
                await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                await collector.reply({
                    content: client.handleLanguages("WELCOME_MESSAGE_DELETED", client, interaction.guildId),
                    ephemeral: true
                });
            }
        }
        catch (error) {
            await handleErrors(client, error, "configFunctions.ts", interaction);
        }
    }
    else {
        await interaction.reply(client.handleLanguages("WELCOME_MESSAGE_SETUP", client, interaction.guildId));
        const msg = await interaction.fetchReply();
        const buttonFilter = (i) => (i.customId === "welcomeMessage") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({
                filter: buttonFilter,
                componentType: ComponentType.Button,
                time: 60000
            });
            if (collector) {
                await collector.showModal(client.handleLanguages("WELCOME_MESSAGE_MODAL", client, interaction.guildId));
                const filter = (i) => i.customId === "welcomeMessage" && i.user.id === interaction.user.id;
                try {
                    const collector = await interaction.awaitModalSubmit({ filter, time: 60000 });
                    const data = collector.fields.getTextInputValue("welcomeMessage");
                    const config = {
                        $set: {
                            "config.welcomeMessage": data
                        }
                    };
                    await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                    await collector.reply({
                        content: client.handleLanguages("WELCOME_MESSAGE_SUCCESS", client, interaction.guildId),
                        ephemeral: true
                    });
                }
                catch (error) {
                    await handleErrors(client, error, "configFunctions.ts", interaction);
                }
            }
        }
        catch (error) {
            await handleErrors(client, error, "configFunctions.ts", interaction);
        }
    }
}
async function goodbyeChannel(interaction, client) {
    const raw = client.handleLanguages("GOODBYE_CHANNEL_PROMPT", client, interaction.guildId);
    raw.components[0].components[0].default_values.shift();
    const goodbyeChannel = client.guildsConfig.get(interaction.guild.id)?.config.leaveChannel;
    if (goodbyeChannel) {
        raw.components[0].components[0].default_values.push({
            "id": goodbyeChannel,
            "type": "channel"
        });
    }
    await interaction.reply(raw);
    const msg = await interaction.fetchReply();
    const filter = (i) => i.user.id === interaction.user.id;
    try {
        const collector = await msg.awaitMessageComponent({
            filter: filter,
            componentType: ComponentType.ChannelSelect,
            time: 60000
        });
        if (collector) {
            const data = collector.values[0];
            const channel = interaction.guild.channels.cache.get(data);
            const config = {
                $set: {
                    "config.leaveChannel": channel.id
                }
            };
            await client.updateGuildConfig({ guildId: interaction.guild.id, config });
            await collector.reply({
                content: client.handleLanguages("GOODBYE_CHANNEL_SUCCESS", client, interaction.guildId),
                ephemeral: true
            });
        }
    }
    catch (error) {
        await handleErrors(client, error, "configFunctions.ts", interaction);
    }
}
async function goodbyeMessage(interaction, client) {
    if (client.guildsConfig.get(interaction.guild.id)?.config.leaveMessage) {
        await interaction.reply(client.handleLanguages("GOODBYE_MESSAGE_ALREADY_SETUP", client, interaction.guildId));
        const filter = (i) => (i.customId === "goodByeMessageReject" || i.customId === "goodByeMessageAccept" || i.customId === "registerChannelDelete") && (i.user.id === interaction.user.id);
        try {
            const collector = await interaction.fetchReply();
            const collector2 = await collector.awaitMessageComponent({
                filter,
                componentType: ComponentType.Button,
                time: 60000
            });
            if (collector2) {
                if (collector2.customId === "goodByeMessageReject") {
                    await collector2.reply({
                        content: client.handleLanguages("GOODBYE_MESSAGE_CANCEL", client, interaction.guildId),
                        ephemeral: true
                    });
                }
                else if (collector2.customId === "goodByeMessageAccept") {
                    await collector2.reply(client.handleLanguages("GOODBYE_MESSAGE_SETUP", client, interaction.guildId));
                    const msg = await collector2.fetchReply();
                    const buttonFilter = (i) => (i.customId === "goodbyeMessage") && (i.user.id === interaction.user.id);
                    try {
                        const modalcollector = await msg.awaitMessageComponent({
                            filter: buttonFilter,
                            componentType: ComponentType.Button,
                            time: 60000
                        });
                        if (modalcollector) {
                            await modalcollector.showModal(client.handleLanguages("GOODBYE_MESSAGE_MODAL", client, interaction.guildId));
                            const filter = (i) => i.customId === "goodbyeMessage" && i.user.id === interaction.user.id;
                            try {
                                const collector = await modalcollector.awaitModalSubmit({ filter, time: 60000 });
                                const data = collector.fields.getTextInputValue("goodbyeMessage");
                                const config = {
                                    $set: {
                                        "config.leaveMessage": data
                                    }
                                };
                                await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                                await collector.reply({
                                    content: client.handleLanguages("GOODBYE_MESSAGE_SUCCESS", client, interaction.guildId),
                                    ephemeral: true
                                });
                            }
                            catch (error) {
                                await handleErrors(client, error, "configFunctions.ts", interaction);
                            }
                        }
                    }
                    catch (error) {
                        await handleErrors(client, error, "configFunctions.ts", interaction);
                    }
                }
                else if (collector2.customId === "goodByeMessageDelete") {
                    const config = {
                        $set: {
                            "config.leaveMessage": null
                        }
                    };
                    await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                    await collector2.reply({
                        content: client.handleLanguages("GOODBYE_MESSAGE_DELETED", client, interaction.guildId),
                        ephemeral: true
                    });
                }
            }
        }
        catch (error) {
            await handleErrors(client, error, "configFunctions.ts", interaction);
        }
    }
    else {
        await interaction.reply(client.handleLanguages("GOODBYE_MESSAGE_SETUP", client, interaction.guildId));
        const msg = await interaction.fetchReply();
        const buttonFilter = (i) => (i.customId === "goodbyeMessage") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({
                filter: buttonFilter,
                componentType: ComponentType.Button,
                time: 60000
            });
            if (collector) {
                await collector.showModal(client.handleLanguages("GOODBYE_MESSAGE_MODAL", client, interaction.guildId));
                const filter = (i) => i.customId === "goodbyeMessage" && i.user.id === interaction.user.id;
                try {
                    const collector = await interaction.awaitModalSubmit({ filter, time: 60000 });
                    const data = collector.fields.getTextInputValue("goodbyeMessage");
                    const config = {
                        $set: {
                            "config.leaveMessage": data
                        }
                    };
                    await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                    await collector.reply({
                        content: client.handleLanguages("GOODBYE_MESSAGE_SUCCESS", client, interaction.guildId),
                        ephemeral: true
                    });
                }
                catch (error) {
                    await handleErrors(client, error, "configFunctions.ts", interaction);
                }
            }
        }
        catch (error) {
            await handleErrors(client, error, "configFunctions.ts", interaction);
        }
    }
}
async function moderationConfig(interaction, client) {
    await interaction.reply(client.handleLanguages("MODERATION_CONFIG_PROMPT", client, interaction.guildId));
    const msg = await interaction.fetchReply();
    const filter = (i) => (i.customId === "moderationConfig" || i.customId === "muteGetAllRoles") && i.user.id === interaction.user.id;
    try {
        const collector = await msg.awaitMessageComponent({
            filter,
            componentType: ComponentType.SelectMenu,
            time: 60000
        });
        if (collector.customId === "moderationConfig") {
            switch (collector.values[0]) {
                case "modLogChannel":
                    await modLogChannel(collector, client);
                    break;
                case "muteGetAllRoles":
                    await muteGetAllRoles(collector, client);
                    break;
                case "staffRoles":
                    await staffRole(collector, client);
                    break;
                case "modMail":
                    await modMail(collector, client);
                    break;
                case "language":
                    await languageHandler(collector, client);
            }
        }
    }
    catch (error) {
        await handleErrors(client, error, "configFunctions.ts", interaction);
    }
}
async function modLogChannel(interaction, client) {
    const raw = client.handleLanguages("MODLOG_CHANNEL_PROMPT", client, interaction.guildId);
    raw.components[0].components[0].default_values.shift();
    const modLogChannel = client.guildsConfig.get(interaction.guild.id)?.config.modlogChannel;
    if (modLogChannel) {
        raw.components[0].components[0].default_values.push({
            "id": modLogChannel,
            "type": "channel"
        });
    }
    await interaction.reply(raw);
    const msg = await interaction.fetchReply();
    const filter = (i) => i.user.id === interaction.user.id;
    try {
        const collector = await msg.awaitMessageComponent({
            filter: filter,
            componentType: ComponentType.ChannelSelect,
            time: 60000
        });
        if (collector) {
            const data = collector.values[0];
            const channel = interaction.guild.channels.cache.get(data);
            const config = {
                $set: {
                    "config.modlogChannel": channel.id
                }
            };
            await client.updateGuildConfig({ guildId: interaction.guild.id, config });
            await collector.reply({
                content: client.handleLanguages("MODLOG_CHANNEL_SUCCESS", client, interaction.guildId),
                ephemeral: true
            });
        }
    }
    catch (error) {
        await handleErrors(client, error, "configFunctions.ts", interaction);
    }
}
async function muteGetAllRoles(interaction, client) {
    if (!client.guildsConfig.get(interaction.guild.id)?.config.muteGetAllRoles) {
        const config = {
            $set: {
                "config.muteGetAllRoles": true
            }
        };
        await client.updateGuildConfig({ guildId: interaction.guild.id, config });
        await interaction.reply({ content: client.handleLanguages("MUTE_GET_ALL_ROLES_TRUE", client, interaction.guildId), ephemeral: true });
    }
    else {
        const config = {
            $set: {
                "config.muteGetAllRoles": false
            }
        };
        await client.updateGuildConfig({ guildId: interaction.guild.id, config });
        await interaction.reply({ content: client.handleLanguages("MUTE_GET_ALL_ROLES_FALSE", client, interaction.guildId), ephemeral: true });
    }
}
async function staffRole(interaction, client) {
    const raw = client.handleLanguages("STAFF_ROLES_PROMPT", client, interaction.guildId);
    raw.components[0].components[0].default_values.shift();
    const staffRoles = client.guildsConfig.get(interaction.guild.id)?.config.staffRole || [];
    for (const role of staffRoles) {
        raw.components[0].components[0].default_values.push({
            "id": role,
            "type": "role"
        });
    }
    await interaction.reply(raw);
    const msg = await interaction.fetchReply();
    const filter = (i) => i.user.id === interaction.user.id;
    try {
        const collector = await msg.awaitMessageComponent({
            filter: filter,
            componentType: ComponentType.RoleSelect,
            time: 60000
        });
        if (collector) {
            const roles = collector.values;
            const config = {
                $set: {
                    "config.staffRole": roles
                }
            };
            await client.updateGuildConfig({ guildId: interaction.guild.id, config });
            await collector.reply({
                content: client.handleLanguages("STAFF_ROLES_SUCCESS", client, interaction.guildId),
                ephemeral: true
            });
        }
    }
    catch (error) {
        await handleErrors(client, error, "configFunctions.ts", interaction);
    }
}
async function modMail(interaction, client) {
    if (client.guildsConfig.get(interaction.guild.id)?.config.modmail.logChannel) {
        await interaction.reply(client.handleLanguages("MODMAIL_PROMPT", client, interaction.guildId));
        const msg = await interaction.fetchReply();
        const filter = (i) => i.user.id === interaction.user.id;
        try {
            const collector = await msg.awaitMessageComponent({ filter: filter, componentType: ComponentType.Button, time: 60000 });
            if (collector) {
                if (collector.customId === "modMailDelete") {
                    const config = {
                        $set: {
                            "config.modmail": null
                        }
                    };
                    await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                    await collector.reply({ content: client.handleLanguages("MODMAIL_DELETE", client, interaction.guildId), ephemeral: true });
                }
                else if (collector.customId === "modMailReject") {
                    await collector.reply({ content: client.handleLanguages("MODMAIL_REJECT", client, interaction.guildId), ephemeral: true });
                }
            }
        }
        catch (error) {
            await handleErrors(client, error, "configFunctions.ts", interaction);
        }
    }
    else {
        try {
            const parent = await interaction.guild.channels.create({
                name: "ModMail", type: ChannelType.GuildCategory, permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel]
                    }
                ]
            });
            const child = await parent.children.create({
                name: "ModMail Log", type: ChannelType.GuildText, permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel]
                    }
                ]
            });
            const config = {
                $set: {
                    "config.modmail": {
                        category: parent.id,
                        logChannel: child.id
                    }
                }
            };
            await client.updateGuildConfig({ guildId: interaction.guild.id, config });
            await interaction.reply({ content: client.handleLanguages("MODMAIL_SUCCESS", client, interaction.guildId), ephemeral: true });
        }
        catch (error) {
            await handleErrors(client, error, "configFunctions.ts", interaction);
        }
    }
}
async function languageHandler(interaction, client) {
    const raw = client.handleLanguages("LANGUAGE_PROMPT", client, interaction.guildId);
    const language = client.guildsConfig.get(interaction.guild.id)?.config.language;
    if (language) {
        raw.components[0].components[0].placeholder = language.charAt(0).toUpperCase() + language.slice(1);
    }
    await interaction.reply(raw);
    const msg = await interaction.fetchReply();
    const filter = (i) => i.user.id === interaction.user.id;
    try {
        const collector = await msg.awaitMessageComponent({ filter: filter, componentType: ComponentType.SelectMenu, time: 60000 });
        if (collector) {
            const data = collector.values[0];
            const config = {
                $set: {
                    "config.language": data
                }
            };
            await client.updateGuildConfig({ guildId: interaction.guild.id, config });
            await collector.reply({ content: client.handleLanguages("LANGUAGE_SUCCESS", client, interaction.guildId), ephemeral: true });
        }
    }
    catch (error) {
        await handleErrors(client, error, "configFunctions.ts", interaction);
    }
}
async function roleConfig(interaction, client) {
    await interaction.reply(client.handleLanguages("ROLE_CONFIG_PROMPT", client, interaction.guildId));
    const msg = await interaction.fetchReply();
    const filter = (i) => (i.customId === "roleConfig") && (i.user.id === interaction.user.id);
    try {
        const collector = await msg.awaitMessageComponent({ filter, componentType: ComponentType.SelectMenu, time: 60000 });
        if (collector.customId === "roleConfig") {
            switch (collector.values[0]) {
                case "memberRole":
                    await memberRole(collector, client);
                    break;
                case "maleRole":
                    await maleRole(collector, client);
                    break;
                case "femaleRole":
                    await femaleRole(collector, client);
                    break;
                case "muteRole":
                    await muteRole(collector, client);
                    break;
                case "djRole":
                    await djRole(collector, client);
                    break;
                case "dayColorRole":
                    await dayColorRole(collector, client);
            }
        }
    }
    catch (error) {
        await handleErrors(client, error, "configFunctions.ts", interaction);
    }
}
async function memberRole(interaction, client) {
    const raw = client.handleLanguages("MEMBER_ROLE_PROMPT", client, interaction.guildId);
    raw.components[0].components[0].default_values.shift();
    const memberRole = client.guildsConfig.get(interaction.guild.id)?.config.memberRole;
    if (memberRole) {
        raw.components[0].components[0].default_values.push({
            "id": memberRole,
            "type": "role"
        });
    }
    await interaction.reply(raw);
    const msg = await interaction.fetchReply();
    const filter = (i) => i.user.id === interaction.user.id;
    try {
        const collector = await msg.awaitMessageComponent({
            filter: filter,
            componentType: ComponentType.RoleSelect,
            time: 60000
        });
        if (collector) {
            const data = collector.values[0];
            const role = interaction.guild.roles.cache.get(data);
            const config = {
                $set: {
                    "config.memberRole": role.id
                }
            };
            await client.updateGuildConfig({ guildId: interaction.guild.id, config });
            await collector.reply({
                content: client.handleLanguages("MEMBER_ROLE_SUCCESS", client, interaction.guildId),
                ephemeral: true
            });
        }
    }
    catch (error) {
        await handleErrors(client, error, "configFunctions.ts", interaction);
    }
}
async function maleRole(interaction, client) {
    const raw = client.handleLanguages("MALE_ROLE_PROMPT", client, interaction.guildId);
    raw.components[0].components[0].default_values.shift();
    const maleRole = client.guildsConfig.get(interaction.guild.id)?.config.maleRole;
    if (maleRole) {
        raw.components[0].components[0].default_values.push({
            "id": maleRole,
            "type": "role"
        });
    }
    await interaction.reply(raw);
    const msg = await interaction.fetchReply();
    const filter = (i) => i.user.id === interaction.user.id;
    try {
        const collector = await msg.awaitMessageComponent({
            filter: filter,
            componentType: ComponentType.RoleSelect,
            time: 60000
        });
        if (collector) {
            const data = collector.values[0];
            const role = interaction.guild.roles.cache.get(data);
            const config = {
                $set: {
                    "config.maleRole": role.id
                }
            };
            await client.updateGuildConfig({ guildId: interaction.guild.id, config });
            await collector.reply({
                content: client.handleLanguages("MALE_ROLE_SUCCESS", client, interaction.guildId),
                ephemeral: true
            });
        }
    }
    catch (error) {
        await handleErrors(client, error, "configFunctions.ts", interaction);
    }
}
async function femaleRole(interaction, client) {
    const raw = client.handleLanguages("FEMALE_ROLE_PROMPT", client, interaction.guildId);
    raw.components[0].components[0].default_values.shift();
    const femaleRole = client.guildsConfig.get(interaction.guild.id)?.config.femaleRole;
    if (femaleRole) {
        raw.components[0].components[0].default_values.push({
            "id": femaleRole,
            "type": "role"
        });
    }
    await interaction.reply(raw);
    const msg = await interaction.fetchReply();
    const filter = (i) => i.user.id === interaction.user.id;
    try {
        const collector = await msg.awaitMessageComponent({
            filter: filter,
            componentType: ComponentType.RoleSelect,
            time: 60000
        });
        if (collector) {
            const data = collector.values[0];
            const role = interaction.guild.roles.cache.get(data);
            const config = {
                $set: {
                    "config.femaleRole": role.id
                }
            };
            await client.updateGuildConfig({ guildId: interaction.guild.id, config });
            await collector.reply({
                content: client.handleLanguages("FEMALE_ROLE_SUCCESS", client, interaction.guildId),
                ephemeral: true
            });
        }
    }
    catch (error) {
        await handleErrors(client, error, "configFunctions.ts", interaction);
    }
}
async function muteRole(interaction, client) {
    const raw = client.handleLanguages("MUTE_ROLE_PROMPT", client, interaction.guildId);
    raw.components[0].components[0].default_values.shift();
    const muteRole = client.guildsConfig.get(interaction.guild.id)?.config.muteRole;
    if (muteRole) {
        raw.components[0].components[0].default_values.push({
            "id": muteRole,
            "type": "role"
        });
    }
    await interaction.reply(raw);
    const msg = await interaction.fetchReply();
    const filter = (i) => i.user.id === interaction.user.id;
    try {
        const collector = await msg.awaitMessageComponent({
            filter: filter,
            componentType: ComponentType.RoleSelect,
            time: 60000
        });
        if (collector) {
            const data = collector.values[0];
            const role = interaction.guild.roles.cache.get(data);
            const config = {
                $set: {
                    "config.muteRole": role.id
                }
            };
            await client.updateGuildConfig({ guildId: interaction.guild.id, config });
            await collector.reply({
                content: client.handleLanguages("MUTE_ROLE_SUCCESS", client, interaction.guildId),
                ephemeral: true
            });
        }
    }
    catch (error) {
        await handleErrors(client, error, "configFunctions.ts", interaction);
    }
}
async function djRole(interaction, client) {
    const raw = client.handleLanguages("DJ_ROLE_PROMPT", client, interaction.guildId);
    raw.components[0].components[0].default_values.shift();
    const djRole = client.guildsConfig.get(interaction.guild.id)?.config.djRole;
    if (djRole) {
        raw.components[0].components[0].default_values.push({
            "id": djRole,
            "type": "role"
        });
    }
    await interaction.reply(raw);
    const msg = await interaction.fetchReply();
    const filter = (i) => i.user.id === interaction.user.id;
    try {
        const collector = await msg.awaitMessageComponent({
            filter: filter,
            componentType: ComponentType.RoleSelect,
            time: 60000
        });
        if (collector) {
            const data = collector.values[0];
            const role = interaction.guild.roles.cache.get(data);
            const config = {
                $set: {
                    "config.djRole": role.id
                }
            };
            await client.updateGuildConfig({ guildId: interaction.guild.id, config });
            await collector.reply({
                content: client.handleLanguages("DJ_ROLE_SUCCESS", client, interaction.guildId),
                ephemeral: true
            });
        }
    }
    catch (error) {
        await handleErrors(client, error, "configFunctions.ts", interaction);
    }
}
async function dayColorRole(interaction, client) {
    const raw = client.handleLanguages("COLOUR_OF_THE_DAY_ROLE_PROMPT", client, interaction.guildId);
    raw.components[0].components[0].default_values.shift();
    const dayColorRole = client.guildsConfig.get(interaction.guild.id)?.config.roleOfTheDay;
    if (dayColorRole) {
        raw.components[0].components[0].default_values.push({
            "id": dayColorRole,
            "type": "role"
        });
    }
    await interaction.reply(raw);
    const msg = await interaction.fetchReply();
    const filter = (i) => i.user.id === interaction.user.id;
    try {
        const collector = await msg.awaitMessageComponent({
            filter: filter,
            componentType: ComponentType.RoleSelect,
            time: 60000
        });
        if (collector) {
            const data = collector.values[0];
            const role = interaction.guild.roles.cache.get(data);
            const config = {
                $set: {
                    "config.roleOfTheDay": role.id
                }
            };
            await client.updateGuildConfig({ guildId: interaction.guild.id, config });
            await collector.reply({
                content: client.handleLanguages("COLOUR_OF_THE_DAY_ROLE_SUCCESS", client, interaction.guildId),
                ephemeral: true
            });
        }
    }
    catch (error) {
        await handleErrors(client, error, "configFunctions.ts", interaction);
    }
}
async function miscConfig(interaction, client) {
    await interaction.reply(client.handleLanguages("MISC_CONFIG_PROMPT", client, interaction.guildId));
    const msg = await interaction.fetchReply();
    const filter = (i) => i.customId === "miscConfig" && i.user.id === interaction.user.id;
    try {
        const collector = await msg.awaitMessageComponent({
            filter,
            componentType: ComponentType.SelectMenu,
            time: 60000
        });
        if (collector.customId === "miscConfig") {
            switch (collector.values[0]) {
                case "bumpLeaderboardChannel":
                    await bumpLeaderboardChannel(collector, client);
                    break;
            }
        }
    }
    catch (error) {
        await handleErrors(client, error, "configFunctions.ts", interaction);
    }
}
async function bumpLeaderboardChannel(interaction, client) {
    const raw = client.handleLanguages("BUMP_LEADERBOARD_CHANNEL_PROMPT", client, interaction.guildId);
    raw.components[0].components[0].default_values.shift();
    const bumpLeaderboardChannel = client.guildsConfig.get(interaction.guild.id)?.config.bumpLeaderboardChannel;
    if (bumpLeaderboardChannel) {
        raw.components[0].components[0].default_values.push({
            "id": bumpLeaderboardChannel,
            "type": "channel"
        });
    }
    await interaction.reply(raw);
    const msg = await interaction.fetchReply();
    const filter = (i) => i.user.id === interaction.user.id;
    try {
        const collector = await msg.awaitMessageComponent({
            filter: filter,
            componentType: ComponentType.ChannelSelect,
            time: 60000
        });
        if (collector) {
            const data = collector.values[0];
            const channel = interaction.guild.channels.cache.get(data);
            const config = {
                $set: {
                    "config.bumpLeaderboardChannel": channel.id
                }
            };
            await client.updateGuildConfig({ guildId: interaction.guild.id, config });
            await collector.reply({
                content: client.handleLanguages("BUMP_LEADERBOARD_CHANNEL_SUCCESS", client, interaction.guildId),
                ephemeral: true
            });
        }
    }
    catch (error) {
        await handleErrors(client, error, "configFunctions.ts", interaction);
    }
}
export { registerConfig, welcomeConfig, moderationConfig, roleConfig, miscConfig };
//# sourceMappingURL=configFunctions.js.map