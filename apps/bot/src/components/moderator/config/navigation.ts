import { ComponentBase } from "@types";
import { MiscConfigPanel, RegisterConfigPanel, RoleConfigPanel, WelcomeLeaveConfigPanel } from "@config";

export default {
  customId: "config:navigation",
  async execute(interaction, _args, guildData) {
    if (!interaction.isStringSelectMenu() || !interaction.inCachedGuild()) return;

    await interaction.deferUpdate();

    const navigation = interaction.values[0];

    let panel;
    switch (navigation) {
      case "misc":
        panel = new MiscConfigPanel(guildData, interaction.client);
        break;
      case "role":
        panel = new RoleConfigPanel(guildData, interaction.client);
        break;
      case "welcomeLeave":
        panel = new WelcomeLeaveConfigPanel(guildData, interaction.client);
        break;
      case "register":
        panel = new RegisterConfigPanel(guildData, interaction.client);
        break;
      default:
        panel = new MiscConfigPanel(guildData, interaction.client);
    }
    await panel.show(interaction, navigation);
  },
} as ComponentBase;
