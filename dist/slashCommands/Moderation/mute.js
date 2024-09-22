import { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } from "discord.js";
import ms from "ms";
import Punishment from "../../schemas/punishmentSchema.js";
import modlog from "../../utils/modlog.js";
import { handleErrors, replaceMassString } from "../../utils/utils.js";
export default {
  help: {
    name: "mute",
    description: "Bir kullanıcıyı susturur",
    usage: "mute <kullanıcı> <süre> <vakit> [sebep]",
    examples: ["mute @Khaxy 1h sebep", "mute @Khaxy 1d sebep", "mute @Khaxy 1w sebep"],
    category: "Moderasyon",
  },
  data: new SlashCommandBuilder()
    .setName("mute")
    .setNameLocalizations({
      tr: "sustur",
    })
    .setDescription("Mutes a member")
    .setDescriptionLocalizations({
      tr: "Bir üyeyi susturur",
    })
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles)
    .setDMPermission(false)
    .addUserOption((option) =>
      option
        .setName("member")
        .setNameLocalizations({
          tr: "kullanıcı",
        })
        .setDescription("The member to mute")
        .setDescriptionLocalizations({
          tr: "Susturulacak kullanıcı",
        })
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("duration")
        .setDescription("The duration of the mute")
        .setDescriptionLocalizations({
          tr: "Susturulacak kullanıcının susturulma süresi",
        })
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("time")
        .setDescription("The time unit of the mute")
        .setDescriptionLocalizations({
          tr: "Susturulma süresinin zaman birimi",
        })
        .setRequired(true)
        .setChoices(
          { name: "Second(s)", value: "s" },
          { name: "Minute(s)", value: "m" },
          { name: "Hour(s)", value: "h" },
          { name: "Day(s)", value: "d" },
          { name: "Week(s)", value: "w" },
        ),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setNameLocalizations({
          tr: "sebep",
        })
        .setDescription("The reason of the mute")
        .setDescriptionLocalizations({
          tr: "Susturma sebebi",
        })
        .setRequired(true),
    ),
  execute: async ({ interaction, client }) => {
    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      await interaction.reply({
        content: client.handleLanguages("MUTE_APP_NOT_ENOUGH_PERMISSIONS", client, interaction.guildId),
        ephemeral: true,
      });
      return;
    }
    const user = interaction.options.getUser("member");
    const targetMember = interaction.guild.members.cache.get(user.id);
    const data = client.guildsConfig.get(interaction.guild.id);
    const lang = data.config.language || "english";
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles))
      return interaction.reply({
        content: client.handleLanguages("MUTE_USER_NOT_ENOUGH_PERMISSIONS", client, interaction.guildId),
        ephemeral: true,
      });
    if (!interaction.guild.roles.cache.get(data.config.muteRole)) {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setColor("Red")
        .setDescription(client.handleLanguages("MUTE_NO_ROLE", client, interaction.guildId));
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }
    if (targetMember.id === interaction.user.id) {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setColor("Red")
        .setDescription(client.handleLanguages("MUTE_CANT_MUTE_YOURSELF", client, interaction.guildId));
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }
    if (targetMember.user.bot) {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setColor("Red")
        .setDescription(client.handleLanguages("MUTE_CANT_MUTE_APP", client, interaction.guildId));
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }
    if (targetMember.roles.highest.position >= interaction.member.roles.highest.position) {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setColor("Red")
        .setDescription(client.handleLanguages("MUTE_TARGET_HIGH_ROLE", client, interaction.guildId));
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }
    if (targetMember.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setColor("Red")
        .setDescription(client.handleLanguages("MUTE_TARGET_HIGHER_APP_ROLE", client, interaction.guildId));
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }
    if (targetMember.permissions.has("ManageRoles")) {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setColor("Red")
        .setDescription(client.handleLanguages("MUTE_TARGET_HAS_PERMISSIONS", client, interaction.guildId));
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }
    const alreadyMuted = await Punishment.findOne({
      guildID: interaction.guild.id,
      userId: targetMember.id,
      type: "mute",
    });
    if (alreadyMuted) {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setColor("Red")
        .setDescription(client.handleLanguages("MUTE_ALREADY_MUTED", client, interaction.guildId));
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }
    const duration = ms(
      `${interaction.options.getString("duration", true)}${interaction.options.getString("time", true)}`,
    );
    const reason =
      interaction.options.getString("reason", false) ||
      client.handleLanguages("MUTE_NO_REASON", client, interaction.guildId);
    let longduration = ms(duration, { long: true });
    if (lang === "tr") {
      longduration = longduration
        .replace(/minutes|minute/, "dakika")
        .replace(/hours|hour/, "saat")
        .replace(/days|day/, "gün");
    }
    try {
      await targetMember.send(
        replaceMassString(
          JSON.parse(JSON.stringify(client.handleLanguages("MUTE_MESSAGE_DM", client, interaction.guildId))),
          {
            "{guild_name}": interaction.guild.name,
            "{duration}": longduration,
            "{reason}": reason,
          },
        ),
      );
      await interaction.reply(
        replaceMassString(
          JSON.parse(JSON.stringify(client.handleLanguages("MUTE_MESSAGE", client, interaction.guildId))),
          {
            "{targetMember_username}": targetMember.user.username,
            "{case}": data.case.toString(),
            "{confirm}": client.allEmojis.get(client.config.Emojis.confirm).format,
          },
        ),
      );
    } catch {
      await interaction.reply(
        replaceMassString(
          JSON.parse(JSON.stringify(client.handleLanguages("MUTE_MESSAGE_FAIL", client, interaction.guildId))),
          {
            "{targetMember_username}": targetMember.user.username,
            "{case}": data.case.toString(),
            "{confirm}": client.allEmojis.get(client.config.Emojis.confirm).format,
          },
        ),
      );
    }
    if (data.config.muteGetAllRoles) {
      const filterRoles = targetMember.roles.cache
        .filter((role) => role.id !== interaction.guild.id)
        .filter((role) => role.id !== interaction.guild.roles.premiumSubscriberRole?.id)
        .filter((role) => role.position < interaction.guild.members.me.roles.highest.position)
        .map((role) => role.id);
      await new Punishment({
        guildID: interaction.guild.id,
        userId: targetMember.id,
        staffId: interaction.user.id,
        reason,
        previousRoles: filterRoles,
        expires: new Date(Date.now() + duration),
        type: "mute",
      }).save();
      await targetMember.roles.remove(filterRoles);
      await targetMember.roles.add(data.config.muteRole);
    } else {
      await new Punishment({
        guildID: interaction.guild.id,
        userId: targetMember.id,
        staffId: interaction.user.id,
        reason,
        expires: new Date(Date.now() + duration),
        type: "mute",
      }).save();
      await targetMember.roles.add(data.config.muteRole);
    }
    if (interaction.guild.channels.cache.get(data.config.modlogChannel)) {
      try {
        await modlog(
          {
            guild: interaction.guild,
            user: targetMember.user,
            action: "MUTE",
            actionmaker: interaction.user,
            reason,
            duration,
          },
          client,
        );
      } catch (error) {
        await handleErrors(client, error, "mute.ts", interaction);
      }
    }
  },
};
//# sourceMappingURL=mute.js.map
