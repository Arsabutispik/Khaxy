import {slashCommandBase} from "../../types";
import {GuildMember, SlashCommandBuilder} from "discord.js";
import {useQueue} from "discord-player"
export default {
    help: {
        name: "shuffle",
        description: "Müziği karıştırır.",
        usage: "shuffle",
        examples: ["shuffle"],
        category: "Müzik"
    },
    data: new SlashCommandBuilder()
        .setName("shuffle")
        .setDescription("Müziği karıştırır.")
        .setDMPermission(false),
    execute: async ({ client, interaction }) => {
        let player = useQueue(interaction.guild!.id);

        if (!(interaction.member as GuildMember).voice.channel) {
            await interaction.reply("|❌| **Bir sesli kanala girmek zorundasınız**");
            return
        }
        if (!player) {
            await interaction.reply("|❌| **Bot şu anda müzik çalmıyor.**");
            return
        }
        const voiceStateUsers = (interaction.member as GuildMember).voice.channel!.members
            .filter(member => !member.user.bot)
            .filter(member => !member.roles.cache.has("798592379204010024"))
            .filter(member => !member.voice.selfDeaf!)
            .filter(member => !member.voice.serverDeaf!)
            .filter(member => !(member.id === interaction.user.id));
        if (voiceStateUsers.size > 0) {
            if(!(interaction.member as GuildMember).permissions.has("Administrator")) {
                if(!(interaction.member as GuildMember).roles.cache.has(client.guildsConfig.get(interaction.guild!.id)!.config.djRole)) {
                    await interaction.reply("|❌| **Bu komutu kullanmak için yeterli yetkiniz yok.**");
                    return
                } else {
                    player.tracks.shuffle();
                    await interaction.reply("|✅| **Müzik karıştırıldı.**");
                    const message = await interaction.fetchReply()
                    await message.react("✅");
                    return
                }
            } else {
                player.tracks.shuffle();
                await interaction.reply("|✅| **Müzik karıştırıldı.**");
                const message = await interaction.fetchReply()
                await message.react("✅");
                return
            }
        }

        player.tracks.shuffle();
        await interaction.reply("|✅| **Müzik karıştırıldı.**");
        const message = await interaction.fetchReply()
        await message.react("✅");
    }
} as slashCommandBase