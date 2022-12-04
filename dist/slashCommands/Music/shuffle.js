import { SlashCommandBuilder } from "discord.js";
export default {
    data: new SlashCommandBuilder()
        .setName("shuffle")
        .setDescription("Müziği karıştırır.")
        .setDMPermission(false),
    execute: async ({ client, interaction }) => {
        let player = await client.manager.get(interaction.guild.id);
        if (!interaction.member.voice.channel) {
            await interaction.reply("|❌| **Bir sesli kanala girmek zorundasınız**");
            return;
        }
        if (!player) {
            await interaction.reply("|❌| **Bot şu anda müzik çalmıyor.**");
            return;
        }
        if (!interaction.member.permissions.has("Administrator")) {
            if (!interaction.member.roles.cache.has(client.guildsConfig.get(interaction.guild.id).config.djRole)) {
                await interaction.reply("|❌| **Bu komutu kullanmak için yeterli yetkiniz yok.**");
                return;
            }
            else {
                player.pause(true);
                await interaction.reply("|✅| **Müzik karıştırıldı.**");
                const message = await interaction.fetchReply();
                await message.react("✅");
                return;
            }
        }
        player.queue.shuffle();
        await interaction.reply("|✅| **Müzik karıştırıldı.**");
        const message = await interaction.fetchReply();
        await message.react("✅");
    }
};
//# sourceMappingURL=shuffle.js.map