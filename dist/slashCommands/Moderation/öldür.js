import { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } from "discord.js";
import ms from "ms";
import modlog from "../../utils/modlog.js";
import Punishment from "../../schemas/punishmentSchema.js";
import { daysToSeconds } from "../../utils/utils.js";
export default {
    data: new SlashCommandBuilder()
        .setName("öldür")
        .setDescription("Bir kullanıcıyı sunucudan yasaklamanın zevkli yolu")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers)
        .setDMPermission(false)
        .addSubcommand(subcommand => subcommand.setName("force").setDescription("Zorla bir üyeyi öldürür")
        .addStringOption(option => option.setName("id").setDescription("Öldürülecek üyenin ID'si").setRequired(true))
        .addStringOption(option => option.setName("süre").setDescription("Öldürülecek üyenin yasaklanma süresi").setRequired(false))
        .addStringOption(option => option.setName("vakit").setDescription("Öldürülecek üyenin yasaklanma süresinin birimi").setRequired(false)
        .setChoices({ name: "Saniye", value: "s" }, { name: "Dakika", value: "m" }, { name: "Saat", value: "h" }, { name: "Gün", value: "d" }, { name: "Hafta", value: "w" }))
        .addStringOption(option => option.setName("sebep").setDescription("Öldürülme sebebini girin.").setRequired(false)))
        .addSubcommand(subcommand => subcommand.setName("üye").setDescription("Bir üyeyi öldürür")
        .addUserOption(option => option.setName("üye").setDescription("Öldürülecek üyenin ID'si").setRequired(true))
        .addStringOption(option => option.setName("süre").setDescription("Öldürülecek üyenin yasaklanma süresi").setRequired(false))
        .addStringOption(option => option.setName("vakit").setDescription("Öldürülecek üyenin yasaklanma süresinin birimi").setRequired(false)
        .setChoices({ name: "Saniye", value: "s" }, { name: "Dakika", value: "m" }, { name: "Saat", value: "h" }, { name: "Gün", value: "d" }, { name: "Hafta", value: "w" }))
        .addStringOption(option => option.setName("sebep").setDescription("Öldürülme sebebini girin.").setRequired(false))),
    execute: async ({ interaction, client }) => {
        const data = client.guildsConfig.get(interaction.guild.id);
        const subCommand = interaction.options.getSubcommand(true);
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers))
            return interaction.reply({ content: "Bu komutu kullanmak için yeterli yetkin yok.", ephemeral: true });
        if (subCommand === "üye") {
            const user = interaction.options.getUser("üye");
            const targetMember = interaction.guild.members.cache.get(user.id);
            const reason = interaction.options.getString("sebep", false) || "Sebep belirtilmedi";
            if (targetMember.id === interaction.user.id) {
                await interaction.reply({ content: "Kendini öldüremezsin!", ephemeral: true });
                return;
            }
            if (targetMember.user.bot) {
                await interaction.reply({ content: "Bir botu öldüremezsin!", ephemeral: true });
                return;
            }
            if (targetMember.roles.highest.position >= interaction.member.roles.highest.position) {
                await interaction.reply({ content: "Bu kullanıcının rolü senden yüksek (veya aynı) bu kişiyi öldüremezsin!", ephemeral: true });
                return;
            }
            if (targetMember.permissions.has("BanMembers")) {
                await interaction.reply({ content: "Bu kullanıcın \`Üyeleri Yasaklama\` Yetkisi var!", ephemeral: true });
                return;
            }
            if (interaction.options.getString("süre", false) && !interaction.options.getString("vakit", false)) {
                await interaction.reply({ content: "Lütfen bir zaman dilimi belirtin!", ephemeral: true });
                return;
            }
            else if (!interaction.options.getString("süre", false) && interaction.options.getString("vakit", false)) {
                await interaction.reply({ content: "Lütfen bir zaman belirtin!", ephemeral: true });
                return;
            }
            if (interaction.options.getString("süre", false)) {
                const duration = ms(`${interaction.options.getString("süre", true) || "0"}${interaction.options.getString("vakit", true) || "s"}`);
                const longduration = ms(duration, { long: true }).replace(/seconds|second/, "saniye").replace(/minutes|minute/, "dakika").replace(/hours|hour/, "saat").replace(/days|day/, "gün");
                await targetMember.ban({ reason: reason });
                try {
                    await targetMember.send(`${interaction.guild.name} sunucusundan **${longduration}** boyunca öldürüldün (yasaklandın). Sebep: ${reason}`);
                    await interaction.channel.send(`<a:checkmark:1017704018287546388> **${targetMember.user.tag}** ${longduration} boyunca öldürüldü (Olay #${data.case}) Kullanıcı özel bir mesaj ile bildirildi`);
                }
                catch {
                    await interaction.channel.send(`<a:checkmark:1017704018287546388> **${targetMember.user.tag}** ${longduration} boyunca öldürüldü (Olay #${data.case}) Kullanıcıya özel mesaj atılamadı`);
                }
                await targetMember.ban({ reason, deleteMessageSeconds: daysToSeconds(7) });
                if (interaction.guild.channels.cache.get(data.config.modlogChannel)) {
                    await modlog({
                        guild: interaction.guild,
                        user: targetMember.user,
                        action: "SÜRELİ_BAN",
                        actionmaker: interaction.user,
                        reason,
                        duration
                    }, client);
                }
                await new Punishment({ guildID: interaction.guild.id, userId: targetMember.id, staffId: interaction.user.id, reason, expires: new Date(Date.now() + duration), type: "ban" }).save();
            }
            else {
                try {
                    await targetMember.send(`${interaction.guild.name} sunucusunda öldürüldün (yasaklandın). Sebep: ${reason}`);
                    await interaction.channel.send(`<a:checkmark:1017704018287546388> **${targetMember.user.tag}** öldürüldü (Olay #${data.case}) Kullanıcı özel bir mesaj ile bildirildi`);
                }
                catch {
                    await interaction.channel.send(`<a:checkmark:1017704018287546388> **${targetMember.user.tag}** öldürüldü (Olay #${data.case}) Kullanıcıya özel mesaj atılamadı`);
                }
                if (interaction.guild.channels.cache.get(data.config.modlogChannel)) {
                    await modlog({
                        guild: interaction.guild,
                        user: targetMember.user,
                        action: "BAN",
                        actionmaker: interaction.user,
                        reason
                    }, client);
                }
                await targetMember.ban({ reason });
            }
        }
        else if (subCommand === "force") {
            let fetchUser;
            try {
                fetchUser = await client.users.fetch(`${interaction.options.getString("id", true)}`);
            }
            catch {
                const embed = new EmbedBuilder()
                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                    .setColor("Red")
                    .setDescription("Bir kullanıcı bulunamadı!");
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }
            if (interaction.options.getString("süre", false) && !interaction.options.getString("vakit", false)) {
                await interaction.reply({ content: "Lütfen bir zaman dilimi belirtin!", ephemeral: true });
                return;
            }
            else if (!interaction.options.getString("süre", false) && interaction.options.getString("vakit", false)) {
                await interaction.reply({ content: "Lütfen bir zaman belirtin!", ephemeral: true });
                return;
            }
            if (interaction.options.getString("süre", false)) {
                const duration = ms(`${interaction.options.getString("süre", true) || "0"}${interaction.options.getString("vakit", true) || "s"}`);
                const longduration = ms(duration, { long: true }).replace(/seconds|second/, "saniye").replace(/minutes|minute/, "dakika").replace(/hours|hour/, "saat").replace(/days|day/, "gün");
                const reason = interaction.options.getString("sebep", false) || "Sebep belirtilmedi";
                await interaction.channel.send(`<a:checkmark:1017704018287546388> **${fetchUser.tag}** ${longduration} boyunca öldürüldü (Olay #${data.case})`);
                await interaction.guild.bans.create(fetchUser.id);
                if (interaction.guild.channels.cache.get(data.config.modlogChannel)) {
                    await modlog({
                        guild: interaction.guild,
                        user: fetchUser,
                        action: "ZORUNLU_BAN",
                        actionmaker: interaction.user,
                        reason,
                        duration
                    }, client);
                }
                await new Punishment({ guildID: interaction.guild.id, userId: fetchUser.id, staffId: interaction.user.id, reason, expires: new Date(Date.now() + duration), type: "ban" }).save();
            }
            else {
                const reason = interaction.options.getString("sebep", false) || "Sebep belirtilmedi";
                await interaction.channel.send(`<a:checkmark:1017704018287546388> **${fetchUser.tag}** öldürüldü (Olay #${data.case})`);
                await interaction.guild.bans.create(fetchUser.id);
                if (interaction.guild.channels.cache.get(data.config.modlogChannel)) {
                    await modlog({
                        guild: interaction.guild,
                        user: fetchUser,
                        action: "ZORUNLU_BAN",
                        actionmaker: interaction.user,
                        reason
                    }, client);
                }
            }
        }
    }
};
//# sourceMappingURL=%C3%B6ld%C3%BCr.js.map