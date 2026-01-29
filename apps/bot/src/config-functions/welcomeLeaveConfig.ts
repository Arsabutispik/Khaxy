import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelType,
  ChatInputCommandInteraction,
  ContainerBuilder,
  SectionBuilder,
  StringSelectMenuBuilder,
  TextDisplayBuilder,
} from "discord.js";
import { BaseConfigPanel, waitForMessageComponent } from "./utils.js";
import { GuildWithLogs } from "@repo/database";

export class WelcomeLeaveConfigPanel extends BaseConfigPanel {
  override async render() {
    return new ContainerBuilder()
      .addSectionComponents(
        new SectionBuilder()
          .setButtonAccessory(
            new ButtonBuilder()
              .setCustomId("config:welcomeLeave:joinChannelId:test")
              .setStyle(ButtonStyle.Success)
              .setLabel(this.t(($) => $.welcomeLeaveConfig.joinChannelId.testButtonLabel)),
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `## ${this.t(($) => $.welcomeLeaveConfig.joinChannelId.description, {
                limit: this.guildData.joinMessage ? this.guildData.joinMessage.length : 0,
              })}`,
            ),
          ),
      )
      .addActionRowComponents(
        new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
          new ChannelSelectMenuBuilder()
            .setCustomId("config:welcomeLeave:joinChannelId:set")
            .setPlaceholder(this.t(($) => $.welcomeLeaveConfig.joinChannelId.placeholder))
            .setMinValues(0)
            .setMaxValues(1)
            .setChannelTypes(ChannelType.GuildText)
            .addDefaultChannels(this.guildData.joinChannelId ? [this.guildData.joinChannelId] : []),
        ),
      )
      .addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("config:welcomeLeave:joinChannelId:edit")
            .setStyle(ButtonStyle.Primary)
            .setLabel(this.t(($) => $.welcomeLeaveConfig.joinMessage.buttonLabel)),
        ),
      );
  }
}

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
  const messageComponent = await waitForMessageComponent(interaction, actionRow, guildData.language, "joinLeaveConfig");
  if (!messageComponent) return;
  switch (messageComponent.values[0]) {
    case "joinChannelId":
      //await dynamicChannel("joinChannelId", messageComponent, guildData);
      break;
    case "joinMessage":
      //await dynamicMessage("joinMessage", messageComponent, guildData);
      break;
    case "leaveChannelId":
      //await dynamicChannel("leaveChannelId", messageComponent, guildData);
      break;
    case "leaveMessage":
      //await dynamicMessage("leaveMessage", messageComponent, guildData);
      break;
  }
}
