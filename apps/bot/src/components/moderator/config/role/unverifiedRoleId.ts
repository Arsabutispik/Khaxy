import { ComponentBase } from "@types";
import { dynamicRole, RoleConfigPanel } from "@config";

export default {
  customId: "config:role:unverifiedRoleId",
  async execute(interaction, _args, guildData) {
    if (!interaction.isRoleSelectMenu()) return;
    await dynamicRole("unverifiedRoleId", interaction, guildData, RoleConfigPanel);
  },
} as ComponentBase;
