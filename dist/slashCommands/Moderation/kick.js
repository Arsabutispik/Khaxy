import { PermissionsBitField, SlashCommandBuilder } from "discord.js";
import modlog from "../../utils/modlog.js";
import { daysToSeconds, handleErrors, replaceMassString } from "../../utils/utils.js";
export default {
  help: {
    name: "kick",
    description: "Bir kullanıcıyı sunucudan atar",
    usage: "kick <kullanıcı> [sebep] [temizle]",
    examples: ["kick @Khaxy", "kick @Khaxy reklam", "kick @Khaxy reklam true"],
    category: "Moderasyon",
  },
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a user from the server")
    .setDescriptionLocalizations({
      tr: "Bir kullanıcıyı sunucudan atar",
    })
    .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers)
    .setDMPermission(false)
    .addUserOption((option) =>
      option
        .setName("user")
        .setNameLocalizations({
          tr: "kullanıcı",
        })
        .setDescription("User to kick")
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
        .setDescription("Kick reason")
        .setDescriptionLocalizations({
          tr: "Atma sebebi",
        })
        .setRequired(false),
    )
    .addBooleanOption((option) =>
      option
        .setName("clear")
        .setNameLocalizations({
          tr: "temizle",
        })
        .setDescription("Clears up to 7 days of messages")
        .setDescriptionLocalizations({
          tr: "7 güne kadar olan mesajları temizler",
        }),
    ),
  execute: async ({ interaction, client }) => {
    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      await interaction.reply({
        content: client.handleLanguages("KICK_APP_NOT_ENOUGH_PERMISSIONS", client, interaction.guildId),
        ephemeral: true,
      });
      return;
    }
    const user = interaction.options.getUser("user");
    const targetMember = interaction.guild.members.cache.get(user.id);
    const reason = interaction.options.getString("reason", false) || "Sebep belirtilmedi";
    const clear = interaction.options.getBoolean("clear", false);
    const data = client.guildsConfig.get(interaction.guildId);
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return interaction.reply({
        content: client.handleLanguages("KICK_USER_NOT_ENOUGH_PERMISSIONS", client, interaction.guildId),
        ephemeral: true,
      });
    if (targetMember.id === interaction.user.id) {
      await interaction.reply({
        content: client.handleLanguages("KICK_CANT_KICK_YOURSELF", client, interaction.guildId),
        ephemeral: true,
      });
      return;
    }
    if (targetMember.user.bot) {
      await interaction.reply({
        content: client.handleLanguages("KICK_CANT_KICK_BOT", client, interaction.guildId),
        ephemeral: true,
      });
      return;
    }
    if (targetMember.roles.highest.position >= interaction.member.roles.highest.position) {
      await interaction.reply({
        content: client.handleLanguages("KICK_TARGET_HIGH_ROLE", client, interaction.guildId),
        ephemeral: true,
      });
      return;
    }
    if (targetMember.permissions.has("KickMembers")) {
      await interaction.reply({
        content: client.handleLanguages("KICK_TARGET_PERMISSIONS", client, interaction.guildId),
        ephemeral: true,
      });
      return;
    }
    try {
      await targetMember.send(
        replaceMassString(
          JSON.parse(JSON.stringify(client.handleLanguages("KICK_MESSAGE_DM", client, interaction.guildId))),
          {
            "{guild_name}": interaction.guild.name,
            "{reason}": reason,
          },
        ),
      );
      await interaction.reply(
        replaceMassString(
          JSON.parse(JSON.stringify(client.handleLanguages("KICK_MESSAGE", client, interaction.guildId))),
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
          JSON.parse(JSON.stringify(client.handleLanguages("KICK_MESSAGE_FAIL", client, interaction.guildId))),
          {
            "{targetMember_username}": targetMember.user.username,
            "{case}": data.case.toString(),
            "{confirm}": client.allEmojis.get(client.config.Emojis.confirm).format,
          },
        ),
      );
    }
    if (interaction.guild.channels.cache.get(data.config.modlogChannel)) {
      try {
        await modlog(
          {
            guild: interaction.guild,
            user: targetMember.user,
            action: "KICK",
            actionmaker: interaction.user,
            reason,
          },
          client,
        );
      } catch (error) {
        await handleErrors(client, error, "kick.ts", interaction);
      }
    }
    try {
      if (clear) {
        await targetMember.ban({
          reason: `Softban - ${reason}`,
          deleteMessageSeconds: daysToSeconds(7),
        });
        await interaction.guild.bans.remove(targetMember.user, "softban");
      } else {
        await targetMember.kick(reason);
      }
    } catch (e) {
      await handleErrors(client, e, "kick.ts", interaction);
    }
  },
};
//# sourceMappingURL=kick.js.map
