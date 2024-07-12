// noinspection DuplicatedCode

import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    ChatInputCommandInteraction,
    ComponentType,
    Message,
    MessageComponentInteraction,
    ModalSubmitInteraction,
    SelectMenuInteraction,
    RoleSelectMenuBuilder, RoleSelectMenuInteraction, PermissionsBitField, TextChannel, Role
} from "discord.js";
import {KhaxyClient} from "../types";

async function registerConfig(interaction: ChatInputCommandInteraction, client: KhaxyClient) {
    const SelectMenu = client.handleLanguages("REGISTER_CONFIG_PROMPT", client, interaction.guildId!)
    await interaction.reply(SelectMenu)
    const selectMsg = await interaction.fetchReply() as Message
    const selectFilter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id
    try {
        const selectCollector = await selectMsg.awaitMessageComponent({
            filter: selectFilter,
            componentType: ComponentType.SelectMenu,
            time: 60000
        })
        if (selectCollector.customId === "registerConfig") {
            switch (selectCollector.values[0]) {
                case "registerChannel":
                    await registerChannel(selectCollector, client)
                    break
                case "staffRole":
                    await staffRole(selectCollector, client)
                    break
                case "registerMessage":
                    await registerMessage(selectCollector, client)
                    break
                case "registerMessageClear":
                    await registerMessageClear(selectCollector, client)
                    break
                case "registerChannelClear":
                    await registerChannelClear(selectCollector, client)
                    break
            }
        }
    } catch (error) {
        await interaction.followUp({
            content: client.handleLanguages("REGISTER_CONFIG_EXPIRED", client, interaction.guildId!),
            ephemeral: true
        })
        console.log(error)
    }
}

async function registerChannel(interaction: SelectMenuInteraction, client: KhaxyClient) {
    if (client.guildsConfig.get(interaction.guild!.id)?.config.registerChannel) {
        const raw = client.handleLanguages("REGISTER_CHANNEL_ALREADY_SETUP", client, interaction.guildId!)
        await interaction.reply(raw)
        const msg = await interaction.fetchReply() as Message
        const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id
        try {
            const collector = await msg.awaitMessageComponent({
                filter: filter,
                componentType: ComponentType.Button,
                time: 60000
            })
            if (collector.customId === "registerChannelReject") {
                await collector.reply({
                    content: client.handleLanguages("REGISTER_CHANNEL_CANCEL", client, interaction.guildId!),
                    ephemeral: true
                })
            } else if (collector.customId === "registerChannelAccept") {
                const channelSelect = client.handleLanguages("REGISTER_CHANNEL_ACCEPT", client, interaction.guildId!)
                await collector.reply(channelSelect)
                const msg = await collector.fetchReply() as Message
                const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id
                try {
                    const collector = await msg.awaitMessageComponent({
                        filter: filter,
                        componentType: ComponentType.ChannelSelect,
                        time: 60000
                    })
                    if (collector) {

                        const data = collector.values[0]
                        const channel = interaction.guild!.channels.cache.get(data) as TextChannel

                        const config = {
                            $set: {
                                "config.registerChannel": channel.id
                            }
                        }
                        await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                        await collector.reply({
                            content: client.handleLanguages("REGISTER_CHANNEL_ACCEPT_SUCCESS", client, interaction.guildId!),
                            ephemeral: true
                        })
                    }
                } catch (error) {
                    console.log(error)
                    await interaction.followUp({
                        content: client.handleLanguages("REGISTER_CHANNEL_ERROR_OR_EXPIRED", client, interaction.guildId!),
                        ephemeral: true
                    })
                }
            } else if (collector.customId === "registerChannelDelete") {
                const config = {
                    $set: {
                        "config.registerChannel": null
                    }
                }
                await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                await collector.reply({
                    content: client.handleLanguages("REGISTER_CHANNEL_DELETED", client, interaction.guildId!),
                    components: [],
                    ephemeral: true
                })
            }
        } catch (error) {
            console.log(error)
            await interaction.followUp({
                content: client.handleLanguages("REGISTER_CHANNEL_ERROR_OR_EXPIRED", client, interaction.guildId!),
                ephemeral: true
            })
        }
    } else {
        const channelSelect = client.handleLanguages("REGISTER_CHANNEL_ACCEPT", client, interaction.guildId!)
        await interaction.reply(channelSelect)
        const msg = await interaction.fetchReply() as Message
        const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id
        try {
            const collector = await msg.awaitMessageComponent({
                filter: filter,
                componentType: ComponentType.ChannelSelect,
                time: 60000
            })
            if (collector) {

                const data = collector.values[0]
                const channel = interaction.guild!.channels.cache.get(data) as TextChannel

                const config = {
                    $set: {
                        "config.registerChannel": channel.id
                    }
                }
                await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                await collector.reply({
                    content: client.handleLanguages("REGISTER_CHANNEL_ACCEPT_SUCCESS", client, interaction.guildId!),
                    ephemeral: true
                })
            }
        } catch (error) {
            console.log(error)
            await interaction.followUp({
                content: client.handleLanguages("REGISTER_CHANNEL_ERROR_OR_EXPIRED", client, interaction.guildId!),
                ephemeral: true
            })
        }
    }
}

async function staffRole(interaction: SelectMenuInteraction, client: KhaxyClient) {
    const raw = client.handleLanguages("STAFF_ROLES_PROMPT", client, interaction.guildId!)
    raw.components[0].components[0].default_values.shift()
    const staffRoles = client.guildsConfig.get(interaction.guild!.id)?.config.staffRole || []
    for (const role of staffRoles) {
        raw.components[0].components[0].default_values.push({
            "id": role,
            "type": "role"
        })
    }
    //Discord typing doesn't match with the API so it complains about the type
    //@ts-ignore
    await interaction.reply(raw)
    const msg = await interaction.fetchReply()
    const filter = (i: RoleSelectMenuInteraction) => i.user.id === interaction.user.id
    try {
        const collector = await msg.awaitMessageComponent({
            filter: filter,
            componentType: ComponentType.RoleSelect,
            time: 60000
        })
        if (collector) {
            const roles = collector.values
            const config = {
                $set: {
                    "config.staffRole": roles
                }
            }
            await client.updateGuildConfig({guildId: interaction.guild!.id, config})
            await collector.reply({
                content: client.handleLanguages("STAFF_ROLES_SUCCESS", client, interaction.guildId!),
                ephemeral: true
            })
        }
    } catch (error) {
        await interaction.followUp({
            content: client.handleLanguages("STAFF_ROLES_ERROR_OR_EXPIRED", client, interaction.guildId!),
            ephemeral: true
        })
        console.error(error)
    }
}

