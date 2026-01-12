import type { SlashCommandBase } from "@types";
import {
  InteractionContextType,
  MessageFlagsBitField,
  PermissionsBitField,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  User,
} from "discord.js";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { modLog, logBanAdd } from "@utils";
import { logger } from "src/lib/index.js";
import { createPunishment, PunishmentAction, createInfraction, InfractionType, GuildWithLogs } from "@repo/database";
import { TFunction } from "i18next";

dayjs.extend(duration);
dayjs.extend(relativeTime);

export default {
  memberPermissions: [PermissionsBitField.Flags.BanMembers],
  clientPermissions: [PermissionsBitField.Flags.BanMembers],
  data: new SlashCommandBuilder()
    .setName("ban")
    .setNameLocalizations({ tr: "yasakla" })
    .setDescription("Ban a user from the server.")
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers)
    .addUserOption((opt) => opt.setName("user").setRequired(true))
    .addBooleanOption((opt) => opt.setName("preserve-messages"))
    .addStringOption((opt) => opt.setName("reason"))
    .addNumberOption((opt) => opt.setName("duration"))
    .addStringOption((opt) =>
      opt
        .setName("time")
        .setChoices(
          { name: "Minute(s)", value: "minute" },
          { name: "Hour(s)", value: "hour" },
          { name: "Day(s)", value: "day" },
        ),
    ),

  async execute(interaction, guildConfig) {
    const { client, guild, user: moderator } = interaction;
    if (!guild || !guildConfig) return;

    const t = client.i18next.getFixedT(guildConfig.language || "en", "commands", "ban");
    const targetUser = interaction.options.getUser("user", true);

    // 1. Validation
    const validationError = validateBan(interaction, targetUser, guildConfig, t);
    if (validationError)
      return interaction.reply({ content: validationError, flags: MessageFlagsBitField.Flags.Ephemeral });

    await interaction.deferReply();

    // 2. Data Preparation
    const reason = interaction.options.getString("reason") || t("noReason");
    const durationVal = interaction.options.getNumber("duration");
    const unit = interaction.options.getString("time");
    const preserve = interaction.options.getBoolean("preserve-messages") || false;

    const expiresAt =
      durationVal && unit ? new Date(Date.now() + dayjs.duration(durationVal, unit as any).asMilliseconds()) : null;

    const longDuration = expiresAt
      ? dayjs(expiresAt)
          .locale(guildConfig.language || "en")
          .fromNow(true)
      : null;

    // 3. Database Persistence
    try {
      await createInfraction(guild.id, targetUser.id, moderator.id, InfractionType.BAN, reason);
      if (expiresAt) {
        await createPunishment(guild.id, targetUser.id, moderator.id, PunishmentAction.BAN, expiresAt);
      }
    } catch (error) {
      logger.error({ message: "Database error during ban", error });
      return interaction.editReply(t("databaseError"));
    }

    // 4. Notification & Ban Execution
    const isTimed = !!expiresAt;
    const hasMember = guild.members.cache.has(targetUser.id);

    // Dynamic key generation for: successPermanent, successDuration, successDurationNoMember, etc.
    const typeKey = isTimed ? "Duration" : "Permanent";
    const memberSuffix = hasMember ? "" : "NoMember";
    const successKey = `message.success.${typeKey.toLowerCase()}${memberSuffix}`;
    const dmKey = `message.dm.${typeKey.toLowerCase()}`;

    // Attempt DM
    if (hasMember) {
      await targetUser.send(t(dmKey, { guild: guild.name, reason, duration: longDuration })).catch(() => null);
    }

    try {
      await guild.members.ban(targetUser, { reason, deleteMessageSeconds: preserve ? 0 : 604800 });

      await interaction.editReply({
        content: t(successKey, {
          user: targetUser.tag,
          duration: longDuration,
          case: guildConfig.caseId,
          confirm: client.allEmojis.get(client.config.emojis.confirm.id)?.format,
        }),
      });

      // 5. Logging
      const logReply = await modLog(
        {
          guild,
          user: targetUser,
          moderator,
          reason,
          action: isTimed ? "TIMED_BAN" : "BAN",
          duration: expiresAt ? dayjs(expiresAt) : undefined,
          caseID: guildConfig.caseId,
        },
        client,
      );

      if (logReply) await interaction.followUp(logReply.message);

      if (guildConfig.logConfig?.guildLogsChannelId) {
        await logBanAdd({ guild, user: targetUser, reason, guildConfig, t });
      }
    } catch (error) {
      logger.error({ message: "Execution error in ban", error });
      await interaction.editReply(t("failedToBan", { user: targetUser.tag }));
    }
  },
} as SlashCommandBase;

/**
 * Validates if the target can be banned.
 */
function validateBan(
  interaction: ChatInputCommandInteraction,
  target: User,
  config: GuildWithLogs,
  t: TFunction,
): string | null {
  if (target.id === interaction.user.id) return t("cantBanSelf");
  if (target.bot) return t("cantBanBot");

  const member = interaction.guild!.members.cache.get(target.id);
  if (member) {
    const isStaff =
      member.permissions.has(PermissionsBitField.Flags.BanMembers) || member.roles.cache.has(config.staffRoleId!);
    if (isStaff) return t("cantBanMod");

    const modMember = interaction.member as any;
    if (member.roles.highest.position >= modMember.roles.highest.position) return t("cantBanHigher");
  }

  return null;
}
