//Since every value follows the same pattern, we can create a dynamic channel configuration component to reduce code duplication.

import { ComponentBase } from "@types";
import { dynamicLogChannel, LogConfigPanel } from "@config";
import { DbConfigKey } from "@constants";

export default {
  customId: "config:log",
  async execute(interaction, args, guildData) {
    if (!interaction.isChannelSelectMenu()) return;

    await dynamicLogChannel(
      args[0] as Extract<DbConfigKey, `${string}ChannelId`>,
      interaction,
      guildData,
      LogConfigPanel,
      "log",
    );
  },
} satisfies ComponentBase;