async function registerMessage(interaction: SelectMenuInteraction, client: KhaxyClient) {
    if (client.guildsConfig.get(interaction.guild!.id)?.config.registerMessage) {
        const raw = client.handleLanguages("REGISTER_MESSAGE_ALREADY_SETUP", client, interaction.guildId!)
        await interaction.reply(raw)
        const msg = await interaction.fetchReply() as Message
        const buttonFilter = (i: MessageComponentInteraction) => (i.customId === "staffRoleReject" || i.customId === "staffRoleAccept" || i.customId === "staffRoleDelete") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({
                filter: buttonFilter,
                componentType: ComponentType.Button,
                time: 60000
            })
            if (collector) {
                if (collector.customId === "registerMessageReject") {
                    await collector.reply({
                        content: client.handleLanguages("REGISTER_MESSAGE_CANCEL", client, interaction.guildId!),
                        components: [],
                        ephemeral: true
                    })
                } else if (collector.customId === "registerMessageRoleAccept") {
                    const modal = client.handleLanguages("REGISTER_MESSAGE_MODAL", client, interaction.guildId!)

                    await collector.reply(client.handleLanguages("REGISTER_MESSAGE_SETUP", client, interaction.guildId!))
                    const msg = await collector.fetchReply() as Message
                    const buttonFilter = (i: MessageComponentInteraction) => (i.customId === "registerMessage") && (i.user.id === interaction.user.id);
                    try {
                        const collector = await msg.awaitMessageComponent({
                            filter: buttonFilter,
                            componentType: ComponentType.Button,
                            time: 60000
                        })
                        if (collector) {
                            await collector.showModal(modal)
                            const filter = (i: ModalSubmitInteraction) => i.customId === "registerMessage" && i.user.id === interaction.user.id
                            try {
                                const collector = await interaction.awaitModalSubmit({filter, time: 60000})
                                const data = collector.fields.getTextInputValue("registerMessage")
                                const config = {
                                    $set: {
                                        "config.registerMessage": data
                                    }
                                }
                                await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                                await collector.reply({
                                    content: client.handleLanguages("REGISTER_MESSAGE_SUCCESS", client, interaction.guildId!),
                                    ephemeral: true
                                })
                            } catch (e) {
                                await collector.reply({
                                    content: client.handleLanguages("REGISTER_MESSAGE_ERROR_OR_EXPIRED", client, interaction.guildId!),
                                    ephemeral: true
                                })
                                console.log(e)
                            }
                        }
                    } catch (e) {
                        await interaction.followUp({
                            content: client.handleLanguages("REGISTER_MESSAGE_ERROR_OR_EXPIRED", client, interaction.guildId!),
                            ephemeral: true
                        })
                        console.log(e)
                    }
                } else if (collector.customId === "registerMessageDelete") {
                    const config = {
                        $set: {
                            "config.registerMessage": null
                        }
                    }
                    await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                    await collector.reply({
                        content: client.handleLanguages("REGISTER_MESSAGE_DELETED", client, interaction.guildId!),
                        ephemeral: true
                    })
                }
            }
        } catch (e) {
            await interaction.reply({
                content: client.handleLanguages("REGISTER_MESSAGE_ERROR_OR_EXPIRED", client, interaction.guildId!),
                ephemeral: true
            })
            console.log(e)
        }
    } else {
        const modal = client.handleLanguages("REGISTER_MESSAGE_MODAL", client, interaction.guildId!)

        await interaction.reply(client.handleLanguages("REGISTER_MESSAGE_SETUP", client, interaction.guildId!))
        const msg = await interaction.fetchReply() as Message
        const buttonFilter = (i: MessageComponentInteraction) => (i.customId === "registerMessage") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({
                filter: buttonFilter,
                componentType: ComponentType.Button,
                time: 60000
            })
            if (collector) {
                await collector.showModal(modal)
                const filter = (i: ModalSubmitInteraction) => i.customId === "registerMessage" && i.user.id === interaction.user.id
                try {
                    const collector = await interaction.awaitModalSubmit({filter, time: 60000})
                    const data = collector.fields.getTextInputValue("registerMessage")
                    const config = {
                        $set: {
                            "config.registerMessage": data
                        }
                    }
                    await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                    await collector.reply({
                        content: client.handleLanguages("REGISTER_MESSAGE_SUCCESS", client, interaction.guildId!),
                        ephemeral: true
                    })
                } catch (e) {
                    await collector.reply({
                        content: client.handleLanguages("REGISTER_MESSAGE_ERROR_OR_EXPIRED", client, interaction.guildId!),
                        ephemeral: true
                    })
                    console.log(e)
                }
            }
        } catch (e) {
            await interaction.followUp({
                content: client.handleLanguages("REGISTER_MESSAGE_ERROR_OR_EXPIRED", client, interaction.guildId!),
                ephemeral: true
            })
            console.log(e)
        }
    }
}

async function registerMessageClear(interaction: SelectMenuInteraction, client: KhaxyClient) {
    if (!client.guildsConfig.get(interaction.guild!.id)?.config.registerMessageClear) {
        const config = {
            $set: {
                "config.registerMessageClear": true
            }
        }
        await client.updateGuildConfig({guildId: interaction.guild!.id, config})
        await interaction.reply({
            content: client.handleLanguages("REGISTER_MESSAGE_DELETE_TRUE", client, interaction.guildId!),
            ephemeral: true
        })
    } else {
        const config = {
            $set: {
                "config.registerMessageClear": false
            }
        }
        await client.updateGuildConfig({guildId: interaction.guild!.id, config})
        await interaction.reply({
            content: client.handleLanguages("REGISTER_MESSAGE_DELETE_FALSE", client, interaction.guildId!),
            ephemeral: true
        })
    }
}

async function registerChannelClear(interaction: SelectMenuInteraction, client: KhaxyClient) {
    if (!client.guildsConfig.get(interaction.guild!.id)?.config.registerChannelClear) {
        const config = {
            $set: {
                "config.registerChannelClear": true
            }
        }
        await client.updateGuildConfig({guildId: interaction.guild!.id, config})
        await interaction.reply({
            content: client.handleLanguages("REGISTER_CHANNEL_DELETE_TRUE", client, interaction.guildId!),
            ephemeral: true
        })
    } else {
        const config = {
            $set: {
                "config.registerChannelClear": false
            }
        }
        await client.updateGuildConfig({guildId: interaction.guild!.id, config})
        await interaction.reply({
            content: client.handleLanguages("REGISTER_CHANNEL_DELETE_TRUE", client, interaction.guildId!),
            ephemeral: true
        })
    }
}

