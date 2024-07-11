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
    ModalBuilder,
    ModalSubmitInteraction,
    SelectMenuBuilder,
    SelectMenuInteraction,
    StringSelectMenuBuilder,
    TextInputBuilder,
    TextInputStyle,
    ChannelSelectMenuBuilder,
    RoleSelectMenuBuilder, RoleSelectMenuInteraction, PermissionsBitField, TextChannel
} from "discord.js";
import {KhaxyClient} from "../types";

async function registerConfig(interaction: ChatInputCommandInteraction, client: KhaxyClient) {
    const SelectMenu = client.handleLanguages("REGISTER_CONFIG_PROMPT", client, interaction.guildId!)
    await interaction.reply(SelectMenu)
    const selectMsg = await interaction.fetchReply() as Message
    const selectFilter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id
    try {
        const selectCollector = await selectMsg.awaitMessageComponent({filter: selectFilter, componentType: ComponentType.SelectMenu,time: 60000})
        if(selectCollector.customId === "registerConfig") {
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
        await interaction.followUp({content: client.handleLanguages("REGISTER_CONFIG_EXPIRED", client, interaction.guildId!), ephemeral: true})
        console.log(error)
    }
}

async function registerChannel(interaction: SelectMenuInteraction, client: KhaxyClient) {
    if(client.guildsConfig.get(interaction.guild!.id)?.config.registerChannel) {
        const raw = client.handleLanguages("REGISTER_CHANNEL_ALREADY_SETUP", client, interaction.guildId!)
        await interaction.reply(raw)
        const msg = await interaction.fetchReply() as Message
        const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id
        try {
            const collector = await msg.awaitMessageComponent({filter: filter, componentType: ComponentType.Button, time: 60000})
            if(collector.customId === "registerChannelReject") {
                await collector.reply({content: client.handleLanguages("REGISTER_CHANNEL_CANCEL", client, interaction.guildId!), ephemeral: true})
            } else if(collector.customId === "registerChannelAccept") {
                const channelSelect = client.handleLanguages("REGISTER_CHANNEL_ACCEPT", client, interaction.guildId!)
                await collector.reply(channelSelect)
                const msg = await collector.fetchReply() as Message
                const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id
                try {
                    const collector = await msg.awaitMessageComponent({filter: filter, componentType: ComponentType.ChannelSelect, time: 60000})
                    if(collector) {

                            const data = collector.values[0]
                            const channel = interaction.guild!.channels.cache.get(data) as TextChannel

                            const config = {
                                $set: {
                                    "config.registerChannel": channel.id
                                }
                            }
                            await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                            await collector.reply({content: client.handleLanguages("REGISTER_CHANNEL_ACCEPT_SUCCESS", client, interaction.guildId!), ephemeral: true})
                    }
                } catch (error) {
                    console.log(error)
                    await interaction.followUp({content: client.handleLanguages("REGISTER_CHANNEL_ERROR_OR_EXPIRED", client, interaction.guildId!), ephemeral: true})
                }
            } else if(collector.customId === "registerChannelDelete") {
                const config = {
                    $set: {
                        "config.registerChannel": null
                    }
                }
                await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                await collector.reply({content: client.handleLanguages("REGISTER_CHANNEL_DELETED", client, interaction.guildId!), components: [], ephemeral: true})
            }
        } catch (error) {
            console.log(error)
            await interaction.followUp({content: client.handleLanguages("REGISTER_CHANNEL_ERROR_OR_EXPIRED", client, interaction.guildId!), ephemeral: true})
        }
    } else {
        const channelSelect = client.handleLanguages("REGISTER_CHANNEL_ACCEPT", client, interaction.guildId!)
        await interaction.reply(channelSelect)
        const msg = await interaction.fetchReply() as Message
        const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id
        try {
            const collector = await msg.awaitMessageComponent({filter: filter, componentType: ComponentType.ChannelSelect, time: 60000})
            if(collector) {

                const data = collector.values[0]
                const channel = interaction.guild!.channels.cache.get(data) as TextChannel

                const config = {
                    $set: {
                        "config.registerChannel": channel.id
                    }
                }
                await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                await collector.reply({content: client.handleLanguages("REGISTER_CHANNEL_ACCEPT_SUCCESS", client, interaction.guildId!), ephemeral: true})
            }
        } catch (error) {
            console.log(error)
            await interaction.followUp({content: client.handleLanguages("REGISTER_CHANNEL_ERROR_OR_EXPIRED", client, interaction.guildId!), ephemeral: true})
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
        const collector = await msg.awaitMessageComponent({filter: filter, componentType: ComponentType.RoleSelect, time: 60000})
        if (collector) {
            const roles = collector.values
            const config = {
                $set: {
                    "config.staffRole": roles
                }
            }
            await client.updateGuildConfig({guildId: interaction.guild!.id, config})
            await collector.reply({content: client.handleLanguages("STAFF_ROLES_SUCCESS", client, interaction.guildId!), ephemeral: true})
        }
    } catch (error) {
        await interaction.followUp({content: client.handleLanguages("STAFF_ROLES_ERROR_OR_EXPIRED", client, interaction.guildId!), ephemeral: true})
        console.log(error)
    }
}

async function registerMessage(interaction: SelectMenuInteraction, client: KhaxyClient) {
    if(client.guildsConfig.get(interaction.guild!.id)?.config.registerMessage) {
        const raw = client.handleLanguages("REGISTER_MESSAGE_ALREADY_SETUP", client, interaction.guildId!)
        await interaction.reply(raw)
        const msg = await interaction.fetchReply() as Message
        const buttonFilter = (i: MessageComponentInteraction) => (i.customId === "staffRoleReject" || i.customId === "staffRoleAccept" || i.customId === "staffRoleDelete") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({filter: buttonFilter, componentType: ComponentType.Button, time: 60000})
            if (collector) {
                if(collector.customId === "registerMessageReject") {
                    await collector.reply({content: client.handleLanguages("REGISTER_MESSAGE_CANCEL", client, interaction.guildId!), components: [], ephemeral: true})
                } else if(collector.customId === "registerMessageRoleAccept") {
                    const modal = client.handleLanguages("REGISTER_MESSAGE_MODAL", client, interaction.guildId!)

                    await collector.reply(client.handleLanguages("REGISTER_MESSAGE_SETUP", client, interaction.guildId!))
                    const msg = await collector.fetchReply() as Message
                    const buttonFilter = (i: MessageComponentInteraction) => (i.customId === "registerMessage") && (i.user.id === interaction.user.id);
                    try {
                        const collector = await msg.awaitMessageComponent({filter: buttonFilter, componentType: ComponentType.Button, time: 60000})
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
                                await collector.reply({content: client.handleLanguages("REGISTER_MESSAGE_SUCCESS", client, interaction.guildId!), ephemeral: true})
                            } catch (e) {
                                await collector.reply({content: client.handleLanguages("REGISTER_MESSAGE_ERROR_OR_EXPIRED", client, interaction.guildId!), ephemeral: true})
                                console.log(e)
                            }
                        }
                    } catch (e) {
                        await interaction.followUp({content: client.handleLanguages("REGISTER_MESSAGE_ERROR_OR_EXPIRED", client, interaction.guildId!), ephemeral: true})
                        console.log(e)
                    }
                } else if(collector.customId === "registerMessageDelete") {
                    const config = {
                        $set: {
                            "config.registerMessage": null
                        }
                    }
                    await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                    await collector.reply({content: client.handleLanguages("REGISTER_MESSAGE_DELETED", client, interaction.guildId!), ephemeral: true})
                }
            }
        } catch (e) {
            await interaction.reply({content: client.handleLanguages("REGISTER_MESSAGE_ERROR_OR_EXPIRED", client, interaction.guildId!), ephemeral: true})
            console.log(e)
        }
    } else {
        const modal = client.handleLanguages("REGISTER_MESSAGE_MODAL", client, interaction.guildId!)

        await interaction.reply(client.handleLanguages("REGISTER_MESSAGE_SETUP", client, interaction.guildId!))
        const msg = await interaction.fetchReply() as Message
        const buttonFilter = (i: MessageComponentInteraction) => (i.customId === "registerMessage") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({filter: buttonFilter, componentType: ComponentType.Button, time: 60000})
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
                    await collector.reply({content: client.handleLanguages("REGISTER_MESSAGE_SUCCESS", client, interaction.guildId!), ephemeral: true})
                } catch (e) {
                    await collector.reply({content: client.handleLanguages("REGISTER_MESSAGE_ERROR_OR_EXPIRED", client, interaction.guildId!), ephemeral: true})
                    console.log(e)
                }
            }
        } catch (e) {
            await interaction.followUp({content: client.handleLanguages("REGISTER_MESSAGE_ERROR_OR_EXPIRED", client, interaction.guildId!), ephemeral: true})
            console.log(e)
        }
    }
}

