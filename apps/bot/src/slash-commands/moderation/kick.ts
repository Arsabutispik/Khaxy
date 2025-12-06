import type { SlashCommandBase } from "src/types/index.js";
import {
  ChannelType,
  EmbedBuilder,
  InteractionContextType,
  MessageFlagsBitField,
  PermissionsBitField,
  SlashCommandBuilder,
  time as formatted_time,
  TimestampStyles,
} from "discord.js";
import { logger } from "src/lib/index.js";
import { toStringId, addInfraction, modLog, returnWebhook, WebhookType } from "src/utils/index.js";
import { getGuildConfig } from "src/database/index.js";
import { InfractionType } from "src/constants/index.js";

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
  async execute(interaction) {
    const client = interaction.client;
    const guildConfig = await getGuildConfig(interaction.guildId);
    if (!guildConfig) {
      await interaction.reply({
        content: "This server is not registered in the database. This shouldn't happen, please contact developers",
        flags: MessageFlagsBitField.Flags.Ephemeral,
      });
      return;
    }
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
      member.roles.cache.has(toStringId(guildConfig.staff_role_id))
    ) {
      await interaction.reply(t("cant_kick_mod"));
      return;
    }
    if (!member.kickable) {
      await interaction.reply(t("cant_kick"));
      return;
    }
    await addInfraction({
      guild: interaction.guild,
      member: member.id,
      reason,
      type: InfractionType.KICK,
      moderator: interaction.user.id,
    });
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
          case: guildConfig.case_id,
          confirm: client.allEmojis.get(client.config.emojis.confirm.id)?.format,
        }),
      );
    } catch {
      await interaction.reply(
        t("message.fail", {
          user: member.user.tag,
          case: guildConfig.case_id,
          confirm: client.allEmojis.get(client.config.emojis.confirm.id)?.format,
        }),
      );
    }
    if (clear) {
      try {
        await member.ban({ reason: `Softban- ${reason}`, deleteMessageSeconds: 604800 });
        await interaction.guild.members.unban(member, "softban");
      } catch (error) {
        await interaction.reply(t("clear_fail"));
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
      } catch (error) {
        await interaction.reply(t("fail"));
        logger.error({
          message: `Error while kicking user ${member.user.tag} from guild ${interaction.guild.name}`,
          error,
          guild: interaction.guild.id,
          user: interaction.user.id,
        });
      }
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
    if (guildConfig.guild_logs_channel_id) {
      const channel = interaction.guild.channels.cache.get(toStringId(guildConfig.guild_logs_channel_id));
      if (channel?.type === ChannelType.GuildText) {
        const webhook = await returnWebhook(interaction.client, channel, interaction.guild.id, {
          id: guildConfig.guild_logs_webhook_id,
          type: WebhookType.GUILD_LOGS,
        });
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
                  : t("never_joined"),
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