async function welcomeConfig(interaction: ChatInputCommandInteraction, client: KhaxyClient) {
    await interaction.reply(client.handleLanguages("WELCOME_CONFIG_PROMPT", client, interaction.guildId!))
    const msg = await interaction.fetchReply() as Message
    const filter = (i: SelectMenuInteraction) => i.customId === "welcomeConfig" && i.user.id === interaction.user.id
    try {
        const collector = await msg.awaitMessageComponent({
            filter,
            componentType: ComponentType.SelectMenu,
            time: 60000
        })
        if (collector) {
            switch (collector.values[0]) {
                case "welcomeChannel":
                    await welcomeChannel(collector, client)
                    break
                case "welcomeMessage":
                    await welcomeMessage(collector, client)
                    break
                case "goodbyeChannel":
                    await goodbyeChannel(collector, client)
                    break
                case "goodbyeMessage":
                    await goodbyeMessage(collector, client)
                    break
                case "registerChannel":
                    await registerMessageChannel(collector, client)
                    break
            }
        }
    } catch (e) {
        await interaction.followUp({
            content: client.handleLanguages("WELCOME_CONFIG_ERROR_OR_EXPIRED", client, interaction.guildId!),
            ephemeral: true
        })
        console.log(e)
    }
}

async function welcomeChannel(interaction: SelectMenuInteraction, client: KhaxyClient) {
    const raw = client.handleLanguages("WELCOME_CHANNEL_PROMPT", client, interaction.guildId!)
    raw.components[0].components[0].default_values.shift()
    const welcomeChannel = client.guildsConfig.get(interaction.guild!.id)?.config.welcomeChannel
    if (welcomeChannel) {
        raw.components[0].components[0].default_values.push({
            "id": welcomeChannel,
            "type": "channel"
        })
    }
    //@ts-ignore
    await interaction.reply(raw)
    const msg = await interaction.fetchReply() as Message
    const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id
    try {
        const collector = await msg.awaitMessageComponent({
            filter: filter,
            componentType: ComponentType.ChannelSelect,
            time: 60000
        })
        if (collector) {
            const data = collector.values[0]
            const channel = interaction.guild!.channels.cache.get(data) as TextChannel
            const config = {
                $set: {
                    "config.welcomeChannel": channel.id
                }
            }
            await client.updateGuildConfig({guildId: interaction.guild!.id, config})
            await collector.reply({
                content: client.handleLanguages("WELCOME_CHANNEL_SUCCESS", client, interaction.guildId!),
                ephemeral: true
            })
        }
    } catch (error) {
        await interaction.followUp({
            content: client.handleLanguages("WELCOME_CHANNEL_ERROR_OR_EXPIRED", client, interaction.guildId!),
            ephemeral: true
        })
        console.error(error)
    }
}

async function welcomeMessage(interaction: SelectMenuInteraction, client: KhaxyClient) {
    if (client.guildsConfig.get(interaction.guild!.id)?.config.welcomeMessage) {
        await interaction.reply(client.handleLanguages("WELCOME_MESSAGE_ALREADY_SETUP", client, interaction.guildId!))
        const msg = await interaction.fetchReply() as Message
        const buttonFilter = (i: MessageComponentInteraction) => (i.customId === "welcomeMessageReject" || i.customId === "welcomeMessageAccept" || i.customId === "welcomeMessageDelete") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({
                filter: buttonFilter,
                componentType: ComponentType.Button,
                time: 60000
            })
            if (collector.customId === "welcomeMessageReject") {
                await collector.reply({
                    content: client.handleLanguages("WELCOME_MESSAGE_CANCEL", client, interaction.guildId!),
                    ephemeral: true
                })
            } else if (collector.customId === "welcomeMessageAccept") {
                await collector.reply(client.handleLanguages("WELCOME_MESSAGE_SETUP", client, interaction.guildId!))
                const msg = await collector.fetchReply() as Message
                const buttonFilter = (i: MessageComponentInteraction) => (i.customId === "welcomeMessage") && (i.user.id === interaction.user.id);
                try {
                    const modalcollector = await msg.awaitMessageComponent({
                        filter: buttonFilter,
                        componentType: ComponentType.Button,
                        time: 60000
                    })
                    if (modalcollector) {
                        await modalcollector.showModal(client.handleLanguages("WELCOME_MESSAGE_MODAL", client, interaction.guildId!))
                        const filter = (i: ModalSubmitInteraction) => i.customId === "welcomeMessage" && i.user.id === interaction.user.id
                        try {
                            const collector = await modalcollector.awaitModalSubmit({filter, time: 60000})
                            const data = collector.fields.getTextInputValue("welcomeMessage")
                            const config = {
                                $set: {
                                    "config.welcomeMessage": data
                                }
                            }
                            await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                            await collector.reply({
                                content: client.handleLanguages("WELCOME_MESSAGE_SUCCESS", client, interaction.guildId!),
                                ephemeral: true
                            })
                        } catch (e) {
                            await modalcollector.followUp({
                                content: client.handleLanguages("WELCOME_MESSAGE_ERROR_OR_EXPIRED", client, interaction.guildId!),
                                ephemeral: true
                            })
                            console.log(e)
                        }
                    }
                } catch (e) {
                    await interaction.followUp({
                        content: client.handleLanguages("WELCOME_MESSAGE_ERROR_OR_EXPIRED", client, interaction.guildId!),
                        ephemeral: true
                    })
                    console.log(e)
                }
            } else if (collector.customId === "welcomeMessageDelete") {
                const config = {
                    $set: {
                        "config.welcomeMessage": null
                    }
                }
                await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                await collector.reply({
                    content: client.handleLanguages("WELCOME_MESSAGE_DELETED", client, interaction.guildId!),
                    ephemeral: true
                })
            }
        } catch (e) {
            await interaction.followUp({
                content: client.handleLanguages("WELCOME_MESSAGE_ERROR_OR_EXPIRED", client, interaction.guildId!),
                ephemeral: true
            })
            console.log(e)
        }
    } else {
        await interaction.reply(client.handleLanguages("WELCOME_MESSAGE_SETUP", client, interaction.guildId!))
        const msg = await interaction.fetchReply() as Message
        const buttonFilter = (i: MessageComponentInteraction) => (i.customId === "welcomeMessage") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({
                filter: buttonFilter,
                componentType: ComponentType.Button,
                time: 60000
            })
            if (collector) {
                await collector.showModal(client.handleLanguages("WELCOME_MESSAGE_MODAL", client, interaction.guildId!))
                const filter = (i: ModalSubmitInteraction) => i.customId === "welcomeMessage" && i.user.id === interaction.user.id
                try {
                    const collector = await interaction.awaitModalSubmit({filter, time: 60000})
                    const data = collector.fields.getTextInputValue("welcomeMessage")
                    const config = {
                        $set: {
                            "config.welcomeMessage": data
                        }
                    }
                    await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                    await collector.reply({
                        content: client.handleLanguages("WELCOME_MESSAGE_SUCCESS", client, interaction.guildId!),
                        ephemeral: true
                    })
                } catch (e) {
                    await collector.reply({
                        content: client.handleLanguages("WELCOME_MESSAGE_ERROR_OR_EXPIRED", client, interaction.guildId!),
                        ephemeral: true
                    })
                    console.log(e)
                }
            }
        } catch (e) {
            await interaction.followUp({
                content: client.handleLanguages("WELCOME_MESSAGE_ERROR_OR_EXPIRED", client, interaction.guildId!),
                ephemeral: true
            })
            console.log(e)
        }
    }
}

