import { ComponentBase } from "@types";
import { dynamicRole, RoleConfigPanel } from "@config";

export default {
  customId: "config:role:memberRoleId",
  async execute(interaction, _args, guildData) {
    if (!interaction.isRoleSelectMenu()) return;

    await dynamicRole("memberRoleId", interaction, guildData, RoleConfigPanel, "role");
  },
} as ComponentBase;
