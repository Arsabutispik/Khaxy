import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  ComponentType,
  MessageComponentInteraction,
  MessageFlagsBitField,
  StringSelectMenuBuilder,
} from "discord.js";
import { getGuildConfig, updateGuildConfig } from "@database";
import type { guilds as Guilds } from "@prisma/client";
import type { TFunction } from "i18next";
import { dynamicChannel, dynamicMessage } from "./utils.js";
import { localeFlags } from "@constants";
import { waitForMessageComponent } from "./utils.js";
import { logger } from "@lib";

export async function miscConfig(interaction: ChatInputCommandInteraction<"cached">) {
  const client = interaction.client;
  const guildConfig = await getGuildConfig(interaction.guildId!);
  if (!guildConfig) {
    await interaction.reply({
      content: "No guild config found. Running a simple command should create one.",
      flags: MessageFlagsBitField.Flags.Ephemeral,
    });
    return;
  }

  const t = client.i18next.getFixedT(guildConfig.language, null, "misc_config");
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("misc_config")
    .setMinValues(1)
    .setMaxValues(1)
    .setOptions([
      {
        label: t("language.label"),
        value: "language",
        description: t("language.description"),
        emoji: "🌐",
      },
      {
        label: t("mod_mail_message.label"),
        value: "mod_mail_message",
        description: t("mod_mail_message.description"),
        emoji: "📬",
      },
      {
        label: t("bump_leaderboard_channel_id.label"),
        value: "leaderboard",
        description: t("bump_leaderboard_channel_id.description"),
        emoji: "📊",
      },
    ]);
  const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(selectMenu);
  const messageComponent = await waitForMessageComponent(interaction, actionRow, t, "misc_config");
  if (!messageComponent) return;
  switch (messageComponent.values[0]) {
    case "language":
      await messageComponent.deferUpdate();
      await languageConfig(messageComponent, guildConfig, t);
      break;
    case "mod_mail_message":
      await dynamicMessage("mod_mail_message", messageComponent, guildConfig, t);
      break;
    case "leaderboard":
      await dynamicChannel("bump_leaderboard_channel_id", messageComponent, guildConfig, t);
  }
}

async function languageConfig(interaction: MessageComponentInteraction, data: Guilds, t: TFunction) {
  const client = interaction.client;
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("language")
    .setMinValues(1)
    .setMaxValues(1)
    .setOptions(
      [
        {
          label: localeFlags["en-GB"],
          value: "en-GB",
          description: "English",
          emoji: "🇬🇧",
        },
        {
          label: localeFlags["tr-TR"],
          value: "tr-TR",
          description: "Türkçe",
          emoji: "🇹🇷",
        },
      ].map((option) => {
        if (option.value === data.language) {
          // @ts-expect-error - This is a valid property
          option.default = true;
        }
        return option;
      }),
    );
  const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(selectMenu);
  const result = await interaction.editReply({
    content: t("language.initial"),
    components: [actionRow],
  });
  const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id && i.customId === "language";
  const messageComponent = await result
    .awaitMessageComponent({
      filter,
      time: 1000 * 60 * 5,
      componentType: ComponentType.StringSelect,
    })
    .catch(async () => {
      await interaction.editReply({
        content: t("timeout"),
        components: [],
      });
      logger.log({
        level: "warn",
        message: `User ${interaction.user.tag} (${interaction.user.id}) did not respond in time for language selection in guild ${interaction.guild?.name} (${interaction.guildId})`,
        discord: false,
      });
      return null;
    });
  if (!messageComponent) return;
  if (!messageComponent.inCachedGuild()) {
    await messageComponent.deferUpdate();
    await messageComponent.editReply({
      content: "Not cached, unexpected error",
      components: [],
    });
    return;
  }
  await messageComponent.deferUpdate();
  await updateGuildConfig(messageComponent.guildId, {
    language: messageComponent.values[0],
  });
  const new_t = client.i18next.getFixedT(messageComponent.values[0], null, "misc_config");
  await messageComponent.editReply({
    content: new_t("language.set", { language: localeFlags[messageComponent.values[0]] }),
    components: [],
  });
}