async function goodbyeChannel(interaction: SelectMenuInteraction, client: KhaxyClient) {
    const raw = client.handleLanguages("GOODBYE_CHANNEL_PROMPT", client, interaction.guildId!)
    raw.components[0].components[0].default_values.shift()
    const goodbyeChannel = client.guildsConfig.get(interaction.guild!.id)?.config.leaveChannel
    if (goodbyeChannel) {
        raw.components[0].components[0].default_values.push({
            "id": goodbyeChannel,
            "type": "channel"
        })
    }
    //@ts-ignore
    await interaction.reply(raw)
    const msg = await interaction.fetchReply() as Message
    const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id
    try {
        const collector = await msg.awaitMessageComponent({
            filter: filter,
            componentType: ComponentType.ChannelSelect,
            time: 60000
        })
        if (collector) {
            const data = collector.values[0]
            const channel = interaction.guild!.channels.cache.get(data) as TextChannel
            const config = {
                $set: {
                    "config.goodbyeChannel": channel.id
                }
            }
            await client.updateGuildConfig({guildId: interaction.guild!.id, config})
            await collector.reply({
                content: client.handleLanguages("GOODBYE_CHANNEL_SUCCESS", client, interaction.guildId!),
                ephemeral: true
            })
        }
    } catch (error) {
        await interaction.followUp({
            content: client.handleLanguages("GOODBYE_CHANNEL_ERROR_OR_EXPIRED", client, interaction.guildId!),
            ephemeral: true
        })
        console.error(error)
    }
}

async function goodbyeMessage(interaction: SelectMenuInteraction, client: KhaxyClient) {
    if (client.guildsConfig.get(interaction.guild!.id)?.config.leaveMessage) {
        await interaction.reply(client.handleLanguages("GOODBYE_MESSAGE_ALREADY_SETUP", client, interaction.guildId!))
        const filter = (i: MessageComponentInteraction) => (i.customId === "goodByeMessageReject" || i.customId === "goodByeMessageAccept" || i.customId === "registerChannelDelete") && (i.user.id === interaction.user.id);
        try {
            const collector = await interaction.fetchReply() as Message
            const collector2 = await collector.awaitMessageComponent({
                filter,
                componentType: ComponentType.Button,
                time: 60000
            })
            if (collector2) {
                if (collector2.customId === "goodByeMessageReject") {
                    await collector2.reply({
                        content: client.handleLanguages("GOODBYE_MESSAGE_CANCEL", client, interaction.guildId!),
                        ephemeral: true
                    })
                } else if (collector2.customId === "goodByeMessageAccept") {
                    await collector2.reply(client.handleLanguages("GOODBYE_MESSAGE_SETUP", client, interaction.guildId!))
                    const msg = await collector2.fetchReply() as Message
                    const buttonFilter = (i: MessageComponentInteraction) => (i.customId === "goodbyeMessage") && (i.user.id === interaction.user.id);
                    try {
                        const modalcollector = await msg.awaitMessageComponent({
                            filter: buttonFilter,
                            componentType: ComponentType.Button,
                            time: 60000
                        })
                        if (modalcollector) {
                            await modalcollector.showModal(client.handleLanguages("GOODBYE_MESSAGE_MODAL", client, interaction.guildId!))
                            const filter = (i: ModalSubmitInteraction) => i.customId === "goodbyeMessage" && i.user.id === interaction.user.id
                            try {
                                const collector = await modalcollector.awaitModalSubmit({filter, time: 60000})
                                const data = collector.fields.getTextInputValue("goodbyeMessage")
                                const config = {
                                    $set: {
                                        "config.leaveMessage": data
                                    }
                                }
                                await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                                await collector.reply({
                                    content: client.handleLanguages("GOODBYE_MESSAGE_SUCCESS", client, interaction.guildId!),
                                    ephemeral: true
                                })
                            } catch (e) {
                                await modalcollector.followUp({
                                    content: client.handleLanguages("GOODBYE_MESSAGE_ERROR_OR_EXPIRED", client, interaction.guildId!),
                                    ephemeral: true
                                })
                                console.log(e)
                            }
                        }
                    } catch (e) {
                        await interaction.followUp({
                            content: client.handleLanguages("GOODBYE_MESSAGE_ERROR_OR_EXPIRED", client, interaction.guildId!),
                            ephemeral: true
                        })
                        console.log(e)
                    }
                } else if (collector2.customId === "goodByeMessageDelete") {
                    const config = {
                        $set: {
                            "config.leaveMessage": null
                        }
                    }
                    await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                    await collector2.reply({
                        content: client.handleLanguages("GOODBYE_MESSAGE_DELETED", client, interaction.guildId!),
                        ephemeral: true
                    })
                }
            }
        } catch (e) {
            await interaction.followUp({
                content: client.handleLanguages("GOODBYE_MESSAGE_ERROR_OR_EXPIRED", client, interaction.guildId!),
                ephemeral: true
            })
            console.log(e)
        }
    } else {
        await interaction.reply(client.handleLanguages("GOODBYE_MESSAGE_SETUP", client, interaction.guildId!))
        const msg = await interaction.fetchReply() as Message
        const buttonFilter = (i: MessageComponentInteraction) => (i.customId === "goodbyeMessage") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({
                filter: buttonFilter,
                componentType: ComponentType.Button,
                time: 60000
            })
            if (collector) {
                await collector.showModal(client.handleLanguages("GOODBYE_MESSAGE_MODAL", client, interaction.guildId!))
                const filter = (i: ModalSubmitInteraction) => i.customId === "goodbyeMessage" && i.user.id === interaction.user.id
                try {
                    const collector = await interaction.awaitModalSubmit({filter, time: 60000})
                    const data = collector.fields.getTextInputValue("goodbyeMessage")
                    const config = {
                        $set: {
                            "config.leaveMessage": data
                        }
                    }
                    await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                    await collector.reply({
                        content: client.handleLanguages("GOODBYE_MESSAGE_SUCCESS", client, interaction.guildId!),
                        ephemeral: true
                    })
                } catch (e) {
                    await collector.reply({
                        content: client.handleLanguages("GOODBYE_MESSAGE_ERROR_OR_EXPIRED", client, interaction.guildId!),
                        ephemeral: true
                    })
                    console.log(e)
                }
            }
        } catch (e) {
            await interaction.followUp({
                content: client.handleLanguages("GOODBYE_MESSAGE_ERROR_OR_EXPIRED", client, interaction.guildId!),
                ephemeral: true
            })
            console.log(e)
        }
    }
}

