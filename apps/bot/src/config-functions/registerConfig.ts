import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelType,
  ContainerBuilder,
  SectionBuilder,
  TextDisplayBuilder,
} from "discord.js";
import { BaseConfigPanel } from "./utils.js";

export class RegisterConfigPanel extends BaseConfigPanel {
  override getTotalPages(): number {
    return 1;
  }
  override async render() {
    return new ContainerBuilder()
      .addSectionComponents(
        new SectionBuilder()
          .setButtonAccessory(
            new ButtonBuilder()
              .setCustomId("config:register:registerJoinChannelId:test")
              .setStyle(ButtonStyle.Success)
              .setLabel(this.t(($) => $.registerConfig.registerJoinChannelId.testButtonLabel)),
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `## ${this.t(($) => $.registerConfig.registerJoinChannelId.description, {
                limit: this.guildData.registerJoinMessage ? this.guildData.registerJoinMessage.length : 0,
              })}`,
            ),
          ),
      )
      .addActionRowComponents(
        new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
          new ChannelSelectMenuBuilder()
            .setCustomId("config:register:registerJoinChannelId:set")
            .setPlaceholder(this.t(($) => $.registerConfig.registerJoinChannelId.placeholder))
            .setMinValues(0)
            .setMaxValues(1)
            .setChannelTypes(ChannelType.GuildText)
            .addDefaultChannels(this.guildData.registerJoinChannelId ? [this.guildData.registerJoinChannelId] : []),
        ),
      )
      .addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("config:register:registerJoinChannelId:edit")
            .setStyle(ButtonStyle.Primary)
            .setLabel(this.t(($) => $.registerConfig.registerMessage.buttonLabel)),
        ),
      );
  }
}
