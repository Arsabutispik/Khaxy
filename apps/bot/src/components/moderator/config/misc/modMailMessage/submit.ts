import { ComponentBase } from "@types";
import { MiscConfigPanel } from "../../../../../config-functions/index.js";
import { updateGuildConfig } from "@repo/database";

export default {
  customId: "config:misc:modMailMessage:submit",
  async execute(interaction, args, guildData) {
    if (!interaction.isModalSubmit()) return;

    await interaction.deferUpdate();

    const messageValue = interaction.fields.getTextInputValue("message");
    const newValue = messageValue.trim();

    await updateGuildConfig(interaction.guildId, { modMailMessage: newValue });

    const panel = new MiscConfigPanel(guildData, interaction.client);
    await panel.updateAndRefresh(interaction, "misc", { modMailMessage: newValue });
  },
} as ComponentBase;