async function registerMessageChannel(interaction: SelectMenuInteraction, client: KhaxyClient) {
    const raw = client.handleLanguages("REGISTER_MESSAGE_CHANNEL_PROMPT", client, interaction.guildId!)
    raw.components[0].components[0].default_values.shift()
    const registerChannel = client.guildsConfig.get(interaction.guild!.id)?.config.registerChannel
    if (registerChannel) {
        raw.components[0].components[0].default_values.push({
            "id": registerChannel,
            "type": "channel"
        })
    }
    //@ts-ignore
    await interaction.reply(raw)
    const msg = await interaction.fetchReply() as Message
    const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id
    try {
        const collector = await msg.awaitMessageComponent({
            filter: filter,
            componentType: ComponentType.ChannelSelect,
            time: 60000
        })
        if (collector) {
            const data = collector.values[0]
            const channel = interaction.guild!.channels.cache.get(data) as TextChannel
            const config = {
                $set: {
                    "config.registerChannel": channel.id
                }
            }
            await client.updateGuildConfig({guildId: interaction.guild!.id, config})
            await collector.reply({
                content: client.handleLanguages("REGISTER_MESSAGE_CHANNEL_SUCCESS", client, interaction.guildId!),
                ephemeral: true
            })
        }
    } catch (error) {
        await interaction.followUp({
            content: client.handleLanguages("REGISTER_MESSAGE_CHANNEL_ERROR_OR_EXPIRED", client, interaction.guildId!),
            ephemeral: true
        })
        console.error(error)
    }
}

async function moderationConfig(interaction: ChatInputCommandInteraction, client: KhaxyClient) {

    await interaction.reply(client.handleLanguages("MODERATION_CONFIG_PROMPT", client, interaction.guildId!))
    const msg = await interaction.fetchReply() as Message
    const filter = (i: SelectMenuInteraction) => (i.customId === "moderationConfig" || i.customId === "muteGetAllRoles") && i.user.id === interaction.user.id
    try {
        const collector = await msg.awaitMessageComponent({
            filter,
            componentType: ComponentType.SelectMenu,
            time: 60000
        })
        if (collector.customId === "moderationConfig") {
            switch (collector.values[0]) {
                case "modLogChannel":
                    await modLogChannel(collector, client)
                    break;
                case "muteGetAllRoles":
                    await muteGetAllRoles(collector, client)
                    break;
                case "modMail":
                    await modMail(collector, client)
                    break;
            }
        }
    } catch (e) {
        await interaction.followUp({
            content: client.handleLanguages("MODERATION_CONFIG_ERROR_OR_EXPIRED", client, interaction.guildId!),
            ephemeral: true
        })
        console.log(e)
    }
}

async function modLogChannel(interaction: SelectMenuInteraction, client: KhaxyClient) {
    const raw = client.handleLanguages("MODLOG_CHANNEL_PROMPT", client, interaction.guildId!)
    raw.components[0].components[0].default_values.shift()
    const modLogChannel = client.guildsConfig.get(interaction.guild!.id)?.config.modlogChannel
    if (modLogChannel) {
        raw.components[0].components[0].default_values.push({
            "id": modLogChannel,
            "type": "channel"
        })
    }
    //@ts-ignore
    await interaction.reply(raw)
    const msg = await interaction.fetchReply() as Message
    const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id
    try {
        const collector = await msg.awaitMessageComponent({
            filter: filter,
            componentType: ComponentType.ChannelSelect,
            time: 60000
        })
        if (collector) {
            const data = collector.values[0]
            const channel = interaction.guild!.channels.cache.get(data) as TextChannel
            const config = {
                $set: {
                    "config.modLogChannel": channel.id
                }
            }
            await client.updateGuildConfig({guildId: interaction.guild!.id, config})
            await collector.reply({
                content: client.handleLanguages("MODLOG_CHANNEL_SUCCESS", client, interaction.guildId!),
                ephemeral: true
            })
        }
    } catch (error) {
        await interaction.followUp({
            content: client.handleLanguages("MODLOG_CHANNEL_ERROR_OR_EXPIRED", client, interaction.guildId!),
            ephemeral: true
        })
        console.error(error)
    }
}

async function muteGetAllRoles(interaction: SelectMenuInteraction, client: KhaxyClient) {
    if(!client.guildsConfig.get(interaction.guild!.id)?.config.muteGetAllRoles) {
        const config = {
            $set: {
                "config.muteGetAllRoles": true
            }
        }
        await client.updateGuildConfig({guildId: interaction.guild!.id, config})
        await interaction.reply({content: client.handleLanguages("MUTE_GET_ALL_ROLES_TRUE", client, interaction.guildId!), ephemeral: true})
    } else {
        const config = {
            $set: {
                "config.muteGetAllRoles": false
            }
        }
        await client.updateGuildConfig({guildId: interaction.guild!.id, config})
        await interaction.reply({content: client.handleLanguages("MUTE_GET_ALL_ROLES_FALSE", client, interaction.guildId!), ephemeral: true})
    }
}

async function modMail(interaction: SelectMenuInteraction, client: KhaxyClient) {
    if(client.guildsConfig.get(interaction.guild!.id)?.config.modmail.logChannel) {

        await interaction.reply(client.handleLanguages("MODMAIL_PROMPT", client, interaction.guildId!))
        const msg = await interaction.fetchReply() as Message
        const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id
        try {
            const collector = await msg.awaitMessageComponent({filter: filter, componentType: ComponentType.Button, time: 60000})
            if(collector) {
                if(collector.customId === "modMailDelete") {
                    const config = {
                        $set: {
                            "config.modmail": null
                        }
                    }
                    await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                    await collector.reply({content: client.handleLanguages("MODMAIL_DELETE", client, interaction.guildId!), ephemeral: true})
                } else if(collector.customId === "modMailReject") {
                    await collector.reply({content: client.handleLanguages("MODMAIL_REJECT", client, interaction.guildId!), ephemeral: true})
                }
            }
        } catch (e){
            await interaction.followUp({content: client.handleLanguages("MODMAIL_ERROR_OR_EXPIRED", client, interaction.guildId!), ephemeral: true})
            console.error(e)
        }
    } else {
        try {
            const parent = await interaction.guild!.channels.create({
                name: "ModMail", type: ChannelType.GuildCategory, permissionOverwrites: [
                    {
                        id: interaction.guild!.id,
                        deny: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel]
                    }
                ]
            })
            const child = await parent.children.create({
                name: "ModMail Log", type: ChannelType.GuildText, permissionOverwrites: [
                    {
                        id: interaction.guild!.id,
                        deny: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel]
                    }
                ]
            })
            const config = {
                $set: {
                    "config.modmail": {
                        category: parent.id,
                        logChannel: child.id
                    }
                }
            }
            await client.updateGuildConfig({guildId: interaction.guild!.id, config})
            await interaction.reply({content: client.handleLanguages("MODMAIL_SUCCESS", client, interaction.guildId!), ephemeral: true})
        } catch (e) {
            await interaction.reply({content: client.handleLanguages("MODMAIL_ERROR_ON_CREATION", client, interaction.guildId!), ephemeral: true})
            console.error(e)
        }
    }
}

