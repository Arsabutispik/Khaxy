import { MessageEmbed } from "discord.js";
import caseSchema from "../../schemas/caseSchema.js";
import modlog from "../../utils/modlog.js";
import caseResultSchema from "../../schemas/caseResultSchema.js";
export default {
    name: "uyar",
    description: "Bir kullanıcıyı uyarır.",
    usage: `{prefix}uyar <kullanıcı> <sebep>`,
    examples: `{prefix}uyar <@950752419233542195> spam`,
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
        const member = message.mentions.members?.first() || message.guild.members.cache.get(args[0]);
        if (!member) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Bir kullanıcı bulunamadı!");
            message.channel.send({ embeds: [embed] });
            return;
        }
        if (member.id == message.author.id) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Kendini uyaramazsın!");
            message.channel.send({ embeds: [embed] });
            return;
        }
        if (member.user.bot) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Bir botu atamazsın!");
            message.channel.send({ embeds: [embed] });
            return;
        }
        if (member.roles.highest.position >= message.member.roles.highest.position) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Bu kullanıcının rolü senden yüksek (veya aynı) bu kişiyi atamazsın!");
            message.channel.send({ embeds: [embed] });
            return;
        }
        if (member.roles.highest.position >= message.guild.me.roles.highest.position) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Bu kullanıcının rolü benden yüksek (veya aynı) o yüzden bu kişiyi atamam!");
            message.channel.send({ embeds: [embed] });
            return;
        }
        if (member.permissions.has("MODERATE_MEMBERS")) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Bu kullanıcının yetkileri var!");
            message.channel.send({ embeds: [embed] });
            return;
        }
        let reason = args.slice(1).join(" ") || "Sebep belirtilmedi.";
        let cases = await caseSchema.findOne({ _id: message.guild.id });
        if (!cases) {
            cases = await caseSchema.findOneAndUpdate({ _id: message.guild.id }, {}, { setDefaultsOnInsert: true, new: true, upsert: true });
        }
        message.channel.send(`<a:checkmark:1017704018287546388> **${member.user.tag}** uyarıldı (Olay #${cases.case}) Kullanıcı özel bir mesaj ile bildirildi`);
        modlog(message.guild, member.user, "UYARI", message.author, reason);
        await new caseResultSchema({ case: cases.case, reason, userId: member.id, staffId: message.author.id }).save();
    }
};
//# sourceMappingURL=warn.js.map