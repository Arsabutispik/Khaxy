import {slashCommandBase} from "../../types";
import {EmbedBuilder, TextChannel, SlashCommandBuilder, Message, PermissionsBitField} from "discord.js";
import {sleep} from "../../utils/utils.js";

export default {
    help: {
        name: "kayıt",
        description: "Kayıt işlemini yapar.",
        usage: "kayıt <kullanıcı> <cinsiyet>",
        examples: ["kayıt @Khaxy üye", "kayıt @Khaxy erkek", "kayıt @Khaxy kadın"],
        category: "Moderasyon"
    },
    data: new SlashCommandBuilder()
        .setName("register")
        .setNameLocalizations({
            "tr": "kayıt"
        })
        .setDescription("Manages the register process")
        .setDescriptionLocalizations({
            "tr": "Kayıt işlemeni yapar"
        })
        .setDMPermission(false)
        .addUserOption(option => option.setName("user").setNameLocalizations({
            "tr": "kullanıcı"
        }).setDescription("Choose the user to register").setDescriptionLocalizations({
            "tr": "Kayıt edilecek kullanıcıyı seçin"
        }).setRequired(true))
        .addStringOption(option => option.setName("gender").setNameLocalizations({
            "tr": "cinsiyet"
        }).setDescription("The gender of the member to register").setDescriptionLocalizations({
            "tr": "Kayıt edilecek üyenin cinsiyeti cinsi"
        }).setRequired(true).addChoices(
            {
                name: "Male 👨",
                value: "male"

            },
            {
                name: "Woman 👩",
                value: "woman"
            },
            {
                name: "None 👤",
                value: "none"
            }
        )),
    execute: async ({interaction, client}) => {
        const guildConfig = client.guildsConfig.get(interaction.guild!.id)!
        //@ts-ignore
        if(!interaction.member!.roles.cache.hasAny(...guildConfig.config.staffRole) || !interaction.member!.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            const embed = new EmbedBuilder()
                .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
                .setColor("Red")
                .setDescription(client.handleLanguages("REGISTER_NOT_ENOUGH_PERMS", client, interaction.guild!.id))
            await interaction.reply({embeds: [embed], ephemeral: true})
            return
        }
        if(!interaction.guild!.members.me!.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            await interaction.reply({content: "Bu komutu kullanabilmek için `Rolleri Yönet` yetkim yok!", ephemeral: true})
            return
        }
        const user = interaction.options.getUser("user");
        const targetMember = interaction.guild!.members.cache.get(user!.id)!;
        const gender = interaction.options.getString("gender", true)


        if(!guildConfig.config) {
            const embed = new EmbedBuilder()
                .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
                .setColor("Red")
                .setDescription("Bu komut sadece kayıt kanallarında kullanılabilir. Lütfen önce kayıt kanallarını, kayıt sorumlularını ve rolleri ayarlayın ayarlayın!")
            await interaction.reply({embeds: [embed], ephemeral: true})
            return
        } else if(!guildConfig.config.registerChannel) {
            const embed = new EmbedBuilder()
                .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
                .setColor("Red")
                .setDescription("Bu komut sadece kayıt kanallarında kullanılabilir. Lütfen önce kayıt kanallarını ayarlayın!")
            await interaction.reply({embeds: [embed], ephemeral: true})
            return
        } else if(guildConfig.config.registerChannel !== interaction.channel!.id) {
            const embed = new EmbedBuilder()
                .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
                .setColor("Red")
                .setDescription("Bu komut sadece kayıt kanallarında kullanılabilir.")
            await interaction.reply({embeds: [embed], ephemeral: true})
            return
        } else

        if(targetMember.user.id === interaction.user.id) {
            await interaction.reply({content: "Kendini kayıt edemezsin! 💀", ephemeral: true});
            return;
        }
        if(gender === "male") {
            if(!interaction.guild!.roles.cache.get(guildConfig.config.maleRole)) {
                const embed = new EmbedBuilder()
                    .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
                    .setColor("Red")
                    .setDescription("Erkek rolü ayarlanmamış. Lütfen önce erkek rolünü ayarlayın!")
                await interaction.reply({embeds: [embed], ephemeral: true})
                return
            } else if(!interaction.guild!.roles.cache.get(guildConfig.config.memberRole)) {
                const embed = new EmbedBuilder()
                    .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
                    .setColor("Red")
                    .setDescription("Üye rolü ayarlanmamış. Lütfen önce üye rolünü ayarlayın!")
                await interaction.reply({embeds: [embed], ephemeral: true})
                return
            }
            try {
                await targetMember.roles.add(guildConfig.config.maleRole);
                await targetMember.roles.add(guildConfig.config.memberRole);
            } catch (e) {
                await interaction.reply({content: "Bir hata oluştu! Lütfen daha sonra tekrar deneyin! Hatanın muhtemel sebebi üye rolleri botun rolünün üzerinde", ephemeral: true})
            }
        } else if(gender === "woman") {
            if(!interaction.guild!.roles.cache.get(guildConfig.config.femaleRole)) {
                const embed = new EmbedBuilder()
                    .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
                    .setColor("Red")
                    .setDescription("Kadın rolü ayarlanmamış. Lütfen önce kadın rolünü ayarlayın!")
                await interaction.reply({embeds: [embed], ephemeral: true})
                return
            } else if(!interaction.guild!.roles.cache.get(guildConfig.config.memberRole)) {
                const embed = new EmbedBuilder()
                    .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
                    .setColor("Red")
                    .setDescription("Üye rolü ayarlanmamış. Lütfen önce üye rolünü ayarlayın!")
                await interaction.reply({embeds: [embed], ephemeral: true})
                return
            }
            try {
                await targetMember.roles.add(guildConfig.config.femaleRole);
                await targetMember.roles.add(guildConfig.config.memberRole);
            } catch (e) {
                await interaction.reply({content: "Bir hata oluştu! Lütfen daha sonra tekrar deneyin! Hatanın muhtemel sebebi üye rolleri botun rolünün üzerinde", ephemeral: true})
            }
        } else if(gender === "none") {
            if(!interaction.guild!.roles.cache.get(guildConfig.config.memberRole)) {
                const embed = new EmbedBuilder()
                    .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
                    .setColor("Red")
                    .setDescription("Üye rolü ayarlanmamış. Lütfen önce üye rolünü ayarlayın!")
                await interaction.reply({embeds: [embed], ephemeral: true})
                return
            }
            try {
                await targetMember.roles.add(guildConfig.config.memberRole);
            } catch (e) {
                await interaction.reply({content: "Bir hata oluştu! Lütfen daha sonra tekrar deneyin! Hatanın muhtemel sebebi üye rolleri botun rolünün üzerinde", ephemeral: true})
            }
        }
        await interaction.reply(`${targetMember}, başarıyla kayıt edildi!`);
        await sleep(1000);

        if(guildConfig.config.registerChannelClear) {
            if(!interaction.inCachedGuild()) return
            const msgs = await interaction.channel!.messages.fetch();
            await (interaction.channel as TextChannel).bulkDelete(msgs.filter((m: Message) => !m.pinned))
        }
        if(guildConfig.config.registerMessageClear) {
            const welcomeChannel = interaction.guild!.channels.cache.get(guildConfig.config.registerChannel) as TextChannel;
            const wmsgs = await welcomeChannel.messages.fetch({cache: true})
            await welcomeChannel.messages.delete(wmsgs.find((m: Message) => m.mentions.members?.first()?.id === targetMember.id)!)
        }
    }
} as slashCommandBase