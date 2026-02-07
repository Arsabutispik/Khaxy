import { ComponentBase } from "@types";
import { MiscConfigPanel } from "../../../../config-functions/index.js";
import { updateGuildConfig } from "@repo/database";

export default {
  customId: "config:misc:language",
  async execute(interaction, _args, guildData) {
    if (!interaction.isStringSelectMenu() || !interaction.inCachedGuild()) return;

    await interaction.deferUpdate();

    const newLanguage = interaction.values[0] as "en-GB" | "tr-TR";

    await updateGuildConfig(interaction.guildId, { language: newLanguage });

    const panel = new MiscConfigPanel(guildData, interaction.client);

    await panel.updateAndRefresh(interaction, "misc", {
      language: newLanguage,
    });
  },
} as ComponentBase;
