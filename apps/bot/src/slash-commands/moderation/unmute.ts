import type { SlashCommandBase } from "@types";
import { InteractionContextType, MessageFlagsBitField, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { logger } from "@lib";
import { modLog } from "@utils";
import { deletePunishment, getPunishment, PunishmentAction } from "@repo/database";

export default {
  memberPermissions: [PermissionsBitField.Flags.ManageRoles],
  clientPermissions: [PermissionsBitField.Flags.ManageRoles],
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setNameLocalizations({
      tr: "susturmayı-kaldır",
    })
    .setDescription("Unmute a user")
    .setDescriptionLocalizations({
      tr: "Bir kullanıcının susturmasını kaldırır",
    })
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles)
    .addUserOption((option) =>
      option
        .setName("user")
        .setNameLocalizations({
          tr: "kullanıcı",
        })
        .setDescription("The user to unmute")
        .setDescriptionLocalizations({
          tr: "Susturması kaldırılacak kullanıcı",
        })
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setNameLocalizations({
          tr: "sebep",
        })
        .setDescription("The reason for unmuting the user")
        .setDescriptionLocalizations({
          tr: "Kullanıcının susturmasının kaldırılma sebebi",
        }),
    ),
  async execute(interaction, guildConfig) {
    const client = interaction.client;
    const t = client.i18next.getFixedT(guildConfig.language, "commands", "unmute");
    const member = interaction.options.getMember("user");
    if (!member) {
      await interaction.reply({ content: t(($) => $.no_member), flags: MessageFlagsBitField.Flags.Ephemeral });
      return;
    }
    if (!guildConfig.muteRoleId || !interaction.guild.roles.cache.has(guildConfig.muteRoleId)) {
      await interaction.reply({ content: t(($) => $.no_mute_role), flags: MessageFlagsBitField.Flags.Ephemeral });
      return;
    }
    const reason = interaction.options.getString("reason") || t(($) => $.no_reason);
    const punishment = await getPunishment(interaction.guildId, member.id, PunishmentAction.MUTE);

    if (!punishment && member.roles.cache.has(guildConfig.muteRoleId)) {
      await interaction.reply({ content: t(($) => $.muted_no_punishment), flags: MessageFlagsBitField.Flags.Ephemeral });
      await member.roles.remove(guildConfig.muteRoleId);
      return;
    }
    if (!punishment) {
      await interaction.reply({ content: t(($) => $.not_muted), flags: MessageFlagsBitField.Flags.Ephemeral });
      return;
    }
    if (guildConfig.muteGetAllRoles) {
      try {
        await member.roles.set(punishment.previousRoles);
      } catch (error) {
        await interaction.reply({ content: t(($) => $.previous_roles_error), flags: MessageFlagsBitField.Flags.Ephemeral });
        logger.error({
          message: "An error occurred while setting the previous roles of a user",
          error,
          guild: interaction.guild.id,
        });
        return;
      }
    } else {
      // Remove mute role first before deleting from database
      try {
        await member.roles.remove(guildConfig.muteRoleId);
      } catch (error) {
        await interaction.reply({ content: t(($) => $.roleError), flags: MessageFlagsBitField.Flags.Ephemeral });
        logger.error({
          message: "An error occurred while removing the mute role from a user",
          error,
          guild: interaction.guild.id,
        });
        return;
      }
    }
    try {
      await deletePunishment(interaction.guildId, member.id, PunishmentAction.MUTE);
    } catch (error) {
      await interaction.reply({ content: t(($) => $.databaseError), flags: MessageFlagsBitField.Flags.Ephemeral });
      logger.error({
        message: "An error occurred while unmuting a user",
        error,
        guild: interaction.guild.id,
      });
      return;
    }
    try {
      await member.send(t(($) => $.dm, { guild: interaction.guild.name }));
      await interaction.reply(
        t(($) => $.success, {
          user: member.user.tag,
          confirm: client.allEmojis.get(client.config.emojis.confirm.id)?.format,
          case: guildConfig.caseId,
        }),
      );
    } catch {
      await interaction.reply(t(($) => $.dmError, { user: member.user.tag }));
    }
    const result = await modLog(
      {
        guild: interaction.guild,
        action: "UNMUTE",
        user: member.user,
        moderator: interaction.user,
        reason,
      },
      client,
    );
    if (result) {
      if (interaction.replied) {
        await interaction.followUp({ content: result.message });
      } else {
        await interaction.reply({ content: result.message, flags: MessageFlagsBitField.Flags.Ephemeral });
      }
    }
  },
} as SlashCommandBase;
