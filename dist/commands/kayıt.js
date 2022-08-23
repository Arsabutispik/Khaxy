import { sleep } from "../utils/utils.js";
import { MessageEmbed } from "discord.js";
const text = "Sunucumuza hoş geldin ey yolcu {user}\n\n- Lütfen her şeyden önce <#791742951112966194> kanalından sunucuda ne yapıp/yapmaman gerektiğine bakmanı öneririz.\n- Ardından <#792039312409493504> odasına gidip gönlünce istediğin rengi seçebilir, <#792735663258730526> odasından ise almak istediğin rollere bir göz gezdirebilirsin.\n- Ekstra bilgi almak istersen <#791986667174232075> odasını ziyaret etmeyi unutma.\n\nTekrardan hoş geldin, iyi eğlenceler dileriz!";
export default {
    name: "kayıt",
    category: "Moderasyon",
    description: "Bir kullanıcıyı kayıt etmeye yarar",
    usage: `{prefix}kayıt <@kullanıcı|id> <cinsiyet>`,
    examples: `{prefix}kayıt <@1007246359696515125> erkek`,
    async execute({ message, args }) {
        if (message.channel.id !== "1011319738812604456") {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Bu komut sadece kayıt kanallarında kullanılabilir");
            message.channel.send({ embeds: [embed] });
            return;
        }
        if (!message.member.roles.cache.hasAny("791739150188937236", "885211222461513848", "885211284814053418", "885211232582381588", "885211227599548456", "798556578177220608", "791738537505587201", "781180483437854721", "791738418505187329")) {
            const embed = new MessageEmbed()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription("Bu komutu kullanabilmek kayıt yetkilisi olmalısınız!");
            message.channel.send({ embeds: [embed] });
            return;
        }
        const targetMember = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (args.length < 2) {
            message.channel.send("Lütfen bir kullanıcı ve bir kişinin cinsiyetini yazınız.");
            return;
        }
        if (!targetMember) {
            message.channel.send("Bir kullanıcı bulunamadı!");
            return;
        }
        if (targetMember.id === message.author.id) {
            message.channel.send("Kendini kayıt edemezsin! 💀");
            return;
        }
        const gender = args[1].toLowerCase();
        if (gender === "erkek" || gender === "e") {
            await targetMember.roles.add("884217111084433439");
            await targetMember.roles.add("791735061757689867");
        }
        else if (gender === "kız" || gender === "k") {
            await targetMember.roles.add("884217460759359578");
            await targetMember.roles.add("791735061757689867");
        }
        else {
            message.channel.send("Lütfen geçerli bir cinsiyet giriniz!");
            return;
        }
        message.channel.send(`${targetMember}, başarıyla kayıt edildi!`);
        await sleep(1000);
        const channel = message.guild.channels.cache.get("778608932850630668");
        if (!channel) {
            return;
        }
        await channel.send(text.replace("{user}", targetMember.toString()));
        const msgs = await message.channel.messages.fetch();
        msgs.filter(m => !m.pinned).forEach(async (mmsg) => {
            await sleep(1000);
            await mmsg.delete();
        });
    }
};
//# sourceMappingURL=kay%C4%B1t.js.map