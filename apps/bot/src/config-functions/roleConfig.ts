import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  ContainerBuilder,
  RoleSelectMenuBuilder,
  StringSelectMenuBuilder,
  TextDisplayBuilder,
} from "discord.js";
import { BaseConfigPanel, dynamicRole, waitForMessageComponent } from "./utils.js";
import { RoleType } from "@types";
import { GuildWithLogs } from "@repo/database";

export class RoleConfigPanel extends BaseConfigPanel {
  override async render() {
    return new ContainerBuilder()
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
      );
  }
}

async function roleConfig(interaction: ChatInputCommandInteraction<"cached">, guildData: GuildWithLogs) {
  const client = interaction.client;
  const t = client.i18next.getFixedT(guildData.language, null, "roleConfig");
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("roleConfig")
    .setMinValues(1)
    .setMaxValues(1)
    .setOptions([
      {
        label: t(($) => $.memberRoleId.label),
        value: "memberRoleId",
        description: t(($) => $.memberRoleId.description),
        emoji: "👤",
      },
      {
        label: t(($) => $.unverifiedRoleId.label),
        value: "unverifiedRoleId",
        description: t(($) => $.unverifiedRoleId.description),
        emoji: "❓",
      },
      {
        label: t(($) => $.maleRoleId.label),
        value: "maleRoleId",
        description: t(($) => $.maleRoleId.description),
        emoji: "👨",
      },
      {
        label: t(($) => $.femaleRoleId.label),
        value: "femaleRoleId",
        description: t(($) => $.femaleRoleId.description),
        emoji: "👩",
      },
      {
        label: t(($) => $.colourIdOfTheDay.label),
        value: "colourIdOfTheDay",
        description: t(($) => $.colourIdOfTheDay.description),
        emoji: "🌈",
      },
      {
        label: t(($) => $.muteRoleId.label),
        value: "muteRoleId",
        description: t(($) => $.muteRoleId.description),
        emoji: "🔇",
      },
      {
        label: t(($) => $.djRoleId.label),
        value: "djRoleId",
        description: t(($) => $.djRoleId.description),
        emoji: "🎧",
      },
    ]);
  const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(selectMenu);
  const messageComponent = await waitForMessageComponent(interaction, actionRow, guildData.language, "roleConfig");
  if (!messageComponent) return;
  await messageComponent.deferUpdate();
  await dynamicRole(messageComponent.values[0] as RoleType, messageComponent, guildData);
}