async function roleConfig(interaction: ChatInputCommandInteraction, client: KhaxyClient) {
    await interaction.reply(client.handleLanguages("ROLE_CONFIG_PROMPT", client, interaction.guildId!))
    const msg = await interaction.fetchReply() as Message
    const filter = (i: MessageComponentInteraction) => (i.customId === "roleConfig") && (i.user.id === interaction.user.id);
    try {
        const collector = await msg.awaitMessageComponent({filter, componentType: ComponentType.SelectMenu, time: 60000})
        if (collector.customId === "roleConfig") {
            switch (collector.values[0]) {
                case "memberRole":
                    await memberRole(collector, client)
                    break
                case "maleRole":
                    await maleRole(collector, client)
                    break
                case "femaleRole":
                    await femaleRole(collector, client)
                    break
                case "muteRole":
                    await muteRole(collector, client)
                    break
                case "djRole":
                    await djRole(collector, client)
                    break
                case "dayColorRole":
                    await dayColorRole(collector, client)
            }
        }
    } catch (e) {
        await interaction.followUp({content: client.handleLanguages("ROLE_CONFIG_ERROR_OR_EXPIRED", client, interaction.guildId!), ephemeral: true})
        console.log(e)
    }
}

async function memberRole(interaction: SelectMenuInteraction, client: KhaxyClient) {
    const raw = client.handleLanguages("MEMBER_ROLE_PROMPT", client, interaction.guildId!)
    raw.components[0].components[0].default_values.shift()
    const memberRole = client.guildsConfig.get(interaction.guild!.id)?.config.memberRole
    if (memberRole) {
        raw.components[0].components[0].default_values.push({
            "id": memberRole,
            "type": "role"
        })
    }
    //@ts-ignore
    await interaction.reply(raw)
    const msg = await interaction.fetchReply() as Message
    const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id
    try {
        const collector = await msg.awaitMessageComponent({
            filter: filter,
            componentType: ComponentType.RoleSelect,
            time: 60000
        })
        if (collector) {
            const data = collector.values[0]
            const role = interaction.guild!.roles.cache.get(data) as Role
            const config = {
                $set: {
                    "config.memberRole": role.id
                }
            }
            await client.updateGuildConfig({guildId: interaction.guild!.id, config})
            await collector.reply({
                content: client.handleLanguages("MEMBER_ROLE_SUCCESS", client, interaction.guildId!),
                ephemeral: true
            })
        }
    } catch (error) {
        await interaction.followUp({
            content: client.handleLanguages("MEMBER_ROLE_ERROR_OR_EXPIRED", client, interaction.guildId!),
            ephemeral: true
        })
        console.error(error)
    }
}

async function maleRole(interaction: SelectMenuInteraction, client: KhaxyClient) {
    const raw = client.handleLanguages("MALE_ROLE_PROMPT", client, interaction.guildId!)
    raw.components[0].components[0].default_values.shift()
    const maleRole = client.guildsConfig.get(interaction.guild!.id)?.config.maleRole
    if (maleRole) {
        raw.components[0].components[0].default_values.push({
            "id": maleRole,
            "type": "role"
        })
    }
    //@ts-ignore
    await interaction.reply(raw)
    const msg = await interaction.fetchReply() as Message
    const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id
    try {
        const collector = await msg.awaitMessageComponent({
            filter: filter,
            componentType: ComponentType.RoleSelect,
            time: 60000
        })
        if (collector) {
            const data = collector.values[0]
            const role = interaction.guild!.roles.cache.get(data) as Role
            const config = {
                $set: {
                    "config.maleRole": role.id
                }
            }
            await client.updateGuildConfig({guildId: interaction.guild!.id, config})
            await collector.reply({
                content: client.handleLanguages("MALE_ROLE_SUCCESS", client, interaction.guildId!),
                ephemeral: true
            })
        }
    } catch (error) {
        await interaction.followUp({
            content: client.handleLanguages("MALE_ROLE_ERROR_OR_EXPIRED", client, interaction.guildId!),
            ephemeral: true
        })
        console.error(error)
    }
}

async function femaleRole(interaction: SelectMenuInteraction, client: KhaxyClient) {
    if (client.guildsConfig.get(interaction.guild!.id)!.config.femaleRole) {
        const reject = new ButtonBuilder()
            .setCustomId("femaleRoleReject")
            .setLabel("❌| İptal")
            .setStyle(ButtonStyle.Danger)
        const accept = new ButtonBuilder()
            .setCustomId("femaleRoleAccept")
            .setLabel("✅| Değiştir")
            .setStyle(ButtonStyle.Success)
        const deleteButton = new ButtonBuilder()
            .setCustomId("femaleRoleDelete")
            .setLabel("🗑️| Sil")
            .setStyle(ButtonStyle.Danger)
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([reject, accept, deleteButton])
        await interaction.reply({content: "Kız rolü ayarlı. Değiştirmek mi yoksa silmek mi istersiniz?", components: [row], ephemeral: true})
        const msg = await interaction.fetchReply() as Message
        const filter = (i: MessageComponentInteraction) => (i.customId === "femaleRoleReject" || i.customId === "femaleRoleAccept" || i.customId === "femaleRoleDelete") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({
                filter,
                componentType: ComponentType.Button,
                time: 60000
            })
            if (collector.customId === "femaleRoleReject") {
                await collector.reply({content: "İşlem iptal edildi.", ephemeral: true})
            } else if (collector.customId === "femaleRoleAccept") {
                const roleSelect = new RoleSelectMenuBuilder()
                    .setCustomId("femaleRole")
                    .setPlaceholder("Kadın rolünü seçiniz.")
                    .setMinValues(1)
                    .setMaxValues(1)
                const row2 = new ActionRowBuilder<RoleSelectMenuBuilder>()
                    .addComponents([roleSelect])
                await collector.reply({content: "Kadın rolünü ayarlamak için aşağıdan uygun role tıklayınız.", components: [row2], ephemeral: true})
                const msg = await collector.fetchReply() as Message
                const buttonFilter = (i: RoleSelectMenuInteraction) => (i.customId === "femaleRole") && (i.user.id === interaction.user.id);
                try {
                    const collector = await msg.awaitMessageComponent({filter: buttonFilter, componentType: ComponentType.RoleSelect, time: 60000})
                    if (collector) {
                        const data = collector.values[0]
                        const config = {
                            $set: {
                                "config.femaleRole": data
                            }
                        }
                        await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                        await collector.reply({content: `Kadın rolü başarıyla ayarlandı`, ephemeral: true})
                    }
                } catch (e) {
                    await interaction.followUp({content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true})
                    console.log(e)
                }
            } else if (collector.customId === "femaleRoleDelete") {
                const config = {
                    $set: {
                        "config.femaleRole": null
                    }
                }
                await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                await collector.reply({content: "Kız rolü silindi.", ephemeral: true})
            }
        } catch (e) {
            await interaction.followUp({content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true})
            console.log(e)
        }
    } else {
        const roleSelect = new RoleSelectMenuBuilder()
            .setCustomId("femaleRole")
            .setPlaceholder("Kadın rolünü seçiniz.")
            .setMinValues(1)
            .setMaxValues(1)
        const row2 = new ActionRowBuilder<RoleSelectMenuBuilder>()
            .addComponents([roleSelect])
        await interaction.reply({content: "Kadın rolünü ayarlamak için aşağıdan uygun role tıklayınız.", components: [row2], ephemeral: true})
        const msg = await interaction.fetchReply() as Message
        const buttonFilter = (i: RoleSelectMenuInteraction) => (i.customId === "femaleRole") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({filter: buttonFilter, componentType: ComponentType.RoleSelect, time: 60000})
            if (collector) {
                const data = collector.values[0]
                const config = {
                    $set: {
                        "config.femaleRole": data
                    }
                }
                await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                await collector.reply({content: `Kadın rolü başarıyla ayarlandı`, ephemeral: true})
            }
        } catch (e) {
            await interaction.followUp({content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true})
            console.log(e)
        }
    }
}

