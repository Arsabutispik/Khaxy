import type { SlashCommandBase } from "@types";
import {
  ChannelType,
  EmbedBuilder,
  InteractionContextType,
  MessageFlagsBitField,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import dayjs from "dayjs";
import dayjsduration from "dayjs/plugin/duration.js";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { logger } from "@lib";
import "dayjs/locale/tr.js";
import { modLog, returnWebhook, WebhookType } from "@utils";
import { createPunishment, getPunishment, PunishmentAction } from "@repo/database";
export default {
  memberPermissions: [PermissionsBitField.Flags.ManageRoles],
  clientPermissions: [PermissionsBitField.Flags.ManageRoles],
  data: new SlashCommandBuilder()
    .setName("mute")
    .setNameLocalizations({
      tr: "sustur",
    })
    .setDescription("Mute a user")
    .setDescriptionLocalizations({
      tr: "Bir kullanıcıyı susturur",
    })
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles)
    .addUserOption((option) =>
      option
        .setName("user")
        .setNameLocalizations({
          tr: "kullanıcı",
        })
        .setDescription("The user to mute")
        .setDescriptionLocalizations({
          tr: "Susturulacak kullanıcı",
        })
        .setRequired(true),
    )
    .addNumberOption((option) =>
      option
        .setName("duration")
        .setNameLocalizations({
          tr: "süre",
        })
        .setDescription("Duration of the ban (only numbers 1-99)")
        .setDescriptionLocalizations({
          tr: "Yasaklanma süresi (sadece sayılar 1-99)",
        })
        .setMinValue(1)
        .setMaxValue(99)
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("time")
        .setNameLocalizations({
          tr: "vakit",
        })
        .setDescription("Time unit of the ban duration")
        .setDescriptionLocalizations({
          tr: "Yasaklanma süresinin birimi",
        })
        .setRequired(true)
        .setChoices(
          { name: "Second(s)", value: "second", name_localizations: { tr: "Saniye" } },
          { name: "Minute(s)", value: "minute", name_localizations: { tr: "Dakika" } },
          { name: "Hour(s)", value: "hour", name_localizations: { tr: "Saat" } },
          { name: "Day(s)", value: "day", name_localizations: { tr: "Gün" } },
          { name: "Week(s)", value: "week", name_localizations: { tr: "Hafta" } },
        ),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setNameLocalizations({
          tr: "sebep",
        })
        .setDescription("The reason for muting the user")
        .setDescriptionLocalizations({
          tr: "Kullanıcının susturulma sebebi",
        }),
    ),
  async execute(interaction, guildConfig) {
    dayjs.extend(dayjsduration);
    dayjs.extend(relativeTime);
    const client = interaction.client;
    const t = client.i18next.getFixedT(guildConfig.language, "commands", "mute");
    const member = interaction.options.getMember("user");
    if (!member) {
      await interaction.reply({ content: t(($) => $.noUser), flags: MessageFlagsBitField.Flags.Ephemeral });
      return;
    }
    if (member.user.bot) {
      await interaction.reply({ content: t(($) => $.cantMuteBot), flags: MessageFlagsBitField.Flags.Ephemeral });
      return;
    }
    if (member.id === interaction.user.id) {
      await interaction.reply({ content: t(($) => $.cantMuteYourself), flags: MessageFlagsBitField.Flags.Ephemeral });
      return;
    }
    if (
      member.permissions.has(PermissionsBitField.Flags.ManageRoles) ||
      (guildConfig.staffRoleId && member.roles.cache.has(guildConfig.staffRoleId))
    ) {
      await interaction.reply({ content: t(($) => $.cantMuteMod), flags: MessageFlagsBitField.Flags.Ephemeral });
      return;
    }
    if (member.roles.highest.position >= interaction.member.roles.highest.position) {
      await interaction.reply({ content: t(($) => $.cantMuteHigher), flags: MessageFlagsBitField.Flags.Ephemeral });
      return;
    }
    const muteRole = guildConfig.muteRoleId ? interaction.guild.roles.cache.get(guildConfig.muteRoleId) : undefined;
    if (!muteRole) {
      await interaction.reply({ content: t(($) => $.noMuteRole), flags: MessageFlagsBitField.Flags.Ephemeral });
      return;
    }
    const punishment = await getPunishment(interaction.guildId, member.id, PunishmentAction.MUTE);

    if (member.roles.cache.has(muteRole.id) && punishment) {
      await interaction.reply({ content: t(($) => $.alreadyMuted), flags: MessageFlagsBitField.Flags.Ephemeral });
      return;
    } else if (member.roles.cache.has(muteRole.id) && !punishment) {
      await interaction.reply({
        content: t(($) => $.alreadyMutedNoPunishment),
        flags: MessageFlagsBitField.Flags.Ephemeral,
      });
      await member.roles.remove(muteRole);
      return;
    } else if (!member.roles.cache.has(muteRole.id) && punishment) {
      await interaction.reply({ content: t(($) => $.notMuted), flags: MessageFlagsBitField.Flags.Ephemeral });
      await member.roles.add(muteRole);
      return;
    }
    const reason = interaction.options.getString("reason") || t(($) => $.noReason);
    const duration = dayjs.duration(
      interaction.options.getNumber("duration", true),
      interaction.options.getString("time", true) as dayjsduration.DurationUnitType,
    );
    const longDuration = dayjs(dayjs().add(duration))
      .locale(guildConfig.language || "en")
      .fromNow(true);
    const filteredRoles = member.roles.cache
      .filter((role) => role.id !== interaction.guild!.id)
      .filter((role) => role.id !== interaction.guild!.roles.premiumSubscriberRole?.id)
      .filter((role) => role.position < interaction.guild!.members.me!.roles.highest.position)
      .map((role) => role.id);
    if (guildConfig.muteGetAllRoles) {
      try {
        await createPunishment(
          interaction.guildId,
          member.id,
          interaction.user.id,
          PunishmentAction.MUTE,
          new Date(Date.now() + duration.asMilliseconds()),
          filteredRoles,
        );
      } catch (error) {
        await interaction.reply({ content: t(($) => $.database_error), flags: MessageFlagsBitField.Flags.Ephemeral });
        logger.error({
          message: `Error while putting punishments to database for user ${member.user.tag} from guild ${interaction.guild.name}`,
          error,
          guild: `${interaction.guild.name} (${interaction.guild.id})`,
          user: `${interaction.user.tag} (${interaction.user.id})`,
        });
        return;
      }
      try {
        await member.roles.set([muteRole.id]);
      } catch (error) {
        await interaction.reply({ content: t(($) => $.role_error), flags: MessageFlagsBitField.Flags.Ephemeral });
        logger.error({
          message: `Error while setting roles for user ${member.user.tag} from guild ${interaction.guild.name}`,
          error,
          guild: `${interaction.guild.name} (${interaction.guild.id})`,
          user: `${interaction.user.tag} (${interaction.user.id})`,
        });
        return;
      }
    } else {
      try {
        await createPunishment(
          interaction.guildId,
          member.id,
          interaction.user.id,
          PunishmentAction.MUTE,
          new Date(Date.now() + duration.asMilliseconds()),
        );
      } catch (error) {
        await interaction.reply({ content: t(($) => $.database_error), flags: MessageFlagsBitField.Flags.Ephemeral });
        logger.error({
          message: `Error while putting punishments to database for user ${member.user.tag} from guild ${interaction.guild.name}`,
          error,
          guild: `${interaction.guild.name} (${interaction.guild.id})`,
          user: `${interaction.user.tag} (${interaction.user.id})`,
        });
        return;
      }
      try {
        await member.roles.add(muteRole);
      } catch (error) {
        await interaction.reply({ content: t(($) => $.role_error), flags: MessageFlagsBitField.Flags.Ephemeral });
        logger.error({
          message: `Error while setting roles for user ${member.user.tag} from guild ${interaction.guild.name}`,
          error,
          guild: `${interaction.guild.name} (${interaction.guild.id})`,
          user: `${interaction.user.tag} (${interaction.user.id})`,
        });
        return;
      }
    }
    try {
      await member.send(t(($) => $.message.dm, { guild: interaction.guild.name, reason, duration: longDuration }));
      await interaction.reply({
        content: t(($) => $.message.success, {
          user: member.user.tag,
          duration: longDuration,
          confirm: client.allEmojis.get(client.config.emojis.confirm.id)?.format,
          case: guildConfig.caseId,
        }),
      });
    } catch {
      await interaction.reply({
        content: t(($) => $.message.fail, {
          user: member.user.tag,
          duration: longDuration,
          case: guildConfig.caseId,
          confirm: client.allEmojis.get(client.config.emojis.confirm.id)?.format,
        }),
      });
    }
    const result = await modLog(
      {
        guild: interaction.guild,
        user: member.user,
        action: "MUTE",
        moderator: interaction.user,
        reason,
        duration: dayjs().add(duration),
      },
      client,
    );
    if (result) {
      if (interaction.replied) {
        await interaction.followUp(result.message);
      } else {
        await interaction.reply(result.message);
      }
    }
    const logChannel = guildConfig.logConfig?.guildMemberLogsChannelId
      ? member.guild.channels.cache.get(guildConfig.logConfig.guildMemberLogsChannelId)
      : undefined;
    if (logChannel?.type !== ChannelType.GuildText) return;
    const embed = new EmbedBuilder().setTitle(t(($) => $.embed.title)).setColor("Yellow").setTimestamp();
    let description = t(($) => $.embed.description, {
      user: member.user,
      added_roles: muteRole.toString(),
    });

    if (filteredRoles.length > 0) {
      description += `\n> **${t(($) => $.embed.removed)}**: ${filteredRoles.map((id) => `<@&${id}>`).join(", ")}`;
    }

    embed.setDescription(description);
    if (client.user) {
      embed.setFooter({
        text: interaction.user.tag,
        iconURL: interaction.user.displayAvatarURL(),
      });
    }
    const webhook = await returnWebhook(client, logChannel, member.guild.id, guildConfig, {
      id: guildConfig.logConfig?.guildMemberLogsWebhookId,
      type: WebhookType.GUILD_MEMBER_LOGS,
    });
    if (!webhook) return;
    await webhook.send({ embeds: [embed] });
  },
} as SlashCommandBase;
