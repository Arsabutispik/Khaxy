import { TextChannel } from 'discord.js';
import ms from 'ms';
import guildSchema from "../schemas/guildSchema.js";
export default async (data, client) => {
    const { guild, user, action, actionmaker, reason, duration, casenumber } = data;
    let guildData = await guildSchema.findOne({ guildID: guild.id });
    if (!guildData) {
        guildData = await guildSchema.findOneAndUpdate({ guildID: guild.id }, {}, { upsert: true, new: true, setDefaultsOnInsert: true });
    }
    const caseNumber = (casenumber || guildData.case);
    if (!guildData.config?.modlogChannel)
        return;
    let message = `<t:${Math.floor(Date.now() / 1000)}> \`[${caseNumber}]\``;
    if (action === "UYARI") {
        message += ` ⚠️ **${user.tag}** (\`${user.id}\`), **${actionmaker.tag}** (\`${actionmaker.id}\`) tarafından uyarıldı. Sebep:\n\`\`\`${reason}\`\`\``;
    }
    else if (action === "BAN") {
        message += `<:banned:1017703188150894622>  **${user.tag}** (\`${user.id}\`), **${actionmaker.tag}** (\`${actionmaker.id}\`) tarafından yasaklandı. Sebep:\n\`\`\`${reason}\`\`\``;
    }
    else if (action === "AT") {
        message += `👢 **${user.tag}** (\`${user.id}\`), **${actionmaker.tag}** (\`${actionmaker.id}\`) tarafından atıldı. Sebep:\n\`\`\`${reason}\`\`\``;
    }
    else if (action === "ZORUNLU_BAN") {
        message += `<:banbanned:1017703176528474152> Kullanıcı (\`${user.id}\`), **${actionmaker.tag}** (\`${actionmaker.id}\`) tarafından zorla banlandı. Sebep:\n\`\`\`${reason}\`\`\``;
    }
    else if (action === "SUSTUR") {
        const amount = ms(duration, { long: true }).replace(/seconds|second/, "saniye").replace(/minutes|minute/, "dakika").replace(/hours|hour/, "saat").replace(/days|day/, "gün");
        message += ` 🔇 **${user.tag}** (\`${user.id}\`), **${actionmaker.tag}** (\`${actionmaker.id}\`) tarafından **${amount}** boyunca susturuldu. Sebep:\n\`\`\`${reason}\`\`\``;
    }
    else if (action === "SÜRELİ_BAN") {
        const amount = ms(duration, { long: true }).replace(/seconds|second/, "saniye").replace(/minutes|minute/, "dakika").replace(/hours|hour/, "saat").replace(/days|day/, "gün");
        message += `<:banned:1017703188150894622> **${user.tag}** (\`${user.id}\`), **${actionmaker.tag}** (\`${actionmaker.id}\`) tarafından **${amount}** boyunca yasaklandı. Sebep:\n\`\`\`${reason}\`\`\``;
    }
    else if (action === "BAN_KALDIR") {
        message += `🔓 Kullanıcı (\`${user.id}\`), **${actionmaker.tag}** (\`${actionmaker.id}\`) tarafından yasağı kaldırıldı. Sebep:\n\`\`\`${reason}\`\`\``;
    }
    else if (action === "BAN_SÜRESİ") {
        const amount = ms(duration, { long: true }).replace(/seconds|second/, "saniye").replace(/minutes|minute/, "dakika").replace(/hours|hour/, "saat").replace(/days|day/, "gün");
        message += `🔓 Kullanıcı (\`${user.id}\`), **${amount}** sonra **${actionmaker.tag}** (\`${actionmaker.id}\`) tarafından otomatik olarak yasağı kaldırıldı. Sebep:\n\`\`\`${reason}\`\`\``;
    }
    else if (action === "DEĞİŞİKLİK") {
        message = `<t:${Math.floor(Date.now() / 1000)}> \`[${casenumber}]\` ✏️ Olay #${casenumber}, **${actionmaker.tag}** (\`${actionmaker.id}\`) tarafından değiştirildi. Sebep:\n\`\`\`${reason}\`\`\``;
    }
    else if (action === "ZORUNLU_SÜRELİ_BAN") {
        const amount = ms(duration, { long: true }).replace(/seconds|second/, "saniye").replace(/minutes|minute/, "dakika").replace(/hours|hour/, "saat").replace(/days|day/, "gün");
        message += `<:banbanned:1017703176528474152> Kullanıcı (\`${user.id}\`), **${amount}** boyunca **${actionmaker.tag}** (\`${actionmaker.id}\`) tarafından zorla banlandı. Sebep:\n\`\`\`${reason}\`\`\``;
    }
    const channel = await guild.channels.fetch(guildData.config.modlogChannel);
    if (channel && channel instanceof TextChannel) {
        await channel.send(message);
    }
    if (action !== "DEĞİŞİKLİK") {
        await client.updateGuildConfig({ guildId: guild.id, config: { $inc: { case: 1 } } });
    }
};
//# sourceMappingURL=modlog.js.map