async function registerMessageClear(interaction: SelectMenuInteraction, client: KhaxyClient) {
    if(!client.guildsConfig.get(interaction.guild!.id)?.config.registerMessageClear) {
        const config = {
            $set: {
                "config.registerMessageClear": true
            }
        }
        await client.updateGuildConfig({guildId: interaction.guild!.id, config})
        await interaction.reply({content: client.handleLanguages("REGISTER_MESSAGE_DELETE_TRUE", client, interaction.guildId!), ephemeral: true})
    } else {
        const config = {
            $set: {
                "config.registerMessageClear": false
            }
        }
        await client.updateGuildConfig({guildId: interaction.guild!.id, config})
        await interaction.reply({content: client.handleLanguages("REGISTER_MESSAGE_DELETE_FALSE", client, interaction.guildId!), ephemeral: true})
    }
}

async function registerChannelClear(interaction: SelectMenuInteraction, client: KhaxyClient) {
    if(!client.guildsConfig.get(interaction.guild!.id)?.config.registerChannelClear) {
        const config = {
            $set: {
                "config.registerChannelClear": true
            }
        }
        await client.updateGuildConfig({guildId: interaction.guild!.id, config})
        await interaction.reply({content: client.handleLanguages("REGISTER_CHANNEL_DELETE_TRUE", client, interaction.guildId!), ephemeral: true})
    } else {
        const config = {
            $set: {
                "config.registerChannelClear": false
            }
        }
        await client.updateGuildConfig({guildId: interaction.guild!.id, config})
        await interaction.reply({content: client.handleLanguages("REGISTER_CHANNEL_DELETE_TRUE", client, interaction.guildId!), ephemeral: true})
    }
}

async function welcomeConfig(interaction: ChatInputCommandInteraction, client: KhaxyClient) {
    const select = new StringSelectMenuBuilder()
        .setCustomId("welcomeConfig")
        .setPlaceholder("Hoşgeldin ayarları")
        .addOptions([
            {
                label: "Hoşgeldin kanalı",
                value: "welcomeChannel",
                description: "Hoşgeldin kanalı ayarlar.",
                emoji: "👋"
            },
            {
                label: "Hoşgeldin mesajı",
                value: "welcomeMessage",
                description: "Hoşgeldin mesajı ayarlar.",
                emoji: "👋"
            },
            {
                label: "Görüşürüz kanalı",
                value: "goodbyeChannel",
                description: "Görüşürüz kanalı ayarlar.",
                emoji: "👋"
            },
            {
                label: "Görüşürüz mesajı",
                value: "goodbyeMessage",
                description: "Görüşürüz mesajı ayarlar.",
                emoji: "👋"
            }, {
                label: "Kayıt Kanalı",
                value: "registerChannel",
                description: "Kayıt kanalı ayarlar.",
                emoji: "🔒"
            }
        ])
    const row = new ActionRowBuilder<SelectMenuBuilder>()
        .addComponents([select])
    await interaction.reply({content: "Ayarlamak istediğiniz ayarı seçiniz.", components: [row], ephemeral: true})
    const msg = await interaction.fetchReply() as Message
    const filter = (i: SelectMenuInteraction) => i.customId === "welcomeConfig" && i.user.id === interaction.user.id
    try {
        const collector = await msg.awaitMessageComponent({filter, componentType: ComponentType.SelectMenu, time: 60000})
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
        await interaction.followUp({content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true})
        console.log(e)
    }
}

