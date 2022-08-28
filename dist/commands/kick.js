import { MessageEmbed } from "discord.js";
export default {
    name: "kick",
    category: "Moderasyon",
    description: "Sunucudan bir kullanıcıyı atar",
    usage: "{prefix}kick <@kullanıcı|id> [sebep]",
    examples: "{prefix}kick <@1007246359696515125> Spam",
    async execute({ message, args }) {
        if (!message.member.permissions.has("KICK_MEMBERS")) {
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
                .setDescription("Kendini atamazsın!");
            message.channel.send({ embeds: [embed] });
            return;
        }
        if (user.user.bot) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Bir botu atamazsın!");
            message.channel.send({ embeds: [embed] });
            return;
        }
        if (user.permissions.has("KICK_MEMBERS")) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Bu kullanıcıyı bir yetkili!");
            message.channel.send({ embeds: [embed] });
            return;
        }
        if (user.roles.highest.position >= message.member.roles.highest.position) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Bu kullanıcıyı atamazsın!");
            message.channel.send({ embeds: [embed] });
            return;
        }
        const reason = args.slice(1).join(" ") || "Sebep belirtilmedi";
        await user.kick(reason);
        const embed = new MessageEmbed()
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setColor("GREEN")
            .setDescription(`${user} adlı kullanıcı başarıyla atıldı!`);
        message.channel.send({ embeds: [embed] });
    }
};
//# sourceMappingURL=kick.js.map