import { ComponentBase } from "@types";
import { dynamicRole, RoleConfigPanel } from "@config";

export default {
  customId: "config:role:muteRoleId",
  async execute(interaction, _args, guildData) {
    if (!interaction.isRoleSelectMenu()) return;

    await dynamicRole("muteRoleId", interaction, guildData, RoleConfigPanel);
  },
} as ComponentBase;
