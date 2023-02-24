import { EmbedBuilder, PermissionsBitField, SlashCommandBuilder, } from "discord.js";
import { registerConfig, welcomeConfig, moderationConfig, roleConfig } from "../../utils/configFunctions.js";
export default {
    data: new SlashCommandBuilder()
        .setName("config")
        .setDescription("Sunucu için gerekli ayarları değiştirmeye yarar.")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .setDMPermission(false)
        .addStringOption(option => {
        return option
            .setName("ayar")
            .setDescription("Ayarlar")
            .setRequired(false)
            .addChoices({
            name: "Kayıt Ayarları",
            value: "register"
        }, {
            name: "Giriş Çıkış Ayarları",
            value: "welcome-leave"
        }, {
            name: "Moderasyon Ayarları",
            value: "moderation"
        }, {
            name: "Rol Ayarları",
            value: "role"
        });
    }),
    execute: async ({ interaction, client }) => {
        const guildConfig = client.guildsConfig.get(interaction.guild.id);
        const setting = interaction.options.getString("ayar");
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator))
            return interaction.reply({ content: "Bu komutu kullanmak için yeterli yetkin yok.", ephemeral: true });
        if (!setting) {
            const embed = new EmbedBuilder()
                .setTitle("Sunucu Ayarları")
                .addFields({
                name: "Kayıt Kanalı",
                value: `Üyeler geldiğinde kayıt için kayıt kanalı ayarlar\n\n${guildConfig.config.registerChannel ? `<#${guildConfig.config.registerChannel}>` : "Ayarlanmamış"}`,
                inline: true
            }, {
                name: "Kayıt Sorumlusu Rolleri",
                value: `Üyeleri kayıt etmeyi sağlayan roller (Admin yetkileri olanlar bunu es geçer)\n\n${guildConfig.config.staffRole?.length > 0 ? guildConfig.config.staffRole.map(role => `<@&${role}>`).join(", ") : "Ayarlanmamış"}`,
                inline: true
            }, {
                name: "Kayıt Mesajı Kanalı",
                value: `Kayıt mesajı kanalı ayarlar\n\n${guildConfig.config.registerWelcomeChannel ? `<#${guildConfig.config.registerWelcomeChannel}>` : "Ayarlanmamış"}`,
                inline: true
            }, {
                name: "Kayıt Mesajı",
                value: `Kayıt kanalına atılacak mesaj (kayıt kanalı olmadan işlevsizdir)\n\n${guildConfig.config.registerMessage ? "Kayıt Mesajı Ayarlanmış." : "Ayarlanmamış"}`,
                inline: true
            }, {
                name: "Kayıt Mesajı Silinsin mi?",
                value: `Kullanıcı kayıt olduğunda veya sunucudan çıktığında atılan kayıt mesajı silinir\n\n${guildConfig.config.registerMessageClear ? "Evet" : "Hayır"}`,
                inline: true
            }, {
                name: "Kayıt Kanalı mesajları Silinsin mi?",
                value: `Kayıt kanalına atılan mesajları siler\n\n${guildConfig.config.registerChannelClear ? "Evet" : "Hayır"}`,
                inline: true
            }, {
                name: "Hoşgeldin Kanalı",
                value: `Üyeler geldiğinde hoşgeldin mesajı atılacak kanalı ayarlar\n\n${guildConfig.config.welcomeChannel ? `<#${guildConfig.config.welcomeChannel}>` : "Ayarlanmamış"}`,
                inline: true
            }, {
                name: "Hoşgeldin Mesajı",
                value: `Üye geldiğinde atılacak mesajı ayarlar\n\n${guildConfig.config.welcomeMessage ? "Hoşgeldin Mesajı Ayarlanmış." : "Ayarlanmamış"}`,
                inline: true
            }, {
                name: "Görüşürüz Kanalı",
                value: `Üyeler çıktığında mesaj atılacak kanalı ayarlar\n\n${guildConfig.config.leaveChannel ? `<#${guildConfig.config.leaveChannel}>` : "Ayarlanmamış"}`,
                inline: true
            }, {
                name: "Görüşürüz Mesajı",
                value: `Üye çıktığında atılacak mesajı ayarlar\n\n${guildConfig.config.leaveMessage ? "Görüşürüz Mesajı Ayarlanmış." : "Ayarlanmamış"}`,
                inline: true
            }, {
                name: "Mute Rolü",
                value: `Üyeleri susturmak için kullanılacak rolü ayarlar\n\n${guildConfig.config.muteRole ? `<@&${guildConfig.config.muteRole}>` : "Ayarlanmamış"}`,
                inline: true
            }, {
                name: "Erkek Rolü",
                value: `Üyelerin erkek olarak kayıt olması için kullanılacak rolü ayarlar\n\n${guildConfig.config.maleRole ? `<@&${guildConfig.config.maleRole}>` : "Ayarlanmamış"}`,
                inline: true
            }, {
                name: "Kadın Rolü",
                value: `Üyelerin kadın olarak kayıt olması için kullanılacak rolü ayarlar\n\n${guildConfig.config.femaleRole ? `<@&${guildConfig.config.femaleRole}>` : "Ayarlanmamış"}`,
                inline: true
            }, {
                name: "Üye Rolü",
                value: `Üyelerin kayıt olması için kullanılacak rolü ayarlar\n\n${guildConfig.config.memberRole ? `<@&${guildConfig.config.memberRole}>` : "Ayarlanmamış"}`,
                inline: true
            }, {
                name: "Günün Rengi Rolü",
                value: "Günün rengi rolü ayarlar\n\n" + (guildConfig.config.roleOfTheDay ? `<@&${guildConfig.config.roleOfTheDay}>` : "Ayarlanmamış"),
            }, {
                name: "Mutelenen kişinin rolleri alınsın mı?",
                value: `Üyeler susturulduğunda geri vermek üzere alınabilen rollerini alır\n\n${guildConfig.config.muteGetAllRoles ? "Evet" : "Hayır"}`,
                inline: true
            }, {
                name: "Modlog Kanalı",
                value: `Sunucudaki yetkili eylemlerini bir kanala atar\n\n${guildConfig.config.modlogChannel ? `<#${guildConfig.config.modlogChannel}>` : "Ayarlanmamış"}`,
                inline: true
            })
                .setColor("Random");
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        switch (setting) {
            case "register":
                await registerConfig(interaction, client);
                break;
            case "welcome-leave":
                await welcomeConfig(interaction, client);
                break;
            case "moderation":
                await moderationConfig(interaction, client);
                break;
            case "role":
                await roleConfig(interaction, client);
                break;
        }
    }
};
//# sourceMappingURL=config.js.map