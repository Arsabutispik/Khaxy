import { MessageButton, MessageActionRow, MessageEmbed } from "discord.js";
export default {
    name: "skip",
    category: "Müzik",
    description: "Şarkıyı veya birden fazla şarkıyı atlar",
    usage: "{prefix}skip [number]",
    examples: "{prefix}skip 2 | {prefix}skip",
    async execute({ client, message, args }) {
        const acceptButton = new MessageButton()
            .setCustomId('accept')
            .setEmoji('✔️')
            .setStyle('SUCCESS')
            .setDisabled(false);
        const rejectButton = new MessageButton()
            .setCustomId('reject')
            .setEmoji('✖️')
            .setStyle('DANGER')
            .setDisabled(false);
        const row = new MessageActionRow()
            .addComponents(acceptButton, rejectButton);
        async function skipVote(message, userStates, player, args) {
            if (!args?.length) {
                if (userStates.size === 1) {
                    const otherUser = userStates.first();
                    if (otherUser) {
                        const msg = await message.channel.send({ content: `${otherUser} **${message.author.tag}** Şu anda çalan *\`${player.queue.current?.title}\`* şarkısını değiştirmek istiyor lütfen aşağıdan seçimini yap.`, components: [row] });
                        const filter = (interaction) => interaction.user.id === otherUser.id && (interaction.customId === 'accept' || interaction.customId === 'reject');
                        try {
                            let response = await msg.awaitMessageComponent({ filter, time: 1000 * 60 * 2 });
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
                    const embed = new MessageEmbed()
                        .setTitle("Oylama Başladı")
                        .setDescription(`${message.author.tag} Şu anda çalan *\`${player.queue.current?.title}\`* şarkısını değiştirmek istiyor lütfen aşağıdan seçimini yap.`)
                        .setColor("RANDOM")
                        .setFooter({ text: "Oylama 2 dakika içinde sona erecek." });
                    userStates.forEach(user => {
                        embed.addField(user.user.tag, "Oylama Bekleniyor şu anki oylama durumu |⭕|", false);
                        dataHolder.push({ id: user.id, voted: false, accepted: false });
                    });
                    const msg = await message.channel.send({ content: `${userStates.map(user => user.toString()).join(", ")}`, embeds: [embed], components: [row] });
                    const filter = (interaction) => userStates.has(interaction.user.id) && (interaction.customId === 'accept' || interaction.customId === 'reject');
                    const collector = msg.createMessageComponentCollector({ filter, time: 1000 * 60 * 2 });
                    collector.on('collect', async (interaction) => {
                        if (interaction.customId === "accept") {
                            const index = dataHolder.findIndex(data => data.id === interaction.user.id);
                            if (index !== -1) {
                                if (dataHolder[index].voted) {
                                    interaction.reply({ content: "Zaten oy kullandın.", ephemeral: true });
                                    return;
                                }
                                dataHolder[index].voted = true;
                                dataHolder[index].accepted = true;
                                embed.fields[index].value = "Oylama Kabul Edildi şu anki oylama durumu |✅|";
                                accepted++;
                            }
                        }
                        else if (interaction.customId === "reject") {
                            const index = dataHolder.findIndex(data => data.id === interaction.user.id);
                            if (index !== -1) {
                                if (dataHolder[index].voted) {
                                    interaction.reply({ content: "Zaten oy kullandın.", ephemeral: true });
                                    return;
                                }
                                dataHolder[index].voted = true;
                                dataHolder[index].accepted = false;
                                embed.fields[index].value = "Oylama Reddedildi şu anki oylama durumu |❌|";
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
                if (isNaN(Number(args[0])))
                    return message.reply({ content: "Lütfen geçerli bir sayı girin." });
                if (Number(args[0]) > player.queue.length)
                    return message.reply({ content: "Kuyrukta o kadar şarkı yok." });
                if (userStates.size === 1) {
                    const otherUser = userStates.filter(member => member.id !== message.author.id).first();
                    if (otherUser) {
                        const msg = await message.channel.send({ content: `${otherUser} **${message.author.tag}** Listeden ${args[0]} şarkıyı geçmek istiyor lütfen aşağıdan seçimini yap.`, components: [row] });
                        const filter = (interaction) => interaction.user.id === otherUser.id && (interaction.customId === 'accept' || interaction.customId === 'reject');
                        try {
                            let response = await msg.awaitMessageComponent({ filter, time: 1000 * 60 * 2 });
                            switch (response.customId) {
                                case 'accept':
                                    player.queue.remove(0, Number(args[0]));
                                    player.stop();
                                    await msg.edit({ content: `${args[0]} şarkı başarıyla atlandı.`, components: [] });
                                    break;
                                case 'reject':
                                    await msg.edit({ content: `Şarkı atlaması reddedildi.`, components: [] });
                                    break;
                            }
                        }
                        catch (e) {
                            msg.edit({ content: "Zaman aşımı." });
                            return;
                        }
                    }
                }
                else if (userStates.size >= 2) {
                    let dataHolder = [];
                    let accepted = 0;
                    const embed = new MessageEmbed()
                        .setTitle("Oylama Başladı")
                        .setDescription(`${message.author.tag} Şu anda çalan **${args[0]}** şarkıyı değiştirmek istiyor lütfen aşağıdan seçimini yap.`)
                        .setColor("RANDOM")
                        .setFooter({ text: "Oylama 2 dakika içinde sona erecek." });
                    userStates.forEach(user => {
                        embed.addField(user.user.tag, "Oylama Bekleniyor şu anki oylama durumu |⭕|", false);
                        dataHolder.push({ id: user.id, voted: false, accepted: false });
                    });
                    const msg = await message.channel.send({ content: `${userStates.map(user => user.toString()).join(", ")}`, embeds: [embed], components: [row] });
                    const filter = (interaction) => userStates.has(interaction.user.id) && (interaction.customId === 'accept' || interaction.customId === 'reject');
                    const collector = msg.createMessageComponentCollector({ filter, time: 1000 * 60 * 2 });
                    collector.on('collect', async (interaction) => {
                        if (interaction.customId === "accept") {
                            const index = dataHolder.findIndex(data => data.id === interaction.user.id);
                            if (index !== -1) {
                                if (dataHolder[index].voted) {
                                    interaction.reply({ content: "Zaten oy kullandın.", ephemeral: true });
                                    return;
                                }
                                dataHolder[index].voted = true;
                                dataHolder[index].accepted = true;
                                embed.fields[index].value = "Oylama Kabul Edildi şu anki oylama durumu |✅|";
                                accepted++;
                            }
                        }
                        else if (interaction.customId === "reject") {
                            const index = dataHolder.findIndex(data => data.id === interaction.user.id);
                            if (index !== -1) {
                                if (dataHolder[index].voted) {
                                    interaction.reply({ content: "Zaten oy kullandın.", ephemeral: true });
                                    return;
                                }
                                dataHolder[index].voted = true;
                                dataHolder[index].accepted = false;
                                embed.fields[index].value = "Oylama Reddedildi şu anki oylama durumu |❌|";
                            }
                        }
                        await msg.edit({ embeds: [embed], components: [row] });
                        if (dataHolder.find(data => !data.voted))
                            return;
                        collector.stop();
                    });
                    collector.on('end', async () => {
                        if (userStates.size === 2 && accepted === 1) {
                            player.queue.remove(0, Number(args[0]));
                            player.stop();
                            await msg.edit({ content: `${args[0]} şarkı başarıyla atlandı.`, components: [] });
                        }
                        else {
                            await msg.edit({ content: "Oylama başarısız oldu.", components: [] });
                        }
                        if (Math.floor((accepted / userStates.size) * 100) >= 60) {
                            player.queue.remove(0, Number(args[0]));
                            player.stop();
                            await msg.edit({ content: `${args[0]} şarkı başarıyla atlandı.`, components: [] });
                        }
                        else {
                            await msg.edit({ content: "Oylama başarısız oldu.", components: [] });
                        }
                    });
                }
            }
        }
        const player = client.manager.players.get(message.guild.id);
        if (!player)
            return message.reply({ content: "Şu anda hiçbir şey çalmıyor." });
        if (!message.member.voice.channel)
            return message.reply({ content: "Bir ses kanalında olmanız gerekir." });
        if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id)
            return message.reply({ content: "Botla aynı ses kanalında olmanız gerekir." });
        if (!player.queue.current)
            return message.reply({ content: "Şu anda hiçbir şey çalmıyor." });
        const voiceStateUsers = message.member.voice.channel.members
            .filter(member => !member.user.bot)
            .filter(member => !member.roles.cache.has("798592379204010024"))
            .filter(member => !member.voice.selfDeaf)
            .filter(member => !member.voice.serverDeaf)
            .filter(member => !(member.id === message.author.id));
        if (voiceStateUsers.size >= 1) {
            if (message.member.roles.cache.has("798592379204010024")) {
                if (!args[0]) {
                    player.stop();
                    return message.reply({ content: "Şarkı başarıyla atlandı." });
                }
                if (isNaN(Number(args[0])))
                    return message.reply({ content: "Lütfen geçerli bir sayı girin." });
                if (Number(args[0]) > player.queue.length)
                    return message.reply({ content: "Kuyrukta o kadar şarkı yok." });
                player.queue.remove(0, Number(args[0]));
                player.stop();
                message.reply({ content: `${args[0]} şarkı başarıyla atlandı.` });
            }
            else if (message.member?.permissions.has("ADMINISTRATOR")) {
                if (!args[0]) {
                    player.stop();
                    return message.reply({ content: "Şarkı başarıyla atlandı." });
                }
                if (isNaN(Number(args[0])))
                    return message.reply({ content: "Lütfen geçerli bir sayı girin." });
                if (Number(args[0]) > player.queue.length)
                    return message.reply({ content: "Kuyrukta o kadar şarkı yok." });
                player.queue.remove(0, Number(args[0]));
                player.stop();
                message.reply({ content: `${args[0]} şarkı başarıyla atlandı.` });
            }
            else {
                await skipVote(message, voiceStateUsers, player, args);
            }
            return;
        }
        if (!args[0]) {
            player.stop();
            return message.reply({ content: "Şarkı başarıyla atlandı." });
        }
        if (isNaN(Number(args[0])))
            return message.reply({ content: "Lütfen geçerli bir sayı girin." });
        if (Number(args[0]) > player.queue.length)
            return message.reply({ content: "Kuyrukta o kadar şarkı yok." });
        player.queue.remove(0, Number(args[0]));
        player.stop();
        message.reply({ content: `${args[0]} şarkı başarıyla atlandı.` });
    }
};
//# sourceMappingURL=skip.js.map