import { PermissionsBitField, SlashCommandBuilder } from "discord.js";
import modlog from "../../utils/modlog.js";
import { daysToMilliseconds } from "../../utils/utils.js";
export default {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Bir kullanıcıyı sunucudan atar")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers)
        .setDMPermission(false)
        .addUserOption(option => option.setName("kullanıcı").setDescription("Atılacak kullanıcı").setRequired(true))
        .addStringOption(option => option.setName("sebep").setDescription("Atılma sebebi").setRequired(false))
        .addStringOption(option => option.setName("temizle").setDescription("Atılan kullanıcının son 7 gündeki mesajlarını siler").addChoices({ name: "Evet", value: "evet" })),
    execute: async ({ interaction, client }) => {
        const user = interaction.options.getUser("üye");
        const targetMember = interaction.guild.members.cache.get(user.id);
        const reason = interaction.options.getString("sebep", false) || "Sebep belirtilmedi";
        const clear = interaction.options.getString("temizle", false);
        const data = client.guildsConfig.get(interaction.guildId);
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers))
            return interaction.reply({ content: "Bu komutu kullanmak için yeterli yetkin yok.", ephemeral: true });
        if (targetMember.id == interaction.user.id) {
            await interaction.reply({ content: "Kendini atamazsın!", ephemeral: true });
            return;
        }
        if (targetMember.user.bot) {
            await interaction.reply({ content: "Bir botu atamazsın!", ephemeral: true });
            return;
        }
        if (targetMember.roles.highest.position >= interaction.member.roles.highest.position) {
            await interaction.reply({ content: "Bu kullanıcının rolü senden yüksek (veya aynı) bu kişiyi atamazsın!", ephemeral: true });
            return;
        }
        if (targetMember.permissions.has("KickMembers")) {
            await interaction.reply({ content: "Bu kullanıcın \`Üyeleri Atma\` Yetkisi var!", ephemeral: true });
            return;
        }
        try {
            await targetMember.send(`${interaction.guild.name} sunucusundan atıldınız. Sebep: ${reason}`);
            await interaction.reply(`<a:checkmark:1017704018287546388> **${targetMember.user.tag}** atıldı (Olay #${data.case}) Kullanıcı özel bir mesaj ile bildirildi`);
        }
        catch {
            await interaction.reply(`<a:checkmark:1017704018287546388> **${targetMember.user.tag}** atıldı (Olay #${data.case}) Kullanıcıya özel mesaj atılamadı`);
        }
        if (interaction.guild.channels.cache.get(data.config.modlogChannel)) {
            await modlog({ guild: interaction.guild, user: targetMember.user, action: "AT", actionmaker: interaction.user, reason }, client);
        }
        if (clear == "evet") {
            await targetMember.ban({ reason: reason, deleteMessageDays: daysToMilliseconds(7) });
            await interaction.guild.bans.remove(targetMember.user, "softban");
            await interaction.reply({ content: "Kullanıcı başarıyla atıldı ve mesajları silindi!", ephemeral: true });
        }
        else {
            await targetMember.kick(reason);
            await interaction.reply({ content: "Kullanıcı başarıyla atıldı!", ephemeral: true });
        }
    }
};
//# sourceMappingURL=kick.js.map