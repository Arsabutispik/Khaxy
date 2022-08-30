import { MessageEmbed, Permissions } from "discord.js";
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
        const perms = allUsers.map(member => ({ ...message.member?.voice.channel?.permissionOverwrites.cache.map(key => ({ id: key.id, allow: key.allow, deny: key.deny })), id: member.id, deny: [Permissions.FLAGS.SPEAK] }));
        message.member?.voice.channel?.permissionOverwrites.set(perms);
        await message.channel.permissionOverwrites.set([{ ...message.member?.voice.channel?.permissionOverwrites.cache.map(key => ({ id: key.id, allow: key.allow, deny: key.deny })), id: message.guild.id, deny: [Permissions.FLAGS.SEND_MESSAGES] }]);
    }
};
//# sourceMappingURL=gece.js.map