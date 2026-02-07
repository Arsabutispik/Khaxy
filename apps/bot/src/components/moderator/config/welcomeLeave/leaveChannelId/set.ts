import { ComponentBase } from "@types";
import { dynamicChannel, WelcomeLeaveConfigPanel } from "@config";

export default {
  customId: "config:welcomeLeave:leaveChannelId:set",
  async execute(interaction, args, guildData) {
    if (!interaction.isChannelSelectMenu()) return;

    await dynamicChannel("leaveChannelId", interaction, guildData, WelcomeLeaveConfigPanel, "welcomeLeave");
  },
} as ComponentBase;
