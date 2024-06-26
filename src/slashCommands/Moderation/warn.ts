import {GuildMember, EmbedBuilder, SlashCommandBuilder, PermissionsBitField} from "discord.js";
import modlog from "../../utils/modlog.js";
import {slashCommandBase} from "../../types";

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
    execute: async ({interaction, client}) => {
        const user = interaction.options.getUser("member");
        const member = interaction.guild!.members.cache.get(user!.id)!;
        const data = client.guildsConfig.get(interaction.guild!.id)!
        if(!(interaction.member as GuildMember).permissions.has(PermissionsBitField.Flags.ModerateMembers)) return interaction.reply({content: "Bu komutu kullanmak için yeterli yetkin yok.", ephemeral: true});
        if(member.id === interaction.user.id){
            const embed = new EmbedBuilder()
                .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
                .setColor("Red")
                .setDescription("Kendini uyaramazsın!")
            await interaction.reply({embeds: [embed], ephemeral: true})
            return
        }
        if(member.user.bot){
            const embed = new EmbedBuilder()
                .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
                .setColor("Red")
                .setDescription("Bir botu atamazsın!")
            await interaction.reply({embeds: [embed], ephemeral: true})
            return
        }
        if(member.roles.highest.position >= (interaction.member as GuildMember)!.roles.highest.position){
            const embed = new EmbedBuilder()
                .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
                .setColor("Red")
                .setDescription("Bu kullanıcının rolü senden yüksek (veya aynı) bu kişiyi atamazsın!")
            await interaction.reply({embeds: [embed], ephemeral: true})
            return
        }
        if(member.roles.highest.position >= interaction.guild!.members.me!.roles.highest.position){
            const embed = new EmbedBuilder()
                .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
                .setColor("Red")
                .setDescription("Bu kullanıcının rolü benden yüksek (veya aynı) o yüzden bu kişiyi atamam!")
            await interaction.reply({embeds: [embed], ephemeral: true})
            return
        }
        if(member.permissions.has("ModerateMembers")){
            const embed = new EmbedBuilder()
                .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
                .setColor("Red")
                .setDescription("Bu kullanıcının yetkileri var!")
            await interaction.reply({embeds: [embed], ephemeral: true})
            return
        }
        let reason = interaction.options.getString("reason", true);
        await interaction.reply(`<a:checkmark:1017704018287546388> **${member.user.tag}** uyarıldı (Olay #${data.case}) Kullanıcı özel bir mesaj ile bildirildi`)
        if(interaction.guild!.channels.cache.get(data.config.modlogChannel)) {
            try {
                await modlog({
                    guild: interaction.guild!,
                    user: member.user,
                    action: "WARNING",
                    actionmaker: interaction.user,
                    reason
                }, client)
            } catch {
                await interaction.followUp({content: "Modlog kanalına mesaj göndermek için yetkim yok!", ephemeral: true})
            }
        }
    }
} as slashCommandBase