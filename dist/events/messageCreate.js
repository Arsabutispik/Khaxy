import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, ComponentType, EmbedBuilder, ModalBuilder, PermissionsBitField, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import fetch, { Headers, FormData } from "node-fetch";
export default async (client, message) => {
    if (message.author.bot)
        return;
    if (message.channel.type === ChannelType.DM) {
        if (!client.userTickets.has(message.author.id)) {
            try {
                if (message.content.length > 4096)
                    return await message.reply("Mesajınız 4096 karakterden uzun olamaz");
                const commonGuilds = client.guilds.cache.filter(guild => guild.members.cache.has(message.author.id) && guild.channels.cache.get(client.guildsConfig.get(guild.id).config.modmail.logChannel) && guild.members.me.permissionsIn(guild.channels.cache.get(client.guildsConfig.get(guild.id).config.modmail.category)).has(PermissionsBitField.Flags.ManageChannels));
                if (commonGuilds.size > 0) {
                    const SelectMenu = new StringSelectMenuBuilder()
                        .setCustomId("modmail")
                        .setPlaceholder("Bir sunucu seç")
                        .setMinValues(1)
                        .setMaxValues(1)
                        .addOptions(commonGuilds.map(guild => {
                        return {
                            label: guild.name,
                            value: guild.id
                        };
                    }));
                    const row = new ActionRowBuilder()
                        .addComponents(SelectMenu);
                    const msg = await message.reply({
                        content: "Modmail kullanmak istediğin sunucuyu seç",
                        components: [row]
                    });
                    const filter = (messageFilter) => messageFilter.user.id === message.author.id;
                    const stringSelect = await msg.awaitMessageComponent({
                        filter,
                        componentType: ComponentType.StringSelect,
                        time: 60000
                    });
                    if (stringSelect) {
                        const guild = client.guilds.cache.get(stringSelect.values[0]);
                        if (guild) {
                            const tickets = client.guildsConfig.get(guild.id).config.modmail.tickets;
                            const str = "" + tickets;
                            const pad = "000";
                            const ans = pad.substring(0, pad.length - str.length) + str;
                            const mailChannel = await guild.channels.create({
                                name: `${ans}-${message.author.username}`,
                                parent: client.guildsConfig.get(guild.id).config.modmail.category,
                                type: ChannelType.GuildText,
                                topic: `Modmail kanalı **${message.author.username}** tarafından oluşturuldu /kapat yazarak kapatılabilir`,
                                permissionOverwrites: [
                                    {
                                        id: guild.id,
                                        deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
                                    }
                                ]
                            });
                            stringSelect.reply({ content: "Modmail kanalı oluşturuldu", ephemeral: true });
                            const config = {
                                $inc: {
                                    "config.modmail.tickets": 1
                                }
                            };
                            await client.updateGuildConfig({ guildId: guild.id, config });
                            let d = new Date();
                            let padding = (v) => `0${v}`.slice(-2);
                            let datestring = `${d.getFullYear()}/${padding(d.getMonth() + 1)}/${padding(d.getDate())} ${padding(d.getHours())}:${padding(d.getMinutes())}`;
                            client.ticketMessages.set(message.author.id, `[${datestring}] - [Mailer] ${message.author.username}(${message.author.id}) - ${message.content}`);
                            const MailEmbed = new EmbedBuilder()
                                .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
                                .setDescription("Yeni bir mail geldi, yanıtlamak için sohbete yazın reddetmek için aşağıdaki butona basabilirsiniz\n**Mesaj:**\n" + message.content)
                                .setColor("Yellow")
                                .setTimestamp();
                            const reject = new ButtonBuilder()
                                .setCustomId("reject")
                                .setLabel("❌| Reddet")
                                .setStyle(ButtonStyle.Danger);
                            const row = new ActionRowBuilder()
                                .addComponents(reject);
                            const mailMessage = await mailChannel.send({ embeds: [MailEmbed], components: [row] });
                            const TextBuilder = new TextInputBuilder()
                                .setCustomId("rejectReason")
                                .setPlaceholder("Reddetme sebebi")
                                .setMinLength(1)
                                .setMaxLength(3000)
                                .setRequired(true)
                                .setStyle(TextInputStyle.Paragraph)
                                .setLabel("Reddetme sebebi");
                            const rowModal = new ActionRowBuilder()
                                .addComponents(TextBuilder);
                            const modal = new ModalBuilder()
                                .setCustomId("reject")
                                .setTitle("Reddetme sebebi")
                                .addComponents(rowModal);
                            const filter = (messageFilter) => {
                                const member = guild.members.cache.get(messageFilter.user.id);
                                if (member) {
                                    return member.permissions.has(PermissionsBitField.Flags.ManageGuild);
                                }
                                else {
                                    return false;
                                }
                            };
                            const button = await mailMessage.createMessageComponentCollector({
                                filter,
                                componentType: ComponentType.Button
                            });
                            button.on("collect", async (button) => {
                                if (button.customId === "reject") {
                                    await button.showModal(modal);
                                    const modalFilter = (messageFilter) => {
                                        const member = guild.members.cache.get(messageFilter.user.id);
                                        if (member) {
                                            return member.permissions.has(PermissionsBitField.Flags.ManageGuild);
                                        }
                                        else {
                                            return false;
                                        }
                                    };
                                    const collector = await button.awaitModalSubmit({ filter: modalFilter, time: 60000 });
                                    collector.reply({ content: "Mail reddedildi", ephemeral: true });
                                    if (guild.members.me?.permissionsIn(mailChannel).has(PermissionsBitField.Flags.ManageChannels)) {
                                        await mailChannel.delete();
                                    }
                                    else {
                                        await mailChannel.send({ content: "Bu kanalı silmek için yeterli yetkim yok." });
                                    }
                                    const rejectEmbed = new EmbedBuilder()
                                        .setAuthor({
                                        name: collector.user.username,
                                        iconURL: collector.user.displayAvatarURL()
                                    })
                                        .setDescription(`Mail reddedildi\n**Reddeden:** ${collector.user.username}\n**Reddetme sebebi:** ${collector.fields.getTextInputValue("rejectReason")}`)
                                        .setColor("Red")
                                        .setTimestamp();
                                    await message.reply({ embeds: [rejectEmbed] });
                                    const rejectLog = new EmbedBuilder()
                                        .setAuthor({ name: collector.user.username, iconURL: collector.user.displayAvatarURL() })
                                        .setDescription(`Mail reddedildi\n**Reddeden:** ${collector.user.username}\n**Reddetme sebebi:** ${collector.fields.getTextInputValue("rejectReason")}`)
                                        .setColor("Red")
                                        .setTimestamp();
                                    const logChannel = guild.channels.cache.get(client.guildsConfig.get(guild.id).config.modmail.logChannel);
                                    if (logChannel) {
                                        await logChannel.send({ embeds: [rejectLog] });
                                    }
                                    client.userTickets.delete(message.author.id);
                                }
                            });
                            const filterMessage = (messageFilter) => {
                                return messageFilter.channel.id === mailChannel.id;
                            };
                            const collector = await mailChannel.createMessageCollector({ filter: filterMessage });
                            collector.on("collect", async (staffResponse) => {
                                if (staffResponse.author.id === client.user.id)
                                    return;
                                const MailEmbed = new EmbedBuilder()
                                    .setAuthor({ name: staffResponse.author.username, iconURL: staffResponse.author.displayAvatarURL() })
                                    .setDescription(staffResponse.content)
                                    .setColor("Yellow")
                                    .setTimestamp();
                                await message.reply({ embeds: [MailEmbed] });
                                client.userTickets.set(message.author.id, mailChannel.id);
                                mailMessage.edit({ components: [] });
                                let padding = (v) => `0${v}`.slice(-2);
                                let datestring = `${d.getFullYear()}/${padding(d.getMonth() + 1)}/${padding(d.getDate())} ${padding(d.getHours())}:${padding(d.getMinutes())}`;
                                client.ticketMessages.set(message.author.id, client.ticketMessages.get(message.author.id) + `\n[${datestring}] - [Responder] ${staffResponse.author.username}(${staffResponse.author.id}) - ${staffResponse.content}`);
                                await staffResponse.react("✅");
                                collector.stop();
                            });
                        }
                    }
                }
                else {
                    await message.reply("Modmail kullanabileceğin ortak bir sunucu bulamadım");
                }
            }
            catch (e) {
                console.error(e);
                await message.reply("Bir hata oluştu");
            }
        }
        else {
            const mailChannel = client.channels.cache.get(client.userTickets.get(message.author.id));
            if (mailChannel) {
                const closeButton = new ButtonBuilder()
                    .setCustomId("close")
                    .setLabel("❌| Kapat")
                    .setStyle(ButtonStyle.Danger);
                const row = new ActionRowBuilder()
                    .addComponents(closeButton);
                const MailEmbed = new EmbedBuilder()
                    .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
                    .setDescription(message.content)
                    .setColor("Yellow")
                    .setTimestamp();
                const replyMessage = await mailChannel.send({ embeds: [MailEmbed], components: [row] });
                await message.react("✅");
                const filter = (messageFilter) => {
                    const member = messageFilter.guild.members.cache.get(messageFilter.user.id);
                    if (member) {
                        return member.permissions.has(PermissionsBitField.Flags.ManageGuild);
                    }
                    else {
                        return false;
                    }
                };
                const button = await replyMessage.createMessageComponentCollector({
                    filter,
                    componentType: ComponentType.Button
                });
                button.on("collect", async (button) => {
                    if (button.customId === "close") {
                        let d = new Date();
                        let padding = (v) => `0${v}`.slice(-2);
                        let datestring = `${d.getFullYear()}/${padding(d.getMonth() + 1)}/${padding(d.getDate())} ${padding(d.getHours())}:${padding(d.getMinutes())}`;
                        client.ticketMessages.set(message.author.id, client.ticketMessages.get(message.author.id) + `\n[${datestring}] - [Mailer] ${message.author.username}(${message.author.id}) - ${message.content}`);
                        const myHeaders = new Headers();
                        myHeaders.append("Accept", "application/json");
                        const formdata = new FormData();
                        formdata.append("username", "arsabutispik");
                        formdata.append("password", "G7jqT9c4JShir@O");
                        const login = await fetch("https://pastes.io/api/login", {
                            method: "POST",
                            headers: myHeaders,
                            body: formdata,
                            redirect: "follow",
                        });
                        const loginResponse = await login.json();
                        const myPostHeaders = new Headers();
                        myPostHeaders.append("Accept", "application/json");
                        myPostHeaders.append("Authorization", "Bearer " + loginResponse.success.api_token);
                        const postformdata = new FormData();
                        postformdata.append("content", client.ticketMessages.get(message.author.id));
                        postformdata.append("status", "2");
                        postformdata.append("expire", "N");
                        postformdata.append("title", `${button.channel.name} - ${button.user.username} Tarafından yanıtlanan mail`);
                        postformdata.append("syntax", "none");
                        const pasteio = await fetch("https://pastes.io/api/paste/create", {
                            method: "POST",
                            headers: myPostHeaders,
                            body: postformdata,
                            redirect: "follow",
                        });
                        const response = await pasteio.json();
                        const closeEmbed = new EmbedBuilder()
                            .setAuthor({ name: button.user.username, iconURL: button.user.displayAvatarURL() })
                            .setDescription("Mail kapatıldı")
                            .setColor("Red")
                            .setTimestamp();
                        await message.reply({ embeds: [closeEmbed] });
                        client.userTickets.delete(message.author.id);
                        const lastEmbed = new EmbedBuilder()
                            .setAuthor({ name: button.user.username, iconURL: button.user.displayAvatarURL() })
                            .setDescription(`${button.user.username} tarafından ${button.channel.name} maili kapatıldı. Konuşma logları [BURADA](https://pastes.io/raw/${response.success.slug}) bulunabilir`)
                            .setColor("Greyple")
                            .setTimestamp();
                        const logChannel = button.guild.channels.cache.get(client.guildsConfig.get(button.guildId).config.modmail.logChannel);
                        if (logChannel) {
                            await logChannel.send({ embeds: [lastEmbed] });
                        }
                        if (button.guild.members.me?.permissionsIn(mailChannel).has(PermissionsBitField.Flags.ManageChannels)) {
                            await mailChannel.delete();
                        }
                        else {
                            await mailChannel.send({ content: "Bu kanalı silmek için yeterli yetkim yok." });
                        }
                        client.ticketMessages.delete(message.author.id);
                    }
                });
                const collector = mailChannel.createMessageCollector({ filter: (messageFilter) => messageFilter.channel.id === mailChannel.id });
                collector.on("collect", async (staffResponse) => {
                    if (staffResponse.author.id === client.user.id)
                        return;
                    const MailEmbed = new EmbedBuilder()
                        .setAuthor({ name: staffResponse.author.username, iconURL: staffResponse.author.displayAvatarURL() })
                        .setDescription(staffResponse.content)
                        .setColor("Yellow")
                        .setTimestamp();
                    await message.reply({ embeds: [MailEmbed] });
                    await replyMessage.edit({ components: [] });
                    let d = new Date();
                    let padding = (v) => `0${v}`.slice(-2);
                    let datestring = `${d.getFullYear()}/${padding(d.getMonth() + 1)}/${padding(d.getDate())} ${padding(d.getHours())}:${padding(d.getMinutes())}`;
                    client.ticketMessages.set(message.author.id, client.ticketMessages.get(message.author.id) + `\n[${datestring}] - [Responder] ${staffResponse.author.username}(${staffResponse.author.id}) - ${staffResponse.content}`);
                    await staffResponse.react("✅");
                    collector.stop();
                });
            }
            else {
                await message.reply("Bir hata oluştu");
            }
        }
    }
};
//# sourceMappingURL=messageCreate.js.map