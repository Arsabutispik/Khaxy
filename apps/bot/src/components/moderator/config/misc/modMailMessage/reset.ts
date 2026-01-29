import { ComponentBase } from "@types";
import { updateGuildConfig } from "@repo/database";
import { MiscConfigPanel } from "../../../../../config-functions/index.js";

export default {
  customId: "config:misc:modMailMessage:reset",
  async execute(interaction, _args, guildData) {
    if (!interaction.isButton()) return;
    await interaction.deferUpdate();
    const defaultMessage = "Thank you for your message! Our mod team will reply to you here as soon as possible.";
    await updateGuildConfig(interaction.guildId, { modMailMessage: defaultMessage });
    const panel = new MiscConfigPanel(guildData, interaction.client);
    await panel.updateAndRefresh(interaction, "misc", { modMailMessage: defaultMessage });
  },
} as ComponentBase;
