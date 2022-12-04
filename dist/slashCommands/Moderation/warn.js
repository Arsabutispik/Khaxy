import { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } from "discord.js";
import modlog from "../../utils/modlog.js";
export default {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Bir kullanıcıyı uyarır")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles)
        .setDMPermission(false)
        .addUserOption(option => option.setName("kullanıcı").setDescription("Uyarılacak kullanıcı").setRequired(true))
        .addStringOption(option => option.setName("sebep").setDescription("Uyarı sebebi").setRequired(true)),
    execute: async ({ interaction, client }) => {
        const user = interaction.options.getUser("üye");
        const member = interaction.guild.members.cache.get(user.id);
        const data = client.guildsConfig.get(interaction.guild.id);
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
            return interaction.reply({ content: "Bu komutu kullanmak için yeterli yetkin yok.", ephemeral: true });
        if (member.id == interaction.user.id) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setColor("Red")
                .setDescription("Kendini uyaramazsın!");
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        if (member.user.bot) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setColor("Red")
                .setDescription("Bir botu atamazsın!");
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        if (member.roles.highest.position >= interaction.member.roles.highest.position) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setColor("Red")
                .setDescription("Bu kullanıcının rolü senden yüksek (veya aynı) bu kişiyi atamazsın!");
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        if (member.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setColor("Red")
                .setDescription("Bu kullanıcının rolü benden yüksek (veya aynı) o yüzden bu kişiyi atamam!");
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        if (member.permissions.has("ModerateMembers")) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setColor("Red")
                .setDescription("Bu kullanıcının yetkileri var!");
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        let reason = interaction.options.getString("sebep", true);
        await interaction.reply(`<a:checkmark:1017704018287546388> **${member.user.tag}** uyarıldı (Olay #${data.case}) Kullanıcı özel bir mesaj ile bildirildi`);
        if (interaction.guild.channels.cache.get(data.config.modlogChannel)) {
            await modlog({
                guild: interaction.guild,
                user: member.user,
                action: "UYARI",
                actionmaker: interaction.user,
                reason
            }, client);
        }
    }
};
//# sourceMappingURL=warn.js.map