import { ComponentBase } from "@types";
import { LabelBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export default {
  customId: "config:register:registerJoinChannelId:edit",
  async execute(interaction, _args, guildData) {
    if (!interaction.isButton()) return;

    const currentMessage = guildData.registerJoinMessage || "";
    const t = interaction.client.i18next.getFixedT(guildData.language, "components", "config.registerJoinChannelId");
    const modal = new ModalBuilder()
      .setCustomId("config:register:registerJoinChannelId:submit")
      .setTitle(t(($) => $.modal.title));
    modal.addLabelComponents(
      new LabelBuilder()
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("message")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(2000)
            .setValue(currentMessage),
        )
        .setLabel(t(($) => $.modal.label.messageContent)),
    );
    await interaction.showModal(modal);
  },
} as ComponentBase;
