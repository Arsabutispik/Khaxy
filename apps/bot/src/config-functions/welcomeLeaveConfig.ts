import { ActionRowBuilder, ChatInputCommandInteraction, StringSelectMenuBuilder } from "discord.js";
import { dynamicChannel, dynamicMessage, waitForMessageComponent } from "./utils.js";
import { GuildWithLogs } from "@repo/database";

export async function welcomeLeaveConfig(interaction: ChatInputCommandInteraction<"cached">, guildData: GuildWithLogs) {
  const client = interaction.client;
  const t = client.i18next.getFixedT(guildData.language, null, "joinLeaveConfig");
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("joinLeaveConfig")
    .setMinValues(1)
    .setMaxValues(1)
    .setOptions([
      {
        label: t(($) => $.joinChannelId.label),
        value: "joinChannelId",
        description: t(($) => $.joinChannelId.description),
        emoji: "👋",
      },
      {
        label: t(($) => $.joinMessage.label),
        value: "joinMessage",
        description: t(($) => $.joinMessage.description),
        emoji: "📩",
      },
      {
        label: t(($) => $.leaveChannelId.label),
        value: "leaveChannelId",
        description: t(($) => $.leaveChannelId.description),
        emoji: "🚪",
      },
      {
        label: t(($) => $.leaveMessage.label),
        value: "leaveMessage",
        description: t(($) => $.leaveMessage.description),
        emoji: "📤",
      },
    ]);
  const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
  const messageComponent = await waitForMessageComponent(interaction, actionRow, t, "joinLeaveConfig");
  if (!messageComponent) return;
  switch (messageComponent.values[0]) {
    case "joinChannelId":
      await dynamicChannel("joinChannelId", messageComponent, guildData, t);
      break;
    case "joinMessage":
      await dynamicMessage("joinMessage", messageComponent, guildData, t);
      break;
    case "leaveChannelId":
      await dynamicChannel("leaveChannelId", messageComponent, guildData, t);
      break;
    case "leaveMessage":
      await dynamicMessage("leaveMessage", messageComponent, guildData, t);
      break;
  }
}
