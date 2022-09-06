import { TextChannel } from "discord.js";
import punishmentSchema from "../schemas/punishmentSchema.js";
import config from "../config.json" assert { type: 'json' };
const text = "Sunucumuza hoş geldin ey yolcu {user}\n\n- Lütfen her şeyden önce <#791742951112966194> kanalından sunucuda ne yapıp/yapmaman gerektiğine bakmanı öneririz.\n- Ardından <#792039312409493504> odasına gidip gönlünce istediğin rengi seçebilir, <#792735663258730526> odasından ise almak istediğin rollere bir göz gezdirebilirsin.\n- Ekstra bilgi almak istersen <#791986667174232075> odasını ziyaret etmeyi unutma.\n\nTekrardan hoş geldin, iyi eğlenceler dileriz!";
export default async (_client, member) => {
    if (member.guild.id === "1007285630427996292")
        return;
    const result = await punishmentSchema.findOne({ userId: member.id, type: "mute" });
    if (result) {
        await member.roles.add(config.MUTE_ROLE);
    }
    const welcomeChannel = member.guild.channels.cache.get("1011319738812604456");
    if (!welcomeChannel || !(welcomeChannel instanceof TextChannel)) {
        return;
    }
    const welcomeChannel2 = member.guild.channels.cache.get("791742422488580166");
    if (!welcomeChannel2 || !(welcomeChannel2 instanceof TextChannel)) {
        return;
    }
    await welcomeChannel2.send(text.replace("{user}", member.user.toString()));
    await welcomeChannel.send(`${member.guild.name} sunucusuna hoş geldin ${member}! Biraz bekle ve bir yetkili gelip seni kayıt edecektir. <@&791739150188937236>`);
};
//# sourceMappingURL=guildMemberAdd.js.map