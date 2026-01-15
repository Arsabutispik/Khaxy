import { PunishmentAction, getOrCreateGuild, getUserInfractions, createPunishment } from "@repo/database";
import { Guild, GuildMember, PermissionsBitField, User } from "discord.js";
import { modLog } from "@utils";
import dayjs from "dayjs";
import { logger } from "@lib";
import dayjsduration from "dayjs/plugin/duration.js";
dayjs.extend(dayjsduration);
export async function infractionsPunishment(guild: Guild, member: GuildMember, moderator: User) {
  const guildConfig = await getOrCreateGuild(guild.id);
  if (!guildConfig) return "Guild not registered in database";
  const t = guild.client.i18next.getFixedT(guildConfig.language, null, "infractions_punishment");
  const infractions = await getUserInfractions(guild.id, member.id);
  const activeInfractions = infractions.filter((infraction) =>
    infraction.expiresAt ? infraction.expiresAt.getTime() > new Date().getTime() : true,
  );
  // We sort configs descending to easily find the "highest applicable" level
  const sortedConfigs = guildConfig.punishmentConfigs.sort((a, b) => b.level - a.level);

  const punishment = sortedConfigs.find((config) => activeInfractions.length >= config.level);
  if (!punishment) return null;
  switch (punishment.action) {
    case PunishmentAction.MUTE: {
      try {
        if (!guildConfig.muteRoleId) return t(($) => $.no_mute_role);
        const muteRole = guild.roles.cache.get(guildConfig.muteRoleId);
        if (!muteRole) return t(($) => $.no_mute_role);
        if (member.roles.cache.has(muteRole.id)) return t(($) => $.already_muted);
        if (!guild.members.me?.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
          return t(($) => $.no_permission);
        }
        const filteredRoles = member.roles.cache
          .filter((role) => role.id !== guild.id)
          .filter((role) => role.id !== guild.roles.premiumSubscriberRole?.id)
          .filter((role) => role.position < guild.members.me!.roles.highest.position)
          .map((role) => role.id);
        if (guildConfig.muteGetAllRoles) {
          try {
            await createPunishment(
              guild.id,
              member.id,
              moderator.id,
              PunishmentAction.MUTE,
              new Date(Date.now() + punishment.duration! * 1000),
              filteredRoles,
            );
          } catch (error) {
            logger.error({
              message: `Error while putting punishments to database for user ${member.user.username} from guild ${guild.name}`,
              error,
              guild: `${guild.name} (${guild.id})`,
              user: `${moderator.username} (${moderator.id})`,
            });
            return t(($) => $.database_error);
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
            return t(($) => $.role_error);
          }
        } else {
          try {
            await createPunishment(
              guild.id,
              member.id,
              moderator.id,
              PunishmentAction.MUTE,
              new Date(Date.now() + punishment.duration! * 1000),
            );
          } catch (error) {
            logger.error({
              message: `Error while putting punishments to database for user ${member.user.username} from guild ${guild.name}`,
              error,
              guild: `${guild.name} (${guild.id})`,
              user: `${moderator.username} (${moderator.id})`,
            });
            return t(($) => $.database_error);
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
            return t(($) => $.role_error);
          }
        }
        const dayjsDuration = dayjs.duration(punishment.duration! * 1000);
        const longDuration = dayjs(dayjs().add(dayjsDuration))
          .locale(guildConfig.language || "en")
          .fromNow(true);
        await member
          .send(
            t(($) => $.messages.mute, {
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
            reason: t(($) => $.reason, { level: activeInfractions }),
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
        return t(($) => $.mute_error);
      }
      break;
    }
    case PunishmentAction.KICK: {
      await member
        .send(t(($) => $.messages.kick, { guild: guild.name, reason: t("reason", { level: activeInfractions }) }))
        .catch(() => null);
      try {
        await member.kick(t(($) => $.reason, { level: activeInfractions }));
        const kickResult = await modLog(
          {
            guild: guild,
            action: "KICK",
            user: member.user,
            moderator,
            reason: t(($) => $.reason, { level: activeInfractions }),
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
      await member
        .send(t(($) => $.messages.ban, { guild: guild.name, reason: t("reason", { level: activeInfractions }) }))
        .catch(() => null);
      try {
        await member.ban({ reason: t(($) => $.reason, { level: activeInfractions }) });
        const banResult = await modLog(
          {
            guild: guild,
            action: "BAN",
            user: member.user,
            moderator,
            reason: t(($) => $.reason, { level: activeInfractions }),
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
        await createPunishment(
          guild.id,
          member.id,
          moderator.id,
          PunishmentAction.BAN,
          new Date(Date.now() + dayjsDuration.asMilliseconds()),
        );
      } catch (error) {
        logger.error({
          message: `Error while inserting punishment/infraction for user ${member.user.username} from guild ${guild.name}`,
          error,
          guild: `${guild.name} (${guild.id})`,
          user: `${moderator.username} (${moderator.id})`,
        });
        return t(($) => $.database_error);
      }
      await member
        .send(
          t(($) => $.messages.temp_ban, {
            guild: guild.name,
            reason: t("reason", { level: activeInfractions }),
            duration: longDuration,
          }),
        )
        .catch(() => null);
      try {
        await guild.members.ban(member.user, {
          reason: t(($) => $.reason, { level: activeInfractions }),
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
          reason: t(($) => $.reason, { level: activeInfractions }),
          duration: dayjs(Date.now() + dayjsDuration.asMilliseconds()),
          caseID: guildConfig.caseId,
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
