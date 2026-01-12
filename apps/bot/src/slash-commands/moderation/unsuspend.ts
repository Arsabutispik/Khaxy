import { SlashCommandBase } from "@types";
import { InteractionContextType, MessageFlags, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import {
  addMessageToThread,
  getThreadByChannelId,
  getThreadsByUser,
  ModMailStatus,
  ModMailAuthorType,
  ModMailSentToType,
  prisma,
} from "@repo/database";
import { logger } from "@lib";

export default {
  memberPermissions: [PermissionsBitField.Flags.ManageMessages],
  data: new SlashCommandBuilder()
    .setName("unsuspend")
    .setNameLocalizations({
      tr: "askıdan-kaldır",
    })
    .setDescription("Unsuspend a modmail thread")
    .setDescriptionLocalizations({
      tr: "Modmail kanalını askıdan kaldırır",
    })
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),
  async execute(interaction, guildConfig) {
    const t = interaction.client.i18next.getFixedT(guildConfig.language, "commands", "unsuspend");
    const thread = await getThreadByChannelId(interaction.channelId);
    if (!thread) {
      await interaction.reply({
        content: t("noThread"),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    if (thread.status !== ModMailStatus.SUSPENDED) {
      await interaction.reply({
        content: t("notSuspended"),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const userThreads = await getThreadsByUser(thread.userId);
    if (userThreads.some((t) => t.status === ModMailStatus.OPEN)) {
      await interaction.reply({
        content: t("userHasOpenThreads"),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      await prisma.modMailThread.update({
        where: { channelId: interaction.channelId },
        data: { status: ModMailStatus.OPEN },
      });
      await addMessageToThread(
        interaction.channelId,
        t("unsuspended"),
        interaction.user.id,
        ModMailAuthorType.STAFF,
        ModMailSentToType.THREAD,
        interaction.id,
      );
      await interaction.editReply(t("unsuspended"));
    } catch (error) {
      logger.log({
        level: "error",
        message: `Failed to unsuspend modmail thread ${interaction.channelId}`,
        error,
      });
      await interaction.editReply(t("error"));
    }
  },
} as SlashCommandBase;
