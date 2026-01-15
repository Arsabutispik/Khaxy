import type { EventBase } from "@types";
import { ChannelType, EmbedBuilder, Events, PermissionsBitField, time, TimestampStyles } from "discord.js";
import { replacePlaceholders, returnWebhook, WebhookType } from "@utils";
import { logger } from "@lib";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { getPunishmentsByUser, getOrCreateGuild } from "@repo/database";

export default {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const guildConfig = await getOrCreateGuild(member.guild.id);
    if (!guildConfig) return;

    const punishments = await getPunishmentsByUser(member.guild.id, member.id);

    if (punishments.length > 0 && guildConfig.muteRoleId) {
      await member.roles.add(guildConfig.muteRoleId).catch((error) => {
        logger.log({
          level: "error",
          error,
          message: "Error reapplying mute role to member on join",
          meta: {
            guildID: member.guild.id,
            userID: member.id,
          },
        });
      });
    }
    dayjs.extend(relativeTime);
    const replacements = {
      user: member.toString(),
      server: member.guild.name,
      memberCount: member.guild.memberCount.toString(),
      name: member.user.username,
      joinPosition: (member.guild.memberCount - 1).toString(),
      createdAt: dayjs(member.user.createdAt).format("DD/MM/YYYY"),
      createdAgo: dayjs(member.user.createdAt).fromNow(),
    };
    // If a welcome message and channel are configured, send the welcome message to the channel
    if (guildConfig.joinMessage && guildConfig.joinChannelId) {
      const welcomeChannel = member.guild.channels.cache.get(guildConfig.joinChannelId);
      if (
        welcomeChannel?.type === ChannelType.GuildText &&
        welcomeChannel.permissionsFor(member.guild.members.me!)?.has(PermissionsBitField.Flags.SendMessages)
      ) {
        await welcomeChannel.send(replacePlaceholders(guildConfig.joinMessage, replacements));
      }
    }
    // If the guild does not use the register system and a member role is configured, assign the member role to the member
    if (!guildConfig.registerJoinMessage && guildConfig.memberRoleId) {
      await member.roles.add(guildConfig.memberRoleId).catch((error) => {
        logger.log({
          level: "error",
          error,
          message: "Error assigning member role",
          meta: {
            guildID: member.guild.id,
            userID: member.id,
          },
        });
      });
    }

    // If a register welcome message and channel are configured, send the register welcome message to the channel
    if (guildConfig.registerJoinChannelId && guildConfig.registerJoinMessage) {
      const registerWelcomeChannel = member.guild.channels.cache.get(guildConfig.registerJoinChannelId);
      if (
        registerWelcomeChannel?.type === ChannelType.GuildText &&
        registerWelcomeChannel.permissionsFor(member.guild.members.me!)?.has(PermissionsBitField.Flags.SendMessages)
      ) {
        await registerWelcomeChannel.send(replacePlaceholders(guildConfig.registerJoinMessage, replacements));
        // If the guild set up an unverified role, assign it to the member
        if (guildConfig.unverifiedRoleId) {
          await member.roles.add(guildConfig.unverifiedRoleId).catch((error) => {
            logger.log({
              level: "error",
              error,
              message: "Error assigning unverified role",
              meta: {
                guildID: member.guild.id,
                userID: member.id,
              },
            });
          });
        }
      }
    }
    if (guildConfig.logConfig?.guildLogsChannelId) {
      const channel = member.guild.channels.cache.get(guildConfig.logConfig.guildLogsChannelId);
      if (channel?.type !== ChannelType.GuildText) return;
      const webhook = await returnWebhook(member.client, channel, member.guild.id, guildConfig, {
        id: guildConfig.logConfig.guildLogsWebhookId,
        type: WebhookType.GUILD_LOGS,
      });
      const t = member.client.i18next.getFixedT(guildConfig.language, "events", "guildMemberAdd");
      const embed = new EmbedBuilder()
        .setTitle(t(($) => $.embed.title))
        .setColor("Green")
        .setThumbnail(member.user.displayAvatarURL())
        .setDescription(
          t(($) => $.embed.description, {
            user: member.user,
            timestamp: time(member.user.createdAt, TimestampStyles.RelativeTime),
            member_count: member.guild.memberCount.toString(),
          }),
        )
        .setTimestamp();
      if (!webhook) return;
      await webhook
        .send({
          embeds: [embed],
          allowedMentions: { parse: [] }, // Prevent mentions in the log
        })
        .catch((error) => {
          logger.log({
            level: "error",
            message: "Error sending guild member add log",
            error: error,
            guildId: member.guild.id,
            userId: member.user.id,
          });
        });
    }
  },
} satisfies EventBase<Events.GuildMemberAdd>;
