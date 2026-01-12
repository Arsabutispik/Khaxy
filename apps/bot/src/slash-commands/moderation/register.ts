import type { SlashCommandBase } from "@types";
import {
  ChannelType,
  EmbedBuilder,
  InteractionContextType,
  MessageFlagsBitField,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import { logger } from "@lib";
import { returnWebhook, WebhookType } from "@utils";

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
      await interaction.reply({ content: t("no_member"), flags: MessageFlagsBitField.Flags.Ephemeral });
      return;
    }
    const gender = interaction.options.getString("gender", true);
    const registerChannel = guildConfig.registerChannelId
      ? interaction.guild.channels.cache.get(guildConfig.registerChannelId)
      : undefined;
    if (!guildConfig.registerChannelId || !registerChannel) {
      await interaction.reply({ content: t("no_register_channel"), flags: MessageFlagsBitField.Flags.Ephemeral });
      return;
    }
    if (interaction.channelId !== registerChannel.id) {
      await interaction.reply({
        content: t("wrong_channel", { channel: registerChannel.id }),
        flags: MessageFlagsBitField.Flags.Ephemeral,
      });
      return;
    }
    if (!guildConfig.memberRoleId || !interaction.guild.roles.cache.has(guildConfig.memberRoleId)) {
      await interaction.reply({ content: t("no_member_role"), flags: MessageFlagsBitField.Flags.Ephemeral });
      return;
    }
    if (member.roles.cache.has(guildConfig.memberRoleId)) {
      await interaction.reply({ content: t("already_registered"), flags: MessageFlagsBitField.Flags.Ephemeral });
      return;
    }
    const rolesToAdd = [
      ...member.roles.cache.map((role) => role.id).filter((id) => id !== guildConfig.unverifiedRoleId),
      guildConfig.memberRoleId,
    ];
    let added_roles = "";
    const check = guildConfig.unverifiedRoleId ? member.roles.cache.has(guildConfig.unverifiedRoleId) : false;
    switch (gender) {
      case "male":
        if (!guildConfig.maleRoleId || !interaction.guild.roles.cache.has(guildConfig.maleRoleId)) {
          await interaction.reply({ content: t("no_male_role"), flags: MessageFlagsBitField.Flags.Ephemeral });
          return;
        }
        try {
          rolesToAdd.push(guildConfig.maleRoleId);
          await member.roles.set(rolesToAdd);
          added_roles = `<@&${guildConfig.maleRoleId}>, <@&${guildConfig.memberRoleId}>`;
          await interaction.reply({
            content: t("success", {
              user: member.toString(),
              confirm: client.allEmojis.get(client.config.emojis.confirm.id)?.format,
            }),
            flags: MessageFlagsBitField.Flags.Ephemeral,
          });
        } catch (error: any) {
          await interaction.reply({
            content: t("error", { error: error.message }),
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
          await interaction.reply({ content: t("no_female_role"), flags: MessageFlagsBitField.Flags.Ephemeral });
          return;
        }
        try {
          rolesToAdd.push(guildConfig.femaleRoleId);
          await member.roles.set(rolesToAdd);
          added_roles = `<@&${guildConfig.femaleRoleId}>, <@&${guildConfig.memberRoleId}>`;
          await interaction.reply({
            content: t("success", {
              user: member.toString(),
              confirm: client.allEmojis.get(client.config.emojis.confirm.id)?.format,
            }),
            flags: MessageFlagsBitField.Flags.Ephemeral,
          });
        } catch (e: any) {
          await interaction.reply({
            content: t("error", { error: e.message }),
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
          added_roles = `<@&${guildConfig.memberRoleId}>`;
          await interaction.reply({
            content: t("success", {
              user: member.toString(),
              confirm: client.allEmojis.get(client.config.emojis.confirm.id)?.format,
            }),
            flags: MessageFlagsBitField.Flags.Ephemeral,
          });
        } catch (e: any) {
          await interaction.reply({
            content: t("error", { error: e.message }),
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
        await interaction.reply(t("not_valid"));
        break;
    }
    const logChannel = guildConfig.logConfig?.guildMemberLogsChannelId
      ? interaction.guild.channels.cache.get(guildConfig.logConfig.guildMemberLogsChannelId)
      : undefined;
    if (logChannel?.type !== ChannelType.GuildText) return;
    const embed = new EmbedBuilder()
      .setTitle(t("roles_update.embed.title"))
      .setColor("Yellow")
      .setThumbnail(member.user.displayAvatarURL())
      .setTimestamp()
      .setFooter({
        text: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL(),
      });

    let description = t("roles_update.embed.description", { user: member.user, added_roles });

    if (check) {
      description += `\n> **${t("roles_update.embed.removed")}**: <@&${guildConfig.unverifiedRoleId}>`;
    }

    embed.setDescription(description);

    const webhook = await returnWebhook(client, logChannel, interaction.guildId, guildConfig, {
      id: guildConfig.logConfig?.guildMemberLogsWebhookId,
      type: WebhookType.GUILD_MEMBER_LOGS,
    });
    if (!webhook) return;
    await webhook.send({ embeds: [embed] }).catch((error) => {
      logger.log({
        level: "error",
        message: `Failed to send guildMemberUpdate embed in ${interaction.guild.name} (${interaction.guild.id})`,
        error,
        channelId: logChannel.id,
      });
    });
  },
} as SlashCommandBase;
