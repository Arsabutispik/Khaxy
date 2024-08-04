import { TextChannel } from 'discord.js';
import ms from 'ms';
import guildSchema from "../schemas/guildSchema.js";
import { log, replaceMassString } from "./utils.js";
export default async (data, client) => {
    const { guild, user, action, actionmaker, reason, duration, casenumber } = data;
    let guildData = await guildSchema.findOne({ guildID: guild.id });
    if (!guildData) {
        guildData = await guildSchema.findOneAndUpdate({ guildID: guild.id }, {}, { upsert: true, new: true, setDefaultsOnInsert: true });
    }
    const caseNumber = (casenumber || guildData.case);
    if (!guildData.config?.modlogChannel)
        return;
    const lang = guildData.config.language || "en";
    let message = `<t:${Math.floor(Date.now() / 1000)}> \`[${caseNumber}]\``;
    if (action === "WARNING") {
        message += replaceMassString(JSON.parse(JSON.stringify(client.handleLanguages("MODLOG_WARNING", client, guild.id))), {
            "{user_username}": user.username,
            "{user_id}": user.id,
            "{actionmaker_username}": actionmaker.username,
            "{actionmaker_id}": actionmaker.id,
            "{reason}": reason
        });
    }
    else if (action === "BAN") {
        message += replaceMassString(JSON.parse(JSON.stringify(client.handleLanguages("MODLOG_BAN", client, guild.id))), {
            "{user_username}": user.username,
            "{user_id}": user.id,
            "{actionmaker_username}": actionmaker.username,
            "{actionmaker_id}": actionmaker.id,
            "{reason}": reason
        });
    }
    else if (action === "KICK") {
        message += replaceMassString(JSON.parse(JSON.stringify(client.handleLanguages("MODLOG_KICK", client, guild.id))), {
            "{user_username}": user.username,
            "{user_id}": user.id,
            "{actionmaker_username}": actionmaker.username,
            "{actionmaker_id}": actionmaker.id,
            "{reason}": reason
        });
    }
    else if (action === "FORCED_BAN") {
        message += replaceMassString(JSON.parse(JSON.stringify(client.handleLanguages("MODLOG_FORCED_BAN", client, guild.id))), {
            "{user_id}": user.id,
            "{actionmaker_username}": actionmaker.username,
            "{actionmaker_id}": actionmaker.id,
            "{reason}": reason
        });
    }
    else if (action === "MUTE") {
        let amount = ms(duration, { long: true });
        if (lang === "tr") {
            amount = amount.replace(/minutes|minute/, "dakika").replace(/hours|hour/, "saat").replace(/days|day/, "gün");
        }
        message += replaceMassString(JSON.parse(JSON.stringify(client.handleLanguages("MODLOG_MUTE", client, guild.id))), {
            "{user_username}": user.username,
            "{user_id}": user.id,
            "{actionmaker_username}": actionmaker.username,
            "{actionmaker_id}": actionmaker.id,
            "{reason}": reason,
            "{amount}": amount
        });
    }
    else if (action === "TIMED_BAN") {
        let amount = ms(duration, { long: true });
        if (lang === "tr") {
            amount = amount.replace(/minutes|minute/, "dakika").replace(/hours|hour/, "saat").replace(/days|day/, "gün");
        }
        message += replaceMassString(JSON.parse(JSON.stringify(client.handleLanguages("MODLOG_TIMED_BAN", client, guild.id))), {
            "{user_username}": user.username,
            "{user_id}": user.id,
            "{actionmaker_username}": actionmaker.username,
            "{actionmaker_id}": actionmaker.id,
            "{reason}": reason,
            "{amount}": amount
        });
    }
    else if (action === "BAN_REMOVE") {
        message += replaceMassString(JSON.parse(JSON.stringify(client.handleLanguages("MODLOG_UNBAN", client, guild.id))), {
            "{user_id}": user.id,
            "{actionmaker_username}": actionmaker.username,
            "{actionmaker_id}": actionmaker.id,
            "{reason}": reason
        });
    }
    else if (action === "BAN_END") {
        let amount = ms(duration, { long: true });
        if (lang === "tr") {
            amount = amount.replace(/minutes|minute/, "dakika").replace(/hours|hour/, "saat").replace(/days|day/, "gün");
        }
        message += replaceMassString(JSON.parse(JSON.stringify(client.handleLanguages("MODLOG_BAN_TIMEOUT", client, guild.id))), {
            "{user_id}": user.id,
            "{actionmaker_username}": actionmaker.username,
            "{actionmaker_id}": actionmaker.id,
            "{reason}": reason,
            "{amount}": amount
        });
    }
    else if (action === "CHANGES") {
        message = replaceMassString(JSON.parse(JSON.stringify(client.handleLanguages("MODLOG_CHANGES", client, guild.id))), {
            "{time}": `${Math.floor(Date.now() / 1000)}`,
            "{actionmaker_username}": actionmaker.username,
            "{actionmaker_id}": actionmaker.id,
            "{reason}": reason,
            "{case}": caseNumber.toString(),
        });
    }
    else if (action === "FORCED_TIMED_BAN") {
        let amount = ms(duration, { long: true });
        if (lang === "tr") {
            amount = amount.replace(/minutes|minute/, "dakika").replace(/hours|hour/, "saat").replace(/days|day/, "gün");
        }
        message += replaceMassString(JSON.parse(JSON.stringify(client.handleLanguages("MODLOG_BAN_TIMEOUT", client, guild.id))), {
            "{user_id}": user.id,
            "{actionmaker_username}": actionmaker.username,
            "{actionmaker_id}": actionmaker.id,
            "{reason}": reason,
            "{amount}": amount
        });
    }
    else if (action === "TIMEOUT") {
        let amount = ms(duration, { long: true });
        if (lang === "tr") {
            amount = amount.replace(/minutes|minute/, "dakika").replace(/hours|hour/, "saat").replace(/days|day/, "gün");
        }
        message += replaceMassString(JSON.parse(JSON.stringify(client.handleLanguages("MODLOG_TIMEOUT", client, guild.id))), {
            "{user_username}": user.username,
            "{user_id}": user.id,
            "{actionmaker_username}": actionmaker.username,
            "{actionmaker_id}": actionmaker.id,
            "{reason}": reason,
            "{amount}": amount
        });
    }
    try {
        const channel = await guild.channels.fetch(guildData.config.modlogChannel);
        if (channel && channel instanceof TextChannel) {
            await channel.send(message);
        }
    }
    catch (err) {
        log("ERROR", `${__filename}`, `An error occurred while sending modlog message to ${guild.name} (${guild.id}): ${err.message}`);
    }
    if (action !== "CHANGES") {
        await client.updateGuildConfig({ guildId: guild.id, config: { $inc: { case: 1 } } });
    }
};
//# sourceMappingURL=modlog.js.map