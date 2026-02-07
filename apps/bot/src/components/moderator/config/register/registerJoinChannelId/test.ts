import { ComponentBase } from "@types";
import { MessageFlags } from "discord.js";
import { sendRegisterMessage } from "@features";

export default {
  customId: "config:register:registerJoinChannelId:test",
  async execute(interaction, _args, guildData) {
    if (!interaction.isButton()) return;
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    // Run the helper using the person who clicked the button
    const sent = await sendRegisterMessage(interaction.member, guildData, true);
    const t = interaction.client.i18next.getFixedT(
      guildData.language,
      "components",
      "config.registerJoinChannelId.test",
    );
    if (sent) {
      await interaction.editReply(
        t(($) => $.pass, {
          channelId: guildData.registerJoinChannelId,
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
} satisfies ComponentBase;
