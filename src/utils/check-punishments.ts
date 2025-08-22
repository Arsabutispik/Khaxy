import dayjs from "dayjs";
import { logger } from "@lib";
import { modLog, returnWebhook, toStringId, WebhookType } from "./index.js";
import { ChannelType, Client, EmbedBuilder } from "discord.js";
import { deleteExpiredPunishments, getExpiredPunishments, getGuildConfig } from "@database";
import { PunishmentType } from "@constants";

export async function checkPunishments(client: Client) {
  // Fetch punishments that have expired
  const punishments = await getExpiredPunishments();
  for (const punishment of punishments) {
    const guild = client.guilds.cache.get(toStringId(punishment.guild_id));
    if (!guild) {
      logger.log({
        level: "warn",
        message: `Guild ${punishment.guild_id} not found in cache`,
        discord: false,
      });
      continue;
    }
    await guild.members.fetch();
    // Fetch guild configuration
    const guildConfig = await getGuildConfig(guild.id);
    if (!guildConfig) {
      logger.log({
        level: "warn",
        message: `Guild ${punishment.guild_id} not found in database`,
        discord: false,
      });
      continue;
    }

    const user = await client.users.fetch(toStringId(punishment.user_id));

    const staff = await client.users.fetch(toStringId(punishment.staff_id));
    const expiresDate = dayjs(punishment.expires_at);
    const createdAtDate = dayjs(punishment.created_at);
    const duration = dayjs(Date.now() - expiresDate.diff(createdAtDate));
    if (punishment.type === PunishmentType.BAN) {
      // If the punishment is a ban, unban the user
      const banned = await guild.bans.fetch(user.id).catch(() => null);
      if (!banned) {
        logger.log({
          level: "warn",
          message: `User ${user.tag} is not banned in guild ${guild.name}`,
          discord: false,
        });
        continue;
      }
      await guild.members.unban(user, client.i18next.getFixedT(guildConfig.language)("commands:ban.expired"));
      await modLog(
        {
          guild,
          user: user,
          action: "BAN_EXPIRED",
          moderator: staff,
          reason: client.i18next.getFixedT(guildConfig.language)("commands:ban.expired"),
          duration,
        },
        client,
      );
    } else if (punishment.type === PunishmentType.MUTE) {
      const member = await guild.members.fetch(user.id).catch(() => null);
      // If the punishment is a mute, remove the mute role and restore previous roles
      if (!member) {
        logger.log({
          level: "warn",
          message: `Member ${user.tag} not found in guild ${guild.name}`,
          discord: false,
        });
        continue;
      }
      const rolesToChange = [];
      if (punishment.previous_roles) {
        for (const role of [...punishment.previous_roles]) {
          // spread operator to clone the array
          if (!member.guild.roles.cache.get(toStringId(role))) {
            const idx = punishment.previous_roles.indexOf(role);
            if (idx !== -1) punishment.previous_roles.splice(idx, 1);
          }
        }
        rolesToChange.push(...punishment.previous_roles.map((role) => toStringId(role)));
      }
      await member.roles.set(rolesToChange);
      const logChannel = member.guild.channels.cache.get(toStringId(guildConfig.guild_member_logs_channel_id));
      if (logChannel?.type !== ChannelType.GuildText) return;
      const t = client.i18next.getFixedT(guildConfig.language, null, "check_punishments");
      const embed = new EmbedBuilder()
        .setTitle(t("embed.title"))
        .setDescription(
          t("embed.description", {
            user: member.user,
            added_roles: rolesToChange.map((role) => `<@&${role}>`).join(", "),
            removed_roles: member.guild.roles.cache.get(toStringId(guildConfig.mute_role_id))
              ? `<@&${guildConfig.mute_role_id}>`
              : "",
          }),
        )
        .setColor("Yellow")
        .setTimestamp();
      if (client.user) {
        embed.setFooter({
          text: client.user.tag,
          iconURL: client.user.displayAvatarURL(),
        });
      }
      const webhook = await returnWebhook(client, logChannel, member.guild.id, {
        id: guildConfig.guild_member_logs_channel_id,
        type: WebhookType.GUILD_MEMBER_LOGS,
      });
      await webhook.send({ embeds: [embed] });
    }
  }
  // Delete expired punishments from the database
  await deleteExpiredPunishments();
}
