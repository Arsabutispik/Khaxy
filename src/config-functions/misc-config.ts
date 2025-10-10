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
import { dynamicChannel, dynamicMessage } from "./register-config.js";
import { localeFlags } from "@constants";

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
  const reply = await interaction.reply({
    content: t("initial"),
    components: [actionRow],
    flags: MessageFlagsBitField.Flags.Ephemeral,
    withResponse: true,
  });
  const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id && i.customId === "misc_config";
  let messageComponent;
  try {
    messageComponent = await reply.resource!.message!.awaitMessageComponent({
      filter,
      time: 1000 * 60,
      componentType: ComponentType.StringSelect,
    });
  } catch {
    await reply.resource!.message!.edit({ content: t("timeout"), components: [] }).catch(() => null);
    return;
  }

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
  let messageComponent;
  try {
    messageComponent = await result.awaitMessageComponent({
      filter,
      time: 1000 * 60,
      componentType: ComponentType.StringSelect,
    });
  } catch {
    await interaction.editReply({ content: t("timeout"), components: [] });
    return;
  }
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
