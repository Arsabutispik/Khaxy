import {
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  ContainerBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder,
} from "discord.js";
import { BaseConfigPanel } from "./utils.js";

export class LogConfigPanel extends BaseConfigPanel {
  override getTotalPages(): number {
    return 5;
  }

  override async render() {
    const container = new ContainerBuilder();

    // Page 1: Message, GuildMember, Guild
    if (this.currentPage === 1) {
      container
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## ${this.t(($) => $.logConfig.messageLogsChannelId.description)}`),
        )
        .addActionRowComponents(
          new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
            new ChannelSelectMenuBuilder()
              .setCustomId("config:log:messageLogsChannelId")
              .setPlaceholder(this.t(($) => $.logConfig.messageLogsChannelId.placeholder))
              .setMinValues(0)
              .setMaxValues(1)
              .setChannelTypes(ChannelType.GuildText)
              .addDefaultChannels(
                this.guildData.logConfig?.messageLogsChannelId ? [this.guildData.logConfig.messageLogsChannelId] : [],
              ),
          ),
        )
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## ${this.t(($) => $.logConfig.guildMemberLogsChannelId.description)}`),
        )
        .addActionRowComponents(
          new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
            new ChannelSelectMenuBuilder()
              .setCustomId("config:log:guildMemberLogsChannelId")
              .setPlaceholder(this.t(($) => $.logConfig.guildMemberLogsChannelId.placeholder))
              .setMinValues(0)
              .setMaxValues(1)
              .setChannelTypes(ChannelType.GuildText)
              .addDefaultChannels(
                this.guildData.logConfig?.guildMemberLogsChannelId
                  ? [this.guildData.logConfig.guildMemberLogsChannelId]
                  : [],
              ),
          ),
        )
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## ${this.t(($) => $.logConfig.guildLogsChannelId.description)}`),
        )
        .addActionRowComponents(
          new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
            new ChannelSelectMenuBuilder()
              .setCustomId("config:log:guildLogsChannelId")
              .setPlaceholder(this.t(($) => $.logConfig.guildLogsChannelId.placeholder))
              .setMinValues(0)
              .setMaxValues(1)
              .setChannelTypes(ChannelType.GuildText)
              .addDefaultChannels(
                this.guildData.logConfig?.guildLogsChannelId ? [this.guildData.logConfig.guildLogsChannelId] : [],
              ),
          ),
        );
    }

    // Page 2: Voice, Channel, Emoji
    if (this.currentPage === 2) {
      container
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## ${this.t(($) => $.logConfig.voiceLogsChannelId.description)}`),
        )
        .addActionRowComponents(
          new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
            new ChannelSelectMenuBuilder()
              .setCustomId("config:log:voiceLogsChannelId")
              .setPlaceholder(this.t(($) => $.logConfig.voiceLogsChannelId.placeholder))
              .setMinValues(0)
              .setMaxValues(1)
              .setChannelTypes(ChannelType.GuildText)
              .addDefaultChannels(
                this.guildData.logConfig?.voiceLogsChannelId ? [this.guildData.logConfig.voiceLogsChannelId] : [],
              ),
          ),
        )
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## ${this.t(($) => $.logConfig.channelLogsChannelId.description)}`),
        )
        .addActionRowComponents(
          new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
            new ChannelSelectMenuBuilder()
              .setCustomId("config:log:channelLogsChannelId")
              .setPlaceholder(this.t(($) => $.logConfig.channelLogsChannelId.placeholder))
              .setMinValues(0)
              .setMaxValues(1)
              .setChannelTypes(ChannelType.GuildText)
              .addDefaultChannels(
                this.guildData.logConfig?.channelLogsChannelId ? [this.guildData.logConfig.channelLogsChannelId] : [],
              ),
          ),
        )
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## ${this.t(($) => $.logConfig.emojiLogsChannelId.description)}`),
        )
        .addActionRowComponents(
          new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
            new ChannelSelectMenuBuilder()
              .setCustomId("config:log:emojiLogsChannelId")
              .setPlaceholder(this.t(($) => $.logConfig.emojiLogsChannelId.placeholder))
              .setMinValues(0)
              .setMaxValues(1)
              .setChannelTypes(ChannelType.GuildText)
              .addDefaultChannels(
                this.guildData.logConfig?.emojiLogsChannelId ? [this.guildData.logConfig.emojiLogsChannelId] : [],
              ),
          ),
        );
    }

    // Page 3: Role, Sticker, Event
    if (this.currentPage === 3) {
      container
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## ${this.t(($) => $.logConfig.roleLogsChannelId.description)}`),
        )
        .addActionRowComponents(
          new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
            new ChannelSelectMenuBuilder()
              .setCustomId("config:log:roleLogsChannelId")
              .setPlaceholder(this.t(($) => $.logConfig.roleLogsChannelId.placeholder))
              .setMinValues(0)
              .setMaxValues(1)
              .setChannelTypes(ChannelType.GuildText)
              .addDefaultChannels(
                this.guildData.logConfig?.roleLogsChannelId ? [this.guildData.logConfig.roleLogsChannelId] : [],
              ),
          ),
        )
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## ${this.t(($) => $.logConfig.stickerLogsChannelId.description)}`),
        )
        .addActionRowComponents(
          new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
            new ChannelSelectMenuBuilder()
              .setCustomId("config:log:stickerLogsChannelId")
              .setPlaceholder(this.t(($) => $.logConfig.stickerLogsChannelId.placeholder))
              .setMinValues(0)
              .setMaxValues(1)
              .setChannelTypes(ChannelType.GuildText)
              .addDefaultChannels(
                this.guildData.logConfig?.stickerLogsChannelId ? [this.guildData.logConfig.stickerLogsChannelId] : [],
              ),
          ),
        )
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## ${this.t(($) => $.logConfig.eventLogsChannelId.description)}`),
        )
        .addActionRowComponents(
          new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
            new ChannelSelectMenuBuilder()
              .setCustomId("config:log:eventLogsChannelId")
              .setPlaceholder(this.t(($) => $.logConfig.eventLogsChannelId.placeholder))
              .setMinValues(0)
              .setMaxValues(1)
              .setChannelTypes(ChannelType.GuildText)
              .addDefaultChannels(
                this.guildData.logConfig?.eventLogsChannelId ? [this.guildData.logConfig.eventLogsChannelId] : [],
              ),
          ),
        );
    }

    // Page 4: Invite, Poll, Stage
    if (this.currentPage === 4) {
      container
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## ${this.t(($) => $.logConfig.inviteLogsChannelId.description)}`),
        )
        .addActionRowComponents(
          new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
            new ChannelSelectMenuBuilder()
              .setCustomId("config:log:inviteLogsChannelId")
              .setPlaceholder(this.t(($) => $.logConfig.inviteLogsChannelId.placeholder))
              .setMinValues(0)
              .setMaxValues(1)
              .setChannelTypes(ChannelType.GuildText)
              .addDefaultChannels(
                this.guildData.logConfig?.inviteLogsChannelId ? [this.guildData.logConfig.inviteLogsChannelId] : [],
              ),
          ),
        )
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## ${this.t(($) => $.logConfig.pollLogsChannelId.description)}`),
        )
        .addActionRowComponents(
          new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
            new ChannelSelectMenuBuilder()
              .setCustomId("config:log:pollLogsChannelId")
              .setPlaceholder(this.t(($) => $.logConfig.pollLogsChannelId.placeholder))
              .setMinValues(0)
              .setMaxValues(1)
              .setChannelTypes(ChannelType.GuildText)
              .addDefaultChannels(
                this.guildData.logConfig?.pollLogsChannelId ? [this.guildData.logConfig.pollLogsChannelId] : [],
              ),
          ),
        )
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## ${this.t(($) => $.logConfig.stageLogsChannelId.description)}`),
        )
        .addActionRowComponents(
          new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
            new ChannelSelectMenuBuilder()
              .setCustomId("config:log:stageLogsChannelId")
              .setPlaceholder(this.t(($) => $.logConfig.stageLogsChannelId.placeholder))
              .setMinValues(0)
              .setMaxValues(1)
              .setChannelTypes(ChannelType.GuildText)
              .addDefaultChannels(
                this.guildData.logConfig?.stageLogsChannelId ? [this.guildData.logConfig.stageLogsChannelId] : [],
              ),
          ),
        );
    }

    // Page 5: Soundboard, Thread, Webhook
    if (this.currentPage === 5) {
      container
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## ${this.t(($) => $.logConfig.soundboardLogsChannelId.description)}`),
        )
        .addActionRowComponents(
          new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
            new ChannelSelectMenuBuilder()
              .setCustomId("config:log:soundboardLogsChannelId")
              .setPlaceholder(this.t(($) => $.logConfig.soundboardLogsChannelId.placeholder))
              .setMinValues(0)
              .setMaxValues(1)
              .setChannelTypes(ChannelType.GuildText)
              .addDefaultChannels(
                this.guildData.logConfig?.soundboardLogsChannelId
                  ? [this.guildData.logConfig.soundboardLogsChannelId]
                  : [],
              ),
          ),
        )
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## ${this.t(($) => $.logConfig.threadLogsChannelId.description)}`),
        )
        .addActionRowComponents(
          new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
            new ChannelSelectMenuBuilder()
              .setCustomId("config:log:threadLogsChannelId")
              .setPlaceholder(this.t(($) => $.logConfig.threadLogsChannelId.placeholder))
              .setMinValues(0)
              .setMaxValues(1)
              .setChannelTypes(ChannelType.GuildText)
              .addDefaultChannels(
                this.guildData.logConfig?.threadLogsChannelId ? [this.guildData.logConfig.threadLogsChannelId] : [],
              ),
          ),
        )
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## ${this.t(($) => $.logConfig.webhookLogsChannelId.description)}`),
        )
        .addActionRowComponents(
          new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
            new ChannelSelectMenuBuilder()
              .setCustomId("config:log:webhookLogsChannelId")
              .setPlaceholder(this.t(($) => $.logConfig.webhookLogsChannelId.placeholder))
              .setMinValues(0)
              .setMaxValues(1)
              .setChannelTypes(ChannelType.GuildText)
              .addDefaultChannels(
                this.guildData.logConfig?.webhookLogsChannelId ? [this.guildData.logConfig.webhookLogsChannelId] : [],
              ),
          ),
        );
    }

    return container;
  }
}
