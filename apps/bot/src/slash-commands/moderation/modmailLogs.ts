import { SlashCommandBase } from "@types";
import { InteractionContextType, PermissionsBitField, SlashCommandBuilder, ChannelType } from "discord.js";
import { getThreadMessages, getModMailThreads, ModMailStatus } from "@repo/database";
import { modMailLog } from "@lib";

export default {
  memberPermissions: [PermissionsBitField.Flags.ManageMessages],
  data: new SlashCommandBuilder()
    .setName("modmail-logs")
    .setNameLocalizations({
      tr: "modmail-günlükleri",
    })
    .setDescription("Get the logs for a specified modmail thread")
    .setDescriptionLocalizations({
      tr: "Belirtilen modmail dizisi için günlükleri alın",
    })
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
    .addIntegerOption((option) =>
      option
        .setName("log-id")
        .setNameLocalizations({
          tr: "günlük-id",
        })
        .setDescription("The ID of the modmail log to retrieve")
        .setDescriptionLocalizations({
          tr: "Alınacak modmail günlüğünün kimliği",
        })
        .setRequired(true),
    ),
  async execute(interaction, guildConfig) {
    await interaction.deferReply();
    const t = interaction.client.i18next.getFixedT(guildConfig.language, "commands", "modmailLogs");
    const logId = interaction.options.getInteger("log-id", true);
    const threads = await getModMailThreads(interaction.guildId);
    const thread = threads?.find((thread) => Number(thread.id) === logId);
    if (!thread) {
      return interaction.editReply({ content: t(($) => $.noThreadFound, { logId }) });
    }
    if (thread.status !== ModMailStatus.CLOSED) {
      return interaction.editReply({ content: t(($) => $.threadNotClosed, { logId }) });
    }
    const user = await interaction.client.users.fetch(thread.userId).catch(() => null);
    if (!user) {
      return interaction.editReply({ content: t(($) => $.userNotFound, { userId: thread.userId }) });
    }
    const messages = await getThreadMessages(thread.channelId);
    if (messages.length === 0) {
      return interaction.editReply({ content: t(($) => $.noMessagesFound, { logId }) });
    }
    const channel = interaction.guild?.channels.cache.get(thread.channelId);
    if (channel?.type !== ChannelType.GuildText) return;
    const attachment = await modMailLog(interaction.client, channel, user, interaction.user, true);
    await interaction.editReply({ content: t(($) => $.logSent, { user: user.tag }), files: [attachment!] });
  },
} as SlashCommandBase;
