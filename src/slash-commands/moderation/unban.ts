import type { SlashCommandBase } from "@customTypes";
import {
  ChannelType,
  EmbedBuilder,
  InteractionContextType,
  MessageFlagsBitField,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import { logger } from "@lib";
import { modLog, returnWebhook, toStringId, WebhookType } from "@utils";
import { getGuildConfig } from "@database";

export default {
  memberPermissions: [PermissionsBitField.Flags.BanMembers],
  clientPermissions: [PermissionsBitField.Flags.BanMembers],
  data: new SlashCommandBuilder()
    .setName("unban")
    .setNameLocalizations({
      tr: "yasak-kaldır",
    })
    .setDescription("Unban a user from the server")
    .setDescriptionLocalizations({
      tr: "Bir kullanıcının yasağını kaldırır",
    })
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers)
    .addUserOption((option) =>
      option
        .setName("user")
        .setNameLocalizations({
          tr: "kullanıcı",
        })
        .setDescription("The user to unban")
        .setDescriptionLocalizations({
          tr: "Yasağı kaldırılacak kullanıcı",
        })
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setNameLocalizations({
          tr: "sebep",
        })
        .setDescription("The reason for unbanning the user")
        .setDescriptionLocalizations({
          tr: "Kullanıcının yasağının kaldırılma sebebi",
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
    const t = client.i18next.getFixedT(guildConfig.language, "commands", "unban");
    const user = interaction.options.getUser("user", true);
    if (!user) {
      await interaction.reply({ content: t("no_user"), flags: MessageFlagsBitField.Flags.Ephemeral });
      return;
    }
    const banned = await interaction.guild.bans.fetch(user.id).catch(() => null);
    if (!banned) {
      await interaction.reply({
        content: t("not_banned", { user: user.tag }),
        flags: MessageFlagsBitField.Flags.Ephemeral,
      });
      return;
    }
    const reason = interaction.options.getString("reason") || t("no_reason");
    try {
      await interaction.guild.members.unban(user, reason);
      await interaction.reply({
        content: t("success", {
          user: user.tag,
          confirm: client.allEmojis.get(client.config.emojis.confirm.id)?.format,
          case: guildConfig.case_id,
        }),
        flags: MessageFlagsBitField.Flags.Ephemeral,
      });
    } catch (error) {
      await interaction.reply({
        content: t("error", { error: error.message }),
        flags: MessageFlagsBitField.Flags.Ephemeral,
      });
      logger.error({
        message: `An error occurred while unbanning a user. Error: ${error.message}`,
        error,
        guild: interaction.guild.id,
        user: interaction.user.id,
      });
    }
    if (guildConfig.guild_logs_channel_id) {
      const channel = await interaction.guild.channels
        .fetch(toStringId(guildConfig.guild_logs_channel_id))
        .catch(() => null);
      if (channel?.type === ChannelType.GuildText) {
        const webhook = await returnWebhook(interaction.client, channel, interaction.guild.id, {
          id: guildConfig.guild_logs_webhook_id,
          type: WebhookType.GUILD_LOGS,
        });
        const embed = new EmbedBuilder()
          .setTitle(t("embed.title"))
          .setColor("Green")
          .setThumbnail(user.displayAvatarURL())
          .setDescription(t("embed.description", { user: user }))
          .setFooter({
            text: interaction.user.tag || t("unknown_executor"),
            iconURL: interaction.user.displayAvatarURL() || undefined,
          })
          .setTimestamp()
          .addFields([
            {
              name: t("embed.fields.reason"),
              value: reason || t("no_reason"),
            },
          ]);
        await webhook
          .send({
            embeds: [embed],
            allowedMentions: { parse: [] }, // Prevent mentions in the log
          })
          .catch((error) => {
            logger.log({
              level: "error",
              message: `Failed to send guild ban remove log`,
              error,
              meta: {
                guildId: interaction.guild.id,
                userId: user.id,
              },
            });
          });
      }
    }
    const result = await modLog(
      {
        guild: interaction.guild,
        action: "UNBAN",
        user,
        moderator: interaction.user,
        reason,
      },
      client,
    );
    if (result) {
      if (interaction.replied) {
        await interaction.followUp({ content: result.message, flags: MessageFlagsBitField.Flags.Ephemeral });
      } else {
        await interaction.reply({ content: result.message, flags: MessageFlagsBitField.Flags.Ephemeral });
      }
    }
  },
} as SlashCommandBase;
