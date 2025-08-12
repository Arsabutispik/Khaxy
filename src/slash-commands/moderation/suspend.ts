import type { SlashCommandBase } from "@customTypes";
import { InteractionContextType, MessageFlags, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { logger } from "@lib";
import { ModMailMessageSentTo, ModMailMessageType, ModMailThreadStatus } from "@constants";
import { createModMailMessage, getGuildConfig, getModMailThread, updateModMailThread } from "@database";
export default {
  memberPermissions: [PermissionsBitField.Flags.ManageMessages],
  data: new SlashCommandBuilder()
    .setName("suspend")
    .setNameLocalizations({
      tr: "askıya-al",
    })
    .setDescription("Suspend a mod mail thread.")
    .setDescriptionLocalizations({
      tr: "Bir mod mail kanalını askıya al.",
    })
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),
  async execute(interaction) {
    const guildConfig = await getGuildConfig(interaction.guildId);
    if (!guildConfig) {
      return interaction.reply({
        content: "This server is not registered in the database. This shouldn't happen, please contact developers",
        flags: MessageFlags.Ephemeral,
      });
    }
    const t = interaction.client.i18next.getFixedT(guildConfig.language, "commands", "suspend");
    const modMailThread = await getModMailThread(interaction.channelId);
    if (!modMailThread) {
      return interaction.reply({
        content: t("no_thread"),
        flags: MessageFlags.Ephemeral,
      });
    }
    if (modMailThread.status === ModMailThreadStatus.SUSPENDED) {
      return interaction.reply({
        content: t("already_suspended"),
        flags: MessageFlags.Ephemeral,
      });
    }
    try {
      await updateModMailThread(interaction.channelId, {
        status: ModMailThreadStatus.SUSPENDED,
      });
      const response = await interaction.reply({
        content: t("suspended"),
        flags: MessageFlags.Ephemeral,
        withResponse: true,
      });
      await createModMailMessage(interaction.channelId, {
        author_id: BigInt(interaction.user.id),
        sent_at: new Date(),
        author_type: ModMailMessageType.CLIENT,
        sent_to: ModMailMessageSentTo.THREAD,
        content: t("suspended"),
        message_id: BigInt(response.resource?.message?.id || 0),
      });
    } catch (error) {
      logger.log({
        level: "error",
        error,
        message: "Failed to suspend mod mail thread",
      });
      return interaction.reply({
        content: t("error"),
        flags: MessageFlags.Ephemeral,
      });
    }
  },
} as SlashCommandBase;
