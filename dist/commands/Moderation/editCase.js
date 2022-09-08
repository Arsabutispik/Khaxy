import caseResultSchema from '../../schemas/caseResultSchema.js';
import { sleep } from "../../utils/utils.js";
import { MessageButton, MessageEmbed, MessageActionRow } from "discord.js";
import modlog from "../../utils/modlog.js";
const rejectButton = new MessageButton()
    .setCustomId("reddet")
    .setEmoji("✖️")
    .setDisabled(false)
    .setStyle("DANGER");
const acceptButton = new MessageButton()
    .setCustomId("kabul")
    .setEmoji("✔️")
    .setDisabled(false)
    .setStyle("SUCCESS");
const actionRow = new MessageActionRow()
    .addComponents(acceptButton, rejectButton);
export default {
    name: "düzenle",
    category: "Moderasyon",
    description: "mod-log kanalında ki bir olayın sebebini düzenlemek için kullanılır.",
    usage: "s!düzenle <olay numarası> <yeni sebep>",
    examples: "s!düzenle 12 Yanlış kişi",
    async execute({ message, args }) {
        if (!message.member.permissions.has("MANAGE_MESSAGES")) {
            const reply = await message.reply("Bu komutu kullanmaya yetkin yok");
            await message.delete();
            await sleep(1000 * 10);
            reply.delete();
            return;
        }
        const caseNumber = parseInt(args[0]);
        if (isNaN(caseNumber)) {
            const reply = await message.reply("Verdiğin olay numarası bir sayı değil!");
            await message.delete();
            await sleep(1000 * 10);
            reply.delete();
            return;
        }
        const result = await caseResultSchema.findOne({ case: caseNumber });
        if (!result) {
            const reply = await message.reply("Olay numarasına bağlı bir şey bulamadım.");
            await message.delete();
            await sleep(1000 * 10);
            reply.delete();
            return;
        }
        let reason = args.slice(1).join(" ");
        if (!reason) {
            const msg = await message.reply("Bir sebep belirtmedin lütfen bir sebep belirt (girdiğin sonraki mesaj sebep olarak alınacaktır.)");
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
        const embed = new MessageEmbed()
            .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setDescription("Değişiklikleri onaylamak için düğmelerden ✔️, iptal etmek için ✖️ tuşuna basınız.")
            .addFields({
            name: "Orijinal Moderatör",
            value: message.guild.members.cache.get(result.staffId).user.tag
        }, {
            name: "Orijinal Sebep",
            value: result.reason
        }, {
            name: "Yeni Moderatör",
            value: message.author.tag
        }, {
            name: "Yeni Sebep",
            value: reason
        });
        const msg = await message.channel.send({ embeds: [embed], components: [actionRow] });
        const filter = (m) => (m.customId === "reddet" || m.customId === "kabul") && (m.user.id === message.author.id);
        let response;
        try {
            response = (await msg.awaitMessageComponent({ filter, time: 300000 }));
        }
        catch {
            const msg2 = await message.reply("Onay zamanında gelmedi.");
            setTimeout(async () => {
                await msg.delete();
            }, 1000 * 5);
            setTimeout(() => {
                msg2.delete();
            }, 1000 * 20);
            return;
        }
        switch (response.customId) {
            case "reddet":
                message.reply("Komut iptal edildi.");
                embed.setColor("RED");
                msg.edit({ embeds: [embed] });
                break;
            case "kabul":
                await caseResultSchema.findOneAndUpdate({ case: caseNumber }, { $push: { changes: { staffId: message.author, reason: reason } } });
                embed.setColor("GREEN");
                msg.edit({ embeds: [embed], components: [] });
                modlog(message.guild, message.author, "DEĞİŞİKLİK", message.author, reason, 0, result.case);
                break;
        }
    }
};
//# sourceMappingURL=editCase.js.map