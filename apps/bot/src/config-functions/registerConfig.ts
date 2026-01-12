import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from "discord.js";
import { updateGuildConfig, GuildWithLogs } from "@repo/database";
import { dynamicChannel, dynamicMessage, waitForMessageComponent } from "./utils.js";
import { TFunction } from "i18next";

export async function registerConfig(interaction: ChatInputCommandInteraction<"cached">, guildData: GuildWithLogs) {
  const client = interaction.client;
  const t = client.i18next.getFixedT(guildData.language, null, "registerConfig");
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("registerConfig")
    .setMinValues(1)
    .setMaxValues(1)
    .setOptions([
      {
        label: t("registerJoinChannelId.label"),
        value: "registerJoinChannelId",
        description: t("registerJoinChannelId.description"),
        emoji: "📝",
      },
      {
        label: t("registerChannelId.label"),
        value: "registerChannelId",
        description: t("registerChannelId.description"),
        emoji: "📝",
      },
      {
        label: t("registerJoinMessage.label"),
        value: "registerJoinMessage",
        description: t("registerJoinMessage.description"),
        emoji: "📝",
      },
      {
        label: t("registerClearChannel.label"),
        value: "registerClearChannel",
        description: t("registerClearChannel.description"),
        emoji: "📝",
      },
    ]);
  const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(selectMenu);
  const messageComponent = await waitForMessageComponent(interaction, actionRow, t, "registerConfig");
  if (!messageComponent) return;
  switch (messageComponent.values[0]) {
    case "registerJoinChannelId":
      await dynamicChannel("registerJoinChannelId", messageComponent, guildData, t);
      break;
    case "registerChannelId":
      await dynamicChannel("registerChannelId", messageComponent, guildData, t);
      break;
    case "registerJoinMessage":
      await dynamicMessage("registerJoinMessage", messageComponent, guildData, t);
      break;
    case "registerClearChannel":
      await registerClearChannel(messageComponent, guildData, t);
      break;
  }
}

async function registerClearChannel(
  interaction: StringSelectMenuInteraction<"cached">,
  data: GuildWithLogs,
  t: TFunction,
) {
  await interaction.deferUpdate();
  if (data.registerChannelClear) {
    await updateGuildConfig(interaction.guildId, {
      registerChannelClear: false,
    });
    await interaction.editReply({
      content: t("registerClearChannel.unset"),
      components: [],
    });
  } else {
    await updateGuildConfig(interaction.guildId, {
      registerChannelClear: true,
    });
    await interaction.editReply({
      content: t("registerClearChannel.set"),
      components: [],
    });
  }
}
