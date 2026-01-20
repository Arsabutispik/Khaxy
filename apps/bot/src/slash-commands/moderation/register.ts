import type { SlashCommandBase } from "@types";
import { InteractionContextType, MessageFlagsBitField, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { logger } from "@lib";
import { logMemberAction } from "@utils";

export default {
  memberPermissions: [PermissionsBitField.Flags.ManageRoles],
  clientPermissions: [PermissionsBitField.Flags.ManageRoles],
  data: new SlashCommandBuilder()
    .setName("register")
    .setNameLocalizations({
      tr: "kayıt",
    })
    .setDescription("Register a user to the server")
    .setDescriptionLocalizations({
      tr: "Kullanıcıyı sunucuya kayıt eder",
    })
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles)
    .addUserOption((option) =>
      option
        .setName("user")
        .setNameLocalizations({
          tr: "kullanıcı",
        })
        .setDescription("The user to register")
        .setDescriptionLocalizations({
          tr: "Kayıt edilecek kullanıcı",
        })
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("gender")
        .setNameLocalizations({
          tr: "cinsiyet",
        })
        .setDescription("The gender of the user")
        .setDescriptionLocalizations({
          tr: "Kullanıcının cinsiyeti",
        })
        .setRequired(true)
        .setChoices(
          {
            name: "Male 👨",
            value: "male",
            name_localizations: {
              tr: "Erkek 👨",
            },
          },
          {
            name: "Female 👩",
            value: "female",
            name_localizations: {
              tr: "Kadın 👩",
            },
          },
          {
            name: "Other 🧑",
            value: "other",
            name_localizations: {
              tr: "Diğer 🧑",
            },
          },
        ),
    ),
  async execute(interaction, guildConfig) {
    const client = interaction.client;
    const t = client.i18next.getFixedT(guildConfig.language || "en", "commands", "register");
    const member = interaction.options.getMember("user");
    if (!member) {
      await interaction.reply({ content: t(($) => $.noMember), flags: MessageFlagsBitField.Flags.Ephemeral });
      return;
    }
    const gender = interaction.options.getString("gender", true);
    const registerChannel = guildConfig.registerChannelId
      ? interaction.guild.channels.cache.get(guildConfig.registerChannelId)
      : undefined;
    if (!guildConfig.registerChannelId || !registerChannel) {
      await interaction.reply({ content: t(($) => $.noRegisterChannel), flags: MessageFlagsBitField.Flags.Ephemeral });
      return;
    }
    if (interaction.channelId !== registerChannel.id) {
      await interaction.reply({
        content: t(($) => $.wrongChannel, { channel: registerChannel.id }),
        flags: MessageFlagsBitField.Flags.Ephemeral,
      });
      return;
    }
    if (!guildConfig.memberRoleId || !interaction.guild.roles.cache.has(guildConfig.memberRoleId)) {
      await interaction.reply({ content: t(($) => $.noMemberRole), flags: MessageFlagsBitField.Flags.Ephemeral });
      return;
    }
    if (member.roles.cache.has(guildConfig.memberRoleId)) {
      await interaction.reply({ content: t(($) => $.alreadyRegistered), flags: MessageFlagsBitField.Flags.Ephemeral });
      return;
    }
    const rolesToAdd = [
      ...member.roles.cache.map((role) => role.id).filter((id) => id !== guildConfig.unverifiedRoleId),
      guildConfig.memberRoleId,
    ];
    let addedRoles = [];
    const check = guildConfig.unverifiedRoleId ? member.roles.cache.has(guildConfig.unverifiedRoleId) : false;
    switch (gender) {
      case "male":
        if (!guildConfig.maleRoleId || !interaction.guild.roles.cache.has(guildConfig.maleRoleId)) {
          await interaction.reply({ content: t(($) => $.noMaleRole), flags: MessageFlagsBitField.Flags.Ephemeral });
          return;
        }
        try {
          rolesToAdd.push(guildConfig.maleRoleId);
          await member.roles.set(rolesToAdd);
          addedRoles.push(guildConfig.maleRoleId, guildConfig.memberRoleId);
          await interaction.reply({
            content: t(($) => $.success, {
              user: member.toString(),
              confirm: client.allEmojis.get(client.config.emojis.confirm.id)?.format,
            }),
            flags: MessageFlagsBitField.Flags.Ephemeral,
          });
        } catch (error: unknown) {
          await interaction.reply({
            content: t(($) => $.error, { error: error }),
            flags: MessageFlagsBitField.Flags.Ephemeral,
          });
          logger.error({
            message: `Error while registering user ${member.user.tag} from guild ${interaction.guild.name}`,
            error,
            guild: interaction.guild.id,
            user: interaction.user.id,
          });
        }
        break;
      case "female":
        if (!guildConfig.femaleRoleId || !interaction.guild.roles.cache.has(guildConfig.femaleRoleId)) {
          await interaction.reply({ content: t(($) => $.noFemaleRole), flags: MessageFlagsBitField.Flags.Ephemeral });
          return;
        }
        try {
          rolesToAdd.push(guildConfig.femaleRoleId);
          await member.roles.set(rolesToAdd);
          addedRoles.push(guildConfig.femaleRoleId, guildConfig.memberRoleId);
          await interaction.reply({
            content: t(($) => $.success, {
              user: member.toString(),
              confirm: client.allEmojis.get(client.config.emojis.confirm.id)?.format,
            }),
            flags: MessageFlagsBitField.Flags.Ephemeral,
          });
        } catch (e: unknown) {
          await interaction.reply({
            content: t(($) => $.error, { error: e }),
            flags: MessageFlagsBitField.Flags.Ephemeral,
          });
          logger.error({
            message: `Error while registering user ${member.user.tag} from guild ${interaction.guild.name}`,
            error: e,
            guild: interaction.guild.id,
            user: interaction.user.id,
          });
        }
        break;
      case "other":
        try {
          await member.roles.set(rolesToAdd);
          addedRoles.push(guildConfig.memberRoleId);
          await interaction.reply({
            content: t(($) => $.success, {
              user: member.toString(),
              confirm: client.allEmojis.get(client.config.emojis.confirm.id)?.format,
            }),
            flags: MessageFlagsBitField.Flags.Ephemeral,
          });
        } catch (e: unknown) {
          await interaction.reply({
            content: t(($) => $.error, { error: e }),
            flags: MessageFlagsBitField.Flags.Ephemeral,
          });
          logger.error({
            message: `Error while registering user ${member.user.tag} from guild ${interaction.guild.name}`,
            error: e,
            guild: interaction.guild.id,
            user: interaction.user.id,
          });
        }
        break;
      default:
        await interaction.reply(t(($) => $.notValid));
        break;
    }
    await logMemberAction({
      member,
      action: "rolesUpdate",
      guildConfig,
      executor: interaction.user,
      addedRoles,
      removedRoles: check ? [guildConfig.unverifiedRoleId!] : [],
    });
  },
} as SlashCommandBase;
