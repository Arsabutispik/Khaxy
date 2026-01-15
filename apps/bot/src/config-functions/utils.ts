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
import { DbConfigKey } from "@constants";

// --- Wait For Message Component ---
export async function waitForMessageComponent(
  interaction: ChatInputCommandInteraction<"cached"> | StringSelectMenuInteraction<"cached">,
  actionRow: ActionRowBuilder<StringSelectMenuBuilder>,
  language: string,
  customId: string,
) {
  const t = interaction.client.i18next.getFixedT(language, null, "waitForMessageComponent");
  const interactionCallbackResponse = await interaction.reply({
    content: t(($) => $.initial),
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
      await interaction.editReply({ content: t(($) => $.timeout), components: [] });

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
  dbKey: Extract<DbConfigKey, `${string}ChannelId`>,
  interaction: StringSelectMenuInteraction<"cached">,
  data: GuildWithLogs,
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
  const t = interaction.client.i18next.getFixedT(data.language, null, `dynamicChannel`);
  const result = await interaction.editReply({
    content: t(($) => $.initial),
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
    await result.edit({ content: t(($) => $.timeout), components: [] });
    return;
  }

  await messageComponent.deferUpdate();
  const newValue = messageComponent.values[0] || null;

  // 2. Update Database Safely
  await updateConfig(messageComponent.guildId, dbKey, newValue);

  // 3. Reply
  const responseKey = newValue ? "set" : "unset";
  await messageComponent.editReply({
    content: t(($) => $.messages[responseKey], {
      label: t(($) => $.labels[dbKey]),

      channel: newValue ? `<#${newValue}>` : "Unknown",
    }),
    components: [],
  });
}

// --- Dynamic Message ---
export async function dynamicMessage(
  dbKey: Extract<DbConfigKey, `${string}Message`>,
  interaction: StringSelectMenuInteraction<"cached">,
  data: GuildWithLogs,
) {
  const textComponent = new TextInputBuilder().setCustomId(dbKey).setMaxLength(1500).setStyle(TextInputStyle.Paragraph);

  const currentText = getCurrentValue(data, dbKey);
  if (currentText) {
    textComponent.setPlaceholder(trimString(currentText, 97));
    textComponent.setValue(currentText);
  }
  const t = interaction.client.i18next.getFixedT(data.language, null, `dynamicMessage`);
  const labelBuilder = new LabelBuilder()
    .setLabel(
      t(($) => $.initial, {
        label: t(($) => $.labels[dbKey]),
      }),
    )
    .setTextInputComponent(textComponent);
  const modal = new ModalBuilder()
    .setCustomId(dbKey)
    .setTitle(
      t(($) => $.title, {
        label: t(($) => $.labels[dbKey]),
      }),
    )
    .addLabelComponents(labelBuilder);

  await interaction.showModal(modal);

  const filter = (i: ModalSubmitInteraction) => i.user.id === interaction.user.id && i.customId === dbKey;

  let messageComponent;
  try {
    messageComponent = await interaction.awaitModalSubmit({ filter, time: 1000 * 60 * 5 });
  } catch {
    await interaction.editReply({ content: t(($) => $.timeout), components: [] });
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
  const responseKey = finalValue ? "set" : "unset";
  await messageComponent.editReply({
    content: t(($) => $.messages[responseKey], {
      label: t(($) => $.labels[dbKey]),
    }),
    components: [],
  });
}

export async function dynamicRole(
  dbKey: Extract<DbConfigKey, `${string}RoleId`> | "colourIdOfTheDay",
  interaction: StringSelectMenuInteraction<"cached">,
  data: GuildWithLogs,
) {
  const selectMenu = new RoleSelectMenuBuilder().setCustomId(dbKey).setMaxValues(1).setMinValues(0);

  // 1. Get Default Value
  const currentId = getCurrentValue(data, dbKey);
  if (currentId) {
    selectMenu.setDefaultRoles(currentId);
  }
  const t = interaction.client.i18next.getFixedT(data.language, null, `dynamicRole`);
  const actionRow = new ActionRowBuilder<RoleSelectMenuBuilder>().setComponents(selectMenu);

  const result = await interaction.editReply({
    content: t(($) => $.initial),
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
    await result.edit({ content: t(($) => $.timeout), components: [] }).catch(() => null);
    return;
  }

  await messageComponent.deferUpdate();
  const newValue = messageComponent.values[0] || null;

  if (!newValue) {
    // Unset
    await updateConfig(messageComponent.guildId, dbKey, null);
    await messageComponent.editReply({
      content: t(($) => $.messages.unset, {
        label: t(($) => $.labels[dbKey]),
      }),
      components: [],
    });
  } else {
    // Hierarchy Check
    // If we're setting DJ/Staff roles, we might not care about hierarchy, but for managed roles we do.
    const isSpecialRole = ["djRoleId", "staffRoleId"].includes(dbKey);
    const targetRole = messageComponent.guild.roles.cache.get(newValue);
    const myRole = messageComponent.guild.members.me?.roles.highest;

    if (!isSpecialRole && targetRole && myRole && myRole.position < targetRole.position) {
      await messageComponent.editReply({ content: t(($) => $.errors.roleTooHigh), components: [] });
      return;
    }

    // Set
    await updateConfig(messageComponent.guildId, dbKey, newValue);

    await messageComponent.editReply({
      content: t(($) => $.messages.set, {
        role: targetRole?.toString() ?? "Unknown Role",
        label: t(($) => $.labels[dbKey]),
      }),
      components: [],
    });
  }
}
