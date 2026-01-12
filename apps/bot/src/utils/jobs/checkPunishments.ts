import dayjs from "dayjs";
import { Client } from "discord.js";
import { deletePunishment, getExpiredPunishments, getOrCreateGuild, PunishmentAction } from "@repo/database";
import { modLog, logMemberAction } from "@utils";
import { logger } from "@lib";

export async function checkPunishments(client: Client) {
  const punishments = await getExpiredPunishments();

  for (const punishment of punishments) {
    try {
      const guild = client.guilds.cache.get(punishment.guildId);
      if (!guild) {
        // Guild not in cache, delete the orphaned punishment
        await deletePunishment(punishment.guildId, punishment.userId, punishment.type);
        continue;
      }

      const guildConfig = await getOrCreateGuild(guild.id);
      if (!guildConfig) {
        await deletePunishment(punishment.guildId, punishment.userId, punishment.type);
        continue;
      }

      const user = await client.users.fetch(punishment.userId).catch(() => null);
      const staff = await client.users.fetch(punishment.staffId).catch(() => null);

      if (!user) {
        // User doesn't exist anymore, delete the punishment
        await deletePunishment(punishment.guildId, punishment.userId, punishment.type);
        continue;
      }

      const t = client.i18next.getFixedT(guildConfig.language);
      const expiresDate = dayjs(punishment.expiresAt);
      const createdAtDate = dayjs(punishment.created_at);
      const duration = dayjs(Date.now() - expiresDate.diff(createdAtDate));

      // ==========================================================================================
      // CASE A: EXPIRED BAN
      // ==========================================================================================
      if (punishment.type === PunishmentAction.BAN) {
        const banned = await guild.bans.fetch(user.id).catch(() => null);
        if (!banned) {
          // Already unbanned, just delete the punishment record
          await deletePunishment(punishment.guildId, punishment.userId, punishment.type);
          continue;
        }

        const reason = t("commands:ban.expired");
        await guild.members.unban(user, reason);

        await modLog(
          {
            guild,
            user,
            action: "BAN_EXPIRED",
            moderator: staff,
            reason,
            duration,
          },
          client,
        );

        // Delete punishment after successful processing
        await deletePunishment(punishment.guildId, punishment.userId, punishment.type);
      }

      // ==========================================================================================
      // CASE B: EXPIRED MUTE (Using logMemberAction)
      // ==========================================================================================
      else if (punishment.type === PunishmentAction.MUTE) {
        const member = await guild.members.fetch(user.id).catch(() => null);
        if (!member) {
          // Member left, delete the punishment
          await deletePunishment(punishment.guildId, punishment.userId, punishment.type);
          continue;
        }

        const muteRoleId = guildConfig.muteRoleId;

        // 1. Calculate which roles to restore (that still exist in the guild)
        const rolesToRestore = punishment.previousRoles.filter(
          (roleId) => guild.roles.cache.has(roleId) && roleId !== muteRoleId,
        );

        // 2. Apply Changes
        if (rolesToRestore.length > 0) {
          // Restore specific list of roles (replaces current roles)
          await member.roles.set(rolesToRestore);
        } else {
          // Just remove the mute role
          if (muteRoleId) await member.roles.remove(muteRoleId).catch(() => null);
        }

        // 3. Log it using your EXISTING Member Logger
        // We manually trigger this because the automatic event listener ignores Bot actions
        await logMemberAction({
          member,
          action: "rolesUpdate",
          guildConfig,
          t,
          executor: client.user, // The Bot did it
          reason: t("commands:mute.expired"), // "Mute expired"
          addedRoles: rolesToRestore.map((id) => `<@&${id}>`), // Format for embed
          removedRoles: muteRoleId ? [`<@&${muteRoleId}>`] : [],
        });

        // Delete punishment after successful processing
        await deletePunishment(punishment.guildId, punishment.userId, punishment.type);
      }
    } catch (error) {
      logger.error({
        message: `Error processing expired punishment for user ${punishment.userId} in guild ${punishment.guildId}`,
        error,
        meta: {
          punishmentType: punishment.type,
          guildId: punishment.guildId,
          userId: punishment.userId,
        },
      });
      // Don't delete the punishment if there was an error - it will be retried next cycle
    }
  }
}