async function muteRole(interaction: SelectMenuInteraction, client: KhaxyClient) {
    if(client.guildsConfig.get(interaction.guild!.id)!.config.muteRole) {
        const reject = new ButtonBuilder()
            .setCustomId("muteRoleReject")
            .setLabel("❌| İptal")
            .setStyle(ButtonStyle.Danger)
        const accept = new ButtonBuilder()
            .setCustomId("muteRoleAccept")
            .setLabel("✅| Değiştir")
            .setStyle(ButtonStyle.Success)
        const deleteButton = new ButtonBuilder()
            .setCustomId("muteRoleDelete")
            .setLabel("🗑️| Sil")
            .setStyle(ButtonStyle.Danger)
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([reject, accept, deleteButton])
        await interaction.reply({content: "Susturma rolü zaten ayarlı. Değiştirmek mi silmek mi istersiniz?", components: [row], ephemeral: true})
        const msg = await interaction.fetchReply() as Message
        const filter = (i: MessageComponentInteraction) => (i.customId === "muteRoleReject" || i.customId === "muteRoleAccept" || i.customId === "muteRoleDelete") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({
                filter,
                componentType: ComponentType.Button,
                time: 60000
            })
            if (collector) {
                if (collector.customId === "muteRoleReject") {
                    await collector.reply({content: "İşlem iptal edildi.", ephemeral: true})
                } else if (collector.customId === "muteRoleAccept") {
                    const roleSelect = new RoleSelectMenuBuilder()
                        .setCustomId("muteRole")
                        .setPlaceholder("Mute rolünü seçiniz.")
                        .setMinValues(1)
                        .setMaxValues(1)
                    const row2 = new ActionRowBuilder<RoleSelectMenuBuilder>()
                        .addComponents([roleSelect])
                    await collector.reply({content: "Mute rolünü ayarlamak için aşağıdan uygun role tıklayınız.", components: [row2], ephemeral: true})
                    const msg = await collector.fetchReply() as Message
                    const buttonFilter = (i: RoleSelectMenuInteraction) => (i.customId === "muteRole") && (i.user.id === interaction.user.id);
                    try {
                        const collector = await msg.awaitMessageComponent({filter: buttonFilter, componentType: ComponentType.RoleSelect, time: 60000})
                        if (collector) {
                            const data = collector.values[0]
                            const config = {
                                $set: {
                                    "config.muteRole": data
                                }
                            }
                            await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                            await collector.reply({content: `Mute rolü başarıyla ayarlandı`, ephemeral: true})
                        }
                    } catch (e) {
                        await interaction.followUp({content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true})
                        console.log(e)
                    }
                } else if (collector.customId === "muteRoleDelete") {
                    const config = {
                        $set: {
                            "config.muteRole": null
                        }
                    }
                    await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                    await collector.reply({content: "Mute rolü silindi.", ephemeral: true})
                }
            }
        } catch (e) {
            await interaction.followUp({content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true})
            console.log(e)
        }
    } else {
        const roleSelect = new RoleSelectMenuBuilder()
            .setCustomId("muteRole")
            .setPlaceholder("Mute rolünü seçiniz.")
            .setMinValues(1)
            .setMaxValues(1)
        const row2 = new ActionRowBuilder<RoleSelectMenuBuilder>()
            .addComponents([roleSelect])
        await interaction.reply({content: "Mute rolünü ayarlamak için aşağıdan uygun role tıklayınız.", components: [row2], ephemeral: true})
        const msg = await interaction.fetchReply() as Message
        const buttonFilter = (i: RoleSelectMenuInteraction) => (i.customId === "muteRole") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({filter: buttonFilter, componentType: ComponentType.RoleSelect, time: 60000})
            if (collector) {
                const data = collector.values[0]
                const config = {
                    $set: {
                        "config.muteRole": data
                    }
                }
                await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                await collector.reply({content: `Mute rolü başarıyla ayarlandı`, ephemeral: true})
            }
        } catch (e) {
            await interaction.followUp({content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true})
            console.log(e)
        }
    }
}