async function welcomeChannel(interaction: SelectMenuInteraction, client: KhaxyClient) {
    if(client.guildsConfig.get(interaction.guild!.id)?.config.welcomeChannel) {
        const reject = new ButtonBuilder()
            .setCustomId("welcomeChannelReject")
            .setLabel("❌| İptal")
            .setStyle(ButtonStyle.Danger)
        const accept = new ButtonBuilder()
            .setCustomId("welcomeChannelAccept")
            .setLabel("✅| Değiştir")
            .setStyle(ButtonStyle.Success)
        const deleteButton = new ButtonBuilder()
            .setCustomId("welcomeChannelDelete")
            .setLabel("🗑️| Sil")
            .setStyle(ButtonStyle.Danger)
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([reject, accept, deleteButton])
        await interaction.reply({content: "Hoşgeldin kanalı zaten ayarlanmış. Değiştirmek mi yoksa silmek mi istersiniz?", components: [row], ephemeral: true})
        const msg = await interaction.fetchReply() as Message
        const filter = (i: MessageComponentInteraction) => (i.customId === "welcomeChannelReject" || i.customId === "welcomeChannelAccept" || i.customId === "welcomeChannelDelete") && i.user.id === interaction.user.id
        try {
            const collector = await msg.awaitMessageComponent({filter, componentType: ComponentType.Button, time: 60000})
            if(collector.customId === "welcomeChannelReject") {
                await collector.reply({content: "İşlem iptal edildi.", ephemeral: true})
            } else if(collector.customId === "welcomeChannelAccept") {
                const channelSelect = new ChannelSelectMenuBuilder()
                    .setCustomId("welcomeChannel")
                    .setPlaceholder("Kanal seçiniz.")
                    .setDisabled(false)
                    .setChannelTypes(ChannelType.GuildText)
                const row2 = new ActionRowBuilder<ChannelSelectMenuBuilder>()
                    .addComponents(channelSelect)
                await collector.reply({content: "Yeni hoşgeldin kanalını aşağıdan ayarlayınız", components: [row2], ephemeral: true})
                const msg = await collector.fetchReply() as Message
                const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id
                try {
                    const collector = await msg.awaitMessageComponent({filter: filter, componentType: ComponentType.ChannelSelect, time: 60000})
                    if(collector) {

                        const data = collector.values[0]
                        const channel = interaction.guild!.channels.cache.get(data)
                        if (!channel) {
                            await collector.reply({content: "Böyle bir kanal bulunamadı."})
                            return
                        }
                        if(channel.type !== ChannelType.GuildText) {
                            await collector.reply({content: "Lütfen bir metin kanalı giriniz."})
                            return
                        }
                        const config = {
                            $set: {
                                "config.welcomeChannel": channel.id
                            }
                        }
                        await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                        await collector.reply({content: "Hoşgeldin kanalı ayarlandı.", ephemeral: true})
                    }
                } catch (error) {
                    console.log(error)
                    await interaction.followUp({content: "İşlem iptal edildi çünkü bir hata ile karşılaşıldı", ephemeral: true})
                }
            } else if(collector.customId === "welcomeChannelDelete") {
                const config = {
                    $unset: {
                        "config.welcomeChannel": ""
                    }
                }
                await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                await collector.reply({content: "Hoşgeldin kanalı silindi.", ephemeral: true})
            }
        } catch (e) {
            await interaction.followUp({content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true})
            console.log(e)
        }
    } else {
        const channelSelect = new ChannelSelectMenuBuilder()
            .setCustomId("welcomeChannel")
            .setPlaceholder("Kanal seçiniz.")
            .setDisabled(false)
            .setChannelTypes(ChannelType.GuildText)
        const row2 = new ActionRowBuilder<ChannelSelectMenuBuilder>()
            .addComponents(channelSelect)
        await interaction.reply({content: "Yeni hoşgeldin kanalını aşağıdan ayarlayınız", components: [row2], ephemeral: true})
        const msg = await interaction.fetchReply() as Message
        const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id
        try {
            const collector = await msg.awaitMessageComponent({filter: filter, componentType: ComponentType.ChannelSelect, time: 60000})
            if(collector) {

                const data = collector.values[0]
                const channel = interaction.guild!.channels.cache.get(data)
                if (!channel) {
                    await collector.reply({content: "Böyle bir kanal bulunamadı."})
                    return
                }
                if(channel.type !== ChannelType.GuildText) {
                    await collector.reply({content: "Lütfen bir metin kanalı giriniz."})
                    return
                }
                const config = {
                    $set: {
                        "config.welcomeChannel": channel.id
                    }
                }
                await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                await collector.reply({content: "Hoşgeldin kanalı ayarlandı.", ephemeral: true})
            }
        } catch (error) {
            console.log(error)
            await interaction.followUp({content: "İşlem iptal edildi çünkü bir hata ile karşılaşıldı", ephemeral: true})
        }
    }
}

async function welcomeMessage(interaction: SelectMenuInteraction, client: KhaxyClient) {
    if(client.guildsConfig.get(interaction.guild!.id)?.config.welcomeMessage) {
        const reject = new ButtonBuilder()
            .setCustomId("welcomeMessageReject")
            .setLabel("❌| İptal")
            .setStyle(ButtonStyle.Danger)
        const accept = new ButtonBuilder()
            .setCustomId("welcomeMessageAccept")
            .setLabel("✅| Değiştir")
            .setStyle(ButtonStyle.Success)
        const deleteButton = new ButtonBuilder()
            .setCustomId("welcomeMessageDelete")
            .setLabel("🗑️| Sil")
            .setStyle(ButtonStyle.Danger)
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([reject, accept, deleteButton])
        await interaction.reply({content: "Hoşgeldin mesajı zaten ayarlanmış. Değiştirmek mi yoksa silmek mi istersiniz?", components: [row], ephemeral: true})
        const msg = await interaction.fetchReply() as Message
        const buttonFilter = (i: MessageComponentInteraction) => (i.customId === "welcomeMessageReject" || i.customId === "welcomeMessageAccept" || i.customId === "welcomeMessageDelete") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({
                filter: buttonFilter,
                componentType: ComponentType.Button,
                time: 60000
            })
            if (collector.customId === "welcomeMessageReject") {
                await collector.reply({content: "İşlem iptal edildi.", ephemeral: true})
            } else if (collector.customId === "welcomeMessageAccept") {
                const TextInput = new TextInputBuilder()
                    .setCustomId("welcomeMessage")
                    .setPlaceholder("Kullanılabilir değişkenler: {user}, {tag}, {name}, {id}, {server}, {memberCount}")
                    .setMinLength(1)
                    .setMaxLength(2000)
                    .setRequired(true)
                    .setLabel("Hoşgeldin mesajı")
                    .setStyle(TextInputStyle.Paragraph)
                const row = new ActionRowBuilder<TextInputBuilder>()
                    .addComponents([TextInput])
                const modal = new ModalBuilder()
                    .setCustomId("welcomeMessage")
                    .setTitle("Hoşgeldin mesajı ayarla")
                    .addComponents([row])
                const button = new ButtonBuilder()
                    .setCustomId("welcomeMessage")
                    .setLabel("Hoşgeldin mesajı ayarla")
                    .setStyle(ButtonStyle.Primary)
                const row2 = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents([button])
                await collector.reply({
                    content: "Hoşgeldin mesajı ayarlamak için aşağıdaki butona tıklayınız.",
                    components: [row2],
                    ephemeral: true
                })
                const msg = await collector.fetchReply() as Message
                const buttonFilter = (i: MessageComponentInteraction) => (i.customId === "welcomeMessage") && (i.user.id === interaction.user.id);
                try {
                    const modalcollector = await msg.awaitMessageComponent({
                        filter: buttonFilter,
                        componentType: ComponentType.Button,
                        time: 60000
                    })
                    if (modalcollector) {
                        await modalcollector.showModal(modal)
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
                            await collector.reply({content: "Hoşgeldin mesajı ayarlandı.", ephemeral: true})
                        } catch (e) {
                            await modalcollector.followUp({
                                content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.",
                                ephemeral: true
                            })
                            console.log(e)
                        }
                    }
                } catch (e) {
                    await interaction.followUp({
                        content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.",
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
                await collector.reply({content: "Hoşgeldin mesajı silindi.", ephemeral: true})
            }
        } catch (e) {
            await interaction.followUp({content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true})
            console.log(e)
        }
    } else {
        const TextInput = new TextInputBuilder()
            .setCustomId("welcomeMessage")
            .setPlaceholder("Kullanılabilir değişkenler: {user}, {tag}, {name}, {id}, {server}, {memberCount}")
            .setMinLength(1)
            .setMaxLength(2000)
            .setRequired(true)
            .setLabel("Hoşgeldin mesajı")
            .setStyle(TextInputStyle.Paragraph)
        const row = new ActionRowBuilder<TextInputBuilder>()
            .addComponents([TextInput])
        const modal = new ModalBuilder()
            .setCustomId("welcomeMessage")
            .setTitle("Hoşgeldin mesajı ayarla")
            .addComponents([row])
        const button = new ButtonBuilder()
            .setCustomId("welcomeMessage")
            .setLabel("Hoşgeldin mesajı ayarla")
            .setStyle(ButtonStyle.Primary)
        const row2 = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([button])
        await interaction.reply({content: "Hoşgeldin mesajı ayarlamak için aşağıdaki butona tıklayınız.", components: [row2], ephemeral: true})
        const msg = await interaction.fetchReply() as Message
        const buttonFilter = (i: MessageComponentInteraction) => (i.customId === "welcomeMessage") && (i.user.id === interaction.user.id);
        try {
            const modalcollector = await msg.awaitMessageComponent({filter: buttonFilter, componentType: ComponentType.Button, time: 60000})
            if (modalcollector) {
                await modalcollector.showModal(modal)
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
                    await collector.reply({content: "Hoşgeldin mesajı ayarlandı.", ephemeral: true})
                } catch (e) {
                    await modalcollector.followUp({content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true})
                    console.log(e)
                }
            }
        } catch (e) {
            await interaction.followUp({content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true})
            console.log(e)
        }
    }
}

