import { ComponentBase } from "@types";
import { sendWelcomeMessage } from "@features";
import { MessageFlags } from "discord.js";

export default {
  customId: "config:welcomeLeave:joinChannelId:test",
  async execute(interaction, _args, guildData) {
    if (!interaction.isButton()) return;
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    // Run the helper using the person who clicked the button
    const sent = await sendWelcomeMessage(interaction.member, guildData, true);
    const t = interaction.client.i18next.getFixedT(guildData.language, "components", "config.joinChannelId.test");
    if (sent) {
      await interaction.editReply(
        t(($) => $.pass, {
          channelId: guildData.joinChannelId,
          check: interaction.client.allEmojis.get(interaction.client.config.emojis.confirm.id)?.format,
        }),
      );
    } else {
      await interaction.editReply(
        t(($) => $.fail, {
          reject: interaction.client.allEmojis.get(interaction.client.config.emojis.reject.id)?.format,
        }),
      );
    }
  },
} as ComponentBase;
