import { ComponentBase } from "@types";
import { RoleConfigPanel } from "../../../../config-functions/index.js";
import { updateGuildConfig } from "@repo/database";

export default {
  customId: "config:role:memberRoleId",
  async execute(interaction, _args, guildData) {
    if (!interaction.isRoleSelectMenu() || !interaction.inCachedGuild()) return;

    await interaction.deferUpdate();

    const newRoleId = interaction.values[0] || null;

    await updateGuildConfig(interaction.guildId, { memberRoleId: newRoleId });

    const panel = new RoleConfigPanel(guildData, interaction.client);

    await panel.updateAndRefresh(interaction, "role", {
      memberRoleId: newRoleId,
    });
  },
} as ComponentBase;