async function goodbyeChannel(interaction: SelectMenuInteraction, client: KhaxyClient) {
    if (client.guildsConfig.get(interaction.guild!.id)?.config.leaveChannel) {
        const reject = new ButtonBuilder()
            .setCustomId("goodByeChannelReject")
            .setLabel("❌| İptal")
            .setStyle(ButtonStyle.Danger)
        const accept = new ButtonBuilder()
            .setCustomId("goodByeChannelAccept")
            .setLabel("✅| Değiştir")
            .setStyle(ButtonStyle.Success)
        const deleteButton = new ButtonBuilder()
            .setCustomId("goodByeChannelDelete")
            .setLabel("🗑️| Sil")
            .setStyle(ButtonStyle.Danger)
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([reject, accept, deleteButton])
        await interaction.reply({content: "Hoşçakal kanalı ayarlanmış. Değiştirmek mi yoksa silmek mi istersiniz?", components: [row], ephemeral: true })
        const msg = await interaction.fetchReply() as Message
        const buttonFilter = (i: MessageComponentInteraction) => (i.customId === "goodByeChannelReject" || i.customId === "goodByeChannelAccept" || i.customId === "goodByeChannelDelete") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({filter: buttonFilter, componentType: ComponentType.Button, time: 60000})
            if (collector) {
                if (collector.customId === "goodByeChannelReject") {
                    await collector.reply({content: "İşlem iptal edildi.", ephemeral: true})
                } else if (collector.customId === "goodByeChannelAccept") {
                    const channelSelect = new ChannelSelectMenuBuilder()
                        .setCustomId("goodByeChannel")
                        .setPlaceholder("Kanal seçiniz.")
                        .setDisabled(false)
                        .setChannelTypes(ChannelType.GuildText)
                    const row2 = new ActionRowBuilder<ChannelSelectMenuBuilder>()
                        .addComponents(channelSelect)
                    await collector.reply({content: "Yeni görüşürüz kanalını aşağıdan ayarlayınız", components: [row2], ephemeral: true})
                    const msg = await collector.fetchReply() as Message
                    const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id
                    try {
                        const collector = await msg.awaitMessageComponent({filter: filter, componentType: ComponentType.ChannelSelect, time: 60000})
                        if(collector) {

                            const data = collector.values[0]
                            const channel = interaction.guild!.channels.cache.get(data)
                            if (!channel) {
                                await collector.reply({content: "Böyle bir kanal bulunamadı."})
                                return
                            }
                            if(channel.type !== ChannelType.GuildText) {
                                await collector.reply({content: "Lütfen bir metin kanalı giriniz."})
                                return
                            }
                            const config = {
                                $set: {
                                    "config.goodByeChannel": channel.id
                                }
                            }
                            await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                            await collector.reply({content: "Görüşürüz kanalı ayarlandı.", ephemeral: true})
                        }
                    } catch (error) {
                        console.log(error)
                        await interaction.followUp({content: "İşlem iptal edildi çünkü bir hata ile karşılaşıldı", ephemeral: true})
                    }
                } else if (collector.customId === "goodByeChannelDelete") {
                    const config = {
                        $unset: {
                            "config.leaveChannel": ""
                        }
                    }
                    await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                    await collector.reply({content: "Hoşçakal kanalı silindi.", ephemeral: true})
                }
            }
        } catch (e) {
            await interaction.followUp({content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true})
            console.log(e)
        }
    } else {
        const channelSelect = new ChannelSelectMenuBuilder()
            .setCustomId("goodByeChannel")
            .setPlaceholder("Kanal seçiniz.")
            .setDisabled(false)
            .setChannelTypes(ChannelType.GuildText)
        const row2 = new ActionRowBuilder<ChannelSelectMenuBuilder>()
            .addComponents(channelSelect)
        await interaction.reply({content: "Yeni görüşürüz kanalını aşağıdan ayarlayınız", components: [row2], ephemeral: true})
        const msg = await interaction.fetchReply() as Message
        const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id
        try {
            const collector = await msg.awaitMessageComponent({filter: filter, componentType: ComponentType.ChannelSelect, time: 60000})
            if(collector) {

                const data = collector.values[0]
                const channel = interaction.guild!.channels.cache.get(data)
                if (!channel) {
                    await collector.reply({content: "Böyle bir kanal bulunamadı."})
                    return
                }
                if(channel.type !== ChannelType.GuildText) {
                    await collector.reply({content: "Lütfen bir metin kanalı giriniz."})
                    return
                }
                const config = {
                    $set: {
                        "config.goodByeChannel": channel.id
                    }
                }
                await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                await collector.reply({content: "Görüşürüz kanalı ayarlandı.", ephemeral: true})
            }
        } catch (error) {
            console.log(error)
            await interaction.followUp({content: "İşlem iptal edildi çünkü bir hata ile karşılaşıldı", ephemeral: true})
        }
    }

}

