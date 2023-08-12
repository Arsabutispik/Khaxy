import { ActionRowBuilder, EmbedBuilder, PermissionsBitField, SlashCommandBuilder, StringSelectMenuBuilder, ComponentType } from "discord.js";
import { registerConfig, welcomeConfig, moderationConfig, roleConfig } from "../../utils/configFunctions.js";
export default {
    help: {
        name: "config",
        description: "Sunucu için gerekli ayarları değiştirmeye yarar.",
        usage: "config [ayar]",
        examples: ["config", "config register", "config moderation"],
        category: "Moderasyon"
    },
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
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId("config")
                .setPlaceholder("Ayarlar")
                .addOptions([
                {
                    label: "Kayıt Ayarları",
                    value: "register"
                },
                {
                    label: "Giriş Çıkış Ayarları",
                    value: "welcome-leave"
                },
                {
                    label: "Moderasyon Ayarları",
                    value: "moderation"
                },
                {
                    label: "Rol Ayarları",
                    value: "role"
                },
            ]);
            const raw = new ActionRowBuilder()
                .addComponents(selectMenu);
            const embed = new EmbedBuilder()
                .setColor("Random")
                .setTitle("Ayarlar")
                .setDescription("Ayarları görmek için aşağıdaki menüden seçim yapabilirsin.")
                .setTimestamp();
            await interaction.reply({ embeds: [embed], components: [raw], ephemeral: true });
            const msg = await interaction.fetchReply();
            const filter = (i) => i.customId === "config" && i.user.id === interaction.user.id;
            const collector = msg.createMessageComponentCollector({ filter, componentType: ComponentType.StringSelect, time: 60000 });
            collector.on("collect", async (i) => {
                const setting = i.values[0];
                if (setting === "register") {
                    const registerEmbed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle("Kayıt Ayarları")
                        .setDescription("Ayarlar ve kısaca açıklamaları;" +
                        "\n\n**Kayıt Kanalı:** Kayıt işlemlerinin yapıldığı kanal. `/kayıt` sadece belirlenen kanalda yapılır." +
                        "\n\n**Kayıt Mesajı:** Sunucuya birisi geldiğinde kayıt kanalına atılan mesajdır. Yetkili kadroyu etiketlemenizi de sağlar. Değişkenler: **{user}** - Kullanıcı, **{server}** - Sunucu ismi, **{memberCount}** - Sunucudaki üye sayısı, **{id}** - Kullanıcı ID'si, **{name}** - Kullanıcının ismi." +
                        "\n\n**Kayıt Mesajının Atıldığı Kanal:** Kayıt mesajının atıldığı kanal." +
                        "\n\n**Kayıt Kanalındaki Mesajlar Silinsin mi?:** Kayıt işlemlerinden sonra kanaldaki silinebilecek tüm mesajları silmeye çalışır." +
                        "\n\n**Kayıt Mesajı Silinsin mi?:** Kullanıcı çıktığı zaman kayıt mesajını silmeye çalışır. (Genellikle çalışmaz.)" +
                        "\n\n**»»----------------------------¤----------------------------««**")
                        .addFields([
                        {
                            name: "Kayıt Kanalı",
                            value: guildConfig.config.registerChannel ? `<#${guildConfig.config.registerChannel}>` : "Ayarlanmamış"
                        },
                        {
                            name: "Kayıt Mesajı",
                            value: guildConfig.config.registerMessage ? "Ayarlanmış" : "Ayarlanmamış"
                        },
                        {
                            name: "Kayıt Mesajının Atıldığı Kanal",
                            value: guildConfig.config.registerWelcomeChannel ? `<#${guildConfig.config.registerWelcomeChannel}>` : "Ayarlanmamış"
                        },
                        {
                            name: "Kayıt Kanalındaki Mesajlar Silinsin mi?",
                            value: guildConfig.config.registerChannelClear ? "Evet" : "Hayır"
                        },
                        {
                            name: "Kayıt Mesajı Silinsin mi?",
                            value: guildConfig.config.registerMessageClear ? "Evet" : "Hayır"
                        }
                    ])
                        .setTimestamp();
                    await i.update({ embeds: [registerEmbed], components: [raw] });
                }
                else if (setting === "welcome-leave") {
                    const welcomeEmbed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle("Giriş Çıkış Ayarları")
                        .setDescription("Ayarlar ve kısaca açıklamaları;" +
                        "\n\n**Giriş Mesajı:** Sunucuya birisi geldiğinde atılan mesajdır. Değişkenler: **{user}** - Kullanıcı, **{server}** - Sunucu ismi, **{memberCount}** - Sunucudaki üye sayısı, **{id}** - Kullanıcı ID'si, **{name}** - Kullanıcının ismi." +
                        "\n\n**Giriş Mesajının Atıldığı Kanal:** Giriş mesajının atıldığı kanal." +
                        "\n\n**Çıkış Mesajı:** Sunucudan birisi çıktığında atılan mesajdır. Değişkenler: **{user}** - Kullanıcı, **{server}** - Sunucu ismi, **{memberCount}** - Sunucudaki üye sayısı, **{id}** - Kullanıcı ID'si, **{name}** - Kullanıcının ismi." +
                        "\n\n**Çıkış Mesajının Atıldığı Kanal:** Çıkış mesajının atıldığı kanal." +
                        "\n\n**»»----------------------------¤----------------------------««**")
                        .addFields([
                        {
                            name: "Giriş Mesajı",
                            value: guildConfig.config.welcomeMessage ? "Ayarlanmış" : "Ayarlanmamış"
                        },
                        {
                            name: "Giriş Mesajının Atıldığı Kanal",
                            value: guildConfig.config.welcomeChannel ? `<#${guildConfig.config.welcomeChannel}>` : "Ayarlanmamış"
                        },
                        {
                            name: "Çıkış Mesajı",
                            value: guildConfig.config.leaveMessage ? "Ayarlanmış" : "Ayarlanmamış"
                        },
                        {
                            name: "Çıkış Mesajının Atıldığı Kanal",
                            value: guildConfig.config.leaveChannel ? `<#${guildConfig.config.leaveChannel}>` : "Ayarlanmamış"
                        },
                    ])
                        .setTimestamp();
                    await i.update({ embeds: [welcomeEmbed], components: [raw] });
                }
                else if (setting === "moderation") {
                    const moderationEmbed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle("Moderasyon Ayarları")
                        .setDescription("Ayarlar ve kısaca açıklamaları;" +
                        "\n\n**Modlog Kanalı:** Sunucuda yetkililer tarafından yapılan tüm işlemlerin loglandığı kanal." +
                        "\n\n**Mute Sırasında Roller Alınsın mı?:** Kullanıcıya mute atıldığında rollerinin alınıp alınmayacağı ayarlanır." +
                        "\n\n**Yetkili Rolleri:** Kayıt içindir ayarlanmazsa admin permi olmadığı sürece kimse kayıt alamaz." +
                        "\n\n**ModMail Kanalı**: Modmail üyelerin bota DM yazarak sunucuda modlarla özel bir kanalda konuşabileceği yerler açar." +
                        "\n\n**»»----------------------------¤----------------------------««**")
                        .addFields([
                        {
                            name: "Modlog Kanalı",
                            value: guildConfig.config.modlogChannel ? `<#${guildConfig.config.modlogChannel}>` : "Ayarlanmamış"
                        },
                        {
                            name: "Mute Sırasında Roller Alınsın mı?",
                            value: guildConfig.config.muteGetAllRoles ? "Evet" : "Hayır"
                        },
                        {
                            name: "Yetikili Rolleri",
                            value: guildConfig.config.staffRole.length > 0 ? guildConfig.config.staffRole.map(x => `<@&${x}>`).join(", ") : "Ayarlanmamış"
                        },
                        {
                            name: "ModMail Kanalı",
                            value: guildConfig.config.modmail.logChannel ? `<#${guildConfig.config.modmail.logChannel}>` : "Ayarlanmamış"
                        }
                    ])
                        .setTimestamp();
                    await i.update({ embeds: [moderationEmbed], components: [raw] });
                }
                else if (setting === "role") {
                    const roleEmbed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle("Rol Ayarları")
                        .setDescription("Ayarlar ve kısaca açıklamaları;" +
                        "\n\n**Kayıt Rolleri:** Kayıt sırasında verilecek cinsiyet rolleri." +
                        "\n\n**Üye Rolü:** Kayıt sırasında verilecek üye rolü. (Eğer kayıt ayarlanmadan bu rol ayarlandıysa bot sunucuya gelen kişiye bu rolü verir.)" +
                        "\n\n**Susturulmuş Rolü:** Kullanıcıya mute atıldığında verilecek rol." +
                        "\n\n**Günün Rengi Rolü:** Her gün UTC+3 00:00'da bot ayarlanmış rolün rengini ve ismini değiştirir. (Eğer ayarlanmazsa bu özellik çalışmaz.)" +
                        "\n\n**DJ Rolü:** Bu role sahip kullanıcılar müzik dinlerken bazı kısıtlamaları bypass edebilirler." +
                        "\n\n**»»----------------------------¤----------------------------««**")
                        .addFields([
                        {
                            name: "Kayıt Rolleri",
                            value: `Kız: ${guildConfig.config.femaleRole ? `<@&${guildConfig.config.femaleRole}>` : "Ayarlanmamış"}\nErkek: ${guildConfig.config.maleRole ? `<@&${guildConfig.config.maleRole}>` : "Ayarlanmamış"}`,
                        },
                        {
                            name: "Üye Rolü",
                            value: guildConfig.config.memberRole ? `<@&${guildConfig.config.memberRole}>` : "Ayarlanmamış"
                        },
                        {
                            name: "Susturulmuş Rolü",
                            value: guildConfig.config.muteRole ? `<@&${guildConfig.config.muteRole}>` : "Ayarlanmamış"
                        },
                        {
                            name: "Günün Rengi Rolü",
                            value: guildConfig.config.roleOfTheDay ? `<@&${guildConfig.config.roleOfTheDay}>` : "Ayarlanmamış"
                        },
                        {
                            name: "DJ Rolü",
                            value: guildConfig.config.djRole ? `<@&${guildConfig.config.djRole}>` : "Ayarlanmamış"
                        }
                    ])
                        .setTimestamp();
                    await i.update({ embeds: [roleEmbed], components: [raw] });
                }
            });
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