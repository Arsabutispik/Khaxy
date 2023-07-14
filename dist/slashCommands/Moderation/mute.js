import { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } from "discord.js";
import ms from "ms";
import Punishment from "../../schemas/punishmentSchema.js";
import modlog from "../../utils/modlog.js";
export default {
    help: {
        name: "mute",
        description: "Bir kullanıcıyı susturur",
        usage: "mute <kullanıcı> <süre> <vakit> [sebep]",
        examples: ["mute @Khaxy 1h sebep", "mute @Khaxy 1d sebep", "mute @Khaxy 1w sebep"],
        category: "Moderasyon"
    },
    data: new SlashCommandBuilder()
        .setName("mute")
        .setDescription("Bir kullanıcıyı susturur")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles)
        .setDMPermission(false)
        .addUserOption(option => option.setName("kullanıcı").setDescription("Susturulacak kullanıcı").setRequired(true))
        .addStringOption(option => option.setName("süre").setDescription("Susturulacak kullanıcının susturulma süresi").setRequired(true))
        .addStringOption(option => option.setName("vakit").setDescription("Susturulacak kullanıcının susturulma süresinin birimi").setRequired(true)
        .setChoices({ name: "Saniye", value: "s" }, { name: "Dakika", value: "m" }, { name: "Saat", value: "h" }, { name: "Gün", value: "d" }, { name: "Hafta", value: "w" }))
        .addStringOption(option => option.setName("sebep").setDescription("Susturulma sebebi").setRequired(true)),
    execute: async ({ interaction, client }) => {
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            await interaction.reply({ content: "Bu komutu kullanabilmek için `Rolleri Yönet` yetkim yok!", ephemeral: true });
            return;
        }
        const user = interaction.options.getUser("kullanıcı");
        const targetMember = interaction.guild.members.cache.get(user.id);
        const data = client.guildsConfig.get(interaction.guild.id);
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles))
            return interaction.reply({ content: "Bu komutu kullanmak için yeterli yetkin yok.", ephemeral: true });
        if (!interaction.guild.roles.cache.get(data.config.muteRole)) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setColor("Red")
                .setDescription("Bu komutu kullanabilmek için önce susturma rolünü ayarlayın!");
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        if (targetMember.id === interaction.user.id) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setColor("Red")
                .setDescription("Kendini susturamazsın!");
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        if (targetMember.user.bot) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setColor("Red")
                .setDescription("Bir botu susturamazsın!");
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        if (targetMember.roles.highest.position >= interaction.member.roles.highest.position) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setColor("Red")
                .setDescription("Bu kullanıcının rolü senden yüksek (veya aynı) bu kişiyi susturamazsın!");
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        if (targetMember.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setColor("Red")
                .setDescription("Bu kullanıcının rolü benden yüksek (veya aynı) o yüzden bu kişiyi susturamam!");
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        if (targetMember.permissions.has("ManageRoles")) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setColor("Red")
                .setDescription("Bu kullanıcının yetkileri var!");
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        const alreadyMuted = await Punishment.findOne({ guildID: interaction.guild.id, userId: targetMember.id, type: "mute" });
        if (alreadyMuted) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setColor("Red")
                .setDescription("Bu kullanıcı zaten susturulmuş!");
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        const duration = ms(`${interaction.options.getString("süre", true)}${interaction.options.getString("vakit", true)}`);
        const reason = interaction.options.getString("sebep", false) || "Sebep belirtilmedi";
        const longduration = ms(duration, { long: true }).replace(/seconds|second/, "saniye").replace(/minutes|minute/, "dakika").replace(/hours|hour/, "saat").replace(/days|day/, "gün");
        try {
            await targetMember.send(`${interaction.guild.name} sunucusunda ${longduration} boyunca susturuldunuz. Sebep: ${reason}`);
            await interaction.reply(`<a:checkmark:1017704018287546388> **${targetMember.user.tag}** ${longduration} boyunca susturuldu (Olay #${data.case}). Kullanıcı özel bir mesaj ile bildirildi`);
        }
        catch {
            await interaction.reply(`<a:checkmark:1017704018287546388> **${targetMember.user.tag}** ${longduration} boyunca susturuldu (Olay #${data.case}). Kullanıcıya özel mesaj atılamadı`);
        }
        if (data.config.muteGetAllRoles) {
            const filterRoles = targetMember.roles.cache.filter(role => (role.id !== interaction.guild.id)).filter((role => role.id !== interaction.guild.roles.premiumSubscriberRole?.id)).filter((role => role.position < interaction.guild.members.me.roles.highest.position)).map(role => role.id);
            await new Punishment({ guildID: interaction.guild.id, userId: targetMember.id, staffId: interaction.user.id, reason, previousRoles: filterRoles, expires: new Date(Date.now() + duration), type: "mute" }).save();
            await targetMember.roles.remove(filterRoles);
            await targetMember.roles.add(data.config.muteRole);
        }
        else {
            await new Punishment({ guildID: interaction.guild.id, userId: targetMember.id, staffId: interaction.user.id, reason, expires: new Date(Date.now() + duration), type: "mute" }).save();
            await targetMember.roles.add(data.config.muteRole);
        }
        if (interaction.guild.channels.cache.get(data.config.modlogChannel)) {
            await modlog({
                guild: interaction.guild,
                user: targetMember.user,
                action: "SUSTUR",
                actionmaker: interaction.user,
                reason,
                duration
            }, client);
        }
    }
};
//# sourceMappingURL=mute.js.map