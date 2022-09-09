import { MessageEmbed } from "discord.js";
import ms from "ms";
import punishment from "../../schemas/punishmentSchema.js";
import modlog from "../../utils/modlog.js";
import caseResultSchema from "../../schemas/caseResultSchema.js";
import caseSchema from "../../schemas/caseSchema.js";
export default {
    name: "ban",
    category: "Moderasyon",
    description: "Bir kullanıcıyı sınırsız veya belirli bir süreliğine yasaklar",
    usage: "{prefix}ban <@kullanıcı|id> [süre] <sebep>",
    examples: "{prefix}ban <@1007246359696515125> 1h sınavın bitince gel (1 saatlik bir ban atar)\ns!ban <@950752419233542195> 3d troll (3 günlük ban atar)\ns!ban <@950752419233542195> raid (süresiz ban)",
    async execute({ client, message, args }) {
        if (!message.member.permissions.has("BAN_MEMBERS")) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Bu komutu kullanabilmek için yetkiniz yok!");
            message.channel.send({ embeds: [embed] });
            return;
        }
        const user = message.mentions.members?.first() || message.guild.members.cache.get(args[0]);
        if (!user) {
            let fetchUser;
            try {
                fetchUser = await client.users.fetch(args[0]);
            }
            catch {
                const embed = new MessageEmbed()
                    .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                    .setColor("RED")
                    .setDescription("Bir kullanıcı bulunamadı!");
                message.channel.send({ embeds: [embed] });
                return;
            }
            const duration = ms(args[1]);
            let cases = await caseSchema.findOne({ _id: message.guild.id });
            if (!cases) {
                cases = await caseSchema.findOneAndUpdate({ _id: message.guild.id }, {}, { setDefaultsOnInsert: true, new: true, upsert: true });
            }
            if (duration) {
                let reason = args.slice(2).join(" ") || "Sebep belirtilmedi";
                message.channel.send(`<a:checkmark:1017704018287546388> **${fetchUser.tag}** yasaklandı. Kullanıcı özel bir mesaj ile bildirildi`);
                await message.guild.bans.create(fetchUser.id);
                modlog(message.guild, fetchUser, "ZORUNLU_BAN", message.author, reason, duration);
                await new punishment({ userId: fetchUser.id, staffId: message.author.id, reason, expires: new Date(Date.now() + duration), type: "ban" }).save();
                await new caseResultSchema({ case: cases.case, reason, userId: fetchUser.id, staffId: message.author.id }).save();
            }
            else {
                let reason = args.slice(1).join(" ") || "Sebep belirtilmedi";
                message.channel.send(`<a:checkmark:1017704018287546388> **${fetchUser.tag}** yasaklandı. Kullanıcı özel bir mesaj ile bildirildi`);
                await message.guild.bans.create(fetchUser.id);
                modlog(message.guild, fetchUser, "BAN", message.author, reason);
                await new caseResultSchema({ case: cases.case, reason, userId: fetchUser.id, staffId: message.author.id }).save();
            }
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
        let cases = await caseSchema.findOne({ _id: message.guild.id });
        if (!cases) {
            cases = await caseSchema.findOneAndUpdate({ _id: message.guild.id }, {}, { setDefaultsOnInsert: true, new: true, upsert: true });
        }
        if (duration) {
            const longduration = ms(duration, { long: true }).replace(/seconds|second/, "saniye").replace(/minutes|minute/, "dakika").replace(/hours|hour/, "saat").replace(/days|day/, "gün");
            let reason = args.slice(2).join(" ") || "Sebep belirtilmedi";
            try {
                await user.send(`${message.guild.name} sunucusundan **${longduration}** boyunca yasaklandın. Sebep: ${args.slice(1).join(" ")}`);
                message.channel.send(`<a:checkmark:1017704018287546388> **${user.user.tag}** yasaklandı. Kullanıcı özel bir mesaj ile bildirildi`);
            }
            catch {
                message.channel.send(`<a:checkmark:1017704018287546388> **${user.user.tag}** yasaklandı. Kullanıcıya özel mesaj atılamadı`);
            }
            user.ban({ reason, days: 7 });
            modlog(message.guild, user.user, "SÜRELİ_BAN", message.author, reason, duration);
            await new punishment({ userId: user.id, staffId: message.author.id, reason, expires: new Date(Date.now() + duration), type: "ban" }).save();
            await new caseResultSchema({ case: cases.case, reason, userId: user.id, staffId: message.author.id }).save();
        }
        else {
            let reason = args.slice(1).join(" ") || "Sebep belirtilmedi";
            try {
                await user.send(`${message.guild.name} sunucusundan süresiz yasaklandın. Sebep: ${reason}`);
                message.channel.send(`<a:checkmark:1017704018287546388> **${user.user.tag}** yasaklandı. Kullanıcı özel bir mesaj ile bildirildi`);
            }
            catch {
                message.channel.send(`<a:checkmark:1017704018287546388> **${user.user.tag}** yasaklandı. Kullanıcıya özel mesaj atılamadı`);
            }
            user.ban({ reason, days: 7 });
            modlog(message.guild, user.user, "BAN", message.author, reason);
            await new caseResultSchema({ case: cases.case, reason, userId: user.id, staffId: message.author.id }).save();
        }
    }
};
//# sourceMappingURL=ban.js.map