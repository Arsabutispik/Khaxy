import { ComponentBase } from "@types";
import { MiscConfigPanel, RegisterConfigPanel } from "@config";
import { RoleConfigPanel } from "@config";
import { WelcomeLeaveConfigPanel } from "@config";
import { getOrCreateGuild } from "@repo/database";

export default {
  customId: "config:reset",
  async execute(interaction) {
    if (!interaction.isButton() || !interaction.inCachedGuild()) return;

    await interaction.deferUpdate();

    // Parse the custom ID to get the panel type
    const [, , panelType] = interaction.customId.split(":");

    // Fetch fresh guild data
    const freshGuildData = await getOrCreateGuild(interaction.guildId);
    if (!freshGuildData) {
      await interaction.followUp("Could not fetch guild data.");
      return;
    }
    // Instantiate the correct panel
    let panel;
    switch (panelType) {
      case "misc":
        panel = new MiscConfigPanel(freshGuildData, interaction.client);
        break;
      case "role":
        panel = new RoleConfigPanel(freshGuildData, interaction.client);
        break;
      case "welcomeLeave":
        panel = new WelcomeLeaveConfigPanel(freshGuildData, interaction.client);
        break;
      case "register":
        panel = new RegisterConfigPanel(freshGuildData, interaction.client);
        break;
      default:
        await interaction.followUp("Unknown panel type.");
        return;
    }

    // Show the refreshed panel
    await panel.show(interaction, panelType);
  },
} satisfies ComponentBase;