async function goodbyeMessage(interaction: SelectMenuInteraction, client: KhaxyClient) {
    if(client.guildsConfig.get(interaction.guild!.id)?.config.leaveMessage) {
        const reject = new ButtonBuilder()
            .setCustomId("goodByeMessageReject")
            .setLabel("❌| İptal")
            .setStyle(ButtonStyle.Danger)
        const accept = new ButtonBuilder()
            .setCustomId("goodByeMessageAccept")
            .setLabel("✅| Değiştir")
            .setStyle(ButtonStyle.Success)
        const deleteButton = new ButtonBuilder()
            .setCustomId("goodByeMessageDelete")
            .setLabel("🗑️| Sil")
            .setStyle(ButtonStyle.Danger)
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([reject, accept, deleteButton])
        await interaction.reply({content: "Görüşürüz mesajı zaten ayarlı. Değiştirmek mi yoksa silmek mi istersiniz?", components: [row], ephemeral: true})
        const filter = (i: MessageComponentInteraction) => (i.customId === "goodByeMessageReject" || i.customId === "goodByeMessageAccept" || i.customId === "registerChannelDelete") && (i.user.id === interaction.user.id);
        try {
            const collector = await interaction.fetchReply() as Message
            const collector2 = await collector.awaitMessageComponent({filter, componentType: ComponentType.Button, time: 60000})
            if (collector2) {
                if (collector2.customId === "goodByeMessageReject") {
                    await collector2.reply({content: "İptal edildi.", ephemeral: true})
                } else if (collector2.customId === "goodByeMessageAccept") {
                    const TextInput = new TextInputBuilder()
                        .setCustomId("goodbyeMessage")
                        .setPlaceholder("Kullanılabilir değişkenler: {user}, {tag}, {name}, {id}, {server}, {memberCount}")
                        .setMinLength(1)
                        .setMaxLength(2000)
                        .setRequired(true)
                        .setLabel("Görüşürüz mesajı")
                        .setStyle(TextInputStyle.Paragraph)
                    const row = new ActionRowBuilder<TextInputBuilder>()
                        .addComponents([TextInput])
                    const modal = new ModalBuilder()
                        .setCustomId("goodbyeMessage")
                        .setTitle("Görüşürüz mesajı ayarla")
                        .addComponents([row])
                    const button = new ButtonBuilder()
                        .setCustomId("goodbyeMessage")
                        .setLabel("Görüşürüz mesajı ayarla")
                        .setStyle(ButtonStyle.Primary)
                    const row2 = new ActionRowBuilder<ButtonBuilder>()
                        .addComponents([button])
                    await collector2.reply({content: "Görüşürüz mesajı ayarlamak için aşağıdaki butona tıklayınız.", components: [row2], ephemeral: true})
                    const msg = await collector2.fetchReply() as Message
                    const buttonFilter = (i: MessageComponentInteraction) => (i.customId === "goodbyeMessage") && (i.user.id === interaction.user.id);
                    try {
                        const modalcollector = await msg.awaitMessageComponent({filter: buttonFilter, componentType: ComponentType.Button, time: 60000})
                        if (modalcollector) {
                            await modalcollector.showModal(modal)
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
                                await collector.reply({content: "Görüşürüz mesajı ayarlandı.", ephemeral: true})
                            } catch (e) {
                                await modalcollector.followUp({content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true})
                                console.log(e)
                            }
                        }
                    } catch (e) {
                        await interaction.followUp({content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true})
                        console.log(e)
                    }
                } else if(collector2.customId === "goodByeMessageDelete") {
                    const config = {
                        $set: {
                            "config.leaveMessage": null
                        }
                    }
                    await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                    await collector2.reply({content: "Görüşürüz mesajı silindi.", ephemeral: true})
                }
            }
        } catch (e) {
            await interaction.followUp({content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true})
            console.log(e)
        }
    } else {
        const TextInput = new TextInputBuilder()
            .setCustomId("goodbyeMessage")
            .setPlaceholder("Kullanılabilir değişkenler: {user}, {tag}, {name}, {id}, {server}, {memberCount}")
            .setMinLength(1)
            .setMaxLength(2000)
            .setRequired(true)
            .setLabel("Görüşürüz mesajı")
            .setStyle(TextInputStyle.Paragraph)
        const row = new ActionRowBuilder<TextInputBuilder>()
            .addComponents([TextInput])
        const modal = new ModalBuilder()
            .setCustomId("goodbyeMessage")
            .setTitle("Görüşürüz mesajı ayarla")
            .addComponents([row])
        const button = new ButtonBuilder()
            .setCustomId("goodbyeMessage")
            .setLabel("Görüşürüz mesajı ayarla")
            .setStyle(ButtonStyle.Primary)
        const row2 = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([button])
        await interaction.reply({content: "Görüşürüz mesajı ayarlamak için aşağıdaki butona tıklayınız.", components: [row2], ephemeral: true})
        const msg = await interaction.fetchReply() as Message
        const buttonFilter = (i: MessageComponentInteraction) => (i.customId === "goodbyeMessage") && (i.user.id === interaction.user.id);
        try {
            const modalcollector = await msg.awaitMessageComponent({filter: buttonFilter, componentType: ComponentType.Button, time: 60000})
            if (modalcollector) {
                await modalcollector.showModal(modal)
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
                    await collector.reply({content: "Görüşürüz mesajı ayarlandı.", ephemeral: true})
                } catch (e) {
                    await modalcollector.followUp({content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true})
                    console.log(e)
                }
            }
        } catch (e) {
            await interaction.followUp({content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true})
            console.log(e)
        }
    }
}

