import { SlashCommandBase } from "@types";
import {
  EmbedBuilder,
  InteractionContextType,
  MessageFlagsBitField,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import { blacklistUser, unblacklistUser, getBlacklistedUser } from "@repo/database";
import dayjs from "dayjs";
import { logger } from "@lib";
import "dayjs/locale/en.js";
import "dayjs/locale/tr.js";
import relativeTime from "dayjs/plugin/relativeTime.js";
dayjs.extend(relativeTime);
export default {
  memberPermissions: [PermissionsBitField.Flags.ManageMessages],
  data: new SlashCommandBuilder()
    .setName("modmail-blacklist")
    .setNameLocalizations({
      tr: "modmail-karaliste",
    })
    .setDescription("Blacklist a user from modmail so they cannot open tickets")
    .setDescriptionLocalizations({
      tr: "Modmail'den bir kullanıcıyı kara listeye alarak bilet açmasını engeller",
    })
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
    .addSubcommand((option) =>
      option
        .setName("add")
        .setNameLocalizations({
          tr: "ekle",
        })
        .setDescription("Add a user to the modmail blacklist")
        .setDescriptionLocalizations({
          tr: "Bir kullanıcıyı modmail kara listesine ekler",
        })
        .addUserOption((option) =>
          option
            .setName("user")
            .setNameLocalizations({
              tr: "kullanıcı",
            })
            .setDescription("The user to blacklist")
            .setDescriptionLocalizations({
              tr: "Kara listeye alınacak kullanıcı",
            })
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("reason")
            .setNameLocalizations({
              tr: "sebep",
            })
            .setDescription("The reason for blacklisting the user")
            .setDescriptionLocalizations({
              tr: "Kullanıcının kara listeye alınma sebebi",
            })
            .setRequired(false),
        )
        .addNumberOption((option) =>
          option
            .setName("duration")
            .setNameLocalizations({
              tr: "süre",
            })
            .setDescription("Duration of the ban (only numbers 1-99)")
            .setDescriptionLocalizations({
              tr: "Yasaklanma süresi (sadece sayılar 1-99)",
            })
            .setMinValue(1)
            .setMaxValue(99)
            .setRequired(false),
        )
        .addStringOption((option) =>
          option
            .setName("time")
            .setNameLocalizations({
              tr: "vakit",
            })
            .setDescription("Time unit of the ban duration")
            .setDescriptionLocalizations({
              tr: "Yasaklanma süresinin birimi",
            })
            .setRequired(false)
            .setChoices(
              { name: "Second(s)", value: "second", name_localizations: { tr: "Saniye" } },
              { name: "Minute(s)", value: "minute", name_localizations: { tr: "Dakika" } },
              { name: "Hour(s)", value: "hour", name_localizations: { tr: "Saat" } },
              { name: "Day(s)", value: "day", name_localizations: { tr: "Gün" } },
              { name: "Week(s)", value: "week", name_localizations: { tr: "Hafta" } },
            ),
        ),
    )
    .addSubcommand((option) =>
      option
        .setName("remove")
        .setNameLocalizations({
          tr: "kaldır",
        })
        .setDescription("Remove a user from the modmail blacklist")
        .setDescriptionLocalizations({
          tr: "Bir kullanıcıyı modmail kara listesinden kaldırır",
        })
        .addUserOption((option) =>
          option
            .setName("user")
            .setNameLocalizations({
              tr: "kullanıcı",
            })
            .setDescription("The user to remove from the blacklist")
            .setDescriptionLocalizations({
              tr: "Kara listeden kaldırılacak kullanıcı",
            })
            .setRequired(true),
        ),
    )
    .addSubcommand((option) =>
      option
        .setName("get")
        .setNameLocalizations({
          tr: "bul",
        })
        .setDescription("Get the modmail blacklist of an user")
        .setDescriptionLocalizations({
          tr: "Bir kullanıcının modmail kara listesini getirir",
        })
        .addUserOption((option) =>
          option
            .setName("user")
            .setNameLocalizations({
              tr: "kullanıcı",
            })
            .setDescription("The user to get the blacklist for")
            .setDescriptionLocalizations({
              tr: "Kara listesini almak istediğiniz kullanıcı",
            })
            .setRequired(true),
        ),
    ),
  async execute(interaction, guildConfig) {
    const t = interaction.client.i18next.getFixedT(guildConfig.language, "commands", "modmail-blacklist");
    const subcommand = interaction.options.getSubcommand(true);
    if (subcommand === "add") {
      const user = interaction.options.getUser("user", true);
      const reason = interaction.options.getString("reason") || t(($) => $.no_reason);
      const duration = interaction.options.getNumber("duration");
      const time = interaction.options.getString("time");
      if (user.id === interaction.user.id) {
        await interaction.reply({
          content: t(($) => $.cannotBlacklistSelf),
          flags: MessageFlagsBitField.Flags.Ephemeral,
        });
        return;
      }
      if (user.bot) {
        await interaction.reply({
          content: t(($) => $.cannotBlacklistBot),
          flags: MessageFlagsBitField.Flags.Ephemeral,
        });
        return;
      }
      if (duration && !time) {
        await interaction.reply({
          content: t(($) => $.durationWithoutTime),
          flags: MessageFlagsBitField.Flags.Ephemeral,
        });
        return;
      }
      if (!duration && time) {
        await interaction.reply({
          content: t(($) => $.timeWithoutDuration),
          flags: MessageFlagsBitField.Flags.Ephemeral,
        });
        return;
      }
      if (!duration || !time) {
        await interaction.reply({
          content: t(($) => $.permanentBlacklistWarning),
          flags: MessageFlagsBitField.Flags.Ephemeral,
        });
        return;
      }
      try {
        await blacklistUser(
          interaction.guildId,
          user.id,
          interaction.user.id,
          reason,
          dayjs()
            .add(duration, time as dayjs.ManipulateType)
            .toDate(),
        );
        await interaction.reply({
          content: t(($) => $.blacklistSuccess, {
            confirm: interaction.client.allEmojis.get(interaction.client.config.emojis.confirm.id)?.format,
            user: user.toString(),
            reason,
            duration: duration
              ? dayjs()
                  .add(duration, time as dayjs.ManipulateType)
                  .locale(guildConfig.language)
                  .fromNow(true)
              : interaction.client.allEmojis.get(interaction.client.config.emojis.infinity.id)?.format,
          }),
          flags: MessageFlagsBitField.Flags.Ephemeral,
        });
      } catch (error) {
        logger.log({
          level: "error",
          message: `Error while blacklisting user ${user.id} in guild ${interaction.guildId}`,
          error,
        });
        await interaction.reply({
          content: t(($) => $.blacklistError),
          flags: MessageFlagsBitField.Flags.Ephemeral,
        });
      }
    } else if (subcommand === "remove") {
      const user = interaction.options.getUser("user", true);
      try {
        const result = await unblacklistUser(interaction.guildId, user.id);
        if (result.count === 0) {
          await interaction.reply({
            content: t(($) => $.blacklistRemove.notFound, { user: user.toString() }),
            flags: MessageFlagsBitField.Flags.Ephemeral,
          });
          return;
        }
        await interaction.reply({
          content: t(($) => $.blacklistRemove.success, {
            confirm: interaction.client.allEmojis.get(interaction.client.config.emojis.confirm.id)?.format,
            user: user.toString(),
          }),
          flags: MessageFlagsBitField.Flags.Ephemeral,
        });
      } catch (error) {
        logger.log({
          level: "error",
          message: `Error while removing user ${user.id} from blacklist in guild ${interaction.guildId}`,
          error,
        });
        await interaction.reply({
          content: t(($) => $.blacklistRemove.error),
          flags: MessageFlagsBitField.Flags.Ephemeral,
        });
      }
    } else if (subcommand === "get") {
      const user = interaction.options.getUser("user", true);
      const blacklist = await getBlacklistedUser(interaction.guildId, user.id);
      if (!blacklist) {
        await interaction.reply({
          content: t(($) => $.blacklistGet.notFound, { user: user.toString() }),
          flags: MessageFlagsBitField.Flags.Ephemeral,
        });
        return;
      }
      const embed = new EmbedBuilder()
        .setTitle(t(($) => $.blacklistGet.embed.title, { user: user.username }))
        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() || undefined })
        .setColor("Random")
        .addFields([
          {
            name: t(($) => $.blacklistGet.embed.fields.reason),
            value: blacklist.reason,
            inline: true,
          },
          {
            name: t(($) => $.blacklistGet.embed.fields.createdAt),
            value: dayjs(blacklist.createdAt).format("YYYY-MM-DD HH:mm:ss"),
            inline: true,
          },
          {
            name: t(($) => $.blacklistGet.embed.fields.expiresAt),
            value: blacklist.expiresAt
              ? dayjs(blacklist.expiresAt).format("YYYY-MM-DD HH:mm:ss")
              : interaction.client.allEmojis.get(interaction.client.config.emojis.infinity.id)!.format,
            inline: true,
          },
          {
            name: t(($) => $.blacklistGet.embed.fields.moderator),
            value: `<@${blacklist.moderatorId}>`,
            inline: true,
          },
        ]);
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlagsBitField.Flags.Ephemeral,
      });
    }
  },
} as SlashCommandBase;
