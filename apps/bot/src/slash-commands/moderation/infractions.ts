import { SlashCommandBase } from "@types";
import {
  EmbedBuilder,
  InteractionContextType,
  MessageFlags,
  PermissionsBitField,
  SlashCommandBuilder,
  time,
  TimestampStyles,
} from "discord.js";
import { getInfraction, getUserInfractions, InfractionType } from "@repo/database";
import { paginate } from "@utils";

export default {
  memberPermissions: [PermissionsBitField.Flags.ModerateMembers],
  data: new SlashCommandBuilder()
    .setName("infractions")
    .setNameLocalizations({
      tr: "uyarılar",
    })
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers)
    .setDescription("View infractions for a user")
    .setDescriptionLocalizations({
      tr: "Bir kullanıcının uyarılarını görüntüle",
    })
    .addSubcommand((subcommand) => {
      subcommand
        .setName("user")
        .setNameLocalizations({
          tr: "kullanıcı",
        })
        .setDescription("View infractions for a user")
        .setDescriptionLocalizations({
          tr: "Bir kullanıcının uyarılarını görüntüle",
        })
        .addUserOption((option) => {
          option
            .setName("user")
            .setNameLocalizations({
              tr: "kullanıcı",
            })
            .setDescription("The user to view infractions for")
            .setDescriptionLocalizations({
              tr: "Uyarılarını görüntülemek istediğiniz kullanıcı",
            })
            .setRequired(true);
          return option;
        })
        .addStringOption((option) => {
          option
            .setName("type")
            .setNameLocalizations({
              tr: "tür",
            })
            .setDescription("Filter infractions by type (e.g., BAN, MUTE, WARN)")
            .setDescriptionLocalizations({
              tr: "Uyarıları türe göre filtrele (ör. BAN, MUTE, WARN)",
            })
            .setRequired(false)
            .addChoices(
              { name: "Ban", value: InfractionType.BAN, name_localizations: { tr: "Yasaklama" } },
              { name: "Mute", value: InfractionType.MUTE, name_localizations: { tr: "Susturma" } },
              { name: "Warn", value: InfractionType.WARN, name_localizations: { tr: "Uyarı" } },
              { name: "KICK", value: InfractionType.KICK, name_localizations: { tr: "Atma" } },
            );
          return option;
        });
      return subcommand;
    })
    .addSubcommand((sub) => {
      sub
        .setName("case")
        .setNameLocalizations({
          tr: "vaka",
        })
        .setDescription("View a specific case")
        .setDescriptionLocalizations({
          tr: "Belirli bir vakayı görüntüle",
        })
        .addIntegerOption((option) => {
          option
            .setName("id")
            .setNameLocalizations({
              tr: "numarası",
            })
            .setDescription("The case ID of the infraction to view")
            .setDescriptionLocalizations({
              tr: "Görüntülenecek uyarının vaka kimliği",
            })
            .setRequired(true);
          return option;
        });
      return sub;
    }),
  async execute(interaction, guildConfig) {
    const t = interaction.client.i18next.getFixedT(guildConfig.language, "commands", "infractions");
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === "case") {
      const caseId = interaction.options.getInteger("id", true);
      const infraction = await getInfraction(interaction.guildId, caseId);
      if (!infraction) {
        return interaction.reply({ content: t("no_infraction", { case: caseId }), flags: MessageFlags.Ephemeral });
      }
      const user = await interaction.client.users.fetch(infraction.userId).catch(() => null);
      if (!user) {
        return interaction.reply({ content: t("no_user"), flags: MessageFlags.Ephemeral });
      }
      const embed = new EmbedBuilder()
        .setAuthor({
          name: user.tag,
          iconURL: user.displayAvatarURL(),
        })
        .setTitle(t("infraction_case", { case: infraction.caseId }))
        .setColor("Random")
        .setTimestamp()
        .setDescription(
          t("infraction_details", {
            type: infraction.type,
            reason: infraction.reason || t("no_reason"),
            moderator: `<@${infraction.moderatorId}>`,
            date: time(infraction.createdAt, TimestampStyles.LongDateTime),
          }),
        );
      return interaction.reply({ embeds: [embed] });
    } else if (subcommand === "user") {
      const user = interaction.options.getUser("user", true);
      const type = interaction.options.getString("type");
      let infractions = await getUserInfractions(interaction.guildId, user.id);
      if (type) {
        infractions = infractions.filter((infraction) => infraction.type.toLowerCase() === type.toLowerCase());
      }
      if (infractions.length === 0) {
        return interaction.reply({ content: t("no_infractions", { user: user.tag }), flags: MessageFlags.Ephemeral });
      }
      const chunkSize = 10;
      const embeds: Array<EmbedBuilder> = [];
      for (let i = 0; i < infractions.length; i += chunkSize) {
        const chunk = infractions.slice(i, i + chunkSize);
        const embed = new EmbedBuilder()
          .setAuthor({
            name: user.tag,
            iconURL: user.displayAvatarURL(),
          })
          .setTitle(t("infractions_for", { user: user.tag }))
          .setColor("Random")
          .setFooter({
            text: t("page_footer", {
              current: Math.floor(i / chunkSize) + 1,
              total: Math.ceil(infractions.length / chunkSize),
            }),
          })
          .setTimestamp();
        chunk.forEach((infraction) => {
          embed.addFields({
            name: t("infraction_case", { case: infraction.caseId }),
            value: t("infraction_details", {
              type: infraction.type,
              reason: infraction.reason || t("no_reason"),
              moderator: `<@${infraction.moderatorId}>`,
              date: time(infraction.createdAt, TimestampStyles.LongDateTime),
            }),
          });
        });
        embeds.push(embed);
      }
      await paginate(interaction, embeds);
    }
  },
} as SlashCommandBase;
