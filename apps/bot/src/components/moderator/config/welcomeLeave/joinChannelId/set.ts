import { ComponentBase } from "@types";
import { dynamicChannel, WelcomeLeaveConfigPanel } from "@config";

export default {
  customId: "config:welcomeLeave:joinChannelId:set",
  async execute(interaction, args, guildData) {
    if (!interaction.isChannelSelectMenu()) return;

    await dynamicChannel("joinChannelId", interaction, guildData, WelcomeLeaveConfigPanel, "welcomeLeave");
  },
} as ComponentBase;
