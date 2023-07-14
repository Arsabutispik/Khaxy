import { ButtonBuilder, ActionRowBuilder, EmbedBuilder, SlashCommandBuilder, ButtonStyle, ComponentType } from "discord.js";
export default {
    help: {
        name: "skip",
        description: "Bir veya birden fazla müziği atlar.",
        usage: "skip [amount]",
        examples: ["skip", "skip 2"],
        category: "Müzik"
    },
    data: new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Bir veya birden fazla müziği atlar.")
        .addIntegerOption(option => option.setName("amount").setDescription("Kaç müzik atılacağını belirtir.").setRequired(false))
        .setDMPermission(false),
    async execute({ client, interaction }) {
        const acceptButton = new ButtonBuilder()
            .setCustomId('accept')
            .setEmoji('✔️')
            .setStyle(ButtonStyle.Success)
            .setDisabled(false);
        const rejectButton = new ButtonBuilder()
            .setCustomId('reject')
            .setEmoji('✖️')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(false);
        const row = new ActionRowBuilder()
            .addComponents(acceptButton, rejectButton);
        const amount = interaction.options.getInteger("amount");
        async function skipVote(interaction, userStates, player) {
            if (!amount) {
                if (userStates.size === 1) {
                    const otherUser = userStates.first();
                    if (otherUser) {
                        await interaction.reply({ content: `${otherUser} **${interaction.user.tag}** Şu anda çalan *\`${player.queue.current?.title}\`* şarkısını değiştirmek istiyor lütfen aşağıdan seçimini yap.`, components: [row] });
                        const msg = await interaction.fetchReply();
                        const filter = (interaction) => interaction.user.id === otherUser.id && (interaction.customId === 'accept' || interaction.customId === 'reject');
                        try {
                            let response = await msg.awaitMessageComponent({ filter, componentType: ComponentType.Button, time: 1000 * 60 * 2 });
                            switch (response.customId) {
                                case 'accept':
                                    player.stop();
                                    await msg.edit({ content: `Şarkı başarıyla atlandı.`, components: [] });
                                    break;
                                case 'reject':
                                    await msg.edit({ content: `Şarkı atlaması reddedildi.`, components: [] });
                                    break;
                            }
                        }
                        catch (e) {
                            await msg.edit({ content: `${otherUser.user.tag} Oylamayı red etti`, components: [] });
                            return;
                        }
                    }
                }
                else if (userStates.size >= 2) {
                    let dataHolder = [];
                    let accepted = 0;
                    const embed = new EmbedBuilder()
                        .setTitle("Oylama Başladı")
                        .setDescription(`${interaction.user.tag} Şu anda çalan *\`${player.queue.current?.title}\`* şarkısını değiştirmek istiyor lütfen aşağıdan seçimini yap.`)
                        .setColor("Random")
                        .setFooter({ text: "Oylama 2 dakika içinde sona erecek." });
                    userStates.forEach(user => {
                        embed.addFields({
                            name: user.user.tag,
                            value: "Oylama Bekleniyor şu anki oylama durumu |⭕|",
                        });
                        dataHolder.push({ id: user.id, voted: false, accepted: false });
                    });
                    await interaction.reply({ content: `${userStates.map(user => user.toString()).join(", ")}`, embeds: [embed], components: [row] });
                    const msg = await interaction.fetchReply();
                    const filter = (interaction) => userStates.has(interaction.user.id) && (interaction.customId === 'accept' || interaction.customId === 'reject');
                    const collector = msg.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 1000 * 60 * 2 });
                    collector.on('collect', async (interaction) => {
                        if (interaction.customId === "accept") {
                            const index = dataHolder.findIndex(data => data.id === interaction.user.id);
                            if (index !== -1) {
                                if (dataHolder[index].voted) {
                                    await interaction.reply({ content: "Zaten oy kullandın.", ephemeral: true });
                                    return;
                                }
                                dataHolder[index].voted = true;
                                dataHolder[index].accepted = true;
                                embed.data.fields[index].value = "Oylama Kabul Edildi şu anki oylama durumu |✅|";
                                accepted++;
                            }
                        }
                        else if (interaction.customId === "reject") {
                            const index = dataHolder.findIndex(data => data.id === interaction.user.id);
                            if (index !== -1) {
                                if (dataHolder[index].voted) {
                                    await interaction.reply({ content: "Zaten oy kullandın.", ephemeral: true });
                                    return;
                                }
                                dataHolder[index].voted = true;
                                dataHolder[index].accepted = false;
                                embed.data.fields[index].value = "Oylama Reddedildi şu anki oylama durumu |❌|";
                            }
                        }
                        await msg.edit({ embeds: [embed], components: [row] });
                        if (dataHolder.find(data => !data.voted))
                            return;
                        collector.stop();
                    });
                    collector.on('end', async () => {
                        if (userStates.size === 2 && accepted === 1) {
                            player.stop();
                            await msg.edit({ content: "Şarkı başarıyla atlandı.", components: [] });
                        }
                        else {
                            await msg.edit({ content: "Oylama başarısız oldu.", components: [] });
                        }
                        if (Math.floor((accepted / userStates.size) * 100) >= 60) {
                            player.stop();
                            await msg.edit({ content: "Şarkı başarıyla atlandı.", components: [] });
                        }
                        else {
                            await msg.edit({ content: "Oylama başarısız oldu.", components: [] });
                        }
                    });
                }
            }
            else {
                if (amount > player.queue.length)
                    return await interaction.reply({ content: "Kuyrukta o kadar şarkı yok." });
                if (userStates.size === 1) {
                    const otherUser = userStates.filter(member => member.id !== interaction.user.id).first();
                    if (otherUser) {
                        await interaction.reply({ content: `${otherUser} **${interaction.user.tag}** Listeden ${amount} şarkıyı geçmek istiyor lütfen aşağıdan seçimini yap.`, components: [row] });
                        const msg = await interaction.fetchReply();
                        const filter = (interaction) => interaction.user.id === otherUser.id && (interaction.customId === 'accept' || interaction.customId === 'reject');
                        try {
                            let response = await msg.awaitMessageComponent({ filter, componentType: ComponentType.Button, time: 1000 * 60 * 2 });
                            switch (response.customId) {
                                case 'accept':
                                    player.queue.remove(0, amount);
                                    player.stop();
                                    await msg.edit({ content: `${amount} şarkı başarıyla atlandı.`, components: [] });
                                    break;
                                case 'reject':
                                    await msg.edit({ content: `Şarkı atlaması reddedildi.`, components: [] });
                                    break;
                            }
                        }
                        catch (e) {
                            await msg.edit({ content: "Zaman aşımı." });
                            return;
                        }
                    }
                }
                else if (userStates.size >= 2) {
                    let dataHolder = [];
                    let accepted = 0;
                    const embed = new EmbedBuilder()
                        .setTitle("Oylama Başladı")
                        .setDescription(`${interaction.user.tag} Şu anda çalan **${amount}** şarkıyı değiştirmek istiyor lütfen aşağıdan seçimini yap.`)
                        .setColor("Random")
                        .setFooter({ text: "Oylama 2 dakika içinde sona erecek." });
                    userStates.forEach(user => {
                        embed.addFields({
                            name: user.user.tag,
                            value: "Oylama Bekleniyor şu anki oylama durumu |⭕|",
                        });
                        dataHolder.push({ id: user.id, voted: false, accepted: false });
                    });
                    await interaction.reply({ content: `${userStates.map(user => user.toString()).join(", ")}`, embeds: [embed], components: [row] });
                    const msg = await interaction.fetchReply();
                    const filter = (interaction) => userStates.has(interaction.user.id) && (interaction.customId === 'accept' || interaction.customId === 'reject');
                    const collector = msg.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 1000 * 60 * 2 });
                    collector.on('collect', async (interaction) => {
                        if (interaction.customId === "accept") {
                            const index = dataHolder.findIndex(data => data.id === interaction.user.id);
                            if (index !== -1) {
                                if (dataHolder[index].voted) {
                                    await interaction.reply({ content: "Zaten oy kullandın.", ephemeral: true });
                                    return;
                                }
                                dataHolder[index].voted = true;
                                dataHolder[index].accepted = true;
                                embed.data.fields[index].value = "Oylama Kabul Edildi şu anki oylama durumu |✅|";
                                accepted++;
                            }
                        }
                        else if (interaction.customId === "reject") {
                            const index = dataHolder.findIndex(data => data.id === interaction.user.id);
                            if (index !== -1) {
                                if (dataHolder[index].voted) {
                                    await interaction.reply({ content: "Zaten oy kullandın.", ephemeral: true });
                                    return;
                                }
                                dataHolder[index].voted = true;
                                dataHolder[index].accepted = false;
                                embed.data.fields[index].value = "Oylama Reddedildi şu anki oylama durumu |❌|";
                            }
                        }
                        await msg.edit({ embeds: [embed], components: [row] });
                        if (dataHolder.find(data => !data.voted))
                            return;
                        collector.stop();
                    });
                    collector.on('end', async () => {
                        if (userStates.size === 2 && accepted === 1) {
                            player.queue.remove(0, amount);
                            player.stop();
                            await msg.edit({ content: `${amount} şarkı başarıyla atlandı.`, components: [] });
                        }
                        else {
                            await msg.edit({ content: "Oylama başarısız oldu.", components: [] });
                        }
                        if (Math.floor((accepted / userStates.size) * 100) >= 60) {
                            player.queue.remove(0, amount);
                            player.stop();
                            await msg.edit({ content: `${amount} şarkı başarıyla atlandı.`, components: [] });
                        }
                        else {
                            await msg.edit({ content: "Oylama başarısız oldu.", components: [] });
                        }
                    });
                }
            }
        }
        const player = client.manager.players.get(interaction.guild.id);
        if (!player)
            return await interaction.reply({ content: "Şu anda hiçbir şey çalmıyor." });
        if (!interaction.member.voice.channel)
            return await interaction.reply({ content: "Bir ses kanalında olmanız gerekir." });
        if (interaction.guild.members.me.voice.channel && interaction.member.voice.channel.id !== interaction.guild.members.me.voice.channel.id)
            return await interaction.reply({ content: "Botla aynı ses kanalında olmanız gerekir." });
        if (!player.queue.current)
            return await interaction.reply({ content: "Şu anda hiçbir şey çalmıyor." });
        const voiceStateUsers = interaction.member.voice.channel.members
            .filter(member => !member.user.bot)
            .filter(member => !member.roles.cache.has("798592379204010024"))
            .filter(member => !member.voice.selfDeaf)
            .filter(member => !member.voice.serverDeaf)
            .filter(member => !(member.id === interaction.user.id));
        if (voiceStateUsers.size >= 1) {
            if (interaction.member.roles.cache.has(client.guildsConfig.get(interaction.guild.id).config.djRole)) {
                if (!amount) {
                    player.stop();
                    return await interaction.reply({ content: "Şarkı başarıyla atlandı." });
                }
                if (amount > player.queue.length)
                    return await interaction.reply({ content: "Kuyrukta o kadar şarkı yok." });
                player.queue.remove(0, amount);
                player.stop();
                await interaction.reply({ content: `${amount} şarkı başarıyla atlandı.` });
            }
            else if (interaction.member.permissions.has("Administrator")) {
                if (!amount) {
                    player.stop();
                    return await interaction.reply({ content: "Şarkı başarıyla atlandı." });
                }
                if (amount > player.queue.length)
                    return await interaction.reply({ content: "Kuyrukta o kadar şarkı yok." });
                player.queue.remove(0, amount);
                player.stop();
                await interaction.reply({ content: `${amount} şarkı başarıyla atlandı.` });
            }
            else {
                await skipVote(interaction, voiceStateUsers, player);
            }
            return;
        }
        if (!amount) {
            player.stop();
            return await interaction.reply({ content: "Şarkı başarıyla atlandı." });
        }
        if (amount > player.queue.length)
            return await interaction.reply({ content: "Kuyrukta o kadar şarkı yok." });
        player.queue.remove(0, amount);
        player.stop();
        await interaction.reply({ content: `${amount} şarkı başarıyla atlandı.` });
    }
};
//# sourceMappingURL=skip.js.map