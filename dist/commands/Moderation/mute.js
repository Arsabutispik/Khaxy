import { MessageEmbed } from "discord.js";
import ms from "ms";
import punishment from "../../schemas/punishmentSchema.js";
import config from "../../config.json" assert { type: 'json' };
import modlog from "../../utils/modlog.js";
import caseResultSchema from "../../schemas/caseResultSchema.js";
import caseSchema from "../../schemas/caseSchema.js";
export default {
    name: "mute",
    description: "Bir kullanıcıyı belirli bir süre susturur",
    usage: "s!mute <@kullanıcı|id> <süre> <sebep>",
    examples: "s!mute <@1007246359696515125> 3h aklını topla gel",
    category: "Moderasyon",
    async execute({ message, args }) {
        if (!message.member.permissions.has("MANAGE_ROLES")) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Bu komutu kullanabilmek için yetkiniz yok!");
            message.channel.send({ embeds: [embed] });
            return;
        }
        const targetMember = message.mentions.members?.first() || message.guild.members.cache.get(args[0]);
        if (!targetMember) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Bir kullanıcı bulunamadı!");
            message.channel.send({ embeds: [embed] });
            return;
        }
        if (targetMember.id == message.author.id) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Kendini susturamazsın!");
            message.channel.send({ embeds: [embed] });
            return;
        }
        if (targetMember.user.bot) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Bir botu susturamazsın!");
            message.channel.send({ embeds: [embed] });
            return;
        }
        if (targetMember.roles.highest.position >= message.member.roles.highest.position) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Bu kullanıcının rolü senden yüksek (veya aynı) bu kişiyi susturamazsın!");
            message.channel.send({ embeds: [embed] });
            return;
        }
        if (targetMember.roles.highest.position >= message.guild.me.roles.highest.position) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Bu kullanıcının rolü benden yüksek (veya aynı) o yüzden bu kişiyi susturamam!");
            message.channel.send({ embeds: [embed] });
            return;
        }
        if (targetMember.permissions.has("MANAGE_ROLES")) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Bu kullanıcının yetkileri var!");
            message.channel.send({ embeds: [embed] });
            return;
        }
        const duration = ms(args[1]);
        if (!duration) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Bir süre girmen gerekiyor!");
            message.channel.send({ embeds: [embed] });
            return;
        }
        const reason = args.slice(2).join(" ") || "Sebep belirtilmedi";
        let cases = await caseSchema.findOne({ _id: message.guild.id });
        if (!cases) {
            cases = await caseSchema.findOneAndUpdate({ _id: message.guild.id }, {}, { setDefaultsOnInsert: true, new: true, upsert: true });
        }
        const longduration = ms(duration, { long: true }).replace(/seconds|second/, "saniye").replace(/minutes|minute/, "dakika").replace(/hours|hour/, "saat").replace(/days|day/, "gün");
        try {
            await targetMember.send(`${message.guild.name} sunucusunda ${longduration} boyunca susturuldunuz. Sebep: ${reason}`);
            message.channel.send(`<:checkmark:962444136366112788> **${targetMember.user.tag}** ${longduration} boyunca susturuldu (Olay #${cases.case}). Kullanıcı özel bir mesaj ile bildirildi`);
        }
        catch {
            message.channel.send(`<:checkmark:962444136366112788> **${targetMember.user.tag}** ${longduration} boyunca susturuldu (Olay #${cases.case}). Kullanıcıya özel mesaj atılamadı`);
        }
        await new punishment({ userId: targetMember.id, staffId: message.author.id, reason, previousRoles: [...targetMember.roles.cache.filter(r => r.id !== message.guild.roles.premiumSubscriberRole?.id || r.id !== message.guild.roles.everyone.id).map(r => r.id)], expires: new Date(Date.now() + duration), type: "mute" }).save();
        await targetMember.roles.remove(targetMember.roles.cache.filter(roles => message.guild.roles.premiumSubscriberRole?.id != roles.id).map(r => r.id));
        await targetMember.roles.add(config.MUTE_ROLE);
        modlog(message.guild, targetMember.user, "SUSTUR", message.author, reason, duration);
        await new caseResultSchema({ case: cases.case, reason, userId: targetMember.id, staffId: message.author.id }).save();
    }
};
//# sourceMappingURL=mute.js.map