async function registerMessageChannel(interaction: SelectMenuInteraction, client: KhaxyClient) {
    if(client.guildsConfig.get(interaction.guild!.id)!.config.registerWelcomeChannel) {
        const reject = new ButtonBuilder()
            .setCustomId("registerMessageChannelReject")
            .setLabel("❌| İptal")
            .setStyle(ButtonStyle.Danger)
        const accept = new ButtonBuilder()
            .setCustomId("registerMessageChannelAccept")
            .setLabel("✅| Değiştir")
            .setStyle(ButtonStyle.Success)
        const deleteButton = new ButtonBuilder()
            .setCustomId("registerMessageChannelDelete")
            .setLabel("🗑️| Sil")
            .setStyle(ButtonStyle.Danger)
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([reject, accept, deleteButton])
        await interaction.reply({content: "Kayıt mesajı kanalı zaten ayarlanmış. Değiştirmek mi yoksa silmek mi istersiniz?", components: [row], ephemeral: true})
        const msg = await interaction.fetchReply() as Message
        const buttonFilter = (i: MessageComponentInteraction) => (i.customId === "registerMessageChannelReject" || i.customId === "registerMessageChannelAccept" || i.customId === "registerMessageChannelDelete") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({filter: buttonFilter, componentType: ComponentType.Button, time: 60000})
            if (collector) {
                if (collector.customId === "registerMessageChannelReject") {
                    await collector.reply({content: "İşlem iptal edildi.", ephemeral: true})
                } else if (collector.customId === "registerMessageChannelAccept") {
                    const channelSelect = new ChannelSelectMenuBuilder()
                        .setCustomId("registerWelcomeChannelAccept")
                        .setPlaceholder("Kanal seçiniz.")
                        .setDisabled(false)
                        .setChannelTypes(ChannelType.GuildText)
                    const row2 = new ActionRowBuilder<ChannelSelectMenuBuilder>()
                        .addComponents(channelSelect)
                    await collector.reply({content: "Yeni kayıt kanalını aşağıdan ayarlayınız", components: [row2], ephemeral: true})
                    const msg = await collector.fetchReply() as Message
                    const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id
                    try {
                        const collector = await msg.awaitMessageComponent({filter: filter, componentType: ComponentType.ChannelSelect, time: 60000})
                        if(collector) {

                            const data = collector.values[0]
                            const channel = interaction.guild!.channels.cache.get(data)
                            if (!channel) {
                                await collector.reply({content: "Böyle bir kanal bulunamadı."})
                                return
                            }
                            if(channel.type !== ChannelType.GuildText) {
                                await collector.reply({content: "Lütfen bir metin kanalı giriniz."})
                                return
                            }
                            const config = {
                                $set: {
                                    "config.registerWelcomeChannel": channel.id
                                }
                            }
                            await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                            await collector.reply({content: "Kayıt kanalı ayarlandı.", ephemeral: true})
                        }
                    } catch (error) {
                        console.log(error)
                        await interaction.followUp({content: "İşlem iptal edildi çünkü bir hata ile karşılaşıldı", ephemeral: true})
                    }
                } else if (collector.customId === "registerMessageChannelDelete") {
                    const config = {
                        $set: {
                            "config.registerWelcomeChannel": null
                        }
                    }
                    await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                    await collector.reply({content: "Kayıt mesajı kanalı silindi.", ephemeral: true})
                }
            }
        } catch (e) {
            await interaction.followUp({content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true})
            console.log(e)
        }
    } else {
        const channelSelect = new ChannelSelectMenuBuilder()
            .setCustomId("registerWelcomeChannelAccept")
            .setPlaceholder("Kanal seçiniz.")
            .setDisabled(false)
            .setChannelTypes(ChannelType.GuildText)
        const row2 = new ActionRowBuilder<ChannelSelectMenuBuilder>()
            .addComponents(channelSelect)
        await interaction.reply({content: "Yeni kayıt kanalını aşağıdan ayarlayınız", components: [row2], ephemeral: true})
        const msg = await interaction.fetchReply() as Message
        const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id
        try {
            const collector = await msg.awaitMessageComponent({filter: filter, componentType: ComponentType.ChannelSelect, time: 60000})
            if(collector) {

                const data = collector.values[0]
                const channel = interaction.guild!.channels.cache.get(data)
                if (!channel) {
                    await collector.reply({content: "Böyle bir kanal bulunamadı."})
                    return
                }
                if(channel.type !== ChannelType.GuildText) {
                    await collector.reply({content: "Lütfen bir metin kanalı giriniz."})
                    return
                }
                const config = {
                    $set: {
                        "config.registerWelcomeChannel": channel.id
                    }
                }
                await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                await collector.reply({content: "Kayıt kanalı ayarlandı.", ephemeral: true})
            }
        } catch (error) {
            console.log(error)
            await interaction.followUp({content: "İşlem iptal edildi çünkü bir hata ile karşılaşıldı", ephemeral: true})
        }
    }
}

async function moderationConfig(interaction: ChatInputCommandInteraction, client: KhaxyClient) {
    const SelectMenu = new StringSelectMenuBuilder()
        .setCustomId("moderationConfig")
        .setPlaceholder("Moderasyon ayarları")
        .addOptions([
            {
                label: "ModLog Kanalını Ayarla",
                value: "modLogChannel",
                description: "ModLog kanalını ayarlar.",
                emoji: "📝"
            },
            {
                label: "Susturmada Tüm Rolleri Al",
                value: "muteGetAllRoles",
                description: "Susturmada tüm rolleri alır.",
                emoji: "🔇"
            },
            {
                label: "ModMail'i Ayarla",
                value: "modMail",
                description: "ModMail'i ayarlar.",
                emoji: "📧"
            }
            ])
    const row = new ActionRowBuilder<SelectMenuBuilder>()
        .addComponents([SelectMenu])
    await interaction.reply({content: "Moderasyon ayarları için aşağıdaki menüden birini seçiniz.", components: [row], ephemeral: true})
    const msg = await interaction.fetchReply() as Message
    const filter = (i: SelectMenuInteraction) => (i.customId === "moderationConfig" || i.customId === "muteGetAllRoles") && i.user.id === interaction.user.id
    try {
        const collector = await msg.awaitMessageComponent({filter, componentType: ComponentType.SelectMenu, time: 60000})
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
        await interaction.followUp({content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true})
        console.log(e)
    }
}

