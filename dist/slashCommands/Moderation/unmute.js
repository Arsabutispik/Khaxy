import { SlashCommandBuilder, PermissionsBitField } from "discord.js";
import punishmentSchema from "../../schemas/punishmentSchema.js";
export default {
    data: new SlashCommandBuilder()
        .setName("unmute")
        .setDescription("Bir kullanıcının susturulmasını kaldırır")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles)
        .setDMPermission(false)
        .addUserOption(option => option.setName("kullanıcı").setDescription("Susturulmasını kaldırılacak kullanıcı").setRequired(true)),
    execute: async ({ interaction, client }) => {
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            await interaction.reply({ content: "Bu komutu kullanabilmek için `Rolleri Yönet` yetkim yok!", ephemeral: true });
            return;
        }
        const user = interaction.options.getUser("kullanıcı");
        const guildConfig = client.guildsConfig.get(interaction.guild.id);
        const member = interaction.guild.members.cache.get(user.id);
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles))
            return interaction.reply({ content: "Bu komutu kullanmak için yeterli yetkin yok.", ephemeral: true });
        const data = await punishmentSchema.findOne({ guildID: interaction.guild.id, userID: member.id, type: "mute" });
        if (!data)
            return interaction.reply({ content: "Bu kullanıcı zaten susturulmamış!", ephemeral: true });
        await member.roles.remove(guildConfig.config.muteRole);
        if (client.guildsConfig.get(interaction.guild.id).config.muteGetAllRoles) {
            data.previousRoles?.forEach(async (role) => {
                if (!member.guild.roles.cache.get(role))
                    data.previousRoles?.splice(data.previousRoles?.indexOf(role), 1);
            });
            await member.roles.add(data.previousRoles);
        }
        await interaction.reply({ content: `${member} adlı kullanıcının susturulması kaldırıldı!`, ephemeral: true });
        await punishmentSchema.deleteOne({ guildID: interaction.guild.id, userId: member.id, type: "mute" });
    }
};
//# sourceMappingURL=unmute.js.map