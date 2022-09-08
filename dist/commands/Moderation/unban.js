import { MessageEmbed } from "discord.js";
import modlog from "../../utils/modlog.js";
import caseSchema from "../../schemas/caseSchema.js";
import caseResultSchema from "../../schemas/caseResultSchema.js";
export default {
    name: "unban",
    category: "Moderasyon",
    description: "Banlanmış bir kullanıcının banını kaldırır",
    usage: "{prefix}unban <@kullanıcı|id> [Sebep]",
    examples: "{prefix}unban 1007246359696515125",
    async execute({ message, args }) {
        if (!message.member.permissions.has("BAN_MEMBERS")) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Bu komutu kullanabilmek için yetkiniz yok!");
            message.channel.send({ embeds: [embed] });
        }
        const reason = args.slice(1).join(" ") || "Sebep belirtilmedi";
        try {
            const user = await message.guild.members.unban(args[0]);
            message.channel.send(`${user.tag} adlı kullanıcının banı kaldırıldı!`);
            let cases = await caseSchema.findOne({ _id: message.guild.id });
            if (!cases) {
                cases = await caseSchema.findOneAndUpdate({ _id: message.guild.id }, {}, { setDefaultsOnInsert: true, new: true, upsert: true });
            }
            modlog(message.guild, user, "BAN_KALDIR", message.author, reason);
            await new caseResultSchema({ case: cases.case, reason, userId: user.id, staffId: message.author.id }).save();
        }
        catch {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Verilen ID ile banlı bir kullanıcı bulunamadı!");
            message.channel.send({ embeds: [embed] });
        }
    }
};
//# sourceMappingURL=unban.js.map