async function modLogChannel(interaction: SelectMenuInteraction, client: KhaxyClient) {
    if(client.guildsConfig.get(interaction.guild!.id)?.config.modlogChannel) {
        const reject = new ButtonBuilder()
            .setCustomId("modLogChannelReject")
            .setLabel("❌| İptal")
            .setStyle(ButtonStyle.Danger)
        const accept = new ButtonBuilder()
            .setCustomId("modLogChannelAccept")
            .setLabel("✅| Değiştir")
            .setStyle(ButtonStyle.Success)
        const deleteButton = new ButtonBuilder()
            .setCustomId("modLogChannelDelete")
            .setLabel("🗑️| Sil")
            .setStyle(ButtonStyle.Danger)
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([reject, accept, deleteButton])
        await interaction.reply({content: "ModLog kanalı ayarlı. Değiştirmek mi yoksa silmek mi istersiniz?", components: [row], ephemeral: true})
        const msg = await interaction.fetchReply() as Message
        const filter = (i: MessageComponentInteraction) => (i.customId === "modLogChannelReject" || i.customId === "modLogChannelAccept" || i.customId === "modLogChannelDelete") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({filter, componentType: ComponentType.Button, time: 60000})
            if (collector.customId === "modLogChannelReject") {
                await collector.reply({content: "İptal edildi.", ephemeral: true})
            } else if (collector.customId === "modLogChannelAccept") {
                const channelSelect = new ChannelSelectMenuBuilder()
                    .setCustomId("modlogChannel")
                    .setPlaceholder("Kanal seçiniz.")
                    .setDisabled(false)
                    .setChannelTypes(ChannelType.GuildText)
                const row2 = new ActionRowBuilder<ChannelSelectMenuBuilder>()
                    .addComponents(channelSelect)
                await collector.reply({content: "Yeni modlog kanalını aşağıdan ayarlayınız", components: [row2], ephemeral: true})
                const msg = await collector.fetchReply() as Message
                const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id
                try {
                    const collector = await msg.awaitMessageComponent({filter: filter, componentType: ComponentType.ChannelSelect, time: 60000})
                    if(collector) {

                        const data = collector.values[0]
                        const channel = interaction.guild!.channels.cache.get(data)
                        if (!channel) {
                            await collector.reply({content: "Böyle bir kanal bulunamadı."})
                            return
                        }
                        if(channel.type !== ChannelType.GuildText) {
                            await collector.reply({content: "Lütfen bir metin kanalı giriniz."})
                            return
                        }
                        const config = {
                            $set: {
                                "config.modlogChannel": channel.id
                            }
                        }
                        await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                        await collector.reply({content: "Modlog kanalı ayarlandı.", ephemeral: true})
                    }
                } catch (error) {
                    console.log(error)
                    await interaction.followUp({content: "İşlem iptal edildi çünkü bir hata ile karşılaşıldı", ephemeral: true})
                }
            } else if (collector.customId === "modLogChannelDelete") {
                const config = {
                    $set: {
                        "config.modlogChannel": null
                    }
                }
                await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                await collector.reply({content: "Modlog kanalı silindi.", ephemeral: true})
            }
        } catch (e) {
            await interaction.followUp({content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true})
            console.log(e)
        }
    } else {
        const channelSelect = new ChannelSelectMenuBuilder()
            .setCustomId("modlogChannel")
            .setPlaceholder("Kanal seçiniz.")
            .setDisabled(false)
            .setChannelTypes(ChannelType.GuildText)
        const row2 = new ActionRowBuilder<ChannelSelectMenuBuilder>()
            .addComponents(channelSelect)
        await interaction.reply({content: "Yeni modlog kanalını aşağıdan ayarlayınız", components: [row2], ephemeral: true})
        const msg = await interaction.fetchReply() as Message
        const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id
        try {
            const collector = await msg.awaitMessageComponent({filter: filter, componentType: ComponentType.ChannelSelect, time: 60000})
            if(collector) {

                const data = collector.values[0]
                const channel = interaction.guild!.channels.cache.get(data)
                if (!channel) {
                    await collector.reply({content: "Böyle bir kanal bulunamadı."})
                    return
                }
                if(channel.type !== ChannelType.GuildText) {
                    await collector.reply({content: "Lütfen bir metin kanalı giriniz."})
                    return
                }
                const config = {
                    $set: {
                        "config.modlogChannel": channel.id
                    }
                }
                await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                await collector.reply({content: "Modlog kanalı ayarlandı.", ephemeral: true})
            }
        } catch (error) {
            console.log(error)
            await interaction.followUp({content: "İşlem iptal edildi çünkü bir hata ile karşılaşıldı", ephemeral: true})
        }
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
        await interaction.reply({content: "Susturmada tüm rolleri alma ayarı aktif edildi.", ephemeral: true})
    } else {
        const config = {
            $set: {
                "config.muteGetAllRoles": false
            }
        }
        await client.updateGuildConfig({guildId: interaction.guild!.id, config})
        await interaction.reply({content: "Susturmada tüm rolleri alma ayarı kapatıldı.", ephemeral: true})
    }
}

async function modMail(interaction: SelectMenuInteraction, client: KhaxyClient) {
    if(client.guildsConfig.get(interaction.guild!.id)?.config.modmail.logChannel) {
        const reject = new ButtonBuilder()
            .setCustomId("modMailReject")
            .setLabel("❌| İptal")
            .setStyle(ButtonStyle.Danger)
        const deleteButton = new ButtonBuilder()
            .setCustomId("modMailDelete")
            .setLabel("🗑️| Sil")
            .setStyle(ButtonStyle.Danger)
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([reject, deleteButton])
        await interaction.reply({content: "Modmail daha önceden ayarlanmış. Eğer kanalları sildiyseniz sil seçeneğini kullanınız.", components: [row], ephemeral: true})
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
                    await collector.reply({content: "Modmail ayarı silindi.", ephemeral: true})
                } else if(collector.customId === "modMailReject") {
                    await collector.reply({content: "İşlem iptal edildi.", ephemeral: true})
                }
            }
        } catch (e){
            await interaction.followUp({content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true})
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
            await interaction.reply({content: "Modmail kanalları başarıyla ayarlandı.", ephemeral: true})
        } catch (e) {
            await interaction.reply({content: "Bir hata ile karşılaşıldı. Kanal açmak için yetiklerim var mı?", ephemeral: true})
            console.error(e)
        }
    }
}

async function roleConfig(interaction: ChatInputCommandInteraction, client: KhaxyClient) {
    const SelectMenu = new StringSelectMenuBuilder()
        .setCustomId("roleConfig")
        .setPlaceholder("Rol ayarları")
        .addOptions([
            {
                label: "Üye Rolü Ayarla",
                value: "memberRole",
                description: "Üye rolünü ayarlar.",
                emoji: "👤"
            },
            {
                label: "Erkek Rolü Ayarla",
                value: "maleRole",
                description: "Erkek rolünü ayarlar.",
                emoji: "👨"
            },
            {
                label: "Kadın Rolü Ayarla",
                value: "femaleRole",
                description: "Kadın rolünü ayarlar.",
                emoji: "👩"
            },
            {
                label: "Mute Rolü Ayarla",
                value: "muteRole",
                description: "Mute rolünü ayarlar.",
                emoji: "🔇"
            },
            {
                label: "DJ Rolü Ayarla",
                value: "djRole",
                description: "DJ rolünü ayarlar.",
                emoji: "🎧"
            },
            {
                label: "Günün Rengi Rol Ayarla",
                value: "dayColorRole",
                description: "Günün rengi rolünü ayarlar.",
                emoji: "🌈"
            }
            ])
    const row = new ActionRowBuilder<SelectMenuBuilder>()
        .addComponents([SelectMenu])
    await interaction.reply({content: "Rol ayarlamak için aşağıdaki menüden birini seçiniz.", components: [row], ephemeral: true})
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
        await interaction.followUp({content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true})
        console.log(e)
    }
}

