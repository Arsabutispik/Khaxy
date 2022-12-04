import { SlashCommandBuilder } from "discord.js";
export default {
    data: new SlashCommandBuilder()
        .setName("loop")
        .setDescription("Şarkıyı tekrarlar.")
        .setDMPermission(false),
    async execute({ client, interaction }) {
        const player = await client.manager.get(interaction.guild.id);
        if (!player) {
            return await interaction.reply("|❌| **Şu anda hiçbir şey çalmıyor.**");
        }
        if (!interaction.member.voice.channel) {
            return await interaction.reply("|❌| **Bir ses kanalında olmanız gerekir.**");
        }
        if (interaction.guild.members.me.voice.channel && interaction.member.voice.channel.id !== interaction.guild.members.me.voice.channel.id) {
            return await interaction.reply("|❌| **Bu komutu kullanmak için aynı ses kanalında olmanız gerekir.**");
        }
        if (!interaction.member.permissions.has("Administrator")) {
            if (!interaction.member.roles.cache.has(client.guildsConfig.get(interaction.guild.id).config.djRole)) {
                await interaction.reply("|❌| **Bu komutu kullanmak için yeterli yetkiniz yok.**");
                return;
            }
            else {
                const success = player.setTrackRepeat(!player.trackRepeat);
                await interaction.reply(`|${success.trackRepeat ? "✅" : "❌"}| **Şarkı tekrarı ${success.trackRepeat ? "açıldı" : "kapatıldı"}.**`);
                return;
            }
        }
        if (!player.queue.current) {
            return await interaction.reply("|❌| **Şu anda hiçbir şey çalmıyor.**");
        }
        const success = player.setTrackRepeat(!player.trackRepeat);
        return await interaction.reply(`|${success.trackRepeat ? "✅" : "❌"}| **Şarkı tekrarı ${success.trackRepeat ? "açıldı" : "kapatıldı"}.**`);
    }
};
//# sourceMappingURL=loop.js.map