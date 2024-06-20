import {slashCommandBase} from "../../types";
import {GuildMember, PermissionsBitField, SlashCommandBuilder} from "discord.js";
import modlog from "../../utils/modlog.js";
import {daysToSeconds} from "../../utils/utils.js";

export default {
    help: {
        name: "kick",
        description: "Bir kullanıcıyı sunucudan atar",
        usage: "kick <kullanıcı> [sebep] [temizle]",
        examples: ["kick @Khaxy", "kick @Khaxy reklam", "kick @Khaxy reklam true"],
        category: "Moderasyon"
    },
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Bir kullanıcıyı sunucudan atar")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers)
        .setDMPermission(false)
        .addUserOption(option => option.setName("kullanıcı").setDescription("Atılacak kullanıcı").setRequired(true))
        .addStringOption(option => option.setName("sebep").setDescription("Atılma sebebi").setRequired(false))
        .addBooleanOption(option => option.setName("temizle").setDescription("Atılan kullanıcının son 7 gündeki mesajlarını siler")),
    execute: async ({interaction, client}) => {
        if(!interaction.guild!.members.me!.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            await interaction.reply({content: "Bu komutu kullanabilmek için `Üyeleri At` yetkim yok!", ephemeral: true})
            return
        }
        const user = interaction.options.getUser("kullanıcı");
        const targetMember = interaction.guild!.members.cache.get(user!.id)!;
        const reason = interaction.options.getString("sebep", false) || "Sebep belirtilmedi"
        const clear = interaction.options.getBoolean("temizle", false)
        const data = client.guildsConfig.get(interaction.guildId!)!
        if(!(interaction.member as GuildMember).permissions.has(PermissionsBitField.Flags.KickMembers)) return interaction.reply({content: "Bu komutu kullanmak için yeterli yetkin yok.", ephemeral: true});
        if(targetMember.id === interaction.user.id) {
            await interaction.reply({content: "Kendini atamazsın!", ephemeral: true})
            return
        }
        if(targetMember.user.bot) {
            await interaction.reply({content: "Bir botu atamazsın!", ephemeral: true})
            return
        }
        if(targetMember.roles.highest.position >= (interaction.member as GuildMember)!.roles.highest.position) {
            await interaction.reply({content: "Bu kullanıcının rolü senden yüksek (veya aynı) bu kişiyi atamazsın!", ephemeral: true})
            return
        }
        if(targetMember.permissions.has("KickMembers")) {
            await interaction.reply({content: "Bu kullanıcın \`Üyeleri Atma\` Yetkisi var!", ephemeral: true})
            return
        }
        try {
            await targetMember.send(`${interaction.guild!.name} sunucusundan atıldınız. Sebep: ${reason}`)
            await interaction.reply(`<a:checkmark:1017704018287546388> **${targetMember.user.tag}** atıldı (Olay #${data.case}) Kullanıcı özel bir mesaj ile bildirildi`)
        } catch {
            await interaction.reply(`<a:checkmark:1017704018287546388> **${targetMember.user.tag}** atıldı (Olay #${data.case}) Kullanıcıya özel mesaj atılamadı`)
        }
        if(interaction.guild!.channels.cache.get(data.config.modlogChannel)) {
            try {
                await modlog({
                    guild: interaction.guild!,
                    user: targetMember.user,
                    action: "KICK",
                    actionmaker: interaction.user,
                    reason
                }, client)
            } catch {
                await interaction.followUp({content: "Modlog kanalına mesaj göndermek için yetkim yok!", ephemeral: true})
            }
        }
        if(clear) {
            await targetMember.ban({reason: reason, deleteMessageSeconds: daysToSeconds(7)})
            await interaction.guild!.bans.remove(targetMember.user, "softban")
            await interaction.reply({content: "Kullanıcı başarıyla atıldı ve mesajları silindi!", ephemeral: true})
        } else {
            await targetMember.kick(reason)
            await interaction.reply({content: "Kullanıcı başarıyla atıldı!", ephemeral: true})
        }
    }
} as slashCommandBase