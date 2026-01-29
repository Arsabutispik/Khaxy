import { ComponentBase } from "@types";
import { dynamicRole, RoleConfigPanel } from "@config";

export default {
  customId: "config:role:colourIdOfTheDay",
  async execute(interaction, _args, guildData) {
    if (!interaction.isRoleSelectMenu()) return;

    await dynamicRole("colourIdOfTheDay", interaction, guildData, RoleConfigPanel);
  },
} as ComponentBase;
