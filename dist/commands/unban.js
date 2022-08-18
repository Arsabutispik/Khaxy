import { MessageEmbed } from "discord.js";
export default {
    name: "unban",
    category: "Moderasyon",
    description: "Banlanmış bir kullanıcının banını kaldırır",
    usage: "{prefix}unban <@kullanıcı|id>",
    examples: "{prefix}unban 1007246359696515125",
    async execute({ message, args }) {
        if (!message.member.permissions.has("BAN_MEMBERS")) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Bu komutu kullanabilmek için yetkiniz yok!");
            message.channel.send({ embeds: [embed] });
        }
        try {
            const user = await message.guild.members.unban(args[0]);
            message.channel.send(`${user.tag} adlı kullanıcının banı kaldırıldı!`);
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