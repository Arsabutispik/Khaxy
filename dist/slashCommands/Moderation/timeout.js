import { PermissionsBitField, SlashCommandBuilder } from "discord.js";
import ms from "ms";
import modlog from "../../utils/modlog.js";
export default {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setNameLocalizations({
      tr: "zamanaşımı",
    })
    .setDescription("Timeouts a user")
    .setDescriptionLocalizations({
      tr: "Bir kullanıcıyı zamanaşımına uğratır",
    })
    .setDefaultMemberPermissions(PermissionsBitField.Flags.MuteMembers)
    .addUserOption((option) =>
      option
        .setName("member")
        .setNameLocalizations({
          tr: "kullanıcı",
        })
        .setDescription("The member to timeout")
        .setDescriptionLocalizations({
          tr: "Zamanaşımına uğratılacak kullanıcı",
        })
        .setRequired(true),
    )
    .addNumberOption((option) =>
      option
        .setName("duration")
        .setNameLocalizations({
          tr: "süre",
        })
        .setDescription("The duration of the timeout")
        .setDescriptionLocalizations({
          tr: "Zamanaşımının süresi",
        })
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("time")
        .setNameLocalizations({
          tr: "vakit",
        })
        .setDescription("The time unit of the timeout")
        .setDescriptionLocalizations({
          tr: "Zamanaşımının zaman birimi",
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
        .setDescription("The reason of the timeout")
        .setDescriptionLocalizations({
          tr: "Zamanaşımının sebebi",
        })
        .setRequired(false),
    ),
  async execute({ interaction, client }) {
    const member = interaction.options.getMember("member");
    const duration = interaction.options.getNumber("duration", true);
    const time = interaction.options.getString("time", true);
    const reason =
      interaction.options.getString("reason") ||
      client.handleLanguages("TIMEOUT_NO_REASON", client, interaction.guildId);
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.MuteMembers))
      return interaction.reply({
        content: client.handleLanguages("TIMEOUT_MEMBER_NOT_ENOUGH_PERMISSIONS", client, interaction.guildId),
        ephemeral: true,
      });
    if (!member)
      return interaction.reply({
        content: client.handleLanguages("TIMEOUT_MEMBER_NOT_FOUND", client, interaction.guildId),
        ephemeral: true,
      });
    if (member.id === interaction.user.id)
      return interaction.reply({
        content: client.handleLanguages("TIMEOUT_CANT_TIMEOUT_YOURSELF", client, interaction.guildId),
        ephemeral: true,
      });
    if (member.user.bot)
      return interaction.reply({
        content: client.handleLanguages("TIMEOUT_CANT_TIMEOUT_BOT", client, interaction.guildId),
        ephemeral: true,
      });
    if (member.permissions.has(PermissionsBitField.Flags.MuteMembers))
      return interaction.reply({
        content: client.handleLanguages("TIMEOUT_MEMBER_HAS_PERMISSIONS", client, interaction.guildId),
        ephemeral: true,
      });
    if (member.roles.highest.position >= interaction.member.roles.highest.position)
      return interaction.reply({
        content: client.handleLanguages("TIMEOUT_MEMBER_HAS_HIGHER_ROLE", client, interaction.guildId),
        ephemeral: true,
      });
    if (member.isCommunicationDisabled())
      return interaction.reply({
        content: client.handleLanguages("TIMEOUT_MEMBER_HAS_COMMUNICATION_DISABLED", client, interaction.guildId),
        ephemeral: true,
      });
    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles))
      return interaction.reply({
        content: client.handleLanguages("TIMEOUT_APP_NOT_ENOUGH_PERMISSIONS", client, interaction.guildId),
        ephemeral: true,
      });
    await member.timeout(ms(`${duration}${time}`), reason);
    await interaction.reply({
      content: client
        .handleLanguages("TIMEOUT_SUCCESS", client, interaction.guildId)
        .replace("{user_username}", member.user.username),
      ephemeral: true,
    });
    await modlog(
      {
        guild: interaction.guild,
        user: member.user,
        actionmaker: interaction.user,
        action: "TIMEOUT",
        duration: ms(`${duration}${time}`),
        reason,
      },
      client,
    );
  },
};
//# sourceMappingURL=timeout.js.map
