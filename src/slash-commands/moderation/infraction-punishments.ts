import { SlashCommandBase } from "src/types/index.js";
import { MessageFlags, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { deleteGuildPunishmentConfig, getGuildConfig } from "src/database/index.js";
import dayjs from "dayjs";
import { DurationUnitType } from "dayjs/plugin/duration.js";
import { getGuildPunishmentConfig, setGuildPunishmentConfig } from "src/database/index.js";
import { PunishmentAction } from "@prisma/client";
import dayjsduration from "dayjs/plugin/duration.js";
import { toStringId } from "src/utils/index.js";

dayjs.extend(dayjsduration);
export default {
  memberPermissions: [PermissionsBitField.Flags.ModerateMembers],
  data: new SlashCommandBuilder()
    .setName("infraction-punishments")
    .setNameLocalizations({
      tr: "ihlal-cezaları",
    })
    .setDescription("Set up automatic punishments for reaching infraction thresholds")
    .setDescriptionLocalizations({
      tr: "İhlal eşiklerine ulaşıldığında otomatik cezalar ayarlayın",
    })
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setNameLocalizations({
          tr: "ekle",
        })
        .setDescription("Add a punishment for reaching an infraction threshold (or overwrite an existing one)")
        .setDescriptionLocalizations({
          tr: "Bir ihlal eşiğine ulaşıldığında ceza ekleyin (veya mevcut olanı geçersiz kılın)",
        })
        .addIntegerOption((option) =>
          option
            .setName("threshold")
            .setNameLocalizations({
              tr: "eşik",
            })
            .setDescription("The number of infractions to reach the threshold")
            .setDescriptionLocalizations({
              tr: "Eşiğe ulaşmak için ihlal sayısı",
            })
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(5),
        )
        .addStringOption((option) =>
          option
            .setName("punishment")
            .setNameLocalizations({
              tr: "ceza",
            })
            .setDescription("The punishment to apply when the threshold is reached")
            .setDescriptionLocalizations({
              tr: "Eşiğe ulaşıldığında uygulanacak ceza",
            })
            .setRequired(true)
            .addChoices(
              { name: "Mute", value: "mute" },
              { name: "Kick", value: "kick" },
              { name: "Ban", value: "ban" },
              { name: "Temporary Ban", value: "tempban" },
            ),
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
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setNameLocalizations({
          tr: "kaldır",
        })
        .setDescription("Remove a punishment for a specific infraction threshold")
        .setDescriptionLocalizations({
          tr: "Belirli bir ihlal eşiği için cezayı kaldırın",
        })
        .addIntegerOption((option) =>
          option
            .setName("threshold")
            .setNameLocalizations({
              tr: "eşik",
            })
            .setDescription("The infraction threshold to remove the punishment for")
            .setDescriptionLocalizations({
              tr: "Cezanın kaldırılacağı ihlal eşiği",
            })
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(5),
        ),
    ),
  async execute(interaction) {
    const guildConfig = await getGuildConfig(interaction.guildId);
    if (!guildConfig) {
      await interaction.reply({
        content: "This server is not registered in the database. This shouldn't happen, please contact developers",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const t = interaction.client.i18next.getFixedT(guildConfig.language, "commands", "infraction-punishments");
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === "add") {
      const threshold = interaction.options.getInteger("threshold", true);
      const existingConfig = await getGuildPunishmentConfig(interaction.guildId, threshold);
      if (existingConfig) {
        await deleteGuildPunishmentConfig(interaction.guildId, threshold);
      }
      const punishment = interaction.options.getString("punishment", true) as "mute" | "kick" | "ban" | "tempban";
      const durationNumber = interaction.options.getNumber("duration");
      const durationTime = interaction.options.getString("time");
      if (["tempban", "mute"].includes(punishment) && (!durationNumber || !durationTime)) {
        await interaction.reply({
          content: t("duration_missing"),
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      switch (punishment) {
        case "mute": {
          if (!guildConfig.mute_role_id || interaction.guild.roles.cache.get(toStringId(guildConfig.mute_role_id))) {
            await interaction.reply({
              content: t("no_mute_role"),
              flags: MessageFlags.Ephemeral,
            });
            return;
          }
          const durationInSeconds = dayjs.duration({ [durationTime! + "s"]: durationNumber }).asSeconds();
          const duration = dayjs.duration(durationNumber!, durationTime as DurationUnitType);
          const longDuration = dayjs(dayjs().add(duration))
            .locale(guildConfig.language || "en")
            .fromNow(true);
          await setGuildPunishmentConfig(interaction.guildId!, threshold, PunishmentAction.MUTE, durationInSeconds);
          await interaction.reply({
            content: t("mute_set", { threshold: threshold, duration: longDuration }),
            flags: MessageFlags.Ephemeral,
          });
          break;
        }
        case "kick": {
          await setGuildPunishmentConfig(interaction.guildId!, threshold, PunishmentAction.KICK);
          await interaction.reply({
            content: t("kick_set", { threshold: threshold }),
            flags: MessageFlags.Ephemeral,
          });
          break;
        }
        case "ban": {
          await setGuildPunishmentConfig(interaction.guildId!, threshold, PunishmentAction.BAN);
          await interaction.reply({
            content: t("ban_set", { threshold: threshold }),
            flags: MessageFlags.Ephemeral,
          });
          break;
        }
        case "tempban": {
          const durationInSeconds = dayjs.duration({ [durationTime! + "s"]: durationNumber }).asSeconds();
          const duration = dayjs.duration(durationNumber!, durationTime as DurationUnitType);
          const longDuration = dayjs(dayjs().add(duration))
            .locale(guildConfig.language || "en")
            .fromNow(true);
          await setGuildPunishmentConfig(interaction.guildId!, threshold, PunishmentAction.TEMPBAN, durationInSeconds);
          await interaction.reply({
            content: t("tempban_set", { threshold: threshold, duration: longDuration }),
            flags: MessageFlags.Ephemeral,
          });
          break;
        }
      }
    } else if (subcommand === "remove") {
      const threshold = interaction.options.getInteger("threshold", true);
      const existingConfig = await getGuildPunishmentConfig(interaction.guildId, threshold);
      if (!existingConfig) {
        await interaction.reply({
          content: t("no_config", { threshold: threshold }),
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      await deleteGuildPunishmentConfig(interaction.guildId, threshold);
      await interaction.reply({
        content: t("removed", { threshold: threshold, type: existingConfig.action.toLowerCase() }),
        flags: MessageFlags.Ephemeral,
      });
    }
  },
} as SlashCommandBase;
