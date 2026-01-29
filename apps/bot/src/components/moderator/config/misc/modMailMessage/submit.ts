import { ComponentBase } from "@types";
import { dynamicMessage, RoleConfigPanel } from "@config";

export default {
  customId: "config:misc:modMailMessage:submit",
  async execute(interaction, args, guildData) {
    if (!interaction.isModalSubmit()) return;

    await dynamicMessage("modMailMessage", interaction, guildData, RoleConfigPanel, "misc");
  },
} as ComponentBase;
