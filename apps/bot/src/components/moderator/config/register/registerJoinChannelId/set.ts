import { ComponentBase } from "@types";
import { dynamicChannel, RegisterConfigPanel } from "@config";

export default {
  customId: "config:register:registerJoinChannelId:set",
  async execute(interaction, _args, guildData) {
    if (!interaction.isChannelSelectMenu()) return;

    await dynamicChannel("registerJoinChannelId", interaction, guildData, RegisterConfigPanel, "register");
  },
} satisfies ComponentBase;
