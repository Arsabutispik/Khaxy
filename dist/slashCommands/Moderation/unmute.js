import { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } from "discord.js";
export default {
    data: new SlashCommandBuilder()
        .setName("unmute")
        .setDescription("Bir kullanıcının susturulmasını kaldırır")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles)
        .setDMPermission(false)
        .addUserOption(option => option.setName("kullanıcı").setDescription("Susturulmasını kaldırılacak kullanıcı").setRequired(true)),
    execute: async ({ interaction }) => {
        const user = interaction.options.getUser("kullanıcı");
        const member = interaction.guild.members.cache.get(user.id);
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles))
            return interaction.reply({ content: "Bu komutu kullanmak için yeterli yetkin yok.", ephemeral: true });
        if (member.id === interaction.user.id) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setColor("Red")
                .setDescription("Kendini susturamazsın!");
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        if (member.user.bot) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setColor("Red")
                .setDescription("Bir botu susturamazsın!");
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        if (member.roles.highest.position >= interaction.member.roles.highest.position) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setColor("Red")
                .setDescription("Bu kullanıcının rolü senden yüksek (veya aynı) bu kişiyi susturamazsın!");
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        if (member.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setColor("Red")
                .setDescription("Bu kullanıcının rolü benden yüksek (veya aynı) o yüzden bu kişiyi susturamam!");
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
//# sourceMappingURL=unmute.js.map
