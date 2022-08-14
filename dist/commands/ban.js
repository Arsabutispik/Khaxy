import { MessageEmbed } from "discord.js";
import ms from "ms";
import punishment from "../schemas/punishmentSchema.js";
export default {
    name: "ban",
    category: "Moderasyon",
    description: "Bir kullanıcıyı sınırsız veya belirli bir süreliğine yasaklar",
    usage: "{prefix}ban <@kullanıcı|id> [süre] <sebep>",
    examples: "{prefix}ban <@1007246359696515125> 1h sınavın bitince gel (1 saatlik bir ban atar)\ns!ban <@950752419233542195> 3d troll (3 günlük ban atar)\ns!ban <@950752419233542195> raid (süresiz ban)",
    async execute({ message, args }) {
        if(!message.member.permissions.has("BAN_MEMBERS")) {
          const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Yeterli yetkin yok!");
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
                .setDescription("Kendini yasaklayamazsın!");
            message.channel.send({ embeds: [embed] });
            return;
        }
        if (user.user.bot) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Bir botu yasaklayamazsın!");
            message.channel.send({ embeds: [embed] });
            return;
        }
        if (user.roles.highest.position >= message.member.roles.highest.position) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Bu kullanıcının rolü senden yüksek (veya aynı) bu kişiyi yasaklayamazsın!");
            message.channel.send({ embeds: [embed] });
            return;
        }
        if (user.roles.highest.position >= message.guild.me.roles.highest.position) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Bu kullanıcının rolü benden yüksek (veya aynı) o yüzden bu kişiyi yasaklayamam!");
            message.channel.send({ embeds: [embed] });
            return;
        }
        if (user.permissions.has("BAN_MEMBERS")) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Bu kullanıcının yetkileri var!");
            message.channel.send({ embeds: [embed] });
            return;
        }
        const duration = ms(args[1]);
        if (duration) {
            const longduration = ms(duration, { long: true }).replace(/seconds|second/, "saniye").replace(/minutes|minute/, "dakika").replace(/hours|hour/, "saat").replace(/days|day/, "gün");
            let reason = args.slice(2).join(" ");
            if (!reason) {
                const msg = await message.reply("Bir sebep belirtmedin lütfen bir sebep belirt");
                const filter = (m) => m.author.id === message.author.id;
                try {
                    const msg = await message.channel.awaitMessages({ filter, max: 1, time: 1000 * 60 * 5, errors: ['time'] });
                    reason = msg.first().content;
                }
                catch {
                    msg.delete();
                    message.channel.send("Bir sebep verilmedi yasaklama komutu geçersiz kılındı").then(m => {
                        setTimeout(() => {
                            m.delete();
                        }, 1000 * 20);
                    });
                    return;
                }
            }
            try {
                await user.send(`${message.guild.name} sunucusundan **${longduration}** boyunca yasaklandın. Sebep: ${args.slice(1).join(" ")}`);
                message.channel.send(`<:checkmark:962444136366112788> **${user.user.tag}** yasaklandı. Kullanıcı özel bir mesaj ile bildirildi`);
            }
            catch {
                message.channel.send(`<:checkmark:962444136366112788> **${user.user.tag}** yasaklandı. Kullanıcıya özel mesaj atılamadı`);
            }
            user.ban({ reason, days: 7 });
            await new punishment({ userId: user.id, staffId: message.author.id, reason, expires: new Date(Date.now() + duration), type: "ban" }).save();
        }
        else {
            let reason = args.slice(1).join(" ");
            if (!reason) {
                const msg = await message.reply("Bir sebep belirtmedin lütfen bir sebep belirt");
                const filter = (m) => m.author.id === message.author.id;
                try {
                    const msg = await message.channel.awaitMessages({ filter, max: 1, time: 1000 * 60 * 5, errors: ['time'] });
                    reason = msg.first().content;
                }
                catch {
                    msg.delete();
                    message.channel.send("Bir sebep verilmedi yasaklama komutu geçersiz kılındı").then(m => {
                        setTimeout(() => {
                            m.delete();
                        }, 1000 * 20);
                    });
                    return;
                }
            }
            try {
                await user.send(`${message.guild.name} sunucusundan süresiz yasaklandın. Sebep: ${reason}`);
                message.channel.send(`<:checkmark:962444136366112788> **${user.user.tag}** yasaklandı. Kullanıcı özel bir mesaj ile bildirildi`);
            }
            catch {
                message.channel.send(`<:checkmark:962444136366112788> **${user.user.tag}** yasaklandı. Kullanıcıya özel mesaj atılamadı`);
            }
            user.ban({ reason, days: 7 });
        }
    }
};
//# sourceMappingURL=ban.js.map
