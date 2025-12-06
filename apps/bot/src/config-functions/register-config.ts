import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  MessageFlagsBitField,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from "discord.js";
import type { guilds as Guilds } from "@repo/database";
import type { TFunction } from "i18next";
import { getGuildConfig, updateGuildConfig } from "src/database/index.js";
import { dynamicChannel, dynamicMessage, waitForMessageComponent } from "./utils.js";

export async function registerConfig(interaction: ChatInputCommandInteraction<"cached">) {
  const client = interaction.client;
  const guildConfig = await getGuildConfig(interaction.guildId);
  if (!guildConfig) {
    await interaction.reply({
      content: "Unexpected database error. This should not have happened. Please contact the bot developers",
      flags: MessageFlagsBitField.Flags.Ephemeral,
    });
    return;
  }
  const t = client.i18next.getFixedT(guildConfig.language, null, "register_config");
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("register_config")
    .setMinValues(1)
    .setMaxValues(1)
    .setOptions([
      {
        label: t("register_join_channel_id.label"),
        value: "register_join_channel",
        description: t("register_join_channel_id.description"),
        emoji: "📝",
      },
      {
        label: t("register_channel_id.label"),
        value: "register_channel",
        description: t("register_channel_id.description"),
        emoji: "📝",
      },
      {
        label: t("register_join_message.label"),
        value: "register_join_message",
        description: t("register_join_message.description"),
        emoji: "📝",
      },
      {
        label: t("register_clear_channel.label"),
        value: "register_clear_channel",
        description: t("register_clear_channel.description"),
        emoji: "📝",
      },
    ]);
  const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(selectMenu);
  const messageComponent = await waitForMessageComponent(interaction, actionRow, t, "register_config");
  if (!messageComponent) return;
  switch (messageComponent.values[0]) {
    case "register_join_channel":
      await dynamicChannel("register_join_channel_id", messageComponent, guildConfig, t);
      break;
    case "register_channel":
      await dynamicChannel("register_channel_id", messageComponent, guildConfig, t);
      break;
    case "register_join_message":
      await dynamicMessage("register_join_message", messageComponent, guildConfig, t);
      break;
    case "register_clear_channel":
      await registerClearChannel(messageComponent, guildConfig, t);
      break;
  }
}

async function registerClearChannel(interaction: StringSelectMenuInteraction<"cached">, data: Guilds, t: TFunction) {
  await interaction.deferUpdate();
  if (data.register_channel_clear) {
    await updateGuildConfig(interaction.guildId, {
      register_channel_clear: false,
    });
    await interaction.editReply({
      content: t("register_clear_channel.unset"),
      components: [],
    });
  } else {
    await updateGuildConfig(interaction.guildId, {
      register_channel_clear: true,
    });
    await interaction.editReply({
      content: t("register_clear_channel.set"),
      components: [],
    });
  }
}
