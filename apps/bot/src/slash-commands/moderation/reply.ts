import type { SlashCommandBase } from "src/types/index.js";
import { InteractionContextType, MessageFlagsBitField, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { toStringId } from "src/utils/index.js";
import { logger } from "src/lib/index.js";
import { ModMailMessageSentTo, ModMailMessageType, ModMailThreadStatus } from "src/constants/index.js";
import {
  createModMailMessage,
  getGuildConfig,
  getModMailMessages,
  getModMailThread,
} from "src/database/index.js";
export default {
  memberPermissions: [PermissionsBitField.Flags.ManageMessages],
  data: new SlashCommandBuilder()
    .setName("reply")
    .setNameLocalizations({
      tr: "cevapla",
    })
    .setDescription("Send a reply to a mod mail thread.")
    .setDescriptionLocalizations({
      tr: "Mod mail için bir cevap gönderin.",
    })
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
    .addStringOption((option) =>
      option
        .setName("message")
        .setNameLocalizations({
          tr: "mesaj",
        })
        .setMaxLength(1500)
        .setDescription("The message to send.")
        .setDescriptionLocalizations({
          tr: "Gönderilecek mesaj.",
        })
        .setRequired(true),
    )
    .addAttachmentOption((option) =>
      option
        .setName("attachment")
        .setNameLocalizations({
          tr: "dosya",
        })
        .setDescription("The attachment to send.")
        .setDescriptionLocalizations({
          tr: "Gönderilecek dosya.",
        })
        .setRequired(false),
    )
    .addBooleanOption((option) =>
      option
        .setName("anonymous")
        .setNameLocalizations({
          tr: "anonim",
        })
        .setDescription("Send the message anonymously.")
        .setDescriptionLocalizations({
          tr: "Mesajı anonim olarak gönderin.",
        })
        .setRequired(false),
    ),
  async execute(interaction) {
    const client = interaction.client;
    const guildConfig = await getGuildConfig(interaction.guildId);
    if (!guildConfig) {
      await interaction.reply({
        content: "This server is not registered in the database. This shouldn't happen, please contact developers",
        flags: MessageFlagsBitField.Flags.Ephemeral,
      });
      return;
    }
    const t = client.i18next.getFixedT(guildConfig.language, "commands", "reply");
    const modMailThread = await getModMailThread(interaction.channelId);
    if (!modMailThread) return interaction.reply(t("no_thread"));
    if (modMailThread.status === ModMailThreadStatus.SUSPENDED) return interaction.reply(t("suspended"));
    const message = interaction.options.getString("message", true);
    const anonymous = interaction.options.getBoolean("anonymous");
    const member = await interaction.guild!.members.fetch(toStringId(modMailThread.user_id)).catch(() => null);
    if (!member) return interaction.reply(t("member_not_found"));
    await interaction.deferReply({ flags: MessageFlagsBitField.Flags.Ephemeral });
    const messages = await getModMailMessages(interaction.channelId);
    if (!messages) return interaction.reply(t("no_messages"));
    const { id } = await member.send({
      content: `\`${messages.filter((row) => row.author_type === ModMailMessageType.STAFF && row.sent_to !== ModMailMessageSentTo.COMMAND).length + 1}\` **${anonymous ? `${t("anonymous")}` : `(${interaction.member.roles.highest.name})** **[${interaction.member.user.tag}]`}**: ${message}`,
      files: interaction.options.getAttachment("attachment") ? [interaction.options.getAttachment("attachment")!] : [],
    });
    try {
      await createModMailMessage(interaction.channelId, {
        author_id: BigInt(interaction.member.id),
        sent_at: new Date(),
        author_type: ModMailMessageType.STAFF,
        content: interaction.options.getAttachment("attachment")
          ? `${message} ${interaction.options.getAttachment("attachment")?.url}`
          : message,
        sent_to: ModMailMessageSentTo.USER,
        message_id: BigInt(id),
      });
    } catch (e) {
      logger.error({
        message: "Error while inserting a new mod mail message.",
        error: e,
      });
      return interaction.reply(t("error"));
    }
    await interaction.editReply({ content: t("success") });
    const role =
      interaction.member.roles.highest.name === "@everyone" ? t("no_role") : interaction.member.roles.highest.name;
    await interaction.channel!.send({
      content: `\`${messages.filter((row) => row.author_type === ModMailMessageType.STAFF && row.sent_to !== ModMailMessageSentTo.COMMAND).length + 1}\` **(${role})** **[${interaction.member.user.tag}]**: ${message}`,
      files: interaction.options.getAttachment("attachment") ? [interaction.options.getAttachment("attachment")!] : [],
    });
  },
} as SlashCommandBase;
