import {
  ActionRowBuilder,
  ChannelType,
  ChatInputCommandInteraction,
  ComponentType,
  MessageComponentInteraction,
  PermissionsBitField,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from "discord.js";
import { GuildWithLogs, updateGuildConfig } from "@repo/database";
import { waitForMessageComponent, dynamicChannel, dynamicRole } from "./utils.js";
import { logger } from "src/lib/Logger.js";
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
        label: t("registerDayLimit.label"),
        value: "registerDayLimit",
        description: t("registerDayLimit.description"),
        emoji: "📅",
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
    case "registerDayLimit":
      await registerDayLimit(messageComponent, guildData, t);
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
      content: t("mod_mail_channel.set", { channel: child.toString() }),
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
      content: t("mute_get_all_roles.true"),
      components: [],
    });
  }
}

async function registerDayLimit(interaction: StringSelectMenuInteraction<"cached">, data: GuildWithLogs, t: TFunction) {
  const stringSelect = new StringSelectMenuBuilder()
    .setCustomId("register_day_limit")
    .setMinValues(1)
    .setMaxValues(1)
    .setOptions([
      {
        label: t("register_day_limit.label_zero"),
        value: "0",
        description: t("register_day_limit.description_zero"),
        emoji: "❌",
        default: data.daysToKick === 0,
      },
      {
        label: t("register_day_limit.label_one"),
        value: "1",
        description: t("register_day_limit.description_one"),
        emoji: "1️⃣",
        default: data.daysToKick === 1,
      },
      {
        label: t("register_day_limit.label_three"),
        value: "3",
        description: t("register_day_limit.description_three"),
        emoji: "3️⃣",
        default: data.daysToKick === 3,
      },
      {
        label: t("register_day_limit.label_seven"),
        value: "7",
        description: t("register_day_limit.description_seven"),
        emoji: "7️⃣",
        default: data.daysToKick === 7,
      },
    ]);
  const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(stringSelect);
  await interaction.deferUpdate();
  const reply = await interaction.editReply({
    content: t("register_day_limit.initial"),
    components: [actionRow],
  });
  const filter = (i: MessageComponentInteraction) =>
    i.user.id === interaction.user.id && i.customId === "register_day_limit";
  const messageComponent = await reply
    .awaitMessageComponent({
      filter,
      time: 1000 * 60 * 5,
      componentType: ComponentType.StringSelect,
    })
    .catch(async () => {
      await reply.edit({ content: t("timeout"), components: [] });
      logger.log({
        level: "warn",
        message: `User ${interaction.user.tag} (${interaction.user.id}) did not respond in time for register_day_limit in guild ${interaction.guild?.name} (${interaction.guildId})`,
        discord: false,
      });
      return null;
    });
  if (!messageComponent) return;
  await updateGuildConfig(interaction.guildId, {
    daysToKick: parseInt(messageComponent.values[0]),
  });
  await messageComponent.deferUpdate();
  await messageComponent.editReply({
    content: t("register_day_limit.success", { days: messageComponent.values[0] }),
    components: [],
  });
}

async function defaultExpiry(interaction: StringSelectMenuInteraction<"cached">, data: GuildWithLogs, t: TFunction) {
  const stringSelect = new StringSelectMenuBuilder()
    .setCustomId("default_expiry")
    .setMinValues(1)
    .setMaxValues(1)
    .setOptions([
      {
        label: t("default_expiry.label_zero"),
        value: "0",
        description: t("default_expiry.description_zero"),
        emoji: "❌",
        default: data.defaultExpiry === 0,
      },
      {
        label: t("default_expiry.label_seven"),
        value: "7",
        description: t("default_expiry.description_seven"),
        emoji: "7️⃣",
        default: data.defaultExpiry === 7,
      },
      {
        label: t("default_expiry.label_fourteen"),
        value: "14",
        description: t("default_expiry.description_fourteen"),
        emoji: "📅",
        default: data.defaultExpiry === 14,
      },
      {
        label: t("default_expiry.label_thirty"),
        value: "30",
        description: t("default_expiry.description_thirty"),
        emoji: "📅",
        default: data.defaultExpiry === 30,
      },
    ]);
  const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(stringSelect);
  const messageComponent = await waitForMessageComponent(interaction, actionRow, t, "misc_config");
  if (!messageComponent) return;
  await updateGuildConfig(interaction.guildId, {
    defaultExpiry: parseInt(messageComponent.values[0]),
  });
  await messageComponent.deferUpdate();
  await messageComponent.editReply({
    content: t("default_expiry.success", { days: messageComponent.values[0] }),
    components: [],
  });
}
