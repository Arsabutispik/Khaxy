import { ActionRowBuilder, EmbedBuilder, SelectMenuBuilder, SlashCommandBuilder, ComponentType, } from "discord.js";
export default {
    help: {
        name: "yardım",
        description: "Tüm komutları gösterir",
        usage: "yardım",
        examples: ["yardım"],
        category: "Diğer"
    },
    data: new SlashCommandBuilder()
        .setName("yardım")
        .setDescription("Tüm komutları gösterir"),
    execute: async ({ interaction, client }) => {
        const category = client.slashCommands.filter(key => {
            if (!key.help.hidden) {
                return key;
            }
        }).map((command) => {
            return {
                label: command.help.category,
                description: command.help.description,
                value: command.help.category.toLowerCase()
            };
        });
        const selectMenu = new SelectMenuBuilder()
            .setCustomId("help")
            .setPlaceholder("Kategori Seç")
            .addOptions(category);
        const row = new ActionRowBuilder()
            .addComponents(selectMenu);
        const embed = new EmbedBuilder()
            .setColor("Random")
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setDescription("Komutlar hakkında bilgi almak için kategori seçin");
        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
        const message = await interaction.fetchReply();
        const filter = (i) => i.user.id === interaction.user.id;
        const collector = message.createMessageComponentCollector({ filter, time: 60000, componentType: ComponentType.SelectMenu });
        collector.on("collect", async (i) => {
            const category = i.values[0];
            const commands = client.slashCommands.filter((command) => command.help.category.toLowerCase() === category);
            const embed = new EmbedBuilder()
                .setColor("Random")
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                .setDescription(`**${category}** Kategorisini görüntülüyorsunuz`);
            commands.forEach((command) => {
                if (!command.help.hidden) {
                    embed.addFields({ name: command.help.name, value: `Tanım: ${command.help.description}\n\nKullanım: ${command.help.usage}\n\nÖrnekler: ${command.help.examples}`, inline: true });
                }
            });
            await i.update({ embeds: [embed] });
        });
        collector.on("end", async () => {
            const embed = new EmbedBuilder()
                .setColor("Random")
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                .setDescription("Süre dolduğu için menü kapatıldı");
            await message.edit({ embeds: [embed], components: [] });
        });
    }
};
//# sourceMappingURL=yard%C4%B1m.js.map