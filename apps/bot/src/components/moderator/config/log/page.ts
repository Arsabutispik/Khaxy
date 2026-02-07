import { ComponentBase } from "@types";
import { LogConfigPanel } from "@config";

export default {
  customId: "config:log:page",
  async execute(interaction, args, guildData) {
    if (!interaction.isButton() || !interaction.inCachedGuild()) return;

    await interaction.deferUpdate();

    const [action, currentPageStr] = args;
    let currentPage = parseInt(currentPageStr);

    if (action === "next") {
      currentPage++;
    } else if (action === "prev") {
      currentPage--;
    }

    const panel = new LogConfigPanel(guildData, interaction.client, currentPage);
    await panel.show(interaction, "log");
  },
} satisfies ComponentBase;
