import { SlashCommandBase } from "@types";
import { SlashCommandBuilder, InteractionContextType } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setNameLocalizations({
      tr: "yardım",
    })
    .setDescription("Get help with the bot's commands")
    .setDescriptionLocalizations({
      tr: "Botun komutları hakkında yardım al",
    })
    .setContexts(InteractionContextType.Guild)
    .addStringOption((option) =>
      option
        .setName("command")
        .setNameLocalizations({
          tr: "komut",
        })
        .setDescription("The command you need help with")
        .setDescriptionLocalizations({
          tr: "Yardım almak istediğiniz komut",
        })
        .setRequired(true),
    ),
  async execute(interaction) {
    interaction.reply("This command is under development.").catch(() => {});
  },
} as SlashCommandBase;
