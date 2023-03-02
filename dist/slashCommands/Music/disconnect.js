import { SlashCommandBuilder } from "discord.js";
export default {
    data: new SlashCommandBuilder()
        .setName("disconnect")
        .setDescription("Botu ses kanalından atar.")
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
                    await interaction.reply("|✅| **Müzik durduruldu.**");
                    const message = await interaction.fetchReply();
                    await message.react("✅");
                    player.destroy();
                    return;
                }
            }
            else {
                await interaction.reply("|✅| **Müzik durduruldu.**");
                const message = await interaction.fetchReply();
                await message.react("✅");
                player.destroy();
                return;
            }
        }
        await interaction.reply("|✅| **Müzik durduruldu.**");
        const message = await interaction.fetchReply();
        await message.react("✅");
        player.destroy();
    }
};
//# sourceMappingURL=disconnect.js.map