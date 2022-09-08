import { MessageEmbed } from "discord.js";
import caseSchema from "../../schemas/caseSchema.js";
import modlog from "../../utils/modlog.js";
import caseResultSchema from "../../schemas/caseResultSchema.js";
export default {
    name: "kick",
    category: "Moderasyon",
    description: "Bir kullanıcıyı sunucudan atar eğer istenilirse 7 günlük mesajlarını da siler",
    usage: "s!kick [-temizle] <@kullanıcı|id> <sebep>",
    examples: "s!kick <@950752419233542195> spam için sunucuya girmiş\ns!kick -temizle <@950752419233542195> hileler için yardım",
    async execute({ message, args }) {
        if (!message.member.permissions.has("KICK_MEMBERS")) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Bu komutu kullanabilmek için yetkiniz yok!");
            message.channel.send({ embeds: [embed] });
            return;
        }
        const clean = args[0];
        if (clean == "-temizle") {
            const user = message.mentions.members?.first() || message.guild.members.cache.get(args[1]);
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
            if (user.roles.highest.position >= message.member.roles.highest.position) {
                const embed = new MessageEmbed()
                    .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                    .setColor("RED")
                    .setDescription("Bu kullanıcının rolü senden yüksek (veya aynı) bu kişiyi atamazsın!");
                message.channel.send({ embeds: [embed] });
                return;
            }
            if (user.roles.highest.position >= message.guild.me.roles.highest.position) {
                const embed = new MessageEmbed()
                    .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                    .setColor("RED")
                    .setDescription("Bu kullanıcının rolü benden yüksek (veya aynı) o yüzden bu kişiyi atamam!");
                message.channel.send({ embeds: [embed] });
                return;
            }
            if (user.permissions.has("KICK_MEMBERS")) {
                const embed = new MessageEmbed()
                    .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                    .setColor("RED")
                    .setDescription("Bu kullanıcının yetkileri var!");
                message.channel.send({ embeds: [embed] });
                return;
            }
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
                    message.channel.send("Bir sebep verilmedi ban komutu geçersiz kılındı").then(m => {
                        setTimeout(() => {
                            m.delete();
                        }, 1000 * 20);
                    });
                    return;
                }
            }
            let cases = await caseSchema.findOne({ _id: message.guild.id });
            if (!cases) {
                cases = await caseSchema.findOneAndUpdate({ _id: message.guild.id }, {}, { setDefaultsOnInsert: true, new: true });
            }
            try {
                await user.send(`${message.guild.name} sunucusundan atıldınız. Sebep: ${reason}`);
                message.channel.send(`<:checkmark:962444136366112788> **${user.user.tag}** atıldı (Olay #${cases.case}) Kullanıcı özel bir mesaj ile bildirildi`);
            }
            catch {
                message.channel.send(`<:checkmark:962444136366112788> **${user.user.tag}** atıldı (Olay #${cases.case}) Kullanıcıya özel mesaj atılamadı`);
            }
            modlog(message.guild, user.user, "AT", message.author, args.slice(2).join(" "));
            await user.ban({ days: 7, reason });
            await message.guild?.members.unban(user.id, "softban");
            await new caseResultSchema({ case: cases.case, reason, userId: user.id, staffId: message.author.id }).save();
        }
        else if (clean == (message.mentions.members?.first()?.toString() || message.guild.members.cache.get(args[0]))) {
            const user = message.mentions.members?.first() || message.guild.members.cache.get(args[1]);
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
            if (user.roles.highest >= message.member.roles.highest) {
                const embed = new MessageEmbed()
                    .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                    .setColor("RED")
                    .setDescription("Bu kullanıcının rolü senden yüksek (veya aynı) bu kişiyi atamazsın!");
                message.channel.send({ embeds: [embed] });
                return;
            }
            if (user.roles.highest >= message.guild.me.roles.highest) {
                const embed = new MessageEmbed()
                    .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                    .setColor("RED")
                    .setDescription("Bu kullanıcının rolü benden yüksek (veya aynı) o yüzden bu kişiyi atamam!");
                message.channel.send({ embeds: [embed] });
                return;
            }
            if (user.permissions.has("KICK_MEMBERS")) {
                const embed = new MessageEmbed()
                    .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                    .setColor("RED")
                    .setDescription("Bu kullanıcının yetkileri var!");
                message.channel.send({ embeds: [embed] });
                return;
            }
            let reason = args.slice(1).join(" ");
            if (!reason) {
                const msg = await message.reply("Bir sebep belirtmedin lütfen bir sebep belirt");
                const filter = (m) => m.author.id === message.author.id;
                try {
                    const msg = await message.channel.awaitMessages({ filter, max: 1, idle: 1000 * 60 * 5 });
                    reason = msg.first().content;
                }
                catch {
                    msg.delete();
                    message.channel.send("Bir sebep verilmedi ban komutu geçersiz kılındı").then(m => {
                        setTimeout(() => {
                            m.delete();
                        }, 1000 * 20);
                    });
                    return;
                }
            }
            let cases = await caseSchema.findOne({ _id: message.guild.id });
            if (!cases) {
                cases = await caseSchema.findOneAndUpdate({ _id: message.guild.id }, {}, { setDefaultsOnInsert: true, new: true });
            }
            try {
                await user.send(`${message.guild.name} sunucusundan atıldınız. Sebep: ${reason}`);
                message.channel.send(`<:checkmark:962444136366112788> **${user.user.tag}** atıldı (Olay #${cases.case}) Kullanıcı özel bir mesaj ile bildirildi`);
            }
            catch {
                message.channel.send(`<:checkmark:962444136366112788> **${user.user.tag}** atıldı (Olay #${cases.case}) Kullanıcıya özel mesaj atılamadı`);
            }
            modlog(message.guild, user.user, "AT", message.author, reason);
            user.kick(reason);
            await new caseResultSchema({ case: cases.case, reason, staffId: message.author.id }).save();
        }
        else if (clean !== "-temizle" && (message.mentions.members?.first()?.toString() || message.guild.members.cache.get(args[1])) !== clean) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription(`Doğru kullanım: ${this.usage}`);
            message.channel.send({ embeds: [embed] });
            return;
        }
    }
};
//# sourceMappingURL=kick.js.map