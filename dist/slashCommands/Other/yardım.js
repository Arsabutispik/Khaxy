import { SlashCommandBuilder } from "discord.js";
export default {
    help: {
        name: "yardım",
        description: "Tüm komutları gösterir",
        usage: "yardım",
        examples: ["yardım"],
        category: "Diğer"
    },
    data: new SlashCommandBuilder()
        .setName("help")
        .setNameLocalizations({
        "tr": "yardım",
    })
        .setDescription("Displays all commands.")
        .setDescriptionLocalizations({
        "tr": "Tüm komutları gösterir."
    }),
    execute: async ({ interaction }) => {
        await interaction.reply("Untill further notice, this command is disabled.");
    }
};
//# sourceMappingURL=yard%C4%B1m.js.map