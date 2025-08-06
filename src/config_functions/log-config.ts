import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  ComponentType,
  MessageComponentInteraction,
  MessageFlagsBitField,
  StringSelectMenuBuilder,
} from "discord.js";
import { getGuildConfig } from "@database";
import { dynamicChannel } from "./register-config.js";

export async function logConfig(interaction: ChatInputCommandInteraction<"cached">) {
  const client = interaction.client;
  const guild_config = await getGuildConfig(interaction.guildId!);
  if (!guild_config) {
    await interaction.reply({
      content: "No guild config found. Running a simple command should create one.",
      flags: MessageFlagsBitField.Flags.Ephemeral,
    });
    return;
  }

  const t = client.i18next.getFixedT(guild_config.language, null, "log_config");
  const select_menu = new StringSelectMenuBuilder()
    .setCustomId("log_config")
    .setMinValues(1)
    .setMaxValues(1)
    .setOptions([
      {
        label: t("message_logs_channel_id.label"),
        value: "message_logs_channel_id",
        description: t("message_logs_channel_id.description"),
        emoji: "📜",
      },
      {
        label: t("guild_member_logs_channel_id.label"),
        value: "guild_member_logs_channel_id",
        description: t("guild_member_logs_channel_id.description"),
        emoji: "👥",
      },
      {
        label: t("guild_logs_channel_id.label"),
        value: "guild_logs_channel_id",
        description: t("guild_logs_channel_id.description"),
        emoji: "📋",
      },
      {
        label: t("voice_logs_channel_id.label"),
        value: "voice_logs_channel_id",
        description: t("voice_logs_channel_id.description"),
        emoji: "🔊",
      },
      {
        label: t("channel_logs_channel_id.label"),
        value: "channel_logs_channel_id",
        description: t("channel_logs_channel_id.description"),
        emoji: "📂",
      },
    ]);
  const action_row = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(select_menu);
  const reply = await interaction.reply({
    content: t("initial"),
    components: [action_row],
    flags: MessageFlagsBitField.Flags.Ephemeral,
    withResponse: true,
  });
  const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id && i.customId === "log_config";
  let message_component;
  try {
    message_component = await reply.resource!.message!.awaitMessageComponent({
      filter,
      time: 1000 * 60,
      componentType: ComponentType.StringSelect,
    });
  } catch {
    await reply.resource!.message!.edit({ content: t("timeout"), components: [] }).catch(() => null);
    return;
  }
  if (!message_component.inCachedGuild()) {
    await message_component.deferUpdate();
    await message_component.editReply({
      content: "Not cached, unexpected error",
      components: [],
    });
    return;
  }

  switch (message_component.values[0]) {
    case "message_logs_channel_id":
      await dynamicChannel("message_logs_channel_id", message_component, guild_config, t);
      break;
    case "guild_member_logs_channel_id":
      await dynamicChannel("guild_member_logs_channel_id", message_component, guild_config, t);
      break;
    case "guild_logs_channel_id":
      await dynamicChannel("guild_logs_channel_id", message_component, guild_config, t);
      break;
    case "voice_logs_channel_id":
      await dynamicChannel("voice_logs_channel_id", message_component, guild_config, t);
      break;
    case "channel_logs_channel_id":
      await dynamicChannel("channel_logs_channel_id", message_component, guild_config, t);
      break;
  }
}
