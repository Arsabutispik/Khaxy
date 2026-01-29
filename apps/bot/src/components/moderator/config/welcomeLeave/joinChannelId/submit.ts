import { ComponentBase } from "@types";
import { dynamicMessage, WelcomeLeaveConfigPanel } from "@config";

export default {
  customId: "config:welcomeLeave:joinChannelId:submit",
  async execute(interaction, _args, guildData) {
    if (!interaction.isModalSubmit()) return;

    await dynamicMessage("joinMessage", interaction, guildData, WelcomeLeaveConfigPanel, "welcomeLeave");
  },
} as ComponentBase;
