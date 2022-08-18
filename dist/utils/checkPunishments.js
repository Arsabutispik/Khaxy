import punishmentSchema from "../schemas/punishmentSchema.js";
import config from "../config.json" assert { type: 'json' };
export default async (client) => {
    const check = async () => {
        const query = {
            expires: { $lt: new Date() },
        };
        const results = await punishmentSchema.find(query);
        for (const result of results) {
            const { userId, type } = result;
            const guild = await client.guilds.fetch("778608930582036490");
            const member = guild.members.cache.get(userId);
            if (type == "ban") {
                await guild.members.unban(userId, "Ban süresi doldu");
            }
            else if (type == "mute") {
                if (!member) {
                    continue;
                }
                await member.roles.remove(config.MUTE_ROLE);
            }
        }
        await punishmentSchema.deleteMany(query);
        setTimeout(check, 1000 * 60 * 5);
    };
    await check();
};
//# sourceMappingURL=checkPunishments.js.map