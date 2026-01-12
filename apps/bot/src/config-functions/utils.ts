import {
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  ChatInputCommandInteraction,
  ComponentType,
  LabelBuilder,
  MessageComponentInteraction,
  MessageFlagsBitField,
  ModalBuilder,
  ModalSubmitInteraction,
  RoleSelectMenuBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { logger } from "@lib";
import { GuildWithLogs } from "@repo/database";
import { trimString, getCurrentValue, updateConfig } from "@utils";
import { TFunction } from "i18next";
import { DbConfigKey } from "@constants";
export async function waitForMessageComponent(
  interaction: ChatInputCommandInteraction<"cached"> | StringSelectMenuInteraction<"cached">,
  actionRow: ActionRowBuilder<StringSelectMenuBuilder>,
  t: TFunction,
  customId: string,
) {
  const interactionCallbackResponse = await interaction.reply({
    content: t("initial"),
    components: [actionRow],
    flags: MessageFlagsBitField.Flags.Ephemeral,
  });

  const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id && i.customId === customId;

  return await interactionCallbackResponse
    .awaitMessageComponent({
      filter,
      time: 1000 * 60 * 5,
      componentType: ComponentType.StringSelect,
    })
    .catch(async () => {
      await interaction.editReply({ content: t("timeout"), components: [] });

      logger.log({
        level: "warn",
        message: `User ${interaction.user.tag} (${interaction.user.id}) did not respond in time for ${customId} in guild ${interaction.guild?.name} (${interaction.guildId})`,
        discord: false,
      });
      return null;
    });
}

// --- Dynamic Channel ---
export async function dynamicChannel(
  dbKey: DbConfigKey, // Pass the DB Column Name (camelCase)
  interaction: StringSelectMenuInteraction<"cached">,
  data: GuildWithLogs,
  t: TFunction,
) {
  await interaction.deferUpdate();

  const selectMenu = new ChannelSelectMenuBuilder()
    .setCustomId(dbKey)
    .setMaxValues(1)
    .setMinValues(0)
    .setChannelTypes(ChannelType.GuildText);

  // 1. Get Default Value Safely
  const currentId = getCurrentValue(data, dbKey);
  if (currentId) {
    selectMenu.setDefaultChannels(currentId);
  }

  const actionRow = new ActionRowBuilder<ChannelSelectMenuBuilder>().setComponents(selectMenu);

  const result = await interaction.editReply({
    content: t("channelInitial"),
    components: [actionRow],
  });

  const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id && i.customId === dbKey;

  let messageComponent;
  try {
    messageComponent = await result.awaitMessageComponent({
      filter,
      componentType: ComponentType.ChannelSelect,
      time: 1000 * 60 * 5,
    });
  } catch {
    await result.edit({ content: t("timeout"), components: [] });
    return;
  }

  await messageComponent.deferUpdate();
  const newValue = messageComponent.values[0] || null;

  // 2. Update Database Safely
  await updateConfig(messageComponent.guildId, dbKey, newValue);

  // 3. Reply
  const responseKey = newValue ? "set" : "unset";
  await messageComponent.editReply({
    // Ensure translation keys match DB keys: "messageLogsChannelId.set"
    content: t(`${dbKey}.${responseKey}`, {
      channel: newValue ? `<#${newValue}>` : "Unknown",
    }),
    components: [],
  });
}

// --- Dynamic Message ---
export async function dynamicMessage(
  dbKey: DbConfigKey,
  interaction: StringSelectMenuInteraction<"cached">,
  data: GuildWithLogs,
  t: TFunction,
) {
  const textComponent = new TextInputBuilder().setCustomId(dbKey).setMaxLength(1500).setStyle(TextInputStyle.Paragraph);

  const currentText = getCurrentValue(data, dbKey);
  if (currentText) {
    textComponent.setPlaceholder(trimString(currentText, 97));
    textComponent.setValue(currentText);
  }

  const labelBuilder = new LabelBuilder().setLabel(t(`${dbKey}.label`)).setTextInputComponent(textComponent);
  const modal = new ModalBuilder()
    .setCustomId(dbKey)
    .setTitle(t(`${dbKey}.title`))
    .addLabelComponents(labelBuilder);

  await interaction.showModal(modal);

  const filter = (i: ModalSubmitInteraction) => i.user.id === interaction.user.id && i.customId === dbKey;

  let messageComponent;
  try {
    messageComponent = await interaction.awaitModalSubmit({ filter, time: 1000 * 60 * 5 });
  } catch {
    await interaction.editReply({ content: t("timeout"), components: [] });
    return;
  }

  await messageComponent.deferUpdate();

  const input = messageComponent.fields.getTextInputValue(dbKey);
  let finalValue: string | null = input;

  if (input === "") {
    if (dbKey === "modMailMessage") {
      finalValue = "Thank you for your message! Our mod team will reply to you here as soon as possible.";
    } else {
      finalValue = null;
    }
  }

  await updateConfig(messageComponent.guildId, dbKey, finalValue);

  await messageComponent.editReply({ content: t(`${dbKey}.set`), components: [] });
}

export async function dynamicRole(
  dbKey: DbConfigKey,
  interaction: StringSelectMenuInteraction<"cached">,
  data: GuildWithLogs,
  t: TFunction,
) {
  const selectMenu = new RoleSelectMenuBuilder().setCustomId(dbKey).setMaxValues(1).setMinValues(0);

  // 1. Get Default Value
  const currentId = getCurrentValue(data, dbKey);
  if (currentId) {
    selectMenu.setDefaultRoles(currentId);
  }

  const actionRow = new ActionRowBuilder<RoleSelectMenuBuilder>().setComponents(selectMenu);

  const result = await interaction.editReply({
    content: t("roleInitial"),
    components: [actionRow],
  });

  const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id && i.customId === dbKey;

  let messageComponent;
  try {
    messageComponent = await result.awaitMessageComponent({
      filter,
      componentType: ComponentType.RoleSelect,
      time: 1000 * 60 * 5,
    });
  } catch {
    await result.edit({ content: t("timeout"), components: [] }).catch(() => null);
    return;
  }

  await messageComponent.deferUpdate();
  const newValue = messageComponent.values[0] || null;

  if (!newValue) {
    // Unset
    await updateConfig(messageComponent.guildId, dbKey, null);
    await messageComponent.editReply({ content: t(`${dbKey}.unset`), components: [] });
  } else {
    // Hierarchy Check
    // If we're setting DJ/Staff roles, we might not care about hierarchy, but for managed roles we do.
    const isSpecialRole = ["djRoleId", "staffRoleId"].includes(dbKey);
    const targetRole = messageComponent.guild.roles.cache.get(newValue);
    const myRole = messageComponent.guild.members.me?.roles.highest;

    if (!isSpecialRole && targetRole && myRole && myRole.position < targetRole.position) {
      await messageComponent.editReply({ content: t("roleTooHigh"), components: [] });
      return;
    }

    // Set
    await updateConfig(messageComponent.guildId, dbKey, newValue);

    await messageComponent.editReply({
      content: t(`${dbKey}.set`, {
        role: targetRole?.toString() ?? "Unknown Role",
      }),
      components: [],
    });
  }
}
