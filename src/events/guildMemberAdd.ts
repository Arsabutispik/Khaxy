import type { EventBase } from "@customTypes";
import { ChannelType, EmbedBuilder, Events, PermissionsBitField, time, TimestampStyles } from "discord.js";
import { replacePlaceholders, returnWebhook, toStringId, WebhookType } from "@utils";
import { logger } from "@lib";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { getPunishmentsByUser, getGuildConfig } from "@database";

export default {
  name: Events.GuildMemberAdd,
  async execute(member) {
    console.log("I emitted guildMemberAdd event");
    // Fetch guild data from the database
    const guild_config = await getGuildConfig(member.guild.id);

    // If no guild data is found, exit the function
    if (!guild_config) return;

    // Fetch punishment data for the member from the database
    const punishments = await getPunishmentsByUser(member.guild.id, member.id);

    // If punishment data exists and the mute role is present, assign the mute role to the member
    if (punishments.length > 0 && guild_config.mute_role_id) {
      try {
        await member.roles.add(toStringId(guild_config.mute_role_id));
      } catch (error) {
        logger.log({
          level: "error",
          message: "Error assigning member role",
          error: error,
          meta: {
            guildID: member.guild.id,
            userID: member.id,
          },
        });
      }
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
    if (guild_config.join_message && guild_config.join_channel_id) {
      const welcome_channel = await member.guild.channels
        .fetch(toStringId(guild_config.join_channel_id))
        .catch(() => null);
      if (welcome_channel?.type === ChannelType.GuildText) {
        if (welcome_channel.permissionsFor(member.guild.members.me!)?.has(PermissionsBitField.Flags.SendMessages))
          await welcome_channel.send(replacePlaceholders(guild_config.join_message, replacements));
      }
    }

    // If no register channel is configured, assign the member role if present and exit the function
    if (!guild_config.register_channel_id && guild_config.member_role_id) {
      await member.roles.add(toStringId(guild_config.member_role_id)).catch(() => null);
    }

    // If a register welcome message and channel are configured, send the register welcome message to the channel
    if (guild_config.register_join_channel_id && guild_config.register_join_message) {
      const register_welcome_channel = await member.guild.channels
        .fetch(toStringId(guild_config.register_join_channel_id))
        .catch(() => null);
      if (register_welcome_channel?.type === ChannelType.GuildText) {
        if (
          register_welcome_channel.permissionsFor(member.guild.members.me!)?.has(PermissionsBitField.Flags.SendMessages)
        )
          await register_welcome_channel.send(replacePlaceholders(guild_config.register_join_message, replacements));
        // If the guild set up an unverified role, assign it to the member
        if (guild_config.unverified_role_id) {
          await member.roles.add(toStringId(guild_config.unverified_role_id)).catch(() => null);
        }
      }
    }
    if (guild_config.guild_logs_channel_id) {
      const channel = await member.guild.channels
        .fetch(toStringId(guild_config.guild_logs_channel_id))
        .catch(() => null);
      if (channel?.type === ChannelType.GuildText) {
        const webhook = await returnWebhook(member.client, channel, member.guild.id, {
          id: guild_config.guild_logs_webhook_id,
          type: WebhookType.GUILD_LOGS,
        });
        const t = member.client.i18next.getFixedT(guild_config.language, "events", "guildMemberAdd");
        const embed = new EmbedBuilder()
          .setTitle(t("embed.title"))
          .setColor("Green")
          .setThumbnail(member.user.displayAvatarURL())
          .setDescription(
            t("embed.description", {
              user: member.user,
              timestamp: time(member.user.createdAt, TimestampStyles.RelativeTime),
              member_count: member.guild.memberCount.toString(),
            }),
          )
          .setTimestamp();
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
              meta: {
                guildId: member.guild.id,
                userId: member.user.id,
              },
            });
          });
      }
    }
  },
} satisfies EventBase<Events.GuildMemberAdd>;