async function djRole(interaction: SelectMenuInteraction, client: KhaxyClient) {
    if(client.guildsConfig.get(interaction.guild!.id)!.config.djRole) {
        const reject = new ButtonBuilder()
            .setCustomId("djRoleReject")
            .setLabel("❌| İptal")
            .setStyle(ButtonStyle.Danger)
        const accept = new ButtonBuilder()
            .setCustomId("djRoleAccept")
            .setLabel("✅| Değiştir")
            .setStyle(ButtonStyle.Success)
        const deleteButton = new ButtonBuilder()
            .setCustomId("djRoleDelete")
            .setLabel("🗑️| Sil")
            .setStyle(ButtonStyle.Danger)
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([reject, accept, deleteButton])
        await interaction.reply({content: "DJ rolü zaten ayarlı. Değiştirmek mi silmek mi istersiniz?", components: [row], ephemeral: true})
        const msg = await interaction.fetchReply() as Message
        const filter = (i: MessageComponentInteraction) => (i.customId === "djRoleReject" || i.customId === "djRoleAccept" || i.customId === "djRoleDelete") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({
                filter,
                componentType: ComponentType.Button,
                time: 60000
            })
            if (collector) {
                if (collector.customId === "djRoleReject") {
                    await collector.reply({content: "İşlem iptal edildi.", ephemeral: true})
                } else if (collector.customId === "djRoleAccept") {
                    const roleSelect = new RoleSelectMenuBuilder()
                        .setCustomId("djRole")
                        .setPlaceholder("DJ rolünü seçiniz.")
                        .setMinValues(1)
                        .setMaxValues(1)
                    const row2 = new ActionRowBuilder<RoleSelectMenuBuilder>()
                        .addComponents([roleSelect])
                    await collector.reply({content: "DJ rolünü ayarlamak için aşağıdan uygun role tıklayınız.", components: [row2], ephemeral: true})
                    const msg = await collector.fetchReply() as Message
                    const buttonFilter = (i: RoleSelectMenuInteraction) => (i.customId === "djRole") && (i.user.id === interaction.user.id);
                    try {
                        const collector = await msg.awaitMessageComponent({filter: buttonFilter, componentType: ComponentType.RoleSelect, time: 60000})
                        if (collector) {
                            const data = collector.values[0]
                            const config = {
                                $set: {
                                    "config.djRole": data
                                }
                            }
                            await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                            await collector.reply({content: `DJ rolü başarıyla ayarlandı`, ephemeral: true})
                        }
                    } catch (e) {
                        await interaction.followUp({content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true})
                        console.log(e)
                    }
                } else if (collector.customId === "djRoleDelete") {
                    const config = {
                        $set: {
                            "config.djRole": null
                        }
                    }
                    await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                    await collector.reply({content: "DJ rolü silindi.", ephemeral: true})
                }
            }
        } catch (e) {
            await interaction.followUp({content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true})
            console.log(e)
        }
    } else {
        const roleSelect = new RoleSelectMenuBuilder()
            .setCustomId("djRole")
            .setPlaceholder("DJ rolünü seçiniz.")
            .setMinValues(1)
            .setMaxValues(1)
        const row2 = new ActionRowBuilder<RoleSelectMenuBuilder>()
            .addComponents([roleSelect])
        await interaction.reply({content: "DJ rolünü ayarlamak için aşağıdan uygun role tıklayınız.", components: [row2], ephemeral: true})
        const msg = await interaction.fetchReply() as Message
        const buttonFilter = (i: RoleSelectMenuInteraction) => (i.customId === "djRole") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({filter: buttonFilter, componentType: ComponentType.RoleSelect, time: 60000})
            if (collector) {
                const data = collector.values[0]
                const config = {
                    $set: {
                        "config.djRole": data
                    }
                }
                await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                await collector.reply({content: `DJ rolü başarıyla ayarlandı`, ephemeral: true})
            }
        } catch (e) {
            await interaction.followUp({content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true})
            console.log(e)
        }
    }
}

async function dayColorRole(interaction: SelectMenuInteraction, client: KhaxyClient) {
    if(client.guildsConfig.get(interaction.guild!.id)!.config.roleOfTheDay) {
        const reject = new ButtonBuilder()
            .setCustomId("dayColorRoleReject")
            .setLabel("❌| İptal")
            .setStyle(ButtonStyle.Danger)
        const accept = new ButtonBuilder()
            .setCustomId("dayColorRoleAccept")
            .setLabel("✅| Değiştir")
            .setStyle(ButtonStyle.Success)
        const deleteButton = new ButtonBuilder()
            .setCustomId("dayColorRoleDelete")
            .setLabel("🗑️| Sil")
            .setStyle(ButtonStyle.Danger)
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([reject, accept, deleteButton])
        await interaction.reply({content: "Günün rengi rolü zaten ayarlı. Değiştirmek mi silmek mi istersiniz?", components: [row], ephemeral: true})
        const msg = await interaction.fetchReply() as Message
        const filter = (i: MessageComponentInteraction) => (i.customId === "dayColorRoleReject" || i.customId === "dayColorRoleAccept" || i.customId === "dayColorRoleDelete") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({
                filter,
                componentType: ComponentType.Button,
                time: 60000
            })
            if (collector) {
                if (collector.customId === "dayColorRoleReject") {
                    await collector.reply({content: "İşlem iptal edildi.", ephemeral: true})
                } else if (collector.customId === "dayColorRoleAccept") {
                    const roleSelect = new RoleSelectMenuBuilder()
                        .setCustomId("roleOfTheDay")
                        .setPlaceholder("Günün Rengi rolünü seçiniz.")
                        .setMinValues(1)
                        .setMaxValues(1)
                    const row2 = new ActionRowBuilder<RoleSelectMenuBuilder>()
                        .addComponents([roleSelect])
                    await collector.reply({content: "Günün Rengi rolünü ayarlamak için aşağıdan uygun role tıklayınız.", components: [row2], ephemeral: true})
                    const msg = await collector.fetchReply() as Message
                    const buttonFilter = (i: RoleSelectMenuInteraction) => (i.customId === "roleOfTheDay") && (i.user.id === interaction.user.id);
                    try {
                        const collector = await msg.awaitMessageComponent({filter: buttonFilter, componentType: ComponentType.RoleSelect, time: 60000})
                        if (collector) {
                            const data = collector.values[0]
                            const config = {
                                $set: {
                                    "config.roleOfTheDay": data
                                }
                            }
                            await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                            await collector.reply({content: `Günün Rengi rolü başarıyla ayarlandı`, ephemeral: true})
                        }
                    } catch (e) {
                        await interaction.followUp({content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true})
                        console.log(e)
                    }
                } else if (collector.customId === "dayColorRoleDelete") {
                    const config = {
                        $set: {
                            "config.roleOfTheDay": null
                        }
                    }
                    await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                    await collector.reply({content: "Günün rengi rolü silindi.", ephemeral: true})
                }
            }
        } catch (e) {
            await interaction.followUp({content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true})
            console.log(e)
        }
    } else {
        const roleSelect = new RoleSelectMenuBuilder()
            .setCustomId("roleOfTheDay")
            .setPlaceholder("Günün Rengi rolünü seçiniz.")
            .setMinValues(1)
            .setMaxValues(1)
        const row2 = new ActionRowBuilder<RoleSelectMenuBuilder>()
            .addComponents([roleSelect])
        await interaction.reply({content: "Günün Rengi rolünü ayarlamak için aşağıdan uygun role tıklayınız.", components: [row2], ephemeral: true})
        const msg = await interaction.fetchReply() as Message
        const buttonFilter = (i: RoleSelectMenuInteraction) => (i.customId === "roleOfTheDay") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({filter: buttonFilter, componentType: ComponentType.RoleSelect, time: 60000})
            if (collector) {
                const data = collector.values[0]
                const config = {
                    $set: {
                        "config.roleOfTheDay": data
                    }
                }
                await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                await collector.reply({content: `Günün Rengi rolü başarıyla ayarlandı`, ephemeral: true})
            }
        } catch (e) {
            await interaction.followUp({content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true})
            console.log(e)
        }
    }
}
export {registerConfig, welcomeConfig, moderationConfig, roleConfig}