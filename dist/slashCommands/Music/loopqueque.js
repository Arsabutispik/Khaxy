import { SlashCommandBuilder } from "discord.js";
import { useQueue } from "discord-player";
export default {
    help: {
        name: "loopqueue",
        description: "Kuyruğu tekrarlar.",
        usage: "loopqueue",
        examples: ["loopqueue"],
        category: "Müzik"
    },
    data: new SlashCommandBuilder()
        .setName("loopqueue")
        .setDescription("Kuyruğu tekrarlar.")
        .setDMPermission(false),
    async execute({ client, interaction }) {
        const player = useQueue(interaction.guild.id);
        if (!player) {
            return await interaction.reply("|❌| **Şu anda hiçbir şey çalmıyor.**");
        }
        if (!interaction.member.voice.channel) {
            return await interaction.reply("|❌| **Bir ses kanalında olmanız gerekir.**");
        }
        if (interaction.guild.members.me.voice.channel && interaction.member.voice.channel.id !== interaction.guild.members.me.voice.channel.id) {
            return await interaction.reply("|❌| **Bu komutu kullanmak için aynı ses kanalında olmanız gerekir.**");
        }
        if (player.repeatMode !== 2 && player.repeatMode !== 0) {
            await interaction.reply("|❌| **Başka bir tekrar modu açılmış.**");
        }
        const voiceStateUsers = interaction.member.voice.channel.members
            .filter(member => !member.user.bot)
            .filter(member => !member.roles.cache.has("798592379204010024"))
            .filter(member => !member.voice.selfDeaf)
            .filter(member => !member.voice.serverDeaf)
            .filter(member => !(member.id === interaction.user.id));
        if (voiceStateUsers.size > 0) {
            if (!interaction.member.permissions.has("Administrator")) {
                if (!interaction.member.roles.cache.has(client.guildsConfig.get(interaction.guild.id).config.djRole)) {
                    await interaction.reply("|❌| **Bu komutu kullanmak için yeterli yetkiniz yok.**");
                    return;
                }
                else {
                    player.setRepeatMode((player.repeatMode === 0 ? 2 : 0));
                    await interaction.reply(`|${(player.repeatMode === 2) ? "✅" : "❌"}| **Kuyruk tekrarı ${(player.repeatMode === 2) ? "açıldı" : "kapatıldı"}.**`);
                    return;
                }
            }
            else {
                player.setRepeatMode((player.repeatMode === 0 ? 2 : 0));
                return await interaction.reply(`|${(player.repeatMode === 2) ? "✅" : "❌"}| **Kuyruk tekrarı ${(player.repeatMode === 2) ? "açıldı" : "kapatıldı"}.**`);
            }
        }
        player.setRepeatMode((player.repeatMode === 0 ? 2 : 0));
        return await interaction.reply(`|${(player.repeatMode === 2) ? "✅" : "❌"}| **Kuyruk tekrarı ${(player.repeatMode === 2) ? "açıldı" : "kapatıldı"}.**`);
    }
};
//# sourceMappingURL=loopqueque.js.map