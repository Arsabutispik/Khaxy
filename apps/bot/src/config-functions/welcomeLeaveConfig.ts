import { ActionRowBuilder, ChatInputCommandInteraction, StringSelectMenuBuilder } from "discord.js";
import { dynamicChannel, dynamicMessage, waitForMessageComponent } from "./utils.js";
import { GuildWithLogs } from "@repo/database";

export async function welcomeLeaveConfig(interaction: ChatInputCommandInteraction<"cached">, guildData: GuildWithLogs) {
  const client = interaction.client;
  const t = client.i18next.getFixedT(guildData.language, null, "welcomeLeaveConfig");
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("welcomeLeaveConfig")
    .setMinValues(1)
    .setMaxValues(1)
    .setOptions([
      {
        label: t("welcomeChannelId.label"),
        value: "welcomeChannelId",
        description: t("welcomeChannelId.description"),
        emoji: "👋",
      },
      {
        label: t("welcomeMessage.label"),
        value: "welcomeMessage",
        description: t("welcomeMessage.description"),
        emoji: "📩",
      },
      {
        label: t("leaveChannelId.label"),
        value: "leaveChannelId",
        description: t("leaveChannelId.description"),
        emoji: "🚪",
      },
      {
        label: t("leaveMessage.label"),
        value: "leaveMessage",
        description: t("leaveMessage.description"),
        emoji: "📤",
      },
    ]);
  const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
  const messageComponent = await waitForMessageComponent(interaction, actionRow, t, "welcome_leave_config");
  if (!messageComponent) return;
  switch (messageComponent.values[0]) {
    case "welcomeChannelId":
      await dynamicChannel("welcomeChannelId", messageComponent, guildData, t);
      break;
    case "welcomeMessage":
      await dynamicMessage("welcomeMessage", messageComponent, guildData, t);
      break;
    case "leaveChannelId":
      await dynamicChannel("leaveChannelId", messageComponent, guildData, t);
      break;
    case "leaveMessage":
      await dynamicMessage("leaveMessage", messageComponent, guildData, t);
      break;
  }
}
