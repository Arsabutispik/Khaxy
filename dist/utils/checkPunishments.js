import punishmentSchema from "../schemas/punishmentSchema.js";
import modlog from "./modlog.js";
export default async (client) => {
    const check = async () => {
        const query = {
            expires: { $lt: new Date() },
        };
        const results = await punishmentSchema.find(query);
        for (const result of results) {
            const { userId, type, previousRoles, staffId, expires, createdAt, guildID } = result;
            const guild = await client.guilds.cache.get(guildID);
            if (!guild)
                continue;
            const member = await guild.members.cache.get(userId);
            if (!member)
                continue;
            const staff = await guild.members.fetch(staffId);
            if (type === "ban") {
                if (!guild.bans.cache.get(userId))
                    continue;
                await guild.members.unban(userId, "Ban süresi doldu");
                await modlog({ guild, user: member.user, action: "BAN_SÜRESİ", actionmaker: (staff ? staff : staffId), reason: "Ban süresi doldu", duration: new Date(expires).getTime() - new Date(createdAt).getTime() }, client);
            }
            else if (type === "mute") {
                if (!member) {
                    continue;
                }
                if (client.guildsConfig.get(guildID).config.muteGetAllRoles) {
                    await member.roles.add(previousRoles);
                }
                await member.roles.remove(client.guildsConfig.get(guildID).config.muteRole);
            }
        }
        await punishmentSchema.deleteMany(query);
        setTimeout(check, 1000 * 60 * 5);
    };
    await check();
};
//# sourceMappingURL=checkPunishments.js.map