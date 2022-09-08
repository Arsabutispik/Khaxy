import punishmentSchema from "../schemas/punishmentSchema.js";
import config from "../config.json" assert { type: 'json' };
import modlog from "./modlog.js";
export default async (client) => {
    const check = async () => {
        const query = {
            expires: { $lt: new Date() },
        };
        const results = await punishmentSchema.find(query);
        for (const result of results) {
            const { userId, type, previousRoles, staffId, expires, createdAt } = result;
            const guild = await client.guilds.fetch("778608930582036490");
            const member = guild.members.cache.get(userId);
            if (!member)
                continue;
            const staff = guild.members.cache.get(staffId);
            if (type == "ban") {
                await guild.members.unban(userId, "Ban süresi doldu");
                modlog(guild, member.user, "BAN_SÜRESİ", (staff ? staff : staffId), "Ban süresi doldu", new Date(expires).getTime() - new Date(createdAt).getTime());
            }
            else if (type == "mute") {
                if (!member) {
                    continue;
                }
                await member.roles.add([...previousRoles]);
                await member.roles.remove(config.MUTE_ROLE);
            }
        }
        await punishmentSchema.deleteMany(query);
        setTimeout(check, 1000 * 60 * 5);
    };
    await check();
};
//# sourceMappingURL=checkPunishments.js.map