async function memberRole(interaction: SelectMenuInteraction, client: KhaxyClient) {
    if (client.guildsConfig.get(interaction.guild!.id)!.config.memberRole) {
        const reject = new ButtonBuilder()
            .setCustomId("memberRoleReject")
            .setLabel("❌| İptal")
            .setStyle(ButtonStyle.Danger)
        const accept = new ButtonBuilder()
            .setCustomId("memberRoleAccept")
            .setLabel("✅| Değiştir")
            .setStyle(ButtonStyle.Success)
        const deleteButton = new ButtonBuilder()
            .setCustomId("memberRoleDelete")
            .setLabel("🗑️| Sil")
            .setStyle(ButtonStyle.Danger)
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([reject, accept, deleteButton])
        await interaction.reply({content: "Üye rolü ayarlı. Değiştirmek mi yoksa silmek mi istersiniz?", components: [row], ephemeral: true})
        const msg = await interaction.fetchReply() as Message
        const filter = (i: MessageComponentInteraction) => (i.customId === "memberRoleReject" || i.customId === "memberRoleAccept" || i.customId === "memberRoleDelete") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({filter, componentType: ComponentType.Button, time: 60000})
            if (collector.customId === "memberRoleReject") {
                await collector.reply({content: "İşlem iptal edildi.", ephemeral: true})
            } else if (collector.customId === "memberRoleAccept") {
                const roleSelect = new RoleSelectMenuBuilder()
                    .setCustomId("memberRole")
                    .setPlaceholder("Üye rolü seçiniz.")
                    .setMinValues(1)
                    .setMaxValues(1)
                const row2 = new ActionRowBuilder<RoleSelectMenuBuilder>()
                    .addComponents([roleSelect])
                await collector.reply({content: "Üye rolü ayarlamak için aşağıdan uygun role tıklayınız.", components: [row2], ephemeral: true})
                const msg = await collector.fetchReply() as Message
                const buttonFilter = (i: RoleSelectMenuInteraction) => (i.customId === "memberRole") && (i.user.id === interaction.user.id);
                try {
                    const collector = await msg.awaitMessageComponent({filter: buttonFilter, componentType: ComponentType.RoleSelect, time: 60000})
                    if (collector) {
                        const data = collector.values[0]
                        const config = {
                            $set: {
                                "config.memberRole": data
                            }
                        }
                        await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                        await collector.reply({content: `Üye rolü başarıyla ayarlandı`, ephemeral: true})
                    }
                } catch (e) {
                    await interaction.followUp({content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true})
                    console.log(e)
                }
            } else if (collector.customId === "memberRoleDelete") {
                const config = {
                    $set: {
                        "config.memberRole": null
                    }
                }
                await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                await collector.reply({content: "Modlog kanalı silindi.", ephemeral: true})
            }
        } catch (e) {
            await interaction.followUp({content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true})
            console.log(e)
        }
    } else {
        const roleSelect = new RoleSelectMenuBuilder()
            .setCustomId("memberRole")
            .setPlaceholder("Üye rolü seçiniz.")
            .setMinValues(1)
            .setMaxValues(1)
        const row2 = new ActionRowBuilder<RoleSelectMenuBuilder>()
            .addComponents([roleSelect])
        await interaction.reply({content: "Üye rolü ayarlamak için aşağıdan uygun role tıklayınız.", components: [row2], ephemeral: true})
        const msg = await interaction.fetchReply() as Message
        const buttonFilter = (i: RoleSelectMenuInteraction) => (i.customId === "memberRole") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({filter: buttonFilter, componentType: ComponentType.RoleSelect, time: 60000})
            if (collector) {
                const data = collector.values[0]
                const config = {
                    $set: {
                        "config.memberRole": data
                    }
                }
                await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                await collector.reply({content: `Üye rolü başarıyla ayarlandı`, ephemeral: true})
            }
        } catch (e) {
            await interaction.followUp({content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true})
            console.log(e)
        }
    }
}

async function maleRole(interaction: SelectMenuInteraction, client: KhaxyClient) {
    if (client.guildsConfig.get(interaction.guild!.id)!.config.maleRole) {
        const reject = new ButtonBuilder()
            .setCustomId("maleRoleReject")
            .setLabel("❌| İptal")
            .setStyle(ButtonStyle.Danger)
        const accept = new ButtonBuilder()
            .setCustomId("maleRoleAccept")
            .setLabel("✅| Değiştir")
            .setStyle(ButtonStyle.Success)
        const deleteButton = new ButtonBuilder()
            .setCustomId("maleRoleDelete")
            .setLabel("🗑️| Sil")
            .setStyle(ButtonStyle.Danger)
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([reject, accept, deleteButton])
        await interaction.reply({content: "Erkek rolü ayarlı. Değiştirmek mi yoksa silmek mi istersiniz?", components: [row], ephemeral: true})
        const msg = await interaction.fetchReply() as Message
        const filter = (i: MessageComponentInteraction) => (i.customId === "maleRoleReject" || i.customId === "maleRoleAccept" || i.customId === "maleRoleDelete") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({
                filter,
                componentType: ComponentType.Button,
                time: 60000
            })
            if (collector.customId === "maleRoleReject") {
                await collector.reply({content: "İptal edildi.", ephemeral: true})
            } else if (collector.customId === "maleRoleAccept") {
                const roleSelect = new RoleSelectMenuBuilder()
                    .setCustomId("maleRole")
                    .setPlaceholder("Erkek rolünü seçiniz.")
                    .setMinValues(1)
                    .setMaxValues(1)
                const row2 = new ActionRowBuilder<RoleSelectMenuBuilder>()
                    .addComponents([roleSelect])
                await collector.reply({content: "Erkek rolünü ayarlamak için aşağıdan uygun role tıklayınız.", components: [row2], ephemeral: true})
                const msg = await collector.fetchReply() as Message
                const buttonFilter = (i: RoleSelectMenuInteraction) => (i.customId === "maleRole") && (i.user.id === interaction.user.id);
                try {
                    const collector = await msg.awaitMessageComponent({filter: buttonFilter, componentType: ComponentType.RoleSelect, time: 60000})
                    if (collector) {
                        const data = collector.values[0]
                        const config = {
                            $set: {
                                "config.maleRole": data
                            }
                        }
                        await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                        await collector.reply({content: `Erkek rolü başarıyla ayarlandı`, ephemeral: true})
                    }
                } catch (e) {
                    await interaction.followUp({content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true})
                    console.log(e)
                }
            } else if (collector.customId === "maleRoleDelete") {
                const config = {
                    $set: {
                        "config.maleRole": null
                    }
                }
                await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                await collector.reply({content: "Erkek rolü silindi.", ephemeral: true})
            }
        } catch (e) {
            await interaction.followUp({content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true})
            console.log(e)
        }
    } else {
        const roleSelect = new RoleSelectMenuBuilder()
            .setCustomId("maleRole")
            .setPlaceholder("Erkek rolünü seçiniz.")
            .setMinValues(1)
            .setMaxValues(1)
        const row2 = new ActionRowBuilder<RoleSelectMenuBuilder>()
            .addComponents([roleSelect])
        await interaction.reply({content: "Erkek rolünü ayarlamak için aşağıdan uygun role tıklayınız.", components: [row2], ephemeral: true})
        const msg = await interaction.fetchReply() as Message
        const buttonFilter = (i: RoleSelectMenuInteraction) => (i.customId === "maleRole") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({filter: buttonFilter, componentType: ComponentType.RoleSelect, time: 60000})
            if (collector) {
                const data = collector.values[0]
                const config = {
                    $set: {
                        "config.maleRole": data
                    }
                }
                await client.updateGuildConfig({guildId: interaction.guild!.id, config})
                await collector.reply({content: `Erkek rolü başarıyla ayarlandı`, ephemeral: true})
            }
        } catch (e) {
            await interaction.followUp({content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true})
            console.log(e)
        }
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