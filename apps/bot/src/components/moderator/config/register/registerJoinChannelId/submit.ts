import { ComponentBase } from "@types";
import { dynamicMessage, RegisterConfigPanel } from "@config";

export default {
  customId: "config:register:registerJoinChannelId:submit",
  async execute(interaction, _args, guildData) {
    if (!interaction.isModalSubmit()) return;

    await dynamicMessage("registerJoinMessage", interaction, guildData, RegisterConfigPanel, "register");
  },
} as ComponentBase;
