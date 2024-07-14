import { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } from "discord.js";
import modlog from "../../utils/modlog.js";
import { replaceMassString } from "../../utils/utils.js";
export default {
    help: {
        name: "warn",
        description: "Bir kullanıcıyı uyarır",
        usage: "warn <kullanıcı> <sebep>",
        examples: ["warn @Khaxy reklam"],
        category: "Moderasyon"
    },
    data: new SlashCommandBuilder()
        .setName("warn")
        .setNameLocalizations({
        "tr": "uyar"
    })
        .setDescription("Warns a member")
        .setDescriptionLocalizations({
        "tr": "Bir kullanıcıyı uyarır"
    })
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles)
        .setDMPermission(false)
        .addUserOption(option => option
        .setName("member")
        .setNameLocalizations({
        "tr": "kullanıcı"
    })
        .setDescription("Member to warn")
        .setDescriptionLocalizations({
        "tr": "Uyarılacak kullanıcı"
    })
        .setRequired(true))
        .addStringOption(option => option
        .setName("reason")
        .setNameLocalizations({
        "tr": "sebep"
    })
        .setDescription("Reason for warn")
        .setDescriptionLocalizations({
        "tr": "Uyarı sebebi"
    })
        .setRequired(true)),
    execute: async ({ interaction, client }) => {
        const user = interaction.options.getUser("member");
        const member = interaction.guild.members.cache.get(user.id);
        const data = client.guildsConfig.get(interaction.guild.id);
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
            return interaction.reply({ content: client.handleLanguages("WARN_USER_NOT_ENOUGH_PERMISSIONS", client, interaction.guildId), ephemeral: true });
        if (member.id === interaction.user.id) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setColor("Red")
                .setDescription(client.handleLanguages("WARN_CANNOT_WARN_YOURSELF", client, interaction.guildId));
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        if (member.user.bot) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setColor("Red")
                .setDescription(client.handleLanguages("WARN_CANNOT_WARN_BOT", client, interaction.guildId));
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        if (member.roles.highest.position >= interaction.member.roles.highest.position) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setColor("Red")
                .setDescription(client.handleLanguages("WARN_USER_HAS_HIGHER_ROLE", client, interaction.guildId));
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        if (member.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setColor("Red")
                .setDescription(client.handleLanguages("WARN_USER_HAS_HIGHER_BOT_ROLE", client, interaction.guildId));
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        if (member.permissions.has("ModerateMembers")) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setColor("Red")
                .setDescription(client.handleLanguages("WARN_USER_HAS_PERMISSIONS", client, interaction.guildId));
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        let reason = interaction.options.getString("reason", true);
        try {
            await member.send(replaceMassString(client.handleLanguages("WARN_USER_DM", client, interaction.guildId), {
                "{guild_name}": interaction.guild.name,
                "{reason}": reason
            }));
            await interaction.reply(replaceMassString(client.handleLanguages("WARN_SUCCESS", client, interaction.guildId), {
                "{user}": member.user.username,
                "{case}": data.case.toString()
            }));
        }
        catch {
            await interaction.reply(replaceMassString(client.handleLanguages("WARN_USER_CANNOT_DM", client, interaction.guildId), {
                "{user}": member.user.username,
                "{case}": data.case.toString()
            }));
        }
        if (interaction.guild.channels.cache.get(data.config.modlogChannel)) {
            try {
                await modlog({
                    guild: interaction.guild,
                    user: member.user,
                    action: "WARNING",
                    actionmaker: interaction.user,
                    reason
                }, client);
            }
            catch {
                await interaction.followUp({ content: client.handleLanguages("WARN_MODLOG_FAIL", client, interaction.guildId), ephemeral: true });
            }
        }
    }
};
//# sourceMappingURL=warn.js.map