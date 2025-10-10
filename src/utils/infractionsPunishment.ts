import { createPunishment, getActivePunishments, getGuildConfig } from "@database";
import { getGuildPunishmentConfig } from "@database";
import { PunishmentAction } from "@prisma/client";
import { Guild, GuildMember, PermissionsBitField, User } from "discord.js";
import { toStringId } from "./utils.js";
import { modLog } from "./mod-log.js";
import dayjs from "dayjs";
import { logger } from "@lib";
import { PunishmentType } from "@constants";
import dayjsduration from "dayjs/plugin/duration.js";
dayjs.extend(dayjsduration);
export async function infractionsPunishment(guild: Guild, member: GuildMember, moderator: User) {
  const guildConfig = await getGuildConfig(guild.id);
  if (!guildConfig) return "Guild not registered in database";
  const t = guild.client.i18next.getFixedT(guildConfig.language, null, "infractions_punishment");
  const activeInfractions = await getActivePunishments(guild.id, member.id);
  const punishment = await getGuildPunishmentConfig(guild.id, activeInfractions);
  if (!punishment) return null;
  switch (punishment.action) {
    case PunishmentAction.MUTE: {
      try {
        if (!guildConfig.mute_role_id) return t("no_mute_role");
        const muteRole = guild.roles.cache.get(toStringId(guildConfig.mute_role_id));
        if (!muteRole) return t("no_mute_role");
        if (member.roles.cache.has(muteRole.id)) return t("already_muted");
        if (!guild.members.me?.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
          return t("no_permission");
        }
        const filteredRoles = member.roles.cache
          .filter((role) => role.id !== guild.id)
          .filter((role) => role.id !== guild.roles.premiumSubscriberRole?.id)
          .filter((role) => role.position < guild.members.me!.roles.highest.position)
          .map((role) => BigInt(role.id));
        if (guildConfig.mute_get_all_roles) {
          try {
            await createPunishment(guild.id, {
              user_id: BigInt(member.id),
              type: PunishmentType.MUTE,
              staff_id: BigInt(moderator.id),
              expires_at: new Date(Date.now() + punishment.duration! * 1000),
              created_at: new Date(),
              previous_roles: filteredRoles,
            });
          } catch (error) {
            logger.error({
              message: `Error while putting punishments to database for user ${member.user.username} from guild ${guild.name}`,
              error,
              guild: `${guild.name} (${guild.id})`,
              user: `${moderator.username} (${moderator.id})`,
            });
            return t("database_error");
          }
          try {
            await member.roles.set([muteRole.id]);
          } catch (error) {
            logger.error({
              message: `Error while setting roles for user ${member.user.username} from guild ${guild.name}`,
              error,
              guild: `${guild.name} (${guild.id})`,
              user: `${moderator.username} (${moderator.id})`,
            });
            return t("role_error");
          }
        } else {
          try {
            await createPunishment(guild.id, {
              user_id: BigInt(member.id),
              type: PunishmentType.MUTE,
              staff_id: BigInt(moderator.id),
              expires_at: new Date(Date.now() + punishment.duration! * 1000),
              created_at: new Date(),
            });
          } catch (error) {
            logger.error({
              message: `Error while putting punishments to database for user ${member.user.username} from guild ${guild.name}`,
              error,
              guild: `${guild.name} (${guild.id})`,
              user: `${moderator.username} (${moderator.id})`,
            });
            return t("database_error");
          }
          try {
            await member.roles.add(muteRole);
          } catch (error) {
            logger.error({
              message: `Error while setting roles for user ${member.user.username} from guild ${guild.name}`,
              error,
              guild: `${guild.name} (${guild.id})`,
              user: `${moderator.username} (${moderator.id})`,
            });
            return t("role_error");
          }
        }
        const dayjsDuration = dayjs.duration(punishment.duration! * 1000);
        const longDuration = dayjs(dayjs().add(dayjsDuration))
          .locale(guildConfig.language || "en")
          .fromNow(true);
        await member
          .send(
            t("message", {
              guild: guild.name,
              reason: t("reason", { level: activeInfractions }),
              duration: longDuration,
            }),
          )
          .catch(() => null);
        const muteResult = await modLog(
          {
            guild: guild,
            action: "MUTE",
            user: member.user,
            moderator,
            reason: t("reason", { level: activeInfractions }),
            duration: dayjs(Date.now() + dayjsDuration.asMilliseconds()),
          },
          guild.client,
        );
        if (muteResult) {
          return muteResult.message;
        }
      } catch (error) {
        logger.error({
          message: "An error occurred while muting a user",
          error,
          guild: guild.id,
        });
        return t("mute_error");
      }
      break;
    }
    case PunishmentAction.KICK: {
      try {
        await member.kick(t("reason", { level: activeInfractions }));
        const kickResult = await modLog(
          {
            guild: guild,
            action: "KICK",
            user: member.user,
            moderator,
            reason: t("reason", { level: activeInfractions }),
          },
          guild.client,
        );
        if (kickResult) {
          return kickResult.message;
        }
      } catch (error) {
        logger.error({
          message: "An error occurred while kicking a user",
          error,
          guild: guild.id,
        });
      }
      break;
    }
    case PunishmentAction.BAN: {
      try {
        await member.ban({ reason: t("reason", { level: activeInfractions }) });
        const banResult = await modLog(
          {
            guild: guild,
            action: "BAN",
            user: member.user,
            moderator,
            reason: t("reason", { level: activeInfractions }),
          },
          guild.client,
        );
        if (banResult) {
          return banResult.message;
        }
      } catch (error) {
        logger.error({
          message: "An error occurred while banning a user",
          error,
          guild: guild.id,
        });
      }
      break;
    }
    case PunishmentAction.TEMPBAN: {
      const dayjsDuration = dayjs.duration(punishment.duration! * 1000);
      const longDuration = dayjs(dayjs().add(dayjsDuration))
        .locale(guildConfig.language || "en")
        .fromNow(true);

      try {
        await createPunishment(guild.id, {
          type: PunishmentType.BAN,
          created_at: new Date(),
          expires_at: new Date(Date.now() + dayjsDuration.asMilliseconds()),
          user_id: BigInt(member.id),
          staff_id: BigInt(moderator.id),
        });
      } catch (error) {
        logger.error({
          message: `Error while inserting punishment/infraction for user ${member.user.username} from guild ${guild.name}`,
          error,
          guild: `${guild.name} (${guild.id})`,
          user: `${moderator.username} (${moderator.id})`,
        });
        return t("database_error");
      }
      try {
        await member.send(
          t("message", {
            guild,
            reason: t("reason", { level: activeInfractions }),
            duration: longDuration,
          }),
        );
      } catch {}
      try {
        await guild.members.ban(member.user, {
          reason: t("reason", { level: activeInfractions }),
          deleteMessageSeconds: 604800,
        });
      } catch (error) {
        logger.error({
          message: `Error while banning user ${member.user.username} from guild ${guild.name}`,
          error,
          guild: `${guild.name} (${guild.id})`,
          user: `${member.user.username} (${member.user.id})`,
        });
      }
      const reply = await modLog(
        {
          guild,
          user: member.user,
          action: "TIMED_BAN",
          moderator,
          reason: t("reason", { level: activeInfractions }),
          duration: dayjs(Date.now() + dayjsDuration.asMilliseconds()),
          caseID: guildConfig.case_id,
        },
        guild.client,
      );
      if (reply) {
        return reply.message;
      }
      break;
    }
  }
}
