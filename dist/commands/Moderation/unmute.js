import { MessageEmbed } from "discord.js";
import punishment from "../../schemas/punishmentSchema.js";
import config from "../../config.json" assert { type: 'json' };
export default {
    name: "unmute",
    category: "Moderasyon",
    description: "Susturulmuş bir kullanıcının susturmasını kaldırır",
    usage: "{prefix}unmute <@kullanıcı|id>",
    examples: "{prefix}unmute <@1007246359696515125>",
    async execute({ message, args }) {
        if (!message.member.permissions.has("MANAGE_ROLES")) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Bu komutu kullanabilmek için yetkiniz yok!");
            message.channel.send({ embeds: [embed] });
            return;
        }
        const user = message.mentions.members?.first() || message.guild.members.cache.get(args[0]);
        if (!user) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Bir kullanıcı bulunamadı!");
            message.channel.send({ embeds: [embed] });
            return;
        }
        if (user.id == message.author.id) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Kendini susturamazsın!");
            message.channel.send({ embeds: [embed] });
            return;
        }
        if (user.user.bot) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Bir botu susturamazsın!");
            message.channel.send({ embeds: [embed] });
            return;
        }
        if (user.roles.highest.position >= message.member.roles.highest.position) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Bu kullanıcının rolü senden yüksek (veya aynı) bu kişiyi susturamazsın!");
            message.channel.send({ embeds: [embed] });
            return;
        }
        const punishmentUser = await punishment.findOne({ userId: user.id, type: "mute" });
        if (!punishmentUser) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Bu kullanıcı susturulmamış (eğer susturulmuşsa lütfen rolü manuel olarak alınız.)!");
            message.channel.send({ embeds: [embed] });
            return;
        }
        await user.roles.add([...punishmentUser.previousRoles]);
        await user.roles.remove(config.MUTE_ROLE);
        await punishmentUser.delete();
        const succesEmbed = new MessageEmbed()
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setColor("GREEN")
            .setDescription("Kullanıcının susturulması başarılı bir şekilde kaldırıldı");
        message.channel.send({ embeds: [succesEmbed] });
    }
};
//# sourceMappingURL=unmute.js.map