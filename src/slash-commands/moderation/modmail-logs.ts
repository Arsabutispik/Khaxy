import { SlashCommandBase } from "src/types/index.js";
import { InteractionContextType, MessageFlags, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { getGuildConfig, getModMailMessages, getModMailThreads } from "src/database/index.js";
import { modMailTextFile, toStringId } from "src/utils/index.js";
import dayjs from "dayjs";
import { ModMailThreadStatus } from "src/constants/index.js";

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
  async execute(interaction) {
    const guildConfig = await getGuildConfig(interaction.guildId);
    if (!guildConfig) {
      return interaction.reply({ content: "Guild configuration not found.", flags: MessageFlags.Ephemeral });
    }
    await interaction.deferReply();
    const t = interaction.client.i18next.getFixedT(guildConfig.language, "commands", "modmail-logs");
    const tMail = interaction.client.i18next.getFixedT(guildConfig.language, null, "mod_mail_log");
    const logId = interaction.options.getInteger("log-id", true);
    const threads = await getModMailThreads(interaction.guildId);
    const thread = threads.find((t) => Number(t.id) === logId);
    if (!thread) {
      return interaction.editReply({ content: t("no_thread_found", { logId }) });
    }
    if (thread.status !== ModMailThreadStatus.CLOSED) {
      return interaction.editReply({ content: t("thread_not_closed", { logId }) });
    }
    const user = await interaction.client.users.fetch(thread.user_id.toString()).catch(() => null);
    if (!user) {
      return interaction.editReply({ content: t("user_not_found", { userId: thread.user_id.toString() }) });
    }
    const messages = await getModMailMessages(thread.channel_id.toString());
    if (messages.length === 0) {
      return interaction.editReply({ content: t("no_messages_found", { logId }) });
    }
    const attachment = await modMailTextFile(
      [
        tMail("initial", {
          thread_id: threads.length,
          user,
          time: dayjs(messages[0].sent_at),
        }),
      ],
      messages,
      interaction.client,
      tMail,
      user,
    );
    const thread_messages = {
      user: messages.filter((row) => row.author_type === "user" && row.sent_to === "thread").length,
      staff: messages.filter((row) => row.author_type === "staff" && row.sent_to === "user").length,
      internal: messages.filter((row) => row.author_type === "staff" && row.sent_to === "thread").length,
    };
    const closer = await interaction.client.users.fetch(toStringId(thread.closer_id)).catch(() => null);
    await interaction.editReply({
      content: tMail("close_message", {
        thread_id: threads.length,
        user,
        closer,
        messages: thread_messages,
      }),
      allowedMentions: { parse: [] },
      files: [attachment],
    });
  },
} as SlashCommandBase;
