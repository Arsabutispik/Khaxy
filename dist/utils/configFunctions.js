import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, ComponentType, EmbedBuilder, ModalBuilder, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle, ChannelSelectMenuBuilder, RoleSelectMenuBuilder, PermissionsBitField } from "discord.js";
async function registerConfig(interaction, client) {
    const SelectMenu = new StringSelectMenuBuilder()
        .setCustomId("registerConfig")
        .setPlaceholder("Ayarlar")
        .setDisabled(false)
        .addOptions({
        label: "Kayıt Kanalı",
        value: "registerChannel",
        description: "Kayıt kanalı ayarlar.",
        emoji: "📝"
    }, {
        label: "Kayıt Sorumlusu Rolü",
        value: "staffRole",
        description: "Kayıt sorumlusu rolü ayarlar.",
        emoji: "👮‍♂️"
    }, {
        label: "Kayıt Mesajı",
        value: "registerMessage",
        description: "Kayıt mesajı ayarlar.",
        emoji: "📜"
    }, {
        label: "Kayıt Mesajı Silinsin mi?",
        value: "registerMessageClear",
        description: "Kayıt mesajı silinsin mi ayarlar.",
        emoji: "🗑️"
    }, {
        label: "Kayıt Kanalı mesajları Silinsin mi?",
        value: "registerChannelClear",
        description: "Kayıt kanalı mesajları silinsin mi ayarlar.",
        emoji: "🗑️"
    });
    const selectMenuRow = new ActionRowBuilder()
        .addComponents(SelectMenu);
    await interaction.reply({ content: "Ayarlamak istediğiniz ayarı seçiniz.", components: [selectMenuRow], ephemeral: true });
    const selectMsg = await interaction.fetchReply();
    const selectFilter = (i) => i.user.id === interaction.user.id;
    try {
        const selectCollector = await selectMsg.awaitMessageComponent({ filter: selectFilter, componentType: ComponentType.SelectMenu, time: 60000 });
        if (selectCollector.customId === "registerConfig") {
            switch (selectCollector.values[0]) {
                case "registerChannel":
                    await registerChannel(selectCollector, client);
                    break;
                case "staffRole":
                    await staffRole(selectCollector, client);
                    break;
                case "registerMessage":
                    await registerMessage(selectCollector, client);
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
        await interaction.followUp({ content: "İşlem iptal edildi.", ephemeral: true });
        console.log(error);
    }
}
async function registerChannel(interaction, client) {
    if (client.guildsConfig.get(interaction.guild.id)?.config.registerChannel) {
        const reject = new ButtonBuilder()
            .setCustomId("registerChannelReject")
            .setLabel("❌| İptal")
            .setStyle(ButtonStyle.Danger);
        const accept = new ButtonBuilder()
            .setCustomId("registerChannelAccept")
            .setLabel("✅| Değiştir")
            .setStyle(ButtonStyle.Success);
        const deleteButton = new ButtonBuilder()
            .setCustomId("registerChannelDelete")
            .setLabel("🗑️| Sil")
            .setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder()
            .addComponents([reject, accept, deleteButton]);
        await interaction.reply({ content: "Kayıt kanalı zaten ayarlanmış. Değiştirmek mi yoksa silmek mi istersiniz?", components: [row], ephemeral: true });
        const msg = await interaction.fetchReply();
        const filter = (i) => i.user.id === interaction.user.id;
        try {
            const collector = await msg.awaitMessageComponent({ filter: filter, componentType: ComponentType.Button, time: 60000 });
            if (collector.customId === "registerChannelReject") {
                await collector.reply({ content: "İşlem iptal edildi.", components: [] });
            }
            else if (collector.customId === "registerChannelAccept") {
                const channelSelect = new ChannelSelectMenuBuilder()
                    .setCustomId("registerChannel")
                    .setPlaceholder("Kanal seçiniz.")
                    .setDisabled(false)
                    .setChannelTypes(ChannelType.GuildText);
                const row2 = new ActionRowBuilder()
                    .addComponents(channelSelect);
                await collector.reply({ content: "Yeni kayıt kanalını aşağıdan ayarlayınız", components: [row2], ephemeral: true });
                const msg = await collector.fetchReply();
                const filter = (i) => i.user.id === interaction.user.id;
                try {
                    const collector = await msg.awaitMessageComponent({ filter: filter, componentType: ComponentType.ChannelSelect, time: 60000 });
                    if (collector) {
                        const data = collector.values[0];
                        const channel = interaction.guild.channels.cache.get(data);
                        if (!channel) {
                            await collector.reply({ content: "Böyle bir kanal bulunamadı." });
                            return;
                        }
                        if (channel.type !== ChannelType.GuildText) {
                            await collector.reply({ content: "Lütfen bir metin kanalı giriniz." });
                            return;
                        }
                        const config = {
                            $set: {
                                "config.registerChannel": channel.id
                            }
                        };
                        await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                        await collector.reply({ content: "Kayıt kanalı ayarlandı.", ephemeral: true });
                    }
                }
                catch (error) {
                    console.log(error);
                    await interaction.followUp({ content: "İşlem iptal edildi çünkü bir hata ile karşılaşıldı", ephemeral: true });
                }
            }
            else if (collector.customId === "registerChannelDelete") {
                const config = {
                    $set: {
                        "config.registerChannel": null
                    }
                };
                await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                await collector.reply({ content: "Kayıt kanalı silindi.", components: [], ephemeral: true });
            }
        }
        catch (error) {
            console.log(error);
            await interaction.followUp({ content: "İşlem iptal edildi çünkü bir hata ile karşılaşıldı", ephemeral: true });
        }
    }
    else {
        const channelSelect = new ChannelSelectMenuBuilder()
            .setCustomId("registerChannel")
            .setPlaceholder("Kanal seçiniz.")
            .setDisabled(false)
            .setChannelTypes(ChannelType.GuildText);
        const row2 = new ActionRowBuilder()
            .addComponents(channelSelect);
        await interaction.reply({ content: "Yeni kayıt kanalını aşağıdan ayarlayınız", components: [row2], ephemeral: true });
        const msg = await interaction.fetchReply();
        const filter = (i) => i.user.id === interaction.user.id;
        try {
            const collector = await msg.awaitMessageComponent({ filter: filter, componentType: ComponentType.ChannelSelect, time: 60000 });
            if (collector) {
                const data = collector.values[0];
                const channel = interaction.guild.channels.cache.get(data);
                if (!channel) {
                    await collector.reply({ content: "Böyle bir kanal bulunamadı." });
                    return;
                }
                if (channel.type !== ChannelType.GuildText) {
                    await collector.reply({ content: "Lütfen bir metin kanalı giriniz." });
                    return;
                }
                const config = {
                    $set: {
                        "config.registerChannel": channel.id
                    }
                };
                await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                await collector.reply({ content: "Kayıt kanalı ayarlandı.", ephemeral: true });
                channelSelect.setDisabled(true);
                await msg.edit({ content: "Kayıt kanalı ayarlandı.", components: [row2] });
            }
        }
        catch (error) {
            console.log(error);
            await interaction.followUp({ content: "İşlem iptal edildi çünkü bir hata ile karşılaşıldı", ephemeral: true });
        }
    }
}
async function staffRole(interaction, client) {
    if (client.guildsConfig.get(interaction.guild.id).config.staffRole?.length > 0) {
        const reject = new ButtonBuilder()
            .setCustomId("staffRoleReject")
            .setLabel("❌| İptal")
            .setStyle(ButtonStyle.Danger);
        const accept = new ButtonBuilder()
            .setCustomId("staffRoleAccept")
            .setLabel("✅| Ekle")
            .setStyle(ButtonStyle.Success);
        const deleteButton = new ButtonBuilder()
            .setCustomId("staffRoleDelete")
            .setLabel("🗑️| Sil")
            .setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder()
            .addComponents([reject, accept, deleteButton]);
        await interaction.reply({ content: "Yetkili rolleri zaten ayarlanmış. Ekleme yapmak mı yoksa silmek mi istersiniz", components: [row], ephemeral: true });
        const msg = await interaction.fetchReply();
        const filter = (i) => (i.customId === "staffRoleReject" || i.customId === "staffRoleAccept" || i.customId === "staffRoleDelete") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({ filter, componentType: ComponentType.Button, time: 60000 });
            if (collector) {
                if (collector.customId === "staffRoleReject") {
                    await collector.reply({ content: "İşlem iptal edildi.", components: [], ephemeral: true });
                }
                else if (collector.customId === "staffRoleAccept") {
                    const roleSelect = new RoleSelectMenuBuilder()
                        .setCustomId("staffRole")
                        .setPlaceholder("Kayıt sorumlusu rolü seçiniz.")
                        .setMinValues(1)
                        .setMaxValues(25);
                    const row2 = new ActionRowBuilder()
                        .addComponents([roleSelect]);
                    await collector.reply({ content: "Kayıt sorumlusu rolü ayarlamak için aşağıdan uygun rollere tıklayınız.", components: [row2], ephemeral: true });
                    const msg = await collector.fetchReply();
                    const buttonFilter = (i) => (i.customId === "staffRole") && (i.user.id === interaction.user.id);
                    try {
                        const collector = await msg.awaitMessageComponent({ filter: buttonFilter, componentType: ComponentType.RoleSelect, time: 60000 });
                        if (collector) {
                            const datas = collector.values;
                            let alreadySelected = [];
                            let roles = [];
                            for (const data of datas) {
                                const role = await interaction.guild.roles.cache.get(data);
                                if (client.guildsConfig.get(interaction.guild.id)?.config.staffRole.includes(role.id)) {
                                    alreadySelected.push(role.name.replace(/(^\w|\s\w)/g, c => c.toUpperCase()));
                                    continue;
                                }
                                roles.push(role.id);
                            }
                            const config = {
                                $push: {
                                    "config.staffRole": roles
                                }
                            };
                            await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                            await collector.reply({ content: `Kayıt sorumlusu rolleri ayarlandı. ${alreadySelected.length ? `\`${alreadySelected.join(", ")}\` rolleri daha önceden ayarlanmış` : ""}`, ephemeral: true });
                        }
                    }
                    catch (e) {
                        await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
                        console.log(e);
                    }
                }
                else if (collector.customId === "staffRoleDelete") {
                    const embed = new EmbedBuilder()
                        .setDescription(`Silmek için aşağıdaki rol isimlerini kullanabilirsiniz. Silmek için aşağıdan seçmeniz yeterlidir`)
                        .setColor("Random")
                        .setTimestamp()
                        .setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });
                    const roles = client.guildsConfig.get(interaction.guild.id)?.config.staffRole;
                    const selectMenu = new StringSelectMenuBuilder()
                        .setCustomId("staffRoleDelete")
                        .setPlaceholder("Silmek istediğiniz rolleri seçiniz.")
                        .setMinValues(1)
                        .setMaxValues(roles.length);
                    for (const role of roles) {
                        const roleData = (await interaction.guild.roles.cache.get(role));
                        selectMenu.addOptions({
                            label: roleData.name.replace(/(^\w|\s\w)/g, c => c.toUpperCase()),
                            value: roleData.id
                        });
                    }
                    const row = new ActionRowBuilder()
                        .addComponents([selectMenu]);
                    await collector.reply({ content: "Silmek istediğiniz rolleri seçiniz.", embeds: [embed], components: [row], ephemeral: true });
                    const msg = await collector.fetchReply();
                    const filter = (i) => (i.customId === "staffRoleDelete") && (i.user.id === interaction.user.id);
                    try {
                        const collector = await msg.awaitMessageComponent({ filter, componentType: ComponentType.SelectMenu, time: 60000 });
                        if (collector) {
                            const data = collector.values;
                            const config = {
                                $pullAll: {
                                    "config.staffRole": data
                                }
                            };
                            await client.updateGuildConfig({ guildId: collector.guild.id, config });
                            await collector.reply({ content: "Kayıt sorumlusu rolü silindi.", ephemeral: true });
                        }
                    }
                    catch (e) {
                        await collector.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
                        console.log(e);
                    }
                }
            }
        }
        catch (e) {
            await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
            console.log(e);
        }
    }
    else {
        const roleSelect = new RoleSelectMenuBuilder()
            .setCustomId("staffRole")
            .setPlaceholder("Kayıt sorumlusu rolü seçiniz.")
            .setMinValues(1)
            .setMaxValues(25);
        const row2 = new ActionRowBuilder()
            .addComponents([roleSelect]);
        await interaction.reply({ content: "Kayıt sorumlusu rolü ayarlamak için aşağıdan uygun rollere tıklayınız.", components: [row2], ephemeral: true });
        const msg = await interaction.fetchReply();
        const buttonFilter = (i) => (i.customId === "staffRole") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({ filter: buttonFilter, componentType: ComponentType.RoleSelect, time: 60000 });
            if (collector) {
                const datas = collector.values;
                let alreadySelected = [];
                let roles = [];
                for (const data of datas) {
                    const role = await interaction.guild.roles.cache.get(data);
                    if (client.guildsConfig.get(interaction.guild.id)?.config.staffRole.includes(role.id)) {
                        alreadySelected.push(role.name.replace(/(^\w|\s\w)/g, c => c.toUpperCase()));
                        continue;
                    }
                    roles.push(role.id);
                }
                const config = {
                    $push: {
                        "config.staffRole": roles
                    }
                };
                await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                await collector.reply({ content: `Kayıt sorumlusu rolleri ayarlandı. ${alreadySelected.length ? `\`${alreadySelected.join(", ")}\` rolleri daha önceden ayarlanmış` : ""}`, ephemeral: true });
            }
        }
        catch (e) {
            await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
            console.log(e);
        }
    }
}
async function registerMessage(interaction, client) {
    if (client.guildsConfig.get(interaction.guild.id)?.config.registerMessage) {
        const reject = new ButtonBuilder()
            .setCustomId("registerMessageReject")
            .setLabel("❌| İptal")
            .setStyle(ButtonStyle.Danger);
        const accept = new ButtonBuilder()
            .setCustomId("registerMessageAccept")
            .setLabel("✅| Değiştir")
            .setStyle(ButtonStyle.Success);
        const deleteButton = new ButtonBuilder()
            .setCustomId("registerMessageDelete")
            .setLabel("🗑️| Sil")
            .setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder()
            .addComponents([reject, accept, deleteButton]);
        await interaction.reply({ content: "Kayıt kanalına atılacak mesaj zaten ayarlanmış. Değiştirmek mi yoksa silmek mi istersiniz?", components: [row], ephemeral: true });
        const msg = await interaction.fetchReply();
        const buttonFilter = (i) => (i.customId === "staffRoleReject" || i.customId === "staffRoleAccept" || i.customId === "staffRoleDelete") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({ filter: buttonFilter, componentType: ComponentType.Button, time: 60000 });
            if (collector) {
                if (collector.customId === "registerMessageReject") {
                    await collector.reply({ content: "İşlem iptal edildi.", components: [], ephemeral: true });
                }
                else if (collector.customId === "registerMessageRoleAccept") {
                    const TextInput = new TextInputBuilder()
                        .setCustomId("registerMessage")
                        .setPlaceholder("Kullanılabilir değişkenler: {user}, {tag}, {name}, {id}, {server}, {memberCount}")
                        .setMinLength(1)
                        .setRequired(true)
                        .setStyle(TextInputStyle.Paragraph)
                        .setLabel("Kayıt Mesajı");
                    const row = new ActionRowBuilder()
                        .addComponents([TextInput]);
                    const modal = new ModalBuilder()
                        .addComponents([row])
                        .setTitle("Kayıt Mesajı")
                        .setCustomId("registerMessage")
                        .toJSON();
                    const button = new ButtonBuilder()
                        .setCustomId("registerMessage")
                        .setLabel("Kayıt Mesajı")
                        .setStyle(ButtonStyle.Primary);
                    const row2 = new ActionRowBuilder()
                        .addComponents([button]);
                    await collector.reply({ content: "Kayıt mesajı ayarlamak için aşağıdaki butona tıklayınız.", components: [row2], ephemeral: true });
                    const msg = await collector.fetchReply();
                    const buttonFilter = (i) => (i.customId === "registerMessage") && (i.user.id === interaction.user.id);
                    try {
                        const collector = await msg.awaitMessageComponent({ filter: buttonFilter, componentType: ComponentType.Button, time: 60000 });
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
                                await collector.reply({ content: "Kayıt mesajı ayarlandı.", ephemeral: true });
                            }
                            catch (e) {
                                await collector.reply({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
                                console.log(e);
                            }
                        }
                    }
                    catch (e) {
                        await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
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
                    await collector.reply({ content: "Yetkili rolü başarıyla silindi.", ephemeral: true });
                }
            }
        }
        catch (e) {
            await interaction.reply({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
            console.log(e);
        }
    }
    else {
        const TextInput = new TextInputBuilder()
            .setCustomId("registerMessage")
            .setPlaceholder("Kullanılabilir değişkenler: {user}, {tag}, {name}, {id}, {server}, {memberCount}")
            .setMinLength(1)
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph)
            .setLabel("Kayıt Mesajı");
        const row = new ActionRowBuilder()
            .addComponents([TextInput]);
        const modal = new ModalBuilder()
            .addComponents([row])
            .setTitle("Kayıt Mesajı")
            .setCustomId("registerMessage")
            .toJSON();
        const button = new ButtonBuilder()
            .setCustomId("registerMessage")
            .setLabel("Kayıt Mesajı")
            .setStyle(ButtonStyle.Primary);
        const row2 = new ActionRowBuilder()
            .addComponents([button]);
        await interaction.reply({ content: "Kayıt mesajı ayarlamak için aşağıdaki butona tıklayınız.", components: [row2], ephemeral: true });
        const msg = await interaction.fetchReply();
        const buttonFilter = (i) => (i.customId === "registerMessage") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({ filter: buttonFilter, componentType: ComponentType.Button, time: 60000 });
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
                    await collector.reply({ content: "Kayıt mesajı ayarlandı.", ephemeral: true });
                }
                catch (e) {
                    await collector.reply({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
                    console.log(e);
                }
            }
        }
        catch (e) {
            await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
            console.log(e);
        }
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
        await interaction.reply({ content: "Kayıt mesajı silme ayarı aktif edildi.", ephemeral: true });
    }
    else {
        const config = {
            $set: {
                "config.registerMessageClear": false
            }
        };
        await client.updateGuildConfig({ guildId: interaction.guild.id, config });
        await interaction.reply({ content: "Kayıt mesajı silme ayarı kapatıldı.", ephemeral: true });
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
        await interaction.reply({ content: "Kayıt kanalı mesajları silme ayarı aktif edildi.", ephemeral: true });
    }
    else {
        const config = {
            $set: {
                "config.registerChannelClear": false
            }
        };
        await client.updateGuildConfig({ guildId: interaction.guild.id, config });
        await interaction.reply({ content: "Kayıt kanalı mesajları silme ayarı kapatıldı.", ephemeral: true });
    }
}
async function welcomeConfig(interaction, client) {
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
    ]);
    const row = new ActionRowBuilder()
        .addComponents([select]);
    await interaction.reply({ content: "Ayarlamak istediğiniz ayarı seçiniz.", components: [row], ephemeral: true });
    const msg = await interaction.fetchReply();
    const filter = (i) => i.customId === "welcomeConfig" && i.user.id === interaction.user.id;
    try {
        const collector = await msg.awaitMessageComponent({ filter, componentType: ComponentType.SelectMenu, time: 60000 });
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
                case "registerChannel":
                    await registerMessageChannel(collector, client);
                    break;
            }
        }
    }
    catch (e) {
        await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
        console.log(e);
    }
}
async function welcomeChannel(interaction, client) {
    if (client.guildsConfig.get(interaction.guild.id)?.config.welcomeChannel) {
        const reject = new ButtonBuilder()
            .setCustomId("welcomeChannelReject")
            .setLabel("❌| İptal")
            .setStyle(ButtonStyle.Danger);
        const accept = new ButtonBuilder()
            .setCustomId("welcomeChannelAccept")
            .setLabel("✅| Değiştir")
            .setStyle(ButtonStyle.Success);
        const deleteButton = new ButtonBuilder()
            .setCustomId("welcomeChannelDelete")
            .setLabel("🗑️| Sil")
            .setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder()
            .addComponents([reject, accept, deleteButton]);
        await interaction.reply({ content: "Hoşgeldin kanalı zaten ayarlanmış. Değiştirmek mi yoksa silmek mi istersiniz?", components: [row], ephemeral: true });
        const msg = await interaction.fetchReply();
        const filter = (i) => (i.customId === "welcomeChannelReject" || i.customId === "welcomeChannelAccept" || i.customId === "welcomeChannelDelete") && i.user.id === interaction.user.id;
        try {
            const collector = await msg.awaitMessageComponent({ filter, componentType: ComponentType.Button, time: 60000 });
            if (collector.customId === "welcomeChannelReject") {
                await collector.reply({ content: "İşlem iptal edildi.", ephemeral: true });
            }
            else if (collector.customId === "welcomeChannelAccept") {
                const channelSelect = new ChannelSelectMenuBuilder()
                    .setCustomId("welcomeChannel")
                    .setPlaceholder("Kanal seçiniz.")
                    .setDisabled(false)
                    .setChannelTypes(ChannelType.GuildText);
                const row2 = new ActionRowBuilder()
                    .addComponents(channelSelect);
                await collector.reply({ content: "Yeni hoşgeldin kanalını aşağıdan ayarlayınız", components: [row2], ephemeral: true });
                const msg = await collector.fetchReply();
                const filter = (i) => i.user.id === interaction.user.id;
                try {
                    const collector = await msg.awaitMessageComponent({ filter: filter, componentType: ComponentType.ChannelSelect, time: 60000 });
                    if (collector) {
                        const data = collector.values[0];
                        const channel = interaction.guild.channels.cache.get(data);
                        if (!channel) {
                            await collector.reply({ content: "Böyle bir kanal bulunamadı." });
                            return;
                        }
                        if (channel.type !== ChannelType.GuildText) {
                            await collector.reply({ content: "Lütfen bir metin kanalı giriniz." });
                            return;
                        }
                        const config = {
                            $set: {
                                "config.welcomeChannel": channel.id
                            }
                        };
                        await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                        await collector.reply({ content: "Hoşgeldin kanalı ayarlandı.", ephemeral: true });
                    }
                }
                catch (error) {
                    console.log(error);
                    await interaction.followUp({ content: "İşlem iptal edildi çünkü bir hata ile karşılaşıldı", ephemeral: true });
                }
            }
            else if (collector.customId === "welcomeChannelDelete") {
                const config = {
                    $unset: {
                        "config.welcomeChannel": ""
                    }
                };
                await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                await collector.reply({ content: "Hoşgeldin kanalı silindi.", ephemeral: true });
            }
        }
        catch (e) {
            await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
            console.log(e);
        }
    }
    else {
        const channelSelect = new ChannelSelectMenuBuilder()
            .setCustomId("welcomeChannel")
            .setPlaceholder("Kanal seçiniz.")
            .setDisabled(false)
            .setChannelTypes(ChannelType.GuildText);
        const row2 = new ActionRowBuilder()
            .addComponents(channelSelect);
        await interaction.reply({ content: "Yeni hoşgeldin kanalını aşağıdan ayarlayınız", components: [row2], ephemeral: true });
        const msg = await interaction.fetchReply();
        const filter = (i) => i.user.id === interaction.user.id;
        try {
            const collector = await msg.awaitMessageComponent({ filter: filter, componentType: ComponentType.ChannelSelect, time: 60000 });
            if (collector) {
                const data = collector.values[0];
                const channel = interaction.guild.channels.cache.get(data);
                if (!channel) {
                    await collector.reply({ content: "Böyle bir kanal bulunamadı." });
                    return;
                }
                if (channel.type !== ChannelType.GuildText) {
                    await collector.reply({ content: "Lütfen bir metin kanalı giriniz." });
                    return;
                }
                const config = {
                    $set: {
                        "config.welcomeChannel": channel.id
                    }
                };
                await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                await collector.reply({ content: "Hoşgeldin kanalı ayarlandı.", ephemeral: true });
            }
        }
        catch (error) {
            console.log(error);
            await interaction.followUp({ content: "İşlem iptal edildi çünkü bir hata ile karşılaşıldı", ephemeral: true });
        }
    }
}
async function welcomeMessage(interaction, client) {
    if (client.guildsConfig.get(interaction.guild.id)?.config.welcomeMessage) {
        const reject = new ButtonBuilder()
            .setCustomId("welcomeMessageReject")
            .setLabel("❌| İptal")
            .setStyle(ButtonStyle.Danger);
        const accept = new ButtonBuilder()
            .setCustomId("welcomeMessageAccept")
            .setLabel("✅| Değiştir")
            .setStyle(ButtonStyle.Success);
        const deleteButton = new ButtonBuilder()
            .setCustomId("welcomeMessageDelete")
            .setLabel("🗑️| Sil")
            .setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder()
            .addComponents([reject, accept, deleteButton]);
        await interaction.reply({ content: "Hoşgeldin mesajı zaten ayarlanmış. Değiştirmek mi yoksa silmek mi istersiniz?", components: [row], ephemeral: true });
        const msg = await interaction.fetchReply();
        const buttonFilter = (i) => (i.customId === "welcomeMessageReject" || i.customId === "welcomeMessageAccept" || i.customId === "welcomeMessageDelete") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({
                filter: buttonFilter,
                componentType: ComponentType.Button,
                time: 60000
            });
            if (collector.customId === "welcomeMessageReject") {
                await collector.reply({ content: "İşlem iptal edildi.", ephemeral: true });
            }
            else if (collector.customId === "welcomeMessageAccept") {
                const TextInput = new TextInputBuilder()
                    .setCustomId("welcomeMessage")
                    .setPlaceholder("Kullanılabilir değişkenler: {user}, {tag}, {name}, {id}, {server}, {memberCount}")
                    .setMinLength(1)
                    .setMaxLength(2000)
                    .setRequired(true)
                    .setLabel("Hoşgeldin mesajı")
                    .setStyle(TextInputStyle.Paragraph);
                const row = new ActionRowBuilder()
                    .addComponents([TextInput]);
                const modal = new ModalBuilder()
                    .setCustomId("welcomeMessage")
                    .setTitle("Hoşgeldin mesajı ayarla")
                    .addComponents([row]);
                const button = new ButtonBuilder()
                    .setCustomId("welcomeMessage")
                    .setLabel("Hoşgeldin mesajı ayarla")
                    .setStyle(ButtonStyle.Primary);
                const row2 = new ActionRowBuilder()
                    .addComponents([button]);
                await collector.reply({
                    content: "Hoşgeldin mesajı ayarlamak için aşağıdaki butona tıklayınız.",
                    components: [row2],
                    ephemeral: true
                });
                const msg = await collector.fetchReply();
                const buttonFilter = (i) => (i.customId === "welcomeMessage") && (i.user.id === interaction.user.id);
                try {
                    const modalcollector = await msg.awaitMessageComponent({
                        filter: buttonFilter,
                        componentType: ComponentType.Button,
                        time: 60000
                    });
                    if (modalcollector) {
                        await modalcollector.showModal(modal);
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
                            await collector.reply({ content: "Hoşgeldin mesajı ayarlandı.", ephemeral: true });
                        }
                        catch (e) {
                            await modalcollector.followUp({
                                content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.",
                                ephemeral: true
                            });
                            console.log(e);
                        }
                    }
                }
                catch (e) {
                    await interaction.followUp({
                        content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.",
                        ephemeral: true
                    });
                    console.log(e);
                }
            }
            else if (collector.customId === "welcomeMessageDelete") {
                const config = {
                    $set: {
                        "config.welcomeMessage": null
                    }
                };
                await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                await collector.reply({ content: "Hoşgeldin mesajı silindi.", ephemeral: true });
            }
        }
        catch (e) {
            await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
            console.log(e);
        }
    }
    else {
        const TextInput = new TextInputBuilder()
            .setCustomId("welcomeMessage")
            .setPlaceholder("Kullanılabilir değişkenler: {user}, {tag}, {name}, {id}, {server}, {memberCount}")
            .setMinLength(1)
            .setMaxLength(2000)
            .setRequired(true)
            .setLabel("Hoşgeldin mesajı")
            .setStyle(TextInputStyle.Paragraph);
        const row = new ActionRowBuilder()
            .addComponents([TextInput]);
        const modal = new ModalBuilder()
            .setCustomId("welcomeMessage")
            .setTitle("Hoşgeldin mesajı ayarla")
            .addComponents([row]);
        const button = new ButtonBuilder()
            .setCustomId("welcomeMessage")
            .setLabel("Hoşgeldin mesajı ayarla")
            .setStyle(ButtonStyle.Primary);
        const row2 = new ActionRowBuilder()
            .addComponents([button]);
        await interaction.reply({ content: "Hoşgeldin mesajı ayarlamak için aşağıdaki butona tıklayınız.", components: [row2], ephemeral: true });
        const msg = await interaction.fetchReply();
        const buttonFilter = (i) => (i.customId === "welcomeMessage") && (i.user.id === interaction.user.id);
        try {
            const modalcollector = await msg.awaitMessageComponent({ filter: buttonFilter, componentType: ComponentType.Button, time: 60000 });
            if (modalcollector) {
                await modalcollector.showModal(modal);
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
                    await collector.reply({ content: "Hoşgeldin mesajı ayarlandı.", ephemeral: true });
                }
                catch (e) {
                    await modalcollector.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
                    console.log(e);
                }
            }
        }
        catch (e) {
            await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
            console.log(e);
        }
    }
}
async function goodbyeChannel(interaction, client) {
    if (client.guildsConfig.get(interaction.guild.id)?.config.leaveChannel) {
        const reject = new ButtonBuilder()
            .setCustomId("goodByeChannelReject")
            .setLabel("❌| İptal")
            .setStyle(ButtonStyle.Danger);
        const accept = new ButtonBuilder()
            .setCustomId("goodByeChannelAccept")
            .setLabel("✅| Değiştir")
            .setStyle(ButtonStyle.Success);
        const deleteButton = new ButtonBuilder()
            .setCustomId("goodByeChannelDelete")
            .setLabel("🗑️| Sil")
            .setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder()
            .addComponents([reject, accept, deleteButton]);
        await interaction.reply({ content: "Hoşçakal kanalı ayarlanmış. Değiştirmek mi yoksa silmek mi istersiniz?", components: [row], ephemeral: true });
        const msg = await interaction.fetchReply();
        const buttonFilter = (i) => (i.customId === "goodByeChannelReject" || i.customId === "goodByeChannelAccept" || i.customId === "goodByeChannelDelete") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({ filter: buttonFilter, componentType: ComponentType.Button, time: 60000 });
            if (collector) {
                if (collector.customId === "goodByeChannelReject") {
                    await collector.reply({ content: "İşlem iptal edildi.", ephemeral: true });
                }
                else if (collector.customId === "goodByeChannelAccept") {
                    const channelSelect = new ChannelSelectMenuBuilder()
                        .setCustomId("goodByeChannel")
                        .setPlaceholder("Kanal seçiniz.")
                        .setDisabled(false)
                        .setChannelTypes(ChannelType.GuildText);
                    const row2 = new ActionRowBuilder()
                        .addComponents(channelSelect);
                    await collector.reply({ content: "Yeni görüşürüz kanalını aşağıdan ayarlayınız", components: [row2], ephemeral: true });
                    const msg = await collector.fetchReply();
                    const filter = (i) => i.user.id === interaction.user.id;
                    try {
                        const collector = await msg.awaitMessageComponent({ filter: filter, componentType: ComponentType.ChannelSelect, time: 60000 });
                        if (collector) {
                            const data = collector.values[0];
                            const channel = interaction.guild.channels.cache.get(data);
                            if (!channel) {
                                await collector.reply({ content: "Böyle bir kanal bulunamadı." });
                                return;
                            }
                            if (channel.type !== ChannelType.GuildText) {
                                await collector.reply({ content: "Lütfen bir metin kanalı giriniz." });
                                return;
                            }
                            const config = {
                                $set: {
                                    "config.goodByeChannel": channel.id
                                }
                            };
                            await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                            await collector.reply({ content: "Görüşürüz kanalı ayarlandı.", ephemeral: true });
                        }
                    }
                    catch (error) {
                        console.log(error);
                        await interaction.followUp({ content: "İşlem iptal edildi çünkü bir hata ile karşılaşıldı", ephemeral: true });
                    }
                }
                else if (collector.customId === "goodByeChannelDelete") {
                    const config = {
                        $unset: {
                            "config.leaveChannel": ""
                        }
                    };
                    await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                    await collector.reply({ content: "Hoşçakal kanalı silindi.", ephemeral: true });
                }
            }
        }
        catch (e) {
            await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
            console.log(e);
        }
    }
    else {
        const channelSelect = new ChannelSelectMenuBuilder()
            .setCustomId("goodByeChannel")
            .setPlaceholder("Kanal seçiniz.")
            .setDisabled(false)
            .setChannelTypes(ChannelType.GuildText);
        const row2 = new ActionRowBuilder()
            .addComponents(channelSelect);
        await interaction.reply({ content: "Yeni görüşürüz kanalını aşağıdan ayarlayınız", components: [row2], ephemeral: true });
        const msg = await interaction.fetchReply();
        const filter = (i) => i.user.id === interaction.user.id;
        try {
            const collector = await msg.awaitMessageComponent({ filter: filter, componentType: ComponentType.ChannelSelect, time: 60000 });
            if (collector) {
                const data = collector.values[0];
                const channel = interaction.guild.channels.cache.get(data);
                if (!channel) {
                    await collector.reply({ content: "Böyle bir kanal bulunamadı." });
                    return;
                }
                if (channel.type !== ChannelType.GuildText) {
                    await collector.reply({ content: "Lütfen bir metin kanalı giriniz." });
                    return;
                }
                const config = {
                    $set: {
                        "config.goodByeChannel": channel.id
                    }
                };
                await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                await collector.reply({ content: "Görüşürüz kanalı ayarlandı.", ephemeral: true });
            }
        }
        catch (error) {
            console.log(error);
            await interaction.followUp({ content: "İşlem iptal edildi çünkü bir hata ile karşılaşıldı", ephemeral: true });
        }
    }
}
async function goodbyeMessage(interaction, client) {
    if (client.guildsConfig.get(interaction.guild.id)?.config.leaveMessage) {
        const reject = new ButtonBuilder()
            .setCustomId("goodByeMessageReject")
            .setLabel("❌| İptal")
            .setStyle(ButtonStyle.Danger);
        const accept = new ButtonBuilder()
            .setCustomId("goodByeMessageAccept")
            .setLabel("✅| Değiştir")
            .setStyle(ButtonStyle.Success);
        const deleteButton = new ButtonBuilder()
            .setCustomId("goodByeMessageDelete")
            .setLabel("🗑️| Sil")
            .setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder()
            .addComponents([reject, accept, deleteButton]);
        await interaction.reply({ content: "Görüşürüz mesajı zaten ayarlı. Değiştirmek mi yoksa silmek mi istersiniz?", components: [row], ephemeral: true });
        const filter = (i) => (i.customId === "goodByeMessageReject" || i.customId === "goodByeMessageAccept" || i.customId === "registerChannelDelete") && (i.user.id === interaction.user.id);
        try {
            const collector = await interaction.fetchReply();
            const collector2 = await collector.awaitMessageComponent({ filter, componentType: ComponentType.Button, time: 60000 });
            if (collector2) {
                if (collector2.customId === "goodByeMessageReject") {
                    await collector2.reply({ content: "İptal edildi.", ephemeral: true });
                }
                else if (collector2.customId === "goodByeMessageAccept") {
                    const TextInput = new TextInputBuilder()
                        .setCustomId("goodbyeMessage")
                        .setPlaceholder("Kullanılabilir değişkenler: {user}, {tag}, {name}, {id}, {server}, {memberCount}")
                        .setMinLength(1)
                        .setMaxLength(2000)
                        .setRequired(true)
                        .setLabel("Görüşürüz mesajı")
                        .setStyle(TextInputStyle.Paragraph);
                    const row = new ActionRowBuilder()
                        .addComponents([TextInput]);
                    const modal = new ModalBuilder()
                        .setCustomId("goodbyeMessage")
                        .setTitle("Görüşürüz mesajı ayarla")
                        .addComponents([row]);
                    const button = new ButtonBuilder()
                        .setCustomId("goodbyeMessage")
                        .setLabel("Görüşürüz mesajı ayarla")
                        .setStyle(ButtonStyle.Primary);
                    const row2 = new ActionRowBuilder()
                        .addComponents([button]);
                    await collector2.reply({ content: "Görüşürüz mesajı ayarlamak için aşağıdaki butona tıklayınız.", components: [row2], ephemeral: true });
                    const msg = await collector2.fetchReply();
                    const buttonFilter = (i) => (i.customId === "goodbyeMessage") && (i.user.id === interaction.user.id);
                    try {
                        const modalcollector = await msg.awaitMessageComponent({ filter: buttonFilter, componentType: ComponentType.Button, time: 60000 });
                        if (modalcollector) {
                            await modalcollector.showModal(modal);
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
                                await collector.reply({ content: "Görüşürüz mesajı ayarlandı.", ephemeral: true });
                            }
                            catch (e) {
                                await modalcollector.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
                                console.log(e);
                            }
                        }
                    }
                    catch (e) {
                        await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
                        console.log(e);
                    }
                }
                else if (collector2.customId === "goodByeMessageDelete") {
                    const config = {
                        $set: {
                            "config.leaveMessage": null
                        }
                    };
                    await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                    await collector2.reply({ content: "Görüşürüz mesajı silindi.", ephemeral: true });
                }
            }
        }
        catch (e) {
            await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
            console.log(e);
        }
    }
    else {
        const TextInput = new TextInputBuilder()
            .setCustomId("goodbyeMessage")
            .setPlaceholder("Kullanılabilir değişkenler: {user}, {tag}, {name}, {id}, {server}, {memberCount}")
            .setMinLength(1)
            .setMaxLength(2000)
            .setRequired(true)
            .setLabel("Görüşürüz mesajı")
            .setStyle(TextInputStyle.Paragraph);
        const row = new ActionRowBuilder()
            .addComponents([TextInput]);
        const modal = new ModalBuilder()
            .setCustomId("goodbyeMessage")
            .setTitle("Görüşürüz mesajı ayarla")
            .addComponents([row]);
        const button = new ButtonBuilder()
            .setCustomId("goodbyeMessage")
            .setLabel("Görüşürüz mesajı ayarla")
            .setStyle(ButtonStyle.Primary);
        const row2 = new ActionRowBuilder()
            .addComponents([button]);
        await interaction.reply({ content: "Görüşürüz mesajı ayarlamak için aşağıdaki butona tıklayınız.", components: [row2], ephemeral: true });
        const msg = await interaction.fetchReply();
        const buttonFilter = (i) => (i.customId === "goodbyeMessage") && (i.user.id === interaction.user.id);
        try {
            const modalcollector = await msg.awaitMessageComponent({ filter: buttonFilter, componentType: ComponentType.Button, time: 60000 });
            if (modalcollector) {
                await modalcollector.showModal(modal);
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
                    await collector.reply({ content: "Görüşürüz mesajı ayarlandı.", ephemeral: true });
                }
                catch (e) {
                    await modalcollector.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
                    console.log(e);
                }
            }
        }
        catch (e) {
            await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
            console.log(e);
        }
    }
}
async function registerMessageChannel(interaction, client) {
    if (client.guildsConfig.get(interaction.guild.id).config.registerWelcomeChannel) {
        const reject = new ButtonBuilder()
            .setCustomId("registerMessageChannelReject")
            .setLabel("❌| İptal")
            .setStyle(ButtonStyle.Danger);
        const accept = new ButtonBuilder()
            .setCustomId("registerMessageChannelAccept")
            .setLabel("✅| Değiştir")
            .setStyle(ButtonStyle.Success);
        const deleteButton = new ButtonBuilder()
            .setCustomId("registerMessageChannelDelete")
            .setLabel("🗑️| Sil")
            .setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder()
            .addComponents([reject, accept, deleteButton]);
        await interaction.reply({ content: "Kayıt mesajı kanalı zaten ayarlanmış. Değiştirmek mi yoksa silmek mi istersiniz?", components: [row], ephemeral: true });
        const msg = await interaction.fetchReply();
        const buttonFilter = (i) => (i.customId === "registerMessageChannelReject" || i.customId === "registerMessageChannelAccept" || i.customId === "registerMessageChannelDelete") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({ filter: buttonFilter, componentType: ComponentType.Button, time: 60000 });
            if (collector) {
                if (collector.customId === "registerMessageChannelReject") {
                    await collector.reply({ content: "İşlem iptal edildi.", ephemeral: true });
                }
                else if (collector.customId === "registerMessageChannelAccept") {
                    const channelSelect = new ChannelSelectMenuBuilder()
                        .setCustomId("registerWelcomeChannelAccept")
                        .setPlaceholder("Kanal seçiniz.")
                        .setDisabled(false)
                        .setChannelTypes(ChannelType.GuildText);
                    const row2 = new ActionRowBuilder()
                        .addComponents(channelSelect);
                    await collector.reply({ content: "Yeni kayıt kanalını aşağıdan ayarlayınız", components: [row2], ephemeral: true });
                    const msg = await collector.fetchReply();
                    const filter = (i) => i.user.id === interaction.user.id;
                    try {
                        const collector = await msg.awaitMessageComponent({ filter: filter, componentType: ComponentType.ChannelSelect, time: 60000 });
                        if (collector) {
                            const data = collector.values[0];
                            const channel = interaction.guild.channels.cache.get(data);
                            if (!channel) {
                                await collector.reply({ content: "Böyle bir kanal bulunamadı." });
                                return;
                            }
                            if (channel.type !== ChannelType.GuildText) {
                                await collector.reply({ content: "Lütfen bir metin kanalı giriniz." });
                                return;
                            }
                            const config = {
                                $set: {
                                    "config.registerWelcomeChannel": channel.id
                                }
                            };
                            await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                            await collector.reply({ content: "Kayıt kanalı ayarlandı.", ephemeral: true });
                        }
                    }
                    catch (error) {
                        console.log(error);
                        await interaction.followUp({ content: "İşlem iptal edildi çünkü bir hata ile karşılaşıldı", ephemeral: true });
                    }
                }
                else if (collector.customId === "registerMessageChannelDelete") {
                    const config = {
                        $set: {
                            "config.registerWelcomeChannel": null
                        }
                    };
                    await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                    await collector.reply({ content: "Kayıt mesajı kanalı silindi.", ephemeral: true });
                }
            }
        }
        catch (e) {
            await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
            console.log(e);
        }
    }
    else {
        const channelSelect = new ChannelSelectMenuBuilder()
            .setCustomId("registerWelcomeChannelAccept")
            .setPlaceholder("Kanal seçiniz.")
            .setDisabled(false)
            .setChannelTypes(ChannelType.GuildText);
        const row2 = new ActionRowBuilder()
            .addComponents(channelSelect);
        await interaction.reply({ content: "Yeni kayıt kanalını aşağıdan ayarlayınız", components: [row2], ephemeral: true });
        const msg = await interaction.fetchReply();
        const filter = (i) => i.user.id === interaction.user.id;
        try {
            const collector = await msg.awaitMessageComponent({ filter: filter, componentType: ComponentType.ChannelSelect, time: 60000 });
            if (collector) {
                const data = collector.values[0];
                const channel = interaction.guild.channels.cache.get(data);
                if (!channel) {
                    await collector.reply({ content: "Böyle bir kanal bulunamadı." });
                    return;
                }
                if (channel.type !== ChannelType.GuildText) {
                    await collector.reply({ content: "Lütfen bir metin kanalı giriniz." });
                    return;
                }
                const config = {
                    $set: {
                        "config.registerWelcomeChannel": channel.id
                    }
                };
                await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                await collector.reply({ content: "Kayıt kanalı ayarlandı.", ephemeral: true });
            }
        }
        catch (error) {
            console.log(error);
            await interaction.followUp({ content: "İşlem iptal edildi çünkü bir hata ile karşılaşıldı", ephemeral: true });
        }
    }
}
async function moderationConfig(interaction, client) {
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
    ]);
    const row = new ActionRowBuilder()
        .addComponents([SelectMenu]);
    await interaction.reply({ content: "Moderasyon ayarları için aşağıdaki menüden birini seçiniz.", components: [row], ephemeral: true });
    const msg = await interaction.fetchReply();
    const filter = (i) => (i.customId === "moderationConfig" || i.customId === "muteGetAllRoles") && i.user.id === interaction.user.id;
    try {
        const collector = await msg.awaitMessageComponent({ filter, componentType: ComponentType.SelectMenu, time: 60000 });
        if (collector.customId === "moderationConfig") {
            switch (collector.values[0]) {
                case "modLogChannel":
                    await modLogChannel(collector, client);
                    break;
                case "muteGetAllRoles":
                    await muteGetAllRoles(collector, client);
                    break;
                case "modMail":
                    await modMail(collector, client);
                    break;
            }
        }
    }
    catch (e) {
        await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
        console.log(e);
    }
}
async function modLogChannel(interaction, client) {
    if (client.guildsConfig.get(interaction.guild.id)?.config.modlogChannel) {
        const reject = new ButtonBuilder()
            .setCustomId("modLogChannelReject")
            .setLabel("❌| İptal")
            .setStyle(ButtonStyle.Danger);
        const accept = new ButtonBuilder()
            .setCustomId("modLogChannelAccept")
            .setLabel("✅| Değiştir")
            .setStyle(ButtonStyle.Success);
        const deleteButton = new ButtonBuilder()
            .setCustomId("modLogChannelDelete")
            .setLabel("🗑️| Sil")
            .setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder()
            .addComponents([reject, accept, deleteButton]);
        await interaction.reply({ content: "ModLog kanalı ayarlı. Değiştirmek mi yoksa silmek mi istersiniz?", components: [row], ephemeral: true });
        const msg = await interaction.fetchReply();
        const filter = (i) => (i.customId === "modLogChannelReject" || i.customId === "modLogChannelAccept" || i.customId === "modLogChannelDelete") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({ filter, componentType: ComponentType.Button, time: 60000 });
            if (collector.customId === "modLogChannelReject") {
                await collector.reply({ content: "İptal edildi.", ephemeral: true });
            }
            else if (collector.customId === "modLogChannelAccept") {
                const channelSelect = new ChannelSelectMenuBuilder()
                    .setCustomId("modlogChannel")
                    .setPlaceholder("Kanal seçiniz.")
                    .setDisabled(false)
                    .setChannelTypes(ChannelType.GuildText);
                const row2 = new ActionRowBuilder()
                    .addComponents(channelSelect);
                await collector.reply({ content: "Yeni modlog kanalını aşağıdan ayarlayınız", components: [row2], ephemeral: true });
                const msg = await collector.fetchReply();
                const filter = (i) => i.user.id === interaction.user.id;
                try {
                    const collector = await msg.awaitMessageComponent({ filter: filter, componentType: ComponentType.ChannelSelect, time: 60000 });
                    if (collector) {
                        const data = collector.values[0];
                        const channel = interaction.guild.channels.cache.get(data);
                        if (!channel) {
                            await collector.reply({ content: "Böyle bir kanal bulunamadı." });
                            return;
                        }
                        if (channel.type !== ChannelType.GuildText) {
                            await collector.reply({ content: "Lütfen bir metin kanalı giriniz." });
                            return;
                        }
                        const config = {
                            $set: {
                                "config.modlogChannel": channel.id
                            }
                        };
                        await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                        await collector.reply({ content: "Modlog kanalı ayarlandı.", ephemeral: true });
                    }
                }
                catch (error) {
                    console.log(error);
                    await interaction.followUp({ content: "İşlem iptal edildi çünkü bir hata ile karşılaşıldı", ephemeral: true });
                }
            }
            else if (collector.customId === "modLogChannelDelete") {
                const config = {
                    $set: {
                        "config.modlogChannel": null
                    }
                };
                await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                await collector.reply({ content: "Modlog kanalı silindi.", ephemeral: true });
            }
        }
        catch (e) {
            await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
            console.log(e);
        }
    }
    else {
        const channelSelect = new ChannelSelectMenuBuilder()
            .setCustomId("modlogChannel")
            .setPlaceholder("Kanal seçiniz.")
            .setDisabled(false)
            .setChannelTypes(ChannelType.GuildText);
        const row2 = new ActionRowBuilder()
            .addComponents(channelSelect);
        await interaction.reply({ content: "Yeni modlog kanalını aşağıdan ayarlayınız", components: [row2], ephemeral: true });
        const msg = await interaction.fetchReply();
        const filter = (i) => i.user.id === interaction.user.id;
        try {
            const collector = await msg.awaitMessageComponent({ filter: filter, componentType: ComponentType.ChannelSelect, time: 60000 });
            if (collector) {
                const data = collector.values[0];
                const channel = interaction.guild.channels.cache.get(data);
                if (!channel) {
                    await collector.reply({ content: "Böyle bir kanal bulunamadı." });
                    return;
                }
                if (channel.type !== ChannelType.GuildText) {
                    await collector.reply({ content: "Lütfen bir metin kanalı giriniz." });
                    return;
                }
                const config = {
                    $set: {
                        "config.modlogChannel": channel.id
                    }
                };
                await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                await collector.reply({ content: "Modlog kanalı ayarlandı.", ephemeral: true });
            }
        }
        catch (error) {
            console.log(error);
            await interaction.followUp({ content: "İşlem iptal edildi çünkü bir hata ile karşılaşıldı", ephemeral: true });
        }
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
        await interaction.reply({ content: "Susturmada tüm rolleri alma ayarı aktif edildi.", ephemeral: true });
    }
    else {
        const config = {
            $set: {
                "config.muteGetAllRoles": false
            }
        };
        await client.updateGuildConfig({ guildId: interaction.guild.id, config });
        await interaction.reply({ content: "Susturmada tüm rolleri alma ayarı kapatıldı.", ephemeral: true });
    }
}
async function modMail(interaction, client) {
    if (client.guildsConfig.get(interaction.guild.id)?.config.modmail) {
        const reject = new ButtonBuilder()
            .setCustomId("modMailReject")
            .setLabel("❌| İptal")
            .setStyle(ButtonStyle.Danger);
        const deleteButton = new ButtonBuilder()
            .setCustomId("modMailDelete")
            .setLabel("🗑️| Sil")
            .setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder()
            .addComponents([reject, deleteButton]);
        await interaction.reply({ content: "Modmail daha önceden ayarlanmış. Eğer kanalları sildiyseniz sil seçeneğini kullanınız.", components: [row], ephemeral: true });
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
                    await collector.reply({ content: "Modmail ayarı silindi.", ephemeral: true });
                }
                else if (collector.customId === "modMailReject") {
                    await collector.reply({ content: "İşlem iptal edildi.", ephemeral: true });
                }
            }
        }
        catch (e) {
            await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
            console.error(e);
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
            await interaction.reply({ content: "Modmail kanalları başarıyla ayarlandı.", ephemeral: true });
        }
        catch (e) {
            await interaction.reply({ content: "Bir hata ile karşılaşıldı. Kanal açmak için yetiklerim var mı?", ephemeral: true });
            console.error(e);
        }
    }
}
async function roleConfig(interaction, client) {
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
    ]);
    const row = new ActionRowBuilder()
        .addComponents([SelectMenu]);
    await interaction.reply({ content: "Rol ayarlamak için aşağıdaki menüden birini seçiniz.", components: [row], ephemeral: true });
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
    catch (e) {
        await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
        console.log(e);
    }
}
async function memberRole(interaction, client) {
    if (client.guildsConfig.get(interaction.guild.id).config.memberRole) {
        const reject = new ButtonBuilder()
            .setCustomId("memberRoleReject")
            .setLabel("❌| İptal")
            .setStyle(ButtonStyle.Danger);
        const accept = new ButtonBuilder()
            .setCustomId("memberRoleAccept")
            .setLabel("✅| Değiştir")
            .setStyle(ButtonStyle.Success);
        const deleteButton = new ButtonBuilder()
            .setCustomId("memberRoleDelete")
            .setLabel("🗑️| Sil")
            .setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder()
            .addComponents([reject, accept, deleteButton]);
        await interaction.reply({ content: "Üye rolü ayarlı. Değiştirmek mi yoksa silmek mi istersiniz?", components: [row], ephemeral: true });
        const msg = await interaction.fetchReply();
        const filter = (i) => (i.customId === "memberRoleReject" || i.customId === "memberRoleAccept" || i.customId === "memberRoleDelete") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({ filter, componentType: ComponentType.Button, time: 60000 });
            if (collector.customId === "memberRoleReject") {
                await collector.reply({ content: "İşlem iptal edildi.", ephemeral: true });
            }
            else if (collector.customId === "memberRoleAccept") {
                const roleSelect = new RoleSelectMenuBuilder()
                    .setCustomId("memberRole")
                    .setPlaceholder("Üye rolü seçiniz.")
                    .setMinValues(1)
                    .setMaxValues(1);
                const row2 = new ActionRowBuilder()
                    .addComponents([roleSelect]);
                await collector.reply({ content: "Üye rolü ayarlamak için aşağıdan uygun role tıklayınız.", components: [row2], ephemeral: true });
                const msg = await collector.fetchReply();
                const buttonFilter = (i) => (i.customId === "memberRole") && (i.user.id === interaction.user.id);
                try {
                    const collector = await msg.awaitMessageComponent({ filter: buttonFilter, componentType: ComponentType.RoleSelect, time: 60000 });
                    if (collector) {
                        const data = collector.values[0];
                        const config = {
                            $set: {
                                "config.memberRole": data
                            }
                        };
                        await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                        await collector.reply({ content: `Üye rolü başarıyla ayarlandı`, ephemeral: true });
                    }
                }
                catch (e) {
                    await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
                    console.log(e);
                }
            }
            else if (collector.customId === "memberRoleDelete") {
                const config = {
                    $set: {
                        "config.memberRole": null
                    }
                };
                await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                await collector.reply({ content: "Modlog kanalı silindi.", ephemeral: true });
            }
        }
        catch (e) {
            await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
            console.log(e);
        }
    }
    else {
        const roleSelect = new RoleSelectMenuBuilder()
            .setCustomId("memberRole")
            .setPlaceholder("Üye rolü seçiniz.")
            .setMinValues(1)
            .setMaxValues(1);
        const row2 = new ActionRowBuilder()
            .addComponents([roleSelect]);
        await interaction.reply({ content: "Üye rolü ayarlamak için aşağıdan uygun role tıklayınız.", components: [row2], ephemeral: true });
        const msg = await interaction.fetchReply();
        const buttonFilter = (i) => (i.customId === "memberRole") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({ filter: buttonFilter, componentType: ComponentType.RoleSelect, time: 60000 });
            if (collector) {
                const data = collector.values[0];
                const config = {
                    $set: {
                        "config.memberRole": data
                    }
                };
                await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                await collector.reply({ content: `Üye rolü başarıyla ayarlandı`, ephemeral: true });
            }
        }
        catch (e) {
            await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
            console.log(e);
        }
    }
}
async function maleRole(interaction, client) {
    if (client.guildsConfig.get(interaction.guild.id).config.maleRole) {
        const reject = new ButtonBuilder()
            .setCustomId("maleRoleReject")
            .setLabel("❌| İptal")
            .setStyle(ButtonStyle.Danger);
        const accept = new ButtonBuilder()
            .setCustomId("maleRoleAccept")
            .setLabel("✅| Değiştir")
            .setStyle(ButtonStyle.Success);
        const deleteButton = new ButtonBuilder()
            .setCustomId("maleRoleDelete")
            .setLabel("🗑️| Sil")
            .setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder()
            .addComponents([reject, accept, deleteButton]);
        await interaction.reply({ content: "Erkek rolü ayarlı. Değiştirmek mi yoksa silmek mi istersiniz?", components: [row], ephemeral: true });
        const msg = await interaction.fetchReply();
        const filter = (i) => (i.customId === "maleRoleReject" || i.customId === "maleRoleAccept" || i.customId === "maleRoleDelete") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({
                filter,
                componentType: ComponentType.Button,
                time: 60000
            });
            if (collector.customId === "maleRoleReject") {
                await collector.reply({ content: "İptal edildi.", ephemeral: true });
            }
            else if (collector.customId === "maleRoleAccept") {
                const roleSelect = new RoleSelectMenuBuilder()
                    .setCustomId("maleRole")
                    .setPlaceholder("Erkek rolünü seçiniz.")
                    .setMinValues(1)
                    .setMaxValues(1);
                const row2 = new ActionRowBuilder()
                    .addComponents([roleSelect]);
                await collector.reply({ content: "Erkek rolünü ayarlamak için aşağıdan uygun role tıklayınız.", components: [row2], ephemeral: true });
                const msg = await collector.fetchReply();
                const buttonFilter = (i) => (i.customId === "maleRole") && (i.user.id === interaction.user.id);
                try {
                    const collector = await msg.awaitMessageComponent({ filter: buttonFilter, componentType: ComponentType.RoleSelect, time: 60000 });
                    if (collector) {
                        const data = collector.values[0];
                        const config = {
                            $set: {
                                "config.maleRole": data
                            }
                        };
                        await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                        await collector.reply({ content: `Erkek rolü başarıyla ayarlandı`, ephemeral: true });
                    }
                }
                catch (e) {
                    await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
                    console.log(e);
                }
            }
            else if (collector.customId === "maleRoleDelete") {
                const config = {
                    $set: {
                        "config.maleRole": null
                    }
                };
                await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                await collector.reply({ content: "Erkek rolü silindi.", ephemeral: true });
            }
        }
        catch (e) {
            await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
            console.log(e);
        }
    }
    else {
        const roleSelect = new RoleSelectMenuBuilder()
            .setCustomId("maleRole")
            .setPlaceholder("Erkek rolünü seçiniz.")
            .setMinValues(1)
            .setMaxValues(1);
        const row2 = new ActionRowBuilder()
            .addComponents([roleSelect]);
        await interaction.reply({ content: "Erkek rolünü ayarlamak için aşağıdan uygun role tıklayınız.", components: [row2], ephemeral: true });
        const msg = await interaction.fetchReply();
        const buttonFilter = (i) => (i.customId === "maleRole") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({ filter: buttonFilter, componentType: ComponentType.RoleSelect, time: 60000 });
            if (collector) {
                const data = collector.values[0];
                const config = {
                    $set: {
                        "config.maleRole": data
                    }
                };
                await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                await collector.reply({ content: `Erkek rolü başarıyla ayarlandı`, ephemeral: true });
            }
        }
        catch (e) {
            await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
            console.log(e);
        }
    }
}
async function femaleRole(interaction, client) {
    if (client.guildsConfig.get(interaction.guild.id).config.femaleRole) {
        const reject = new ButtonBuilder()
            .setCustomId("femaleRoleReject")
            .setLabel("❌| İptal")
            .setStyle(ButtonStyle.Danger);
        const accept = new ButtonBuilder()
            .setCustomId("femaleRoleAccept")
            .setLabel("✅| Değiştir")
            .setStyle(ButtonStyle.Success);
        const deleteButton = new ButtonBuilder()
            .setCustomId("femaleRoleDelete")
            .setLabel("🗑️| Sil")
            .setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder()
            .addComponents([reject, accept, deleteButton]);
        await interaction.reply({ content: "Kız rolü ayarlı. Değiştirmek mi yoksa silmek mi istersiniz?", components: [row], ephemeral: true });
        const msg = await interaction.fetchReply();
        const filter = (i) => (i.customId === "femaleRoleReject" || i.customId === "femaleRoleAccept" || i.customId === "femaleRoleDelete") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({
                filter,
                componentType: ComponentType.Button,
                time: 60000
            });
            if (collector.customId === "femaleRoleReject") {
                await collector.reply({ content: "İşlem iptal edildi.", ephemeral: true });
            }
            else if (collector.customId === "femaleRoleAccept") {
                const roleSelect = new RoleSelectMenuBuilder()
                    .setCustomId("femaleRole")
                    .setPlaceholder("Kadın rolünü seçiniz.")
                    .setMinValues(1)
                    .setMaxValues(1);
                const row2 = new ActionRowBuilder()
                    .addComponents([roleSelect]);
                await collector.reply({ content: "Kadın rolünü ayarlamak için aşağıdan uygun role tıklayınız.", components: [row2], ephemeral: true });
                const msg = await collector.fetchReply();
                const buttonFilter = (i) => (i.customId === "femaleRole") && (i.user.id === interaction.user.id);
                try {
                    const collector = await msg.awaitMessageComponent({ filter: buttonFilter, componentType: ComponentType.RoleSelect, time: 60000 });
                    if (collector) {
                        const data = collector.values[0];
                        const config = {
                            $set: {
                                "config.femaleRole": data
                            }
                        };
                        await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                        await collector.reply({ content: `Kadın rolü başarıyla ayarlandı`, ephemeral: true });
                    }
                }
                catch (e) {
                    await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
                    console.log(e);
                }
            }
            else if (collector.customId === "femaleRoleDelete") {
                const config = {
                    $set: {
                        "config.femaleRole": null
                    }
                };
                await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                await collector.reply({ content: "Kız rolü silindi.", ephemeral: true });
            }
        }
        catch (e) {
            await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
            console.log(e);
        }
    }
    else {
        const roleSelect = new RoleSelectMenuBuilder()
            .setCustomId("femaleRole")
            .setPlaceholder("Kadın rolünü seçiniz.")
            .setMinValues(1)
            .setMaxValues(1);
        const row2 = new ActionRowBuilder()
            .addComponents([roleSelect]);
        await interaction.reply({ content: "Kadın rolünü ayarlamak için aşağıdan uygun role tıklayınız.", components: [row2], ephemeral: true });
        const msg = await interaction.fetchReply();
        const buttonFilter = (i) => (i.customId === "femaleRole") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({ filter: buttonFilter, componentType: ComponentType.RoleSelect, time: 60000 });
            if (collector) {
                const data = collector.values[0];
                const config = {
                    $set: {
                        "config.femaleRole": data
                    }
                };
                await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                await collector.reply({ content: `Kadın rolü başarıyla ayarlandı`, ephemeral: true });
            }
        }
        catch (e) {
            await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
            console.log(e);
        }
    }
}
async function muteRole(interaction, client) {
    if (client.guildsConfig.get(interaction.guild.id).config.muteRole) {
        const reject = new ButtonBuilder()
            .setCustomId("muteRoleReject")
            .setLabel("❌| İptal")
            .setStyle(ButtonStyle.Danger);
        const accept = new ButtonBuilder()
            .setCustomId("muteRoleAccept")
            .setLabel("✅| Değiştir")
            .setStyle(ButtonStyle.Success);
        const deleteButton = new ButtonBuilder()
            .setCustomId("muteRoleDelete")
            .setLabel("🗑️| Sil")
            .setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder()
            .addComponents([reject, accept, deleteButton]);
        await interaction.reply({ content: "Susturma rolü zaten ayarlı. Değiştirmek mi silmek mi istersiniz?", components: [row], ephemeral: true });
        const msg = await interaction.fetchReply();
        const filter = (i) => (i.customId === "muteRoleReject" || i.customId === "muteRoleAccept" || i.customId === "muteRoleDelete") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({
                filter,
                componentType: ComponentType.Button,
                time: 60000
            });
            if (collector) {
                if (collector.customId === "muteRoleReject") {
                    await collector.reply({ content: "İşlem iptal edildi.", ephemeral: true });
                }
                else if (collector.customId === "muteRoleAccept") {
                    const roleSelect = new RoleSelectMenuBuilder()
                        .setCustomId("muteRole")
                        .setPlaceholder("Mute rolünü seçiniz.")
                        .setMinValues(1)
                        .setMaxValues(1);
                    const row2 = new ActionRowBuilder()
                        .addComponents([roleSelect]);
                    await collector.reply({ content: "Mute rolünü ayarlamak için aşağıdan uygun role tıklayınız.", components: [row2], ephemeral: true });
                    const msg = await collector.fetchReply();
                    const buttonFilter = (i) => (i.customId === "muteRole") && (i.user.id === interaction.user.id);
                    try {
                        const collector = await msg.awaitMessageComponent({ filter: buttonFilter, componentType: ComponentType.RoleSelect, time: 60000 });
                        if (collector) {
                            const data = collector.values[0];
                            const config = {
                                $set: {
                                    "config.muteRole": data
                                }
                            };
                            await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                            await collector.reply({ content: `Mute rolü başarıyla ayarlandı`, ephemeral: true });
                        }
                    }
                    catch (e) {
                        await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
                        console.log(e);
                    }
                }
                else if (collector.customId === "muteRoleDelete") {
                    const config = {
                        $set: {
                            "config.muteRole": null
                        }
                    };
                    await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                    await collector.reply({ content: "Mute rolü silindi.", ephemeral: true });
                }
            }
        }
        catch (e) {
            await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
            console.log(e);
        }
    }
    else {
        const roleSelect = new RoleSelectMenuBuilder()
            .setCustomId("muteRole")
            .setPlaceholder("Mute rolünü seçiniz.")
            .setMinValues(1)
            .setMaxValues(1);
        const row2 = new ActionRowBuilder()
            .addComponents([roleSelect]);
        await interaction.reply({ content: "Mute rolünü ayarlamak için aşağıdan uygun role tıklayınız.", components: [row2], ephemeral: true });
        const msg = await interaction.fetchReply();
        const buttonFilter = (i) => (i.customId === "muteRole") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({ filter: buttonFilter, componentType: ComponentType.RoleSelect, time: 60000 });
            if (collector) {
                const data = collector.values[0];
                const config = {
                    $set: {
                        "config.muteRole": data
                    }
                };
                await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                await collector.reply({ content: `Mute rolü başarıyla ayarlandı`, ephemeral: true });
            }
        }
        catch (e) {
            await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
            console.log(e);
        }
    }
}
async function djRole(interaction, client) {
    if (client.guildsConfig.get(interaction.guild.id).config.djRole) {
        const reject = new ButtonBuilder()
            .setCustomId("djRoleReject")
            .setLabel("❌| İptal")
            .setStyle(ButtonStyle.Danger);
        const accept = new ButtonBuilder()
            .setCustomId("djRoleAccept")
            .setLabel("✅| Değiştir")
            .setStyle(ButtonStyle.Success);
        const deleteButton = new ButtonBuilder()
            .setCustomId("djRoleDelete")
            .setLabel("🗑️| Sil")
            .setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder()
            .addComponents([reject, accept, deleteButton]);
        await interaction.reply({ content: "DJ rolü zaten ayarlı. Değiştirmek mi silmek mi istersiniz?", components: [row], ephemeral: true });
        const msg = await interaction.fetchReply();
        const filter = (i) => (i.customId === "djRoleReject" || i.customId === "djRoleAccept" || i.customId === "djRoleDelete") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({
                filter,
                componentType: ComponentType.Button,
                time: 60000
            });
            if (collector) {
                if (collector.customId === "djRoleReject") {
                    await collector.reply({ content: "İşlem iptal edildi.", ephemeral: true });
                }
                else if (collector.customId === "djRoleAccept") {
                    const roleSelect = new RoleSelectMenuBuilder()
                        .setCustomId("djRole")
                        .setPlaceholder("DJ rolünü seçiniz.")
                        .setMinValues(1)
                        .setMaxValues(1);
                    const row2 = new ActionRowBuilder()
                        .addComponents([roleSelect]);
                    await collector.reply({ content: "DJ rolünü ayarlamak için aşağıdan uygun role tıklayınız.", components: [row2], ephemeral: true });
                    const msg = await collector.fetchReply();
                    const buttonFilter = (i) => (i.customId === "djRole") && (i.user.id === interaction.user.id);
                    try {
                        const collector = await msg.awaitMessageComponent({ filter: buttonFilter, componentType: ComponentType.RoleSelect, time: 60000 });
                        if (collector) {
                            const data = collector.values[0];
                            const config = {
                                $set: {
                                    "config.djRole": data
                                }
                            };
                            await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                            await collector.reply({ content: `DJ rolü başarıyla ayarlandı`, ephemeral: true });
                        }
                    }
                    catch (e) {
                        await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
                        console.log(e);
                    }
                }
                else if (collector.customId === "djRoleDelete") {
                    const config = {
                        $set: {
                            "config.djRole": null
                        }
                    };
                    await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                    await collector.reply({ content: "DJ rolü silindi.", ephemeral: true });
                }
            }
        }
        catch (e) {
            await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
            console.log(e);
        }
    }
    else {
        const roleSelect = new RoleSelectMenuBuilder()
            .setCustomId("djRole")
            .setPlaceholder("DJ rolünü seçiniz.")
            .setMinValues(1)
            .setMaxValues(1);
        const row2 = new ActionRowBuilder()
            .addComponents([roleSelect]);
        await interaction.reply({ content: "DJ rolünü ayarlamak için aşağıdan uygun role tıklayınız.", components: [row2], ephemeral: true });
        const msg = await interaction.fetchReply();
        const buttonFilter = (i) => (i.customId === "djRole") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({ filter: buttonFilter, componentType: ComponentType.RoleSelect, time: 60000 });
            if (collector) {
                const data = collector.values[0];
                const config = {
                    $set: {
                        "config.djRole": data
                    }
                };
                await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                await collector.reply({ content: `DJ rolü başarıyla ayarlandı`, ephemeral: true });
            }
        }
        catch (e) {
            await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
            console.log(e);
        }
    }
}
async function dayColorRole(interaction, client) {
    if (client.guildsConfig.get(interaction.guild.id).config.roleOfTheDay) {
        const reject = new ButtonBuilder()
            .setCustomId("dayColorRoleReject")
            .setLabel("❌| İptal")
            .setStyle(ButtonStyle.Danger);
        const accept = new ButtonBuilder()
            .setCustomId("dayColorRoleAccept")
            .setLabel("✅| Değiştir")
            .setStyle(ButtonStyle.Success);
        const deleteButton = new ButtonBuilder()
            .setCustomId("dayColorRoleDelete")
            .setLabel("🗑️| Sil")
            .setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder()
            .addComponents([reject, accept, deleteButton]);
        await interaction.reply({ content: "Günün rengi rolü zaten ayarlı. Değiştirmek mi silmek mi istersiniz?", components: [row], ephemeral: true });
        const msg = await interaction.fetchReply();
        const filter = (i) => (i.customId === "dayColorRoleReject" || i.customId === "dayColorRoleAccept" || i.customId === "dayColorRoleDelete") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({
                filter,
                componentType: ComponentType.Button,
                time: 60000
            });
            if (collector) {
                if (collector.customId === "dayColorRoleReject") {
                    await collector.reply({ content: "İşlem iptal edildi.", ephemeral: true });
                }
                else if (collector.customId === "dayColorRoleAccept") {
                    const roleSelect = new RoleSelectMenuBuilder()
                        .setCustomId("roleOfTheDay")
                        .setPlaceholder("Günün Rengi rolünü seçiniz.")
                        .setMinValues(1)
                        .setMaxValues(1);
                    const row2 = new ActionRowBuilder()
                        .addComponents([roleSelect]);
                    await collector.reply({ content: "Günün Rengi rolünü ayarlamak için aşağıdan uygun role tıklayınız.", components: [row2], ephemeral: true });
                    const msg = await collector.fetchReply();
                    const buttonFilter = (i) => (i.customId === "roleOfTheDay") && (i.user.id === interaction.user.id);
                    try {
                        const collector = await msg.awaitMessageComponent({ filter: buttonFilter, componentType: ComponentType.RoleSelect, time: 60000 });
                        if (collector) {
                            const data = collector.values[0];
                            const config = {
                                $set: {
                                    "config.roleOfTheDay": data
                                }
                            };
                            await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                            await collector.reply({ content: `Günün Rengi rolü başarıyla ayarlandı`, ephemeral: true });
                        }
                    }
                    catch (e) {
                        await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
                        console.log(e);
                    }
                }
                else if (collector.customId === "dayColorRoleDelete") {
                    const config = {
                        $set: {
                            "config.roleOfTheDay": null
                        }
                    };
                    await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                    await collector.reply({ content: "Günün rengi rolü silindi.", ephemeral: true });
                }
            }
        }
        catch (e) {
            await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
            console.log(e);
        }
    }
    else {
        const roleSelect = new RoleSelectMenuBuilder()
            .setCustomId("roleOfTheDay")
            .setPlaceholder("Günün Rengi rolünü seçiniz.")
            .setMinValues(1)
            .setMaxValues(1);
        const row2 = new ActionRowBuilder()
            .addComponents([roleSelect]);
        await interaction.reply({ content: "Günün Rengi rolünü ayarlamak için aşağıdan uygun role tıklayınız.", components: [row2], ephemeral: true });
        const msg = await interaction.fetchReply();
        const buttonFilter = (i) => (i.customId === "roleOfTheDay") && (i.user.id === interaction.user.id);
        try {
            const collector = await msg.awaitMessageComponent({ filter: buttonFilter, componentType: ComponentType.RoleSelect, time: 60000 });
            if (collector) {
                const data = collector.values[0];
                const config = {
                    $set: {
                        "config.roleOfTheDay": data
                    }
                };
                await client.updateGuildConfig({ guildId: interaction.guild.id, config });
                await collector.reply({ content: `Günün Rengi rolü başarıyla ayarlandı`, ephemeral: true });
            }
        }
        catch (e) {
            await interaction.followUp({ content: "Zaman aşımına uğradı veya bir hatayla karşılaştık.", ephemeral: true });
            console.log(e);
        }
    }
}
export { registerConfig, welcomeConfig, moderationConfig, roleConfig };
//# sourceMappingURL=configFunctions.js.map