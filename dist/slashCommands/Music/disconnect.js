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
        await interaction.reply("|✅| **Müzik durduruldu.**");
        const message = await interaction.fetchReply();
        await message.react("✅");
        player.destroy();
    }
};
//# sourceMappingURL=disconnect.js.map