import { ComponentBase } from "@types";
import { dynamicRole, RoleConfigPanel } from "@config";

export default {
  customId: "config:role:maleRoleId",
  async execute(interaction, _args, guildData) {
    if (!interaction.isRoleSelectMenu()) return;

    await dynamicRole("maleRoleId", interaction, guildData, RoleConfigPanel);
  },
} as ComponentBase;
