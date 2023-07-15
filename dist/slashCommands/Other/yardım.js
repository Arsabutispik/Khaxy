import { SlashCommandBuilder, } from "discord.js";
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
        const category = client.slashCommands.map((command) => command.help.category).filter((value, index, self) => self.indexOf(value) === index).filter((value) => value);
        console.log(category);
        await interaction.reply({ content: "Yardım menüsü yakında eklenecek", ephemeral: true });
    }
};
//# sourceMappingURL=yard%C4%B1m.js.map