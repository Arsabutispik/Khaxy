import type { SlashCommandBase } from "@types";
import { InteractionContextType, MessageFlags, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { logger } from "@lib";
import {
  addMessageToThread,
  getThreadByChannelId,
  ModMailStatus,
  ModMailAuthorType,
  ModMailSentToType,
} from "@repo/database";
import { prisma } from "@repo/database";
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
  async execute(interaction, guildConfig) {
    const t = interaction.client.i18next.getFixedT(guildConfig.language, "commands", "suspend");
    const modMailThread = await getThreadByChannelId(interaction.channelId);
    if (!modMailThread) {
      return interaction.reply({
        content: t("no_thread"),
        flags: MessageFlags.Ephemeral,
      });
    }
    if (modMailThread.status === ModMailStatus.SUSPENDED) {
      return interaction.reply({
        content: t("already_suspended"),
        flags: MessageFlags.Ephemeral,
      });
    }
    try {
      await prisma.modMailThread.update({
        where: { channelId: interaction.channelId },
        data: { status: ModMailStatus.SUSPENDED },
      });
      const response = await interaction.reply({
        content: t("suspended"),
        flags: MessageFlags.Ephemeral,
        withResponse: true,
      });
      await addMessageToThread(
        interaction.channelId,
        t("suspended"),
        interaction.user.id,
        ModMailAuthorType.STAFF,
        ModMailSentToType.THREAD,
        response.resource?.message?.id || "0",
      );
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
