import { getActivePunishments, getGuildConfig } from "@database";
import { getGuildPunishmentConfig } from "../database/queries/guild-punishment-config";
import { PunishmentAction } from "@prisma/client";
import { Guild, GuildMember, User } from "discord.js";
import { toStringId } from "./utils";
import { modLog } from "./mod-log";
import dayjs from "dayjs";
import { logger } from "@lib";

export async function infractionsPunishment(guild: Guild, member: GuildMember, moderator: User) {
  const guildConfig = await getGuildConfig(guild.id);
  if (!guildConfig) return;
  const t = guild.client.i18next.getFixedT(guildConfig.language, null, "infractions_punishment");
  const activeInfractions = await getActivePunishments(guild.id, member.id);
  const newLevel = activeInfractions + 1;
  const punishment = await getGuildPunishmentConfig(guild.id, newLevel);
  if (!punishment) return;
  switch (punishment.action) {
    case PunishmentAction.MUTE: {
      try {
        if (!guildConfig.mute_role_id) return;
        const muteRole = guild.roles.cache.get(toStringId(guildConfig.mute_role_id));
        if (!muteRole) return;
        await member.roles.add(muteRole, t("reason", { level: newLevel }));
        const muteResult = await modLog(
          {
            guild: guild,
            action: "MUTE",
            user: member.user,
            moderator,
            reason: t("reason", { level: newLevel }),
            duration: dayjs().add(punishment.duration!, "seconds"),
          },
          guild.client,
        );
        if (muteResult) {
          return muteResult;
        }
      } catch (error) {
        logger.error({
          message: "An error occurred while muting a user",
          error,
          guild: guild.id,
        });
      }
      break;
    }
    case PunishmentAction.KICK: {
      try {
        await member.kick(t("reason", { level: newLevel }));
        const kickResult = await modLog(
          {
            guild: guild,
            action: "KICK",
            user: member.user,
            moderator,
            reason: t("reason", { level: newLevel }),
          },
          guild.client,
        );
        if (kickResult) {
          return kickResult;
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
        await member.ban({ reason: t("reason", { level: newLevel }) });
        const banResult = await modLog(
          {
            guild: guild,
            action: "BAN",
            user: member.user,
            moderator,
            reason: t("reason", { level: newLevel }),
          },
          guild.client,
        );
        if (banResult) {
          return banResult;
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
      try {
        await member.ban({ reason: t("reason", { level: newLevel }) });
        const tempBanResult = await modLog(
          {
            guild: guild,
            action: "TIMED_BAN",
            user: member.user,
            moderator,
            reason: t("reason", { level: newLevel }),
            duration: dayjs().add(punishment.duration!, "seconds"),
          },
          guild.client,
        );
        if (tempBanResult) {
          return tempBanResult;
        }
      } catch (error) {
        logger.error({
          message: "An error occurred while tempbanning a user",
          error,
          guild: guild.id,
        });
      }
      break;
    }
  }
}
