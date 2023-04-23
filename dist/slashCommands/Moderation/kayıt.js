import { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } from "discord.js";
import { sleep } from "../../utils/utils.js";
export default {
    data: new SlashCommandBuilder()
        .setName("kayıt")
        .setDescription("Kayıt işlemini yapar.")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles)
        .setDMPermission(false)
        .addUserOption(option => option.setName("kullanıcı").setDescription("Kayıt edilecek kullanıcıyı seçin.").setRequired(true))
        .addStringOption(option => option.setName("cinsiyet").setDescription("Kayıt edilecek üyenin cinsiyeti").setRequired(true).addChoices({
        name: "Erkek",
        value: "erkek"
    }, {
        name: "Kadın",
        value: "kadın"
    }, {
        name: "Yok",
        value: "yok"
    })),
    execute: async ({ interaction, client }) => {
        const user = interaction.options.getUser("kullanıcı");
        const targetMember = interaction.guild.members.cache.get(user.id);
        const gender = interaction.options.getString("cinsiyet", true);
        const guildConfig = client.guildsConfig.get(interaction.guild.id);
        if (!guildConfig.config) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setColor("Red")
                .setDescription("Bu komut sadece kayıt kanallarında kullanılabilir. Lütfen önce kayıt kanallarını, kayıt sorumlularını ve rolleri ayarlayın ayarlayın!");
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        else if (!guildConfig.config.registerChannel) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setColor("Red")
                .setDescription("Bu komut sadece kayıt kanallarında kullanılabilir. Lütfen önce kayıt kanallarını ayarlayın!");
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        else if (guildConfig.config.registerChannel !== interaction.channel.id) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setColor("Red")
                .setDescription("Bu komut sadece kayıt kanallarında kullanılabilir.");
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        else if (!interaction.member.roles.cache.hasAny(...guildConfig.config.staffRole) || !interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setColor("Red")
                .setDescription("Bu komutu kullanabilmek kayıt yetkilisi olmalısınız!");
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        if (targetMember.user.id === interaction.user.id) {
            await interaction.reply({ content: "Kendini kayıt edemezsin! 💀", ephemeral: true });
            return;
        }
        if (gender === "erkek") {
            if (!interaction.guild.roles.cache.get(guildConfig.config.maleRole)) {
                const embed = new EmbedBuilder()
                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                    .setColor("Red")
                    .setDescription("Erkek rolü ayarlanmamış. Lütfen önce erkek rolünü ayarlayın!");
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }
            else if (!interaction.guild.roles.cache.get(guildConfig.config.memberRole)) {
                const embed = new EmbedBuilder()
                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                    .setColor("Red")
                    .setDescription("Üye rolü ayarlanmamış. Lütfen önce üye rolünü ayarlayın!");
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }
            try {
                await targetMember.roles.add(guildConfig.config.maleRole);
                await targetMember.roles.add(guildConfig.config.memberRole);
            }
            catch (e) {
                await interaction.reply({ content: "Bir hata oluştu! Lütfen daha sonra tekrar deneyin! Hatanın muhtemel sebebi üye rolleri botun rolünün üzerinde", ephemeral: true });
            }
        }
        else if (gender === "kadın") {
            if (!interaction.guild.roles.cache.get(guildConfig.config.femaleRole)) {
                const embed = new EmbedBuilder()
                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                    .setColor("Red")
                    .setDescription("Kadın rolü ayarlanmamış. Lütfen önce kadın rolünü ayarlayın!");
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }
            else if (!interaction.guild.roles.cache.get(guildConfig.config.memberRole)) {
                const embed = new EmbedBuilder()
                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                    .setColor("Red")
                    .setDescription("Üye rolü ayarlanmamış. Lütfen önce üye rolünü ayarlayın!");
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }
            try {
                await targetMember.roles.add(guildConfig.config.femaleRole);
                await targetMember.roles.add(guildConfig.config.memberRole);
            }
            catch (e) {
                await interaction.reply({ content: "Bir hata oluştu! Lütfen daha sonra tekrar deneyin! Hatanın muhtemel sebebi üye rolleri botun rolünün üzerinde", ephemeral: true });
            }
        }
        else if (gender === "yok") {
            if (!interaction.guild.roles.cache.get(guildConfig.config.memberRole)) {
                const embed = new EmbedBuilder()
                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                    .setColor("Red")
                    .setDescription("Üye rolü ayarlanmamış. Lütfen önce üye rolünü ayarlayın!");
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }
            try {
                await targetMember.roles.add(guildConfig.config.memberRole);
            }
            catch (e) {
                await interaction.reply({ content: "Bir hata oluştu! Lütfen daha sonra tekrar deneyin! Hatanın muhtemel sebebi üye rolleri botun rolünün üzerinde", ephemeral: true });
            }
        }
        await interaction.reply(`${targetMember}, başarıyla kayıt edildi!`);
        await sleep(1000);
        if (guildConfig.config.registerChannelClear) {
            if (!interaction.inCachedGuild())
                return;
            const msgs = await interaction.channel.messages.fetch();
            await interaction.channel.bulkDelete(msgs.filter((m) => !m.pinned));
        }
        if (guildConfig.config.registerMessageClear) {
            const welcomeChannel = interaction.guild.channels.cache.get(guildConfig.config.registerChannel);
            const wmsgs = await welcomeChannel.messages.fetch({ cache: true });
            await welcomeChannel.messages.delete(wmsgs.find((m) => m.mentions.members?.first()?.id === targetMember.id));
        }
    }
};
//# sourceMappingURL=kay%C4%B1t.js.map