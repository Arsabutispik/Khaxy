import type { SlashCommandBase } from "src/types/index.js";
import { InteractionContextType, MessageFlags, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { logger } from "src/lib/index.js";
import {
  createModMailMessage,
  getGuildConfig,
  getModMailThread,
  updateModMailThread,
} from "src/database/index.js";
import { ModMailMessageSentTo, ModMailMessageType } from "src/constants/index.js";

export default {
  memberPermissions: [PermissionsBitField.Flags.ManageMessages],
  data: new SlashCommandBuilder()
    .setName("close-cancel")
    .setNameLocalizations({
      tr: "kapat-iptal",
    })
    .setDescription("Cancel the close of a mod mail thread.")
    .setDescriptionLocalizations({
      tr: "Bir mod mail kanalının kapanmasını iptal et.",
    })
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),
  async execute(interaction) {
    const guild_config = await getGuildConfig(interaction.guildId);
    if (!guild_config) {
      return interaction.reply({
        content: "This server is not registered in the database. This shouldn't happen, please contact developers",
        flags: MessageFlags.Ephemeral,
      });
    }
    const t = interaction.client.i18next.getFixedT(guild_config.language, "commands", "close-cancel");
    const mod_mail_thread = await getModMailThread(interaction.channelId);
    if (!mod_mail_thread) {
      return interaction.reply({
        content: t("no_thread"),
        flags: MessageFlags.Ephemeral,
      });
    }
    if (!mod_mail_thread.close_date) {
      return interaction.reply({
        content: t("not_closing"),
        flags: MessageFlags.Ephemeral,
      });
    }
    try {
      await updateModMailThread(interaction.channelId, {
        close_date: null,
      });
      const response = await interaction.reply({
        content: t("cancelled"),
        flags: MessageFlags.Ephemeral,
        withResponse: true,
      });
      await createModMailMessage(interaction.channelId, {
        author_id: BigInt(interaction.user.id),
        sent_at: new Date(),
        author_type: ModMailMessageType.CLIENT,
        sent_to: ModMailMessageSentTo.THREAD,
        content: t("cancelled"),
        message_id: BigInt(response.resource?.message?.id || 0),
      });
    } catch (error) {
      logger.log({
        level: "error",
        error,
        message: "Error while cancelling close of mod mail thread",
      });
      return interaction.reply({
        content: t("error"),
        flags: MessageFlags.Ephemeral,
      });
    }
  },
} as SlashCommandBase;
