import { ComponentBase } from "@types";
import { dynamicRole, RoleConfigPanel } from "@config";

export default {
  customId: "config:role:femaleRoleId",
  async execute(interaction, _args, guildData) {
    if (!interaction.isRoleSelectMenu()) return;

    await dynamicRole("femaleRoleId", interaction, guildData, RoleConfigPanel);
  },
} as ComponentBase;
