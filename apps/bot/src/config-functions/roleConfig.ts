import {
  ActionRowBuilder,
  ContainerBuilder,
  RoleSelectMenuBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder,
} from "discord.js";
import { BaseConfigPanel } from "./utils.js";

export class RoleConfigPanel extends BaseConfigPanel {
  getTotalPages(): number {
    return 2;
  }
  override async render() {
    const container = new ContainerBuilder();

    if (this.currentPage === 1) {
      container
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## ${this.t(($) => $.roleConfig.memberRoleId.description)}`),
        )
        .addActionRowComponents(
          new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
            new RoleSelectMenuBuilder()
              .setCustomId("config:role:memberRoleId")
              .setPlaceholder(this.t(($) => $.roleConfig.memberRoleId.placeholder))
              .setMinValues(0)
              .setMaxValues(1)
              .addDefaultRoles(this.guildData.memberRoleId ? [this.guildData.memberRoleId] : []),
          ),
        )
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## ${this.t(($) => $.roleConfig.unverifiedRoleId.description)}`),
        )
        .addActionRowComponents(
          new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
            new RoleSelectMenuBuilder()
              .setCustomId("config:role:unverifiedRoleId")
              .setPlaceholder(this.t(($) => $.roleConfig.unverifiedRoleId.placeholder))
              .setMinValues(0)
              .setMaxValues(1)
              .addDefaultRoles(this.guildData.unverifiedRoleId ? [this.guildData.unverifiedRoleId] : []),
          ),
        )
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## ${this.t(($) => $.roleConfig.maleRoleId.description)}`),
        )
        .addActionRowComponents(
          new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
            new RoleSelectMenuBuilder()
              .setCustomId("config:role:maleRoleId")
              .setPlaceholder(this.t(($) => $.roleConfig.maleRoleId.placeholder))
              .setMinValues(0)
              .setMaxValues(1)
              .addDefaultRoles(this.guildData.maleRoleId ? [this.guildData.maleRoleId] : []),
          ),
        );
    }
    if (this.currentPage === 2) {
      container
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## ${this.t(($) => $.roleConfig.femaleRoleId.description)}`),
        )
        .addActionRowComponents(
          new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
            new RoleSelectMenuBuilder()
              .setCustomId("config:role:femaleRoleId")
              .setPlaceholder(this.t(($) => $.roleConfig.femaleRoleId.placeholder))
              .setMinValues(0)
              .setMaxValues(1)
              .addDefaultRoles(this.guildData.femaleRoleId ? [this.guildData.femaleRoleId] : []),
          ),
        )
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## ${this.t(($) => $.roleConfig.colourIdOfTheDay.description)}`),
        )
        .addActionRowComponents(
          new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
            new RoleSelectMenuBuilder()
              .setCustomId("config:role:colourIdOfTheDay")
              .setPlaceholder(this.t(($) => $.roleConfig.colourIdOfTheDay.placeholder))
              .setMinValues(0)
              .setMaxValues(1)
              .addDefaultRoles(this.guildData.colourIdOfTheDay ? [this.guildData.colourIdOfTheDay] : []),
          ),
        )
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## ${this.t(($) => $.roleConfig.muteRoleId.description)}`),
        )
        .addActionRowComponents(
          new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
            new RoleSelectMenuBuilder()
              .setCustomId("config:role:muteRoleId")
              .setPlaceholder(this.t(($) => $.roleConfig.muteRoleId.placeholder))
              .setMinValues(0)
              .setMaxValues(1)
              .addDefaultRoles(this.guildData.muteRoleId ? [this.guildData.muteRoleId] : []),
          ),
        );
    }
    return container;
  }
}
