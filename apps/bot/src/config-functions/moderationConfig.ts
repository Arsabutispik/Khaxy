import {
  ActionRowBuilder,
  ChannelType,
  ChatInputCommandInteraction,
  PermissionsBitField,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from "discord.js";
import { GuildWithLogs, updateGuildConfig } from "@repo/database";
import { waitForMessageComponent, dynamicChannel, dynamicRole } from "./utils.js";
import { TFunction } from "i18next";

export async function moderationConfig(interaction: ChatInputCommandInteraction<"cached">, guildData: GuildWithLogs) {
  const client = interaction.client;
  const t = client.i18next.getFixedT(guildData.language, null, "moderationConfig");
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("moderationConfig")
    .setMinValues(1)
    .setMaxValues(1)
    .setOptions([
      {
        label: t("modLogsChannelId.label"),
        value: "modLogsChannelId",
        description: t("modLogsChannelId.description"),
        emoji: "📝",
      },
      {
        label: t("staffRoleId.label"),
        value: "staffRoleId",
        description: t("staffRoleId.description"),
        emoji: "🛡️",
      },
      {
        label: t("modMailChannel.label"),
        value: "modMailChannel",
        description: t("modMailChannel.description"),
        emoji: "📬",
      },
      {
        label: t("muteGetAllRoles.label"),
        value: "muteGetAllRoles",
        description: t("muteGetAllRoles.description"),
        emoji: "🔇",
      },
      {
        label: t("defaultExpiry.label"),
        value: "defaultExpiry",
        description: t("defaultExpiry.description"),
        emoji: "⏰",
      },
    ]);
  const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
  const messageComponent = await waitForMessageComponent(interaction, actionRow, t, "moderationConfig");
  if (!messageComponent) return;
  switch (messageComponent.values[0]) {
    case "modLogsChannelId":
      await dynamicChannel("modLogsChannelId", messageComponent, guildData, t);
      break;
    case "staffRoleId":
      await messageComponent.deferUpdate();
      await dynamicRole("staffRoleId", messageComponent, guildData, t);
      break;
    case "modMailChannel":
      await modMailChannel(messageComponent, guildData, t);
      break;
    case "muteGetAllRoles":
      await muteGetAllRoles(messageComponent, guildData, t);
      break;
    case "defaultExpiry":
      await defaultExpiry(messageComponent, guildData, t);
      break;
  }
}
async function modMailChannel(interaction: StringSelectMenuInteraction<"cached">, data: GuildWithLogs, t: TFunction) {
  if (data.modMailChannelId && interaction.guild.channels.cache.has(data.modMailChannelId)) {
    await interaction.deferUpdate();
    await interaction.editReply({
      content: t("modMailChannel.alreadySet"),
      components: [],
    });
    return;
  } else {
    let permissions = [
      {
        id: interaction.guild!.id,
        deny: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel],
      },
      {
        id: interaction.client.user!.id,
        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
      },
    ];
    if (data.staffRoleId && interaction.guild.roles.cache.has(data.staffRoleId)) {
      permissions.push({
        id: data.staffRoleId,
        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
      });
    }
    const parent = await interaction.guild.channels.create({
      name: "ModMail",
      type: ChannelType.GuildCategory,
      permissionOverwrites: permissions,
    });
    const child = await parent.children.create({
      name: "ModMail Log",
      type: ChannelType.GuildText,
      permissionOverwrites: permissions,
    });
    await updateGuildConfig(interaction.guildId, {
      modMailChannelId: child.id,
      modMailParentChannelId: parent.id,
    });
    await interaction.deferUpdate();
    await interaction.editReply({
      content: t("modMailChannel.set", { channel: child.toString() }),
      components: [],
    });
  }
}

async function muteGetAllRoles(interaction: StringSelectMenuInteraction<"cached">, data: GuildWithLogs, t: TFunction) {
  if (data.muteGetAllRoles) {
    await updateGuildConfig(interaction.guildId, {
      muteGetAllRoles: false,
    });
    await interaction.deferUpdate();
    await interaction.editReply({
      content: t("mute_get_all_roles.false"),
      components: [],
    });
  } else {
    await updateGuildConfig(interaction.guildId, {
      muteGetAllRoles: true,
    });
    await interaction.deferUpdate();
    await interaction.editReply({
      content: t("muteGetAllRoles.true"),
      components: [],
    });
  }
}

async function defaultExpiry(interaction: StringSelectMenuInteraction<"cached">, data: GuildWithLogs, t: TFunction) {
  const stringSelect = new StringSelectMenuBuilder()
    .setCustomId("defaultExpiry")
    .setMinValues(1)
    .setMaxValues(1)
    .setOptions([
      {
        label: t("defaultExpiry.labelZero"),
        value: "0",
        description: t("defaultExpiry.descriptionZero"),
        emoji: "❌",
        default: data.defaultExpiry === 0,
      },
      {
        label: t("defaultExpiry.labelSeven"),
        value: "7",
        description: t("defaultExpiry.descriptionSeven"),
        emoji: "7️⃣",
        default: data.defaultExpiry === 7,
      },
      {
        label: t("defaultExpiry.labelFourteen"),
        value: "14",
        description: t("defaultExpiry.descriptionFourteen"),
        emoji: "📅",
        default: data.defaultExpiry === 14,
      },
      {
        label: t("defaultExpiry.labelThirty"),
        value: "30",
        description: t("defaultExpiry.descriptionThirty"),
        emoji: "📅",
        default: data.defaultExpiry === 30,
      },
    ]);
  const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(stringSelect);
  const messageComponent = await waitForMessageComponent(interaction, actionRow, t, "defaultExpiry");
  if (!messageComponent) return;
  await updateGuildConfig(interaction.guildId, {
    defaultExpiry: parseInt(messageComponent.values[0]),
  });
  await messageComponent.deferUpdate();
  await messageComponent.editReply({
    content: t("defaultExpiry.success", { days: messageComponent.values[0] }),
    components: [],
  });
}
