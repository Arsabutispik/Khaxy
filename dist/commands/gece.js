import { MessageEmbed } from "discord.js";
export default {
    name: "gece",
    category: "Moderasyon",
    description: "VK'da gece modunu açar",
    usage: "{prefix}gece",
    examples: "{prefix}gece",
    async execute({ message }) {
        if (!message.member.permissions.has("MUTE_MEMBERS")) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Bu komutu kullanabilmek için yetkiniz yok!");
            message.channel.send({ embeds: [embed] });
            return;
        }
        if (!message.member.voice.channel) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Bir ses kanalında olmalısın!");
            message.channel.send({ embeds: [embed] });
            return;
        }
        const allUsers = message.member.voice.channel.members.filter(member => !member.permissions.has("MUTE_MEMBERS"));
        allUsers.forEach(member => {
            member.voice.setMute(true);
        });
        message.member?.voice.channel?.permissionOverwrites.edit(message.guild.id, {
            SEND_MESSAGES: false
        });
        message.channel.send("Gece başladı ve tehlikeyi beraberinde getirdi");
    }
};
//# sourceMappingURL=gece.js.map