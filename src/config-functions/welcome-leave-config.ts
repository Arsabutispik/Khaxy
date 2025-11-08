import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  MessageFlagsBitField,
  StringSelectMenuBuilder,
} from "discord.js";
import { dynamicChannel, dynamicMessage, waitForMessageComponent } from "./utils.js";
import { getGuildConfig } from "@database";

export async function welcomeLeaveConfig(interaction: ChatInputCommandInteraction<"cached">) {
  const client = interaction.client;
  const guildConfig = await getGuildConfig(interaction.guildId);
  if (!guildConfig) {
    await interaction.reply({
      content: "Guild config not found. Please contact the bot developers as this shouldn't happen.",
      flags: MessageFlagsBitField.Flags.Ephemeral,
    });
    return;
  }
  const t = client.i18next.getFixedT(guildConfig.language, null, "welcome_leave_config");
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("welcome_leave_config")
    .setMinValues(1)
    .setMaxValues(1)
    .setOptions([
      {
        label: t("join_channel_id.label"),
        value: "join_channel",
        description: t("join_channel_id.description"),
        emoji: "👋",
      },
      {
        label: t("join_message.label"),
        value: "join_message",
        description: t("join_message.description"),
        emoji: "📩",
      },
      {
        label: t("leave_channel_id.label"),
        value: "leave_channel",
        description: t("leave_channel_id.description"),
        emoji: "🚪",
      },
      {
        label: t("leave_message.label"),
        value: "leave_message",
        description: t("leave_message.description"),
        emoji: "📤",
      },
    ]);
  const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
  const messageComponent = await waitForMessageComponent(interaction, actionRow, t, "welcome_leave_config");
  if (!messageComponent) return;
  switch (messageComponent.values[0]) {
    case "join_channel":
      await dynamicChannel("join_channel_id", messageComponent, guildConfig, t);
      break;
    case "join_message":
      await dynamicMessage("join_message", messageComponent, guildConfig, t);
      break;
    case "leave_channel":
      await dynamicChannel("leave_channel_id", messageComponent, guildConfig, t);
      break;
    case "leave_message":
      await dynamicMessage("leave_message", messageComponent, guildConfig, t);
      break;
  }
}
