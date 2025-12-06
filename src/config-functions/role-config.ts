import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  MessageFlagsBitField,
  StringSelectMenuBuilder,
} from "discord.js";
import { getGuildConfig } from "src/database/index.js";
import { dynamicRole, waitForMessageComponent } from "./utils.js";
import { RoleType } from "src/types/index.js";

export async function roleConfig(interaction: ChatInputCommandInteraction<"cached">) {
  const client = interaction.client;
  const guildConfig = await getGuildConfig(interaction.guildId);
  if (!guildConfig) {
    await interaction.reply({
      content: "Unexpected database error. This should not have happened. Please contact the bot developers",
      flags: MessageFlagsBitField.Flags.Ephemeral,
    });
    return;
  }
  const t = client.i18next.getFixedT(guildConfig.language, null, "role_config");
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("role_config")
    .setMinValues(1)
    .setMaxValues(1)
    .setOptions([
      {
        label: t("member"),
        value: "member_role_id",
        description: t("member_description"),
        emoji: "👤",
      },
      {
        label: t("unverified"),
        value: "unverified_role_id",
        description: t("unverified_description"),
        emoji: "❓",
      },
      {
        label: t("male"),
        value: "male_role_id",
        description: t("male_description"),
        emoji: "👨",
      },
      {
        label: t("female"),
        value: "female_role_id",
        description: t("female_description"),
        emoji: "👩",
      },
      {
        label: t("colour_of_the_day"),
        value: "colour_id_of_the_day",
        description: t("colour_of_the_day_description"),
        emoji: "🌈",
      },
      {
        label: t("mute"),
        value: "mute_role_id",
        description: t("mute_description"),
        emoji: "🔇",
      },
      {
        label: t("dj"),
        value: "dj_role_id",
        description: t("dj_description"),
        emoji: "🎧",
      },
    ]);
  const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(selectMenu);
  const messageComponent = await waitForMessageComponent(interaction, actionRow, t, "role_config");
  if (!messageComponent) return;
  await messageComponent.deferUpdate();
  await dynamicRole(messageComponent.values[0] as RoleType, messageComponent, guildConfig, t);
}
