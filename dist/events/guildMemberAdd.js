import { TextChannel } from "discord.js";
import punishmentSchema from "../schemas/punishmentSchema.js";
import config from "../config.json" assert { type: 'json' };
export default async (_client, member) => {
    const result = await punishmentSchema.findOne({ userId: member.id, type: "mute" });
    if (result) {
        await member.roles.add(config.MUTE_ROLE);
    }
    const welcomeChannel = member.guild.channels.cache.get("1011319738812604456");
    if (!welcomeChannel || !(welcomeChannel instanceof TextChannel)) {
        return;
    }
    await welcomeChannel.send(`${member.guild.name} sunucusuna hoş geldin ${member}! Biraz bekle ve bir yetkili gelip seni kayıt edecektir.`);
};
//# sourceMappingURL=guildMemberAdd.js.map