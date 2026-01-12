import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from "discord.js";
import { GuildWithLogs, updateGuildConfig } from "@repo/database";
import { dynamicMessage, waitForMessageComponent } from "./utils.js";
import { localeFlags } from "@constants";
import { TFunction } from "i18next";

export async function miscConfig(interaction: ChatInputCommandInteraction<"cached">, guildData: GuildWithLogs) {
  const client = interaction.client;

  const t = client.i18next.getFixedT(guildData.language, null, "miscConfig");
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("miscConfig")
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
        label: t("modMailMessage.label"),
        value: "modMailMessage",
        description: t("modMailMessage.description"),
        emoji: "📬",
      },
    ]);
  const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(selectMenu);
  const messageComponent = await waitForMessageComponent(interaction, actionRow, t, "miscConfig");
  if (!messageComponent) return;
  switch (messageComponent.values[0]) {
    case "language":
      await languageConfig(messageComponent, guildData, t);
      break;
    case "modMailMessage":
      await dynamicMessage("modMailMessage", messageComponent, guildData, t);
      break;
  }
}

async function languageConfig(interaction: StringSelectMenuInteraction<"cached">, data: GuildWithLogs, t: TFunction) {
  const client = interaction.client;
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("language")
    .setMinValues(1)
    .setMaxValues(1)
    .setOptions([
      {
        label: localeFlags["en-GB"],
        value: "en-GB",
        description: "English",
        emoji: "🇬🇧",
        default: data.language === "en-GB",
      },
      {
        label: localeFlags["tr-TR"],
        value: "tr-TR",
        description: "Türkçe",
        emoji: "🇹🇷",
        default: data.language === "tr-TR",
      },
    ]);
  const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(selectMenu);
  const messageComponent = await waitForMessageComponent(interaction, actionRow, t, "language");
  if (!messageComponent) return;
  await updateGuildConfig(messageComponent.guildId, {
    language: messageComponent.values[0],
  });
  const new_t = client.i18next.getFixedT(messageComponent.values[0], null, "miscConfig");
  await messageComponent.editReply({
    content: new_t("language.set", { language: localeFlags[messageComponent.values[0]] }),
    components: [],
  });
}
