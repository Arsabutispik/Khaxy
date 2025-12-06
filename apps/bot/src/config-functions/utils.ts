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
import { TFunction } from "i18next";
import { logger } from "src/lib/index.js";
import type { guilds as Guilds } from "@repo/database";
import { updateGuildConfig } from "src/database/index.js";
import { toStringId, trimString } from "src/utils/index.js";
import { DynamicChannelTypes, RoleType } from "src/types/index.js";

export async function waitForMessageComponent(
  interaction: ChatInputCommandInteraction<"cached">,
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
      await interaction.editReply({
        content: t("timeout"),
        components: [],
      });
      logger.log({
        level: "warn",
        message: `User ${interaction.user.tag} (${interaction.user.id}) did not respond in time for ${customId} in guild ${interaction.guild?.name} (${interaction.guildId})`,
        discord: false,
      });
      return null;
    });
}
export async function dynamicChannel(
  channel: DynamicChannelTypes,
  interaction: StringSelectMenuInteraction<"cached">,
  data: Guilds,
  t: TFunction,
) {
  await interaction.deferUpdate();
  const selectMenu = new ChannelSelectMenuBuilder()
    .setCustomId(channel)
    .setMaxValues(1)
    .setMinValues(0)
    .setChannelTypes(ChannelType.GuildText);
  if (data[channel]) {
    selectMenu.setDefaultChannels(toStringId(data[channel]));
  }
  const actionRow = new ActionRowBuilder<ChannelSelectMenuBuilder>().setComponents(selectMenu);
  const result = await interaction.editReply({
    content: t("channel_initial"),
    components: [actionRow],
  });
  const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id && i.customId === channel;
  let messageComponent;
  try {
    messageComponent = await result.awaitMessageComponent({
      filter,
      componentType: ComponentType.ChannelSelect,
      time: 1000 * 60 * 5,
    });
  } catch {
    await result.edit({
      content: t("timeout"),
      components: [],
    });
    return;
  }
  await messageComponent.deferUpdate();
  if (messageComponent.values.length === 0) {
    await updateGuildConfig(messageComponent.guildId, {
      [channel]: null,
    });
    await messageComponent.editReply({
      content: t(`${channel}.unset`),
      components: [],
    });
  } else {
    await updateGuildConfig(messageComponent.guildId, {
      [channel]: messageComponent.values[0],
    });
    await messageComponent.editReply({
      content: t(`${channel}.set`, {
        channel: messageComponent.guild.channels.cache.get(messageComponent.values[0])!.toString(),
      }),
      components: [],
    });
  }
}

export async function dynamicMessage(
  message: "register_join_message" | "join_message" | "leave_message" | "mod_mail_message",
  interaction: StringSelectMenuInteraction<"cached">,
  data: Guilds,
  t: TFunction,
) {
  const textComponent = new TextInputBuilder()
    .setCustomId(message)
    .setMaxLength(1500)
    .setRequired(true)
    .setStyle(TextInputStyle.Paragraph);
  if (data[message]) {
    textComponent.setPlaceholder(trimString(data[message], 97));
  }
  const labelBuilder = new LabelBuilder().setLabel(t(`${message}.label`)).setTextInputComponent(textComponent);
  const modal = new ModalBuilder()
    .setCustomId(message)
    .setTitle(t(`${message}.title`))
    .addLabelComponents(labelBuilder);
  await interaction.showModal(modal);
  const filter = (i: ModalSubmitInteraction) => i.user.id === interaction.user.id && i.customId === message;
  let messageComponent;
  try {
    messageComponent = await interaction.awaitModalSubmit({
      filter,
      time: 1000 * 60 * 5,
    });
  } catch {
    await interaction.editReply({
      content: t("timeout"),
      components: [],
    });
    return;
  }
  await messageComponent.deferUpdate();
  const defaultValueMap = {
    mod_mail_message: "Thank you for your message! Our mod team will reply to you here as soon as possible.",
    [message]: null,
  };
  const input = messageComponent.fields.getTextInputValue(message);
  const defaults = input === "" ? defaultValueMap[message] : input;
  await updateGuildConfig(messageComponent.guildId, {
    [message]: defaults,
  });
  await messageComponent.editReply({
    content: t(`${message}.set`),
    components: [],
  });
}
export async function dynamicRole(
  role: RoleType,
  interaction: StringSelectMenuInteraction<"cached">,
  data: Guilds,
  t: TFunction,
) {
  const selectMenu = new RoleSelectMenuBuilder().setCustomId(role).setMaxValues(1).setMinValues(0);
  if (data[role]) {
    selectMenu.setDefaultRoles(toStringId(data[role]));
  }
  const action_row = new ActionRowBuilder<RoleSelectMenuBuilder>().setComponents(selectMenu);
  const result = await interaction.editReply({
    content: t("role_initial"),
    components: [action_row],
  });
  const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id && i.customId === role;
  let messageComponent;
  try {
    messageComponent = await result.awaitMessageComponent({
      filter,
      componentType: ComponentType.RoleSelect,
      time: 1000 * 60 * 5,
    });
  } catch {
    await result
      .edit({
        content: t("timeout"),
        components: [],
      })
      .catch(() => null);
    return;
  }
  await messageComponent.deferUpdate();
  if (messageComponent.values.length === 0) {
    await updateGuildConfig(messageComponent.guildId, {
      [role]: null,
    });
    await messageComponent.editReply({
      content: t(`${role}.unset`),
      components: [],
    });
  } else {
    if (
      !["dj_role_id", "staff_role_id"].includes(messageComponent.values[0]) &&
      messageComponent.guild!.members.me!.roles.highest.position <
        messageComponent.guild.roles.cache.get(messageComponent.values[0])!.position
    ) {
      await messageComponent.editReply({
        content: t("role_too_high"),
        components: [],
      });
      return;
    }
    await updateGuildConfig(messageComponent.guildId, {
      [role]: messageComponent.values[0],
    });
    await messageComponent.editReply({
      content: t(`${role}.set`, {
        role: messageComponent.guild!.roles.cache.get(messageComponent.values[0])!.toString(),
      }),
      components: [],
    });
  }
}
