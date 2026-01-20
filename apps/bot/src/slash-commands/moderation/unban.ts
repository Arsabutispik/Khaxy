import type { SlashCommandBase } from "@types";
import { InteractionContextType, MessageFlagsBitField, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { logger } from "@lib";
import { logBanRemove, modLog } from "@utils";

export default {
  memberPermissions: [PermissionsBitField.Flags.BanMembers],
  clientPermissions: [PermissionsBitField.Flags.BanMembers],
  data: new SlashCommandBuilder()
    .setName("unban")
    .setNameLocalizations({
      tr: "yasak-kaldır",
    })
    .setDescription("Unban a user from the server")
    .setDescriptionLocalizations({
      tr: "Bir kullanıcının yasağını kaldırır",
    })
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers)
    .addUserOption((option) =>
      option
        .setName("user")
        .setNameLocalizations({
          tr: "kullanıcı",
        })
        .setDescription("The user to unban")
        .setDescriptionLocalizations({
          tr: "Yasağı kaldırılacak kullanıcı",
        })
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setNameLocalizations({
          tr: "sebep",
        })
        .setDescription("The reason for unbanning the user")
        .setDescriptionLocalizations({
          tr: "Kullanıcının yasağının kaldırılma sebebi",
        }),
    ),
  async execute(interaction, guildConfig) {
    const client = interaction.client;
    const t = client.i18next.getFixedT(guildConfig.language, "commands", "unban");
    const user = interaction.options.getUser("user", true);
    if (!user) {
      await interaction.reply({ content: t(($) => $.noUser), flags: MessageFlagsBitField.Flags.Ephemeral });
      return;
    }
    const banned = await interaction.guild.bans.fetch(user.id).catch(() => null);
    if (!banned) {
      await interaction.reply({
        content: t(($) => $.notBanned, { user: user.tag }),
        flags: MessageFlagsBitField.Flags.Ephemeral,
      });
      return;
    }
    const reason = interaction.options.getString("reason") || t(($) => $.noReason);
    try {
      await interaction.guild.members.unban(user, reason);
      await interaction.reply({
        content: t(($) => $.success, {
          user: user.tag,
          confirm: client.allEmojis.get(client.config.emojis.confirm.id)?.format,
          case: guildConfig.caseId,
        }),
        flags: MessageFlagsBitField.Flags.Ephemeral,
      });
    } catch (error) {
      await interaction.reply({
        content: t(($) => $.error, { error: error }),
        flags: MessageFlagsBitField.Flags.Ephemeral,
      });
      logger.error({
        message: `An error occurred while unbanning a user. Error: ${error}`,
        error,
        guild: interaction.guild.id,
        user: interaction.user.id,
      });
    }
    await logBanRemove({ guild: interaction.guild, user, reason, executor: interaction.user, guildConfig });
    const result = await modLog(
      {
        guild: interaction.guild,
        action: "UNBAN",
        user,
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
  },
} as SlashCommandBase;
