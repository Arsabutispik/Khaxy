import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelType,
  ContainerBuilder,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder,
} from "discord.js";
import { BaseConfigPanel } from "./utils.js";

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
      )
      .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
      .addSectionComponents(
        new SectionBuilder()
          .setButtonAccessory(
            new ButtonBuilder()
              .setCustomId("config:welcomeLeave:leaveChannelId:test")
              .setStyle(ButtonStyle.Success)
              .setLabel(this.t(($) => $.welcomeLeaveConfig.leaveChannelId.testButtonLabel)),
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `## ${this.t(($) => $.welcomeLeaveConfig.leaveChannelId.description, {
                limit: this.guildData.leaveMessage ? this.guildData.leaveMessage.length : 0,
              })}`,
            ),
          ),
      )
      .addActionRowComponents(
        new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
          new ChannelSelectMenuBuilder()
            .setCustomId("config:welcomeLeave:leaveChannelId:set")
            .setPlaceholder(this.t(($) => $.welcomeLeaveConfig.leaveChannelId.placeholder))
            .setMinValues(0)
            .setMaxValues(1)
            .setChannelTypes(ChannelType.GuildText)
            .addDefaultChannels(this.guildData.leaveChannelId ? [this.guildData.leaveChannelId] : []),
        ),
      )
      .addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("config:welcomeLeave:leaveChannelId:edit")
            .setStyle(ButtonStyle.Primary)
            .setLabel(this.t(($) => $.welcomeLeaveConfig.leaveMessage.buttonLabel)),
        ),
      );
  }
}
