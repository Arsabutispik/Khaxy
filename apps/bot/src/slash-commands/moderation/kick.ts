import type { SlashCommandBase } from "@types";
import {
  ChannelType,
  EmbedBuilder,
  InteractionContextType,
  PermissionsBitField,
  SlashCommandBuilder,
  time as formatted_time,
  TimestampStyles,
} from "discord.js";
import { logger } from "@lib";
import { modLog, returnWebhook, WebhookType } from "@utils";
import { createInfraction, InfractionType } from "@repo/database";

export default {
  memberPermissions: [PermissionsBitField.Flags.KickMembers],
  clientPermissions: [PermissionsBitField.Flags.KickMembers],
  data: new SlashCommandBuilder()
    .setName("kick")
    .setNameLocalizations({
      tr: "at",
    })
    .setDescription("Kick a member from the server")
    .setDescriptionLocalizations({
      tr: "Sunucudan bir üyeyi atar",
    })
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers)
    .addUserOption((option) =>
      option
        .setName("user")
        .setNameLocalizations({
          tr: "kullanıcı",
        })
        .setDescription("The user to kick")
        .setDescriptionLocalizations({
          tr: "Atılacak kullanıcı",
        })
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setNameLocalizations({
          tr: "sebep",
        })
        .setDescription("The reason for the kick")
        .setDescriptionLocalizations({
          tr: "Atılma sebebi",
        }),
    )
    .addBooleanOption((option) =>
      option
        .setName("clear")
        .setNameLocalizations({
          tr: "temizle",
        })
        .setDescription("Clears up to 7 days of messages from the user")
        .setDescriptionLocalizations({
          tr: "Kullanıcının en fazla 7 günlük mesajlarını temizler",
        }),
    ),
  async execute(interaction, guildConfig) {
    const client = interaction.client;
    const t = client.i18next.getFixedT(guildConfig.language || "en", "commands", "kick");

    const member = interaction.options.getMember("user");
    const reason = interaction.options.getString("reason") || t("no_reason");
    const clear = interaction.options.getBoolean("clear") || false;
    if (!member) {
      await interaction.reply(t("no_member"));
      return;
    }
    if (member.id === interaction.user.id) {
      await interaction.reply(t("cant_kick_yourself"));
      return;
    }
    if (member.user.bot) {
      await interaction.reply(t("cant_kick_bot"));
      return;
    }
    if (member.roles.highest.position >= interaction.member.roles.highest.position) {
      await interaction.reply(t("cant_kick_higher"));
      return;
    }
    if (
      member.permissions.has(PermissionsBitField.Flags.KickMembers) ||
      (guildConfig.staffRoleId && member.roles.cache.has(guildConfig.staffRoleId))
    ) {
      await interaction.reply(t("cant_kick_mod"));
      return;
    }
    if (!member.kickable) {
      await interaction.reply(t("cant_kick"));
      return;
    }
    await createInfraction(interaction.guildId, member.id, interaction.user.id, InfractionType.KICK, reason);

    // Attempt to kick or softban first before replying
    let kickSuccess = false;
    if (clear) {
      try {
        await member.ban({ reason: `Softban- ${reason}`, deleteMessageSeconds: 604800 });
        await interaction.guild.members.unban(member, "softban");
        kickSuccess = true;
      } catch (error) {
        logger.error({
          message: `Error while banning user ${member.user.tag} from guild ${interaction.guild.name}`,
          error,
          guild: `${interaction.guild.name} (${interaction.guild.id})`,
          user: `${interaction.user.tag} (${interaction.user.id})`,
        });
      }
    } else {
      try {
        await member.kick(reason);
        kickSuccess = true;
      } catch (error) {
        logger.error({
          message: `Error while kicking user ${member.user.tag} from guild ${interaction.guild.name}`,
          error,
          guild: interaction.guild.id,
          user: interaction.user.id,
        });
      }
    }

    if (!kickSuccess) {
      await interaction.reply(clear ? t("clearFail") : t("fail"));
      return;
    }

    // Now send success messages
    try {
      await member.send(
        t("message.dm", {
          confirm: client.allEmojis.get(client.config.emojis.confirm.id)?.format,
          guild: interaction.guild.name,
          reason,
        }),
      );
      await interaction.reply(
        t("message.success", {
          user: member.user.tag,
          case: guildConfig.caseId,
          confirm: client.allEmojis.get(client.config.emojis.confirm.id)?.format,
        }),
      );
    } catch {
      await interaction.reply(
        t("message.fail", {
          user: member.user.tag,
          case: guildConfig.caseId,
          confirm: client.allEmojis.get(client.config.emojis.confirm.id)?.format,
        }),
      );
    }
    const reply = await modLog(
      { guild: interaction.guild, action: "KICK", user: member.user, moderator: interaction.user, reason: reason },
      interaction.client,
    );
    if (reply) {
      if (interaction.replied) {
        await interaction.followUp(reply.message);
      } else {
        await interaction.reply(reply.message);
      }
    }
    if (guildConfig.logConfig?.guildLogsChannelId) {
      const channel = interaction.guild.channels.cache.get(guildConfig.logConfig.guildLogsChannelId);
      if (channel?.type === ChannelType.GuildText) {
        const webhook = await returnWebhook(interaction.client, channel, interaction.guild.id, guildConfig, {
          id: guildConfig.logConfig.guildLogsWebhookId,
          type: WebhookType.GUILD_LOGS,
        });
        if (!webhook) return;
        const embed = new EmbedBuilder()
          .setTitle(t("embed.title"))
          .setColor("Red")
          .setThumbnail(member.displayAvatarURL())
          .setDescription(
            t("embed.description", {
              user: member.user,
              timestamp:
                member && member.joinedAt
                  ? formatted_time(member.joinedAt, TimestampStyles.RelativeTime)
                  : t("neverJoined"),
            }),
          )
          .addFields([
            {
              name: t("embed.fields.reason"),
              value: reason,
            },
          ])
          .setFooter({
            text: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTimestamp();
        await webhook
          .send({
            embeds: [embed],
            allowedMentions: { parse: [] }, // Prevent mentions in the log
          })
          .catch((error) => {
            logger.log({
              level: "error",
              message: "Error sending ban log",
              error: error,
              meta: {
                guildID: interaction.guild.id,
                userID: interaction.user.id,
              },
            });
          });
      }
    }
  },
} as SlashCommandBase;
