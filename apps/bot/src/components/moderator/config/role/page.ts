import { ComponentBase } from "@types";
import { RoleConfigPanel } from "@config";

export default {
  customId: "config:role:page", // Matches prefix
  async execute(interaction, args, guildData) {
    if (!interaction.isButton() || !interaction.inCachedGuild()) return;

    await interaction.deferUpdate();

    const [action, currentPageStr] = args; // ["next", "1"] or ["prev", "2"]
    let currentPage = parseInt(currentPageStr);

    if (action === "next") {
      currentPage++;
    } else if (action === "prev") {
      currentPage--;
    }

    const panel = new RoleConfigPanel(guildData, interaction.client, currentPage);
    await panel.show(interaction, "role");
  },
} satisfies ComponentBase;
