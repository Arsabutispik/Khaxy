import { ButtonBuilder, ActionRowBuilder, SlashCommandBuilder, ButtonStyle, ComponentType } from "discord.js";
import { useQueue } from "discord-player";
import { replaceMassString } from "../../utils/utils.js";
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
        .setNameLocalizations({
        "tr": "atla"
    })
        .setDescription("Skip 1 or more tracks")
        .setDescriptionLocalizations({
        "tr": "1 veya daha fazla şarkıyı atlar."
    })
        .addNumberOption(option => option
        .setName("amount")
        .setNameLocalizations({
        "tr": "miktar"
    })
        .setDescription("Determines how many tracks to skip")
        .setDescriptionLocalizations({
        "tr": "Kaç şarkı atlanacağını belirler."
    })
        .setRequired(false)
        .setMinValue(1))
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
        const amount = interaction.options.getNumber("amount");
        async function skipVote(interaction, userStates, player) {
            if (!amount) {
                if (userStates.size === 1) {
                    const otherUser = userStates.first();
                    if (otherUser) {
                        await interaction.reply({ content: replaceMassString(client.handleLanguages("SKIP_ONLY_ONE_USER", client, interaction.guildId), {
                                "{otherUser}": otherUser.toString(),
                                "{interactionUser}": interaction.user.username,
                                "{currentTrack_title}": player.currentTrack.title
                            }), components: [row] });
                        const msg = await interaction.fetchReply();
                        const filter = (interaction) => interaction.user.id === otherUser.id && (interaction.customId === 'accept' || interaction.customId === 'reject');
                        try {
                            let response = await msg.awaitMessageComponent({ filter, componentType: ComponentType.Button, time: 1000 * 60 * 2 });
                            switch (response.customId) {
                                case 'accept':
                                    player.node.skip();
                                    await msg.edit({ content: client.handleLanguages("SKIP_SUCCESS", client, interaction.guildId), components: [] });
                                    break;
                                case 'reject':
                                    await msg.edit({ content: client.handleLanguages("SKIP_REJECT", client, interaction.guildId), components: [] });
                                    break;
                            }
                        }
                        catch (e) {
                            await msg.edit({ content: client.handleLanguages("SKIP_USER_DIDNT_RESPOND_IN_TIME", client, interaction.guildId), components: [] });
                            return;
                        }
                    }
                }
                else if (userStates.size >= 2) {
                    let dataHolder = [];
                    let accepted = 0;
                    const { embeds } = client.handleLanguages("SKIP_VOTING_EMBED", client, interaction.guildId);
                    embeds[0].description = replaceMassString(embeds[0].description, {
                        "{interactionUser}": interaction.user.username,
                        "{currentTrack_title}": player.currentTrack.title
                    });
                    let x = Math.round(0xffffff * Math.random()).toString(16);
                    let y = (6 - x.length);
                    let z = "000000";
                    let z1 = z.substring(0, y);
                    embeds[0].color = Number(`0x${z1 + x}`);
                    userStates.forEach(user => {
                        embeds[0].fields.shift();
                        embeds[0].fields.push({
                            name: user.user.tag,
                            value: client.handleLanguages("SKIP_WAITING_VOTE", client, interaction.guildId),
                            inline: true
                        });
                        dataHolder.push({ id: user.id, voted: false, accepted: false });
                    });
                    await interaction.reply({ content: `${userStates.map(user => user.toString()).join(", ")}`, embeds: embeds, components: [row] });
                    const msg = await interaction.fetchReply();
                    const filter = (interaction) => userStates.has(interaction.user.id) && (interaction.customId === 'accept' || interaction.customId === 'reject');
                    const collector = msg.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 1000 * 60 * 2 });
                    collector.on('collect', async (interaction) => {
                        if (interaction.customId === "accept") {
                            const index = dataHolder.findIndex(data => data.id === interaction.user.id);
                            if (index !== -1) {
                                if (dataHolder[index].voted) {
                                    await interaction.reply({ content: client.handleLanguages("SKIP_ALREADY_VOTED", client, interaction.guildId), ephemeral: true });
                                    return;
                                }
                                dataHolder[index].voted = true;
                                dataHolder[index].accepted = true;
                                embeds[0].fields[index].value = client.handleLanguages("SKIP_ACCEPTED_VOTE", client, interaction.guildId);
                                accepted++;
                            }
                        }
                        else if (interaction.customId === "reject") {
                            const index = dataHolder.findIndex(data => data.id === interaction.user.id);
                            if (index !== -1) {
                                if (dataHolder[index].voted) {
                                    await interaction.reply({ content: client.handleLanguages("SKIP_ALREADY_VOTED", client, interaction.guildId), ephemeral: true });
                                    return;
                                }
                                dataHolder[index].voted = true;
                                dataHolder[index].accepted = false;
                                embeds[0].fields[index].value = client.handleLanguages("SKIP_REJECTED_VOTE", client, interaction.guildId);
                            }
                        }
                        await msg.edit({ embeds: embeds, components: [row] });
                        if (dataHolder.find(data => !data.voted))
                            return;
                        collector.stop();
                    });
                    collector.on('end', async () => {
                        if (userStates.size === 2 && accepted === 1) {
                            player.node.skip();
                            await msg.edit({ content: client.handleLanguages("SKIP_SUCCESS", client, interaction.guildId), components: [] });
                        }
                        else {
                            await msg.edit({ content: client.handleLanguages("SKIP_REJECT", client, interaction.guildId), components: [] });
                        }
                        if (Math.floor((accepted / userStates.size) * 100) >= 60) {
                            player.node.skip();
                            await msg.edit({ content: client.handleLanguages("SKIP_SUCCESS", client, interaction.guildId), components: [] });
                        }
                        else {
                            await msg.edit({ content: client.handleLanguages("SKIP_REJECT", client, interaction.guildId), components: [] });
                        }
                    });
                }
            }
            else {
                if (amount > player.size)
                    return await interaction.reply({ content: client.handleLanguages("SKIP_EXCEEDED_QUEUE_LENGTH", client, interaction.guildId) });
                if (userStates.size === 1) {
                    const otherUser = userStates.filter(member => member.id !== interaction.user.id).first();
                    if (otherUser) {
                        await interaction.reply({ content: replaceMassString(client.handleLanguages("SKIP_ONLY_ONE_USER_AMOUNT", client, interaction.guildId), {
                                "{otherUser}": otherUser.toString(),
                                "{interactionUser}": interaction.user.username,
                                "{amount}": amount.toString()
                            }), components: [row] });
                        const msg = await interaction.fetchReply();
                        const filter = (interaction) => interaction.user.id === otherUser.id && (interaction.customId === 'accept' || interaction.customId === 'reject');
                        try {
                            let response = await msg.awaitMessageComponent({ filter, componentType: ComponentType.Button, time: 1000 * 60 * 2 });
                            switch (response.customId) {
                                case 'accept':
                                    player.node.skipTo(amount - 1);
                                    await msg.edit({ content: replaceMassString(client.handleLanguages("SKIP_AMOUNT_SUCCESS", client, interaction.guildId), {
                                            "{amount}": amount.toString()
                                        }), components: [] });
                                    break;
                                case 'reject':
                                    await msg.edit({ content: client.handleLanguages("SKIP_AMOUNT_REJECT", client, interaction.guildId), components: [] });
                                    break;
                            }
                        }
                        catch (e) {
                            await msg.edit({ content: client.handleLanguages("SKIP_USER_DIDNT_RESPOND_IN_TIME", client, interaction.guildId), components: [] });
                            return;
                        }
                    }
                }
                else if (userStates.size >= 2) {
                    let dataHolder = [];
                    let accepted = 0;
                    const { embeds } = client.handleLanguages("SKIP_VOTING_EMBED_AMOUNT", client, interaction.guildId);
                    embeds[0].description = replaceMassString(embeds[0].description, {
                        "{interactionUser}": interaction.user.username,
                        "{amount}": amount.toString()
                    });
                    let x = Math.round(0xffffff * Math.random()).toString(16);
                    let y = (6 - x.length);
                    let z = "000000";
                    let z1 = z.substring(0, y);
                    embeds[0].color = Number(`0x${z1 + x}`);
                    userStates.forEach(user => {
                        embeds[0].fields.shift();
                        embeds[0].fields.push({
                            name: user.user.tag,
                            value: client.handleLanguages("SKIP_WAITING_VOTE", client, interaction.guildId),
                            inline: true
                        });
                        dataHolder.push({ id: user.id, voted: false, accepted: false });
                    });
                    await interaction.reply({ content: `${userStates.map(user => user.toString()).join(", ")}`, embeds: embeds, components: [row] });
                    const msg = await interaction.fetchReply();
                    const filter = (interaction) => userStates.has(interaction.user.id) && (interaction.customId === 'accept' || interaction.customId === 'reject');
                    const collector = msg.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 1000 * 60 * 2 });
                    collector.on('collect', async (interaction) => {
                        if (interaction.customId === "accept") {
                            const index = dataHolder.findIndex(data => data.id === interaction.user.id);
                            if (index !== -1) {
                                if (dataHolder[index].voted) {
                                    await interaction.reply({ content: client.handleLanguages("SKIP_ALREADY_VOTED", client, interaction.guildId), ephemeral: true });
                                    return;
                                }
                                dataHolder[index].voted = true;
                                dataHolder[index].accepted = true;
                                embeds[0].fields[index].value = client.handleLanguages("SKIP_ACCEPTED_VOTE", client, interaction.guildId);
                                accepted++;
                            }
                        }
                        else if (interaction.customId === "reject") {
                            const index = dataHolder.findIndex(data => data.id === interaction.user.id);
                            if (index !== -1) {
                                if (dataHolder[index].voted) {
                                    await interaction.reply({ content: client.handleLanguages("SKIP_ALREADY_VOTED", client, interaction.guildId), ephemeral: true });
                                    return;
                                }
                                dataHolder[index].voted = true;
                                dataHolder[index].accepted = false;
                                embeds[0].fields[index].value = client.handleLanguages("SKIP_REJECTED_VOTE", client, interaction.guildId);
                            }
                        }
                        await msg.edit({ embeds: embeds, components: [row] });
                        if (dataHolder.find(data => !data.voted))
                            return;
                        collector.stop();
                    });
                    collector.on('end', async () => {
                        if (userStates.size === 2 && accepted === 1) {
                            player.node.skipTo(amount - 1);
                            await msg.edit({ content: replaceMassString(client.handleLanguages("SKIP_AMOUNT_SUCCESS", client, interaction.guildId), {
                                    "{amount}": amount.toString()
                                }), components: [] });
                        }
                        else {
                            await msg.edit({ content: client.handleLanguages("SKIP_REJECTED_VOTE", client, interaction.guildId), components: [] });
                        }
                        if (Math.floor((accepted / userStates.size) * 100) >= 60) {
                            player.node.skipTo(amount - 1);
                            await msg.edit({ content: replaceMassString(client.handleLanguages("SKIP_AMOUNT_SUCCESS", client, interaction.guildId), {
                                    "{amount}": amount.toString()
                                }), components: [] });
                        }
                        else {
                            await msg.edit({ content: client.handleLanguages("SKIP_REJECTED_VOTE", client, interaction.guildId), components: [] });
                        }
                    });
                }
            }
        }
        const player = useQueue(interaction.guild.id);
        if (!player)
            return await interaction.reply({ content: client.handleLanguages("BOT_NOT_PLAYING", client, interaction.guildId) });
        if (!interaction.member.voice.channel)
            return await interaction.reply({ content: client.handleLanguages("USER_NOT_IN_VOICE", client, interaction.guildId) });
        if (interaction.guild.members.me.voice.channel && interaction.member.voice.channel.id !== interaction.guild.members.me.voice.channel.id)
            return await interaction.reply({ content: client.handleLanguages("USER_NOT_IN_THE_SAME_VOICE", client, interaction.guildId) });
        if (!player.currentTrack)
            return await interaction.reply({ content: client.handleLanguages("BOT_NOT_PLAYING", client, interaction.guildId) });
        const voiceStateUsers = interaction.member.voice.channel.members
            .filter(member => !member.user.bot)
            .filter(member => !member.roles.cache.has("798592379204010024"))
            .filter(member => !member.voice.selfDeaf)
            .filter(member => !member.voice.serverDeaf)
            .filter(member => !(member.id === interaction.user.id));
        if (voiceStateUsers.size >= 1) {
            if (interaction.member.roles.cache.has(client.guildsConfig.get(interaction.guild.id).config.djRole)) {
                if (!amount) {
                    player.node.skip();
                    return await interaction.reply({ content: client.handleLanguages("SKIP_SUCCESS", client, interaction.guildId) });
                }
                if (amount > player.size)
                    return await interaction.reply({ content: client.handleLanguages("SKIP_EXCEEDED_QUEUE_LENGTH", client, interaction.guildId) });
                player.node.skipTo(amount - 1);
                await interaction.reply({ content: replaceMassString(client.handleLanguages("SKIP_AMOUNT_SUCCESS", client, interaction.guildId), {
                        "{amount}": amount.toString()
                    }) });
            }
            else if (interaction.member.permissions.has("Administrator")) {
                if (!amount) {
                    player.node.skip();
                    return await interaction.reply({ content: client.handleLanguages("SKIP_SUCCESS", client, interaction.guildId) });
                }
                if (amount > player.size)
                    return await interaction.reply({ content: client.handleLanguages("SKIP_EXCEEDED_QUEUE_LENGTH", client, interaction.guildId) });
                player.node.skipTo(amount - 1);
                await interaction.reply({ content: replaceMassString(client.handleLanguages("SKIP_AMOUNT_SUCCESS", client, interaction.guildId), {
                        "{amount}": amount.toString()
                    }) });
            }
            else {
                await skipVote(interaction, voiceStateUsers, player);
            }
            return;
        }
        if (!amount) {
            player.node.skip();
            return await interaction.reply({ content: client.handleLanguages("SKIP_SUCCESS", client, interaction.guildId) });
        }
        if (amount > player.size)
            return await interaction.reply({ content: client.handleLanguages("SKIP_EXCEEDED_QUEUE_LENGTH", client, interaction.guildId) });
        player.node.skipTo(amount - 1);
        await interaction.reply({ content: replaceMassString(client.handleLanguages("SKIP_AMOUNT_SUCCESS", client, interaction.guildId), {
                "{amount}": amount.toString()
            }) });
    }
};
//# sourceMappingURL=skip.js.map