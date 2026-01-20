import type { SlashCommandBase } from "@types";
import { InteractionContextType, MessageFlagsBitField, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { logger } from "@lib";
import { modLog, infractionsPunishment } from "@utils";
import { createInfraction, InfractionType } from "@repo/database";

export default {
  memberPermissions: [PermissionsBitField.Flags.ModerateMembers],
  data: new SlashCommandBuilder()
    .setName("warn")
    .setNameLocalizations({
      tr: "uyar",
    })
    .setDescription("Warns a user")
    .setDescriptionLocalizations({
      tr: "Bir kullanıcıyı uyarır",
    })
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers)
    .addUserOption((option) =>
      option
        .setName("user")
        .setNameLocalizations({
          tr: "kullanıcı",
        })
        .setDescription("The user to warn")
        .setDescriptionLocalizations({
          tr: "Uyarılacak kullanıcı",
        })
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setNameLocalizations({
          tr: "sebep",
        })
        .setDescription("The reason for warning the user")
        .setDescriptionLocalizations({
          tr: "Kullanıcının uyarılma sebebi",
        })
        .setRequired(true),
    ),
  async execute(interaction, guildConfig) {
    const client = interaction.client;
    const t = client.i18next.getFixedT(guildConfig.language, "commands", "warn");
    const member = interaction.options.getMember("user");
    if (!member) {
      await interaction.reply({ content: t(($) => $.noMember), flags: MessageFlagsBitField.Flags.Ephemeral });
      return;
    }
    if (member.id === interaction.user.id) {
      await interaction.reply({ content: t(($) => $.selfWarn), flags: MessageFlagsBitField.Flags.Ephemeral });
      return;
    }
    if (member.user.bot) {
      await interaction.reply({ content: t(($) => $.botWarn), flags: MessageFlagsBitField.Flags.Ephemeral });
      return;
    }
    if (
      member.permissions.has(PermissionsBitField.Flags.ManageGuild) ||
      (guildConfig.staffRoleId && member.roles.cache.has(guildConfig.staffRoleId))
    ) {
      await interaction.reply({ content: t(($) => $.staffWarn), flags: MessageFlagsBitField.Flags.Ephemeral });
      return;
    }
    const reason = interaction.options.getString("reason", true);
    try {
      await createInfraction(interaction.guildId, member.id, interaction.user.id, InfractionType.WARN, reason);
    } catch (error) {
      await interaction.reply(t(($) => $.databaseError));
      logger.error({
        message: "An error occurred while warning a user",
        error,
        guild: interaction.guild.id,
      });
      return;
    }
    try {
      await member.send(t(($) => $.dm, { guild: interaction.guild.name, reason }));
      await interaction.reply(
        t(($) => $.success, {
          user: member.user.tag,
          case: guildConfig.caseId,
          confirm: client.allEmojis.get(client.config.emojis.confirm.id)?.format,
        }),
      );
    } catch {
      await interaction.reply(
        t(($) => $.dmError, {
          user: member.user.tag,
          case: guildConfig.caseId,
          confirm: client.allEmojis.get(client.config.emojis.confirm.id)?.format,
        }),
      );
    }
    const result = await modLog(
      {
        guild: interaction.guild,
        action: "WARNING",
        user: member.user,
        moderator: interaction.user,
        reason,
      },
      client,
    );
    if (result) {
      if (interaction.replied) {
        await interaction.followUp({ content: result.message, flags: MessageFlagsBitField.Flags.Ephemeral });
      } else {
        await interaction.reply({ content: result.message, flags: MessageFlagsBitField.Flags.Ephemeral });
      }
    }
    const issue = await infractionsPunishment(interaction.guild, member, interaction.user);
    if (issue) {
      await interaction.followUp({ content: issue, flags: MessageFlagsBitField.Flags.Ephemeral });
    }
  },
} as SlashCommandBase;
