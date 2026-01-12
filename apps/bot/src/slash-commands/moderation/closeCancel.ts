import type { SlashCommandBase } from "@types";
import { InteractionContextType, MessageFlags, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { logger } from "@lib";
import {
  getThreadByChannelId,
  cancelScheduledClose,
  addMessageToThread,
  ModMailAuthorType,
  ModMailSentToType,
} from "@repo/database";

export default {
  memberPermissions: [PermissionsBitField.Flags.ManageMessages],
  data: new SlashCommandBuilder()
    .setName("close-cancel")
    .setNameLocalizations({ tr: "kapat-iptal" })
    .setDescription("Cancel the scheduled close of a mod mail thread.")
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),

  async execute(interaction, guildConfig) {
    const { client, channelId, user } = interaction;

    // 1. Config & Translation Setup
    if (!guildConfig) {
      return interaction.reply({
        content: "Server configuration missing. Please contact developers.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const t = client.i18next.getFixedT(guildConfig.language, "commands", "closeCancel");

    // 2. Thread Validation
    const thread = await getThreadByChannelId(channelId);
    if (!thread) {
      return interaction.reply({
        content: t("noThread"),
        flags: MessageFlags.Ephemeral,
      });
    }

    if (!thread.scheduledCloseAt) {
      return interaction.reply({
        content: t("notClosing"),
        flags: MessageFlags.Ephemeral,
      });
    }

    // 3. Execution
    try {
      await cancelScheduledClose(channelId);

      // We use withResponse: true to get the message object for logging
      const response = await interaction.reply({
        content: t("cancelled"),
        withResponse: true,
      });

      const messageId = response.resource?.message?.id || interaction.id;

      // Persist the cancellation in the thread history
      await addMessageToThread(
        channelId,
        t("cancelled"),
        user.id,
        ModMailAuthorType.SYSTEM,
        ModMailSentToType.THREAD,
        messageId,
      );
    } catch (error) {
      logger.error({
        message: "Error while cancelling mod mail close",
        error,
        channelId,
      });

      return interaction.reply({
        content: t("error"),
        flags: MessageFlags.Ephemeral,
      });
    }
  },
} as SlashCommandBase;
