import {EmbedBuilder, SlashCommandBuilder, PermissionsBitField, GuildMember} from "discord.js";
import {slashCommandBase} from "../../types";
import modlog from "../../utils/modlog.js";
import {replaceMassString} from "../../utils/utils.js";

export default {
    help: {
        name: "unban",
        description: "Bir kullanıcının yasağını kaldırır",
        usage: "unban <id> [sebep]",
        examples: ["unban 1007246359696515125", "unban 1007246359696515125 sebep"],
        category: "Moderasyon"
    },
    data: new SlashCommandBuilder()
        .setName("unban")
        .setNameLocalizations({
            "tr": "unban"
        })
        .setDescription("Remove a ban from a user")
        .setDescriptionLocalizations({
            "tr": "Bir kullanıcının yasağını kaldırır"
        })
        .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers)
        .setDMPermission(false)
        .addStringOption(option => option
            .setName("id")
            .setDescription("The ID of the user to unban")
            .setDescriptionLocalizations({
                "tr": "Yasağı kaldırılacak kullanıcının ID'si"
            })
            .setRequired(true))
        .addStringOption(option => option
            .setName("reason")
            .setNameLocalizations({
                "tr": "sebep"
            })
            .setDescription("The reason for unbanning the user")
            .setDescriptionLocalizations({
                "tr": "Kullanıcının yasağının kaldırılma sebebi"
            })),
    execute: async ({interaction, client}) => {
        if(!interaction.guild!.members.me!.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            await interaction.reply({content: client.handleLanguages("UNBAN_NO_APP_PERMISSON", client, interaction.guildId!), ephemeral: true})
            return
        }
        const id = interaction.options.getString("id", true);
        const reason = interaction.options.getString("reason", false) || client.handleLanguages("UNBAN_NO_REASON", client, interaction.guildId!);
        const banned = await interaction.guild!.bans.fetch();
        const user = banned.get(id);
        const data = client.guildsConfig.get(interaction.guild!.id)!;
        if(!(interaction.member as GuildMember).permissions.has(PermissionsBitField.Flags.BanMembers)) return interaction.reply({content: client.handleLanguages("UNBAN_USER_NOT_ENOUGH_PERMISSIONS", client, interaction.guildId!), ephemeral: true});
        if(!user){
            const embed = new EmbedBuilder()
                .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
                .setColor("Red")
                .setDescription(client.handleLanguages("UNBAN_USER_NOT_BANNED", client, interaction.guildId!))
            await interaction.reply({embeds: [embed], ephemeral: true})
            return
        }
        await interaction.guild!.members.unban(user.user, reason);
        if(interaction.guild!.channels.cache.get(data.config.modlogChannel)){
            try {
                await modlog({
                    guild: interaction.guild!,
                    user: user.user,
                    actionmaker: interaction.user,
                    reason,
                    action: "BAN_REMOVE"
                }, client)
            } catch {
                await interaction.followUp({content: client.handleLanguages("UNBAN_MODLOG_FAIL", client, interaction.guildId!), ephemeral: true})
            }
        }
        const embed = new EmbedBuilder()
            .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
            .setColor("Green")
            .setDescription(replaceMassString(client.handleLanguages("UNBAN_SUCCESS", client, interaction.guildId!), {
                "{user_username}": user.user.username,
            }))
        await interaction.reply({embeds: [embed]})
    }
} as slashCommandBase