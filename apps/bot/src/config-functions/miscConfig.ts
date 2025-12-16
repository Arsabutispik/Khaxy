import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from "discord.js";
import { GuildWithLogs, updateGuildConfig } from "@repo/database";
import { dynamicChannel, dynamicMessage } from "./utils.js";
import { localeFlags } from "src/constants/index.js";
import { waitForMessageComponent } from "./utils.js";
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
      {
        label: t("bumpLeaderboardChannelId.label"),
        value: "bumpLeaderboardChannelId",
        description: t("bumpLeaderboardChannelId.description"),
        emoji: "📊",
      },
    ]);
  const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(selectMenu);
  const messageComponent = await waitForMessageComponent(interaction, actionRow, t, "misc_config");
  if (!messageComponent) return;
  switch (messageComponent.values[0]) {
    case "language":
      await messageComponent.deferUpdate();
      await languageConfig(messageComponent, guildData, t);
      break;
    case "modMailMessage":
      await dynamicMessage("modMailMessage", messageComponent, guildData, t);
      break;
    case "bumpLeaderboardChannelId":
      await dynamicChannel("bumpLeaderboardChannelId", messageComponent, guildData, t);
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
