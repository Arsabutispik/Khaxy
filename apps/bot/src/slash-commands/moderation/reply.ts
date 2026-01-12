import type { SlashCommandBase } from "@types";
import { InteractionContextType, MessageFlagsBitField, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { logger } from "@lib";
import {
  addMessageToThread,
  getThreadMessages,
  getThreadByChannelId,
  ModMailStatus,
  ModMailAuthorType,
  ModMailSentToType,
} from "@repo/database";
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
  async execute(interaction, guildConfig) {
    const client = interaction.client;
    const t = client.i18next.getFixedT(guildConfig.language, "commands", "reply");
    const modMailThread = await getThreadByChannelId(interaction.channelId);
    if (!modMailThread) {
      return interaction.reply({ content: t("noThread"), flags: MessageFlagsBitField.Flags.Ephemeral });
    }
    if (modMailThread.status === ModMailStatus.SUSPENDED) {
      return interaction.reply({ content: t("suspended"), flags: MessageFlagsBitField.Flags.Ephemeral });
    }
    const message = interaction.options.getString("message", true);
    const anonymous = interaction.options.getBoolean("anonymous");
    const member = await interaction.guild!.members.fetch(modMailThread.userId).catch(() => null);
    if (!member) {
      return interaction.reply({ content: t("memberNotFound"), flags: MessageFlagsBitField.Flags.Ephemeral });
    }
    await interaction.deferReply({ flags: MessageFlagsBitField.Flags.Ephemeral });
    const messages = await getThreadMessages(interaction.channelId);
    if (!messages) {
      return interaction.editReply({ content: t("noMessages") });
    }
    let dmMessageId: string;
    try {
      const dmMessage = await member.send({
        content: `\`${messages.filter((row) => row.authorType === ModMailAuthorType.STAFF && row.sentTo !== ModMailSentToType.COMMAND).length + 1}\` **${anonymous ? `${t("anonymous")}` : `(${interaction.member.roles.highest.name})** **[${interaction.member.user.tag}]`}**: ${message}`,
        files: interaction.options.getAttachment("attachment")
          ? [interaction.options.getAttachment("attachment")!]
          : [],
      });
      dmMessageId = dmMessage.id;
    } catch {
      return interaction.editReply({ content: t("dm_failed") });
    }
    try {
      await addMessageToThread(
        interaction.channelId,
        interaction.options.getAttachment("attachment")
          ? `${message} ${interaction.options.getAttachment("attachment")?.url}`
          : message,
        interaction.member.id,
        ModMailAuthorType.STAFF,
        ModMailSentToType.USER,
        dmMessageId,
      );
    } catch (e) {
      logger.error({
        message: "Error while inserting a new mod mail message.",
        error: e,
      });
      return interaction.editReply({ content: t("error") });
    }
    await interaction.editReply({ content: t("success") });
    const role =
      interaction.member.roles.highest.name === "@everyone" ? t("noRole") : interaction.member.roles.highest.name;
    await interaction.channel!.send({
      content: `\`${messages.filter((row) => row.authorType === ModMailAuthorType.STAFF && row.sentTo !== ModMailSentToType.COMMAND).length + 1}\` **(${role})** **[${interaction.member.user.tag}]**: ${message}`,
      files: interaction.options.getAttachment("attachment") ? [interaction.options.getAttachment("attachment")!] : [],
    });
  },
} as SlashCommandBase;
