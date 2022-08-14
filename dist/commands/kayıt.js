import { sleep } from "../utils/utils.js";
const text = "Sunucumuza hoş geldin ey yolcu {user}\n\n- Lütfen her şeyden önce │📝│kurallar kanalından sunucuda ne yapıp/yapmaman gerektiğine bakmanı öneririz.\n- Ardından │🌈│renkler odasına gidip gönlünce istediğin rengi seçebilir, │🎫│roller odasından ise almak istediğin rollere bir göz gezdirebilirsin.\n- Ekstra bilgi almak istersen │📜│rol-bilgilendirme odasını ziyaret etmeyi unutma.\n\nTekrardan hoş geldin, iyi eğlenceler dileriz!";
export default {
    name: "kayıt",
    category: "Moderasyon",
    description: "Bir kullanıcıyı kayıt etmeye yarar",
    usage: `{prefix}kayıt <@kullanıcı|id> <cinsiyet>`,
    examples: `{prefix}kayıt <@1007246359696515125> erkek`,
    async execute({ message, args }) {
        if (message.channel.id !== "792712545172979713") {
            return;
        }
        const targetMember = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!message.member?.roles.cache.hasAny(...["791739150188937236", "885211222461513848", "885211284814053418", "885211232582381588", "885211227599548456", "791738537505587201", "798556578177220608"]))
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
        channel.send(text.replace("{user}", targetMember.toString()));
    }
};
//# sourceMappingURL=kay%C4%B1t.js.map