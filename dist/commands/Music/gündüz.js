import { MessageEmbed } from "discord.js";
export default {
    name: "gündüz",
    category: "Moderasyon",
    description: "VK'da gece modunu kapatır",
    usage: "{prefix}gündüz",
    examples: "{prefix}gündüz",
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
            member.voice.setMute(false);
        });
        message.member?.voice.channel?.permissionOverwrites.edit(message.guild.id, {
            SEND_MESSAGES: null
        });
        message.channel.send("Gece bitti! Artık sabah oldu, günaydın :)");
    }
};
//# sourceMappingURL=g%C3%BCnd%C3%BCz.js.map