import type { SlashCommandBase } from "@types";
import { MessageFlags, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import dayjs from "dayjs";
import duration, { DurationUnitType } from "dayjs/plugin/duration.js";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { getGuildPunishmentRules, setPunishmentRule, deletePunishmentRule, PunishmentAction } from "@repo/database";

dayjs.extend(duration);
dayjs.extend(relativeTime);

export default {
  memberPermissions: [PermissionsBitField.Flags.ModerateMembers],
  data: new SlashCommandBuilder()
    .setName("infraction-punishments")
    .setNameLocalizations({ tr: "ihlal-cezaları" })
    .setDescription("Set up automatic punishments for reaching infraction thresholds")
    .addSubcommand((sub) =>
      sub
        .setName("add")
        .setDescription("Add or overwrite a punishment threshold")
        .addIntegerOption((opt) => opt.setName("threshold").setRequired(true).setMinValue(1).setMaxValue(5))
        .addStringOption((opt) =>
          opt
            .setName("punishment")
            .setRequired(true)
            .addChoices(
              { name: "Mute", value: "mute" },
              { name: "Kick", value: "kick" },
              { name: "Ban", value: "ban" },
              { name: "Temporary Ban", value: "tempban" },
            ),
        )
        .addNumberOption((opt) => opt.setName("duration").setMinValue(1).setMaxValue(99))
        .addStringOption((opt) =>
          opt
            .setName("time")
            .setChoices(
              { name: "Minute(s)", value: "minute" },
              { name: "Hour(s)", value: "hour" },
              { name: "Day(s)", value: "day" },
              { name: "Week(s)", value: "week" },
            ),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("remove")
        .setDescription("Remove a punishment threshold")
        .addIntegerOption((opt) => opt.setName("threshold").setRequired(true).setMinValue(1).setMaxValue(5)),
    ),

  async execute(interaction, guildConfig) {
    const { client, guildId, guild, options } = interaction;
    if (!guild || !guildConfig) return;

    const t = client.i18next.getFixedT(guildConfig.language, "commands", "infractionPunishments");
    const subcommand = options.getSubcommand();

    if (subcommand === "add") {
      const threshold = options.getInteger("threshold", true);
      const punishment = options.getString("punishment", true) as "mute" | "kick" | "ban" | "tempban";
      const durationNum = options.getNumber("duration");
      const durationUnit = options.getString("time");

      // 1. Validation for timed punishments
      if (["tempban", "mute"].includes(punishment) && (!durationNum || !durationUnit)) {
        return interaction.reply({ content: t(($) => $.durationMissing), flags: MessageFlags.Ephemeral });
      }

      // 2. Prep Duration
      let durationInSeconds: number | undefined;
      let longDurationLabel: string | undefined;

      if (durationNum && durationUnit) {
        const d = dayjs.duration(durationNum, durationUnit as DurationUnitType);
        durationInSeconds = d.asSeconds();
        longDurationLabel = dayjs()
          .add(d)
          .locale(guildConfig.language || "en")
          .fromNow(true);
      }

      // 3. Execution based on Punishment type
      switch (punishment) {
        case "mute": {
          if (!guildConfig.muteRoleId || !guild.roles.cache.has(guildConfig.muteRoleId)) {
            return interaction.reply({ content: t(($) => $.noMuteRole), flags: MessageFlags.Ephemeral });
          }
          await setPunishmentRule(guildId!, threshold, PunishmentAction.MUTE, durationInSeconds);
          return interaction.reply({
            content: t(($) => $.muteSet, { threshold, duration: longDurationLabel }),
            flags: MessageFlags.Ephemeral,
          });
        }

        case "tempban": {
          await setPunishmentRule(guildId!, threshold, PunishmentAction.TEMPBAN, durationInSeconds);
          return interaction.reply({
            content: t(($) => $.tempbanSet, { threshold, duration: longDurationLabel }),
            flags: MessageFlags.Ephemeral,
          });
        }

        case "kick": {
          await setPunishmentRule(guildId!, threshold, PunishmentAction.KICK);
          return interaction.reply({ content: t(($) => $.kickSet, { threshold }), flags: MessageFlags.Ephemeral });
        }

        case "ban": {
          await setPunishmentRule(guildId!, threshold, PunishmentAction.BAN);
          return interaction.reply({ content: t(($) => $.banSet, { threshold }), flags: MessageFlags.Ephemeral });
        }
      }
    }

    if (subcommand === "remove") {
      const threshold = options.getInteger("threshold", true);
      const existingRules = await getGuildPunishmentRules(guildId!);
      const ruleToRemove = existingRules.find((r) => r.level === threshold);

      if (!ruleToRemove) {
        return interaction.reply({ content: t(($) => $.noConfig, { threshold }), flags: MessageFlags.Ephemeral });
      }

      await deletePunishmentRule(guildId!, threshold);
      return interaction.reply({
        content: t(($) => $.removed, { threshold, type: ruleToRemove.action.toLowerCase() }),
        flags: MessageFlags.Ephemeral,
      });
    }
  },
} as SlashCommandBase;
