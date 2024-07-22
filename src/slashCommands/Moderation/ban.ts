import {slashCommandBase} from "../../../types";
import {GuildMember, EmbedBuilder, SlashCommandBuilder, PermissionsBitField} from "discord.js";
import ms from "ms";
import modlog from "../../utils/modlog.js";
import Punishment from "../../schemas/punishmentSchema.js";
import {daysToSeconds, replaceMassString} from "../../utils/utils.js";

export default {
    help: {
        name: "ban",
        description: "Bir kullanıcıyı sunucudan yasaklar",
        usage: "ban <üye> [süre] [sebep]",
        examples: ["ban 674565119161794560 1d Küfür", "ban @Khaxy Küfür"],
        category: "Moderasyon"
    },
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Bans an user from the server")
        .setDMPermission(false)
        .setDescriptionLocalizations({
            tr: "Bir kullanıcıyı sunucudan yasaklar",
        })
        .addSubcommand(subcommand => subcommand.setName("force").setDescription("Force bans an user from the server")
            .setNameLocalizations({
                tr: "zorla"
            })
            .setDescriptionLocalizations({
                tr: "Bir kullanıcıyı sunucudan zorla yasaklar"
            })
            .addStringOption(option => option.setName("id")
                .setDescription("ID of the user to be banned")
                .setRequired(true)
                .setDescriptionLocalizations({
                tr: "Yasaklanacak kullanıcının ID'si"
            }))
            .addNumberOption(option => option.setName("duration")
                .setNameLocalizations({
                    tr: "süre"
                })
                .setDescription("Duration of the ban (only numbers)")
                .setDescriptionLocalizations({
                        tr: "Yasaklanma süresi (sadece sayılar)"
                    })
                .setRequired(false))
            .addStringOption(option => option.setName("time")
                .setNameLocalizations({
                    tr: "vakit"
                })
                .setDescription("Time unit of the ban duration")
                .setDescriptionLocalizations({
                    tr: "Yasaklanma süresinin birimi"
                })
                .setRequired(false)
                .setChoices(
                    {name: "Second(s)", value: "s"},
                    {name: "Minute(s)", value: "m"},
                    {name: "Hour(s)", value: "h"},
                    {name: "Day(s)", value: "d"},
                    {name: "Week(s)", value: "w"}
                ))
            .addStringOption(option => option.setName("reason")
                .setNameLocalizations({
                    tr: "sebep"
                })
                .setDescription("Reason of the ban.")
                .setDescriptionLocalizations({
                    tr: "Yasaklanma sebebi"
                })
                .setRequired(false)))

        .addSubcommand(subcommand => subcommand.setName("member")
            .setNameLocalizations({
                tr: "üye"
            })
            .setDescription("Ban an user from the server")
            .setDescriptionLocalizations({
                tr: "Bir kullanıcıyı sunucudan yasaklar"
            })
            .addUserOption(option => option.setName("member")
                .setNameLocalizations({
                    tr: "üye"
                })
                .setDescription("Member to be banned")
                .setDescriptionLocalizations({
                    tr: "Yasaklanacak kullanıcı"
                })
                .setRequired(true))
            .addNumberOption(option => option.setName("duration")
                .setNameLocalizations({
                    tr: "süre"
                })
                .setDescription("Duration of the ban (only numbers)")
                .setDescriptionLocalizations({
                    tr: "Yasaklanma süresi (sadece sayılar)"
                })
                .setRequired(false))
            .addStringOption(option => option.setName("time")
                .setNameLocalizations({
                    tr: "vakit"
                })
                .setDescription("Time unit of the ban duration")
                .setDescriptionLocalizations({
                    tr: "Yasaklanma süresinin birimi"
                })
                .setRequired(false)
                .setChoices(
                    {name: "Second(s)", value: "s"},
                    {name: "Minute(s)", value: "m"},
                    {name: "Hour(s)", value: "h"},
                    {name: "Day(s)", value: "d"},
                    {name: "Week(s)", value: "w"}
                ))
            .addStringOption(option => option.setName("reason")
                .setNameLocalizations({
                    tr: "sebep"
                })
                .setDescription("Reason of the ban.")
                .setDescriptionLocalizations({
                    tr: "Yasaklanma sebebi"
                })
                .setRequired(false))),
    execute: async ({interaction, client}) => {
        if(!interaction.guild!.members.me!.permissions.has(PermissionsBitField.Flags.BanMembers)) return interaction.reply({content: client.handleLanguages("BAN_BOT_MISSING_PERMS", client, interaction.guild!.id), ephemeral: true})
        const data = client.guildsConfig.get(interaction.guild!.id)!;
        const lang = data.config.language || "english";
        const subCommand = interaction.options.getSubcommand(true);
        if(!(interaction.member as GuildMember).permissions.has(PermissionsBitField.Flags.BanMembers) || !(interaction.member as GuildMember).roles.cache.hasAny(...data.config.staffRole)) return interaction.reply({content: client.handleLanguages("BAN_USER_MISSING_PERMS", client, interaction.guild!.id), ephemeral: true});
        if(subCommand ===  "üye"){
            const user = interaction.options.getUser("member");
            let targetMember: GuildMember;
            try{
                targetMember = await interaction.guild!.members.fetch(user!.id);
            } catch (err) {
                await interaction.reply({content: client.handleLanguages("BAN_USER_NOT_FOUND", client, interaction.guild!.id), ephemeral: true})
                return
            }
            const reason = interaction.options.getString("reason", false) || client.handleLanguages("BAN_NO_REASON", client, interaction.guild!.id);
            if(targetMember.id === interaction.user.id) {
                await interaction.reply({content: client.handleLanguages("BAN_CANT_BAN_YOURSELF", client, interaction.guild!.id), ephemeral: true})
                return
            }
            if(targetMember.user.bot) {
                await interaction.reply({content: client.handleLanguages("BAN_CANT_BAN_BOT", client, interaction.guild!.id), ephemeral: true})
                return
            }
            if(targetMember.roles.highest.position >= (interaction.member as GuildMember)!.roles.highest.position) {
                await interaction.reply({content: client.handleLanguages("BAN_USER_HIGHER_ROLE", client, interaction.guild!.id), ephemeral: true})
                return
            }
            if(targetMember.permissions.has("BanMembers") || targetMember.roles.cache.hasAny(...data.config.staffRole)) {
                await interaction.reply({content: client.handleLanguages("BAN_USER_HAS_PERMS", client, interaction.guild!.id), ephemeral: true})
                return
            }
            if(interaction.options.getNumber("duration", false) && !interaction.options.getString("time", false)) {
                await interaction.reply({content: client.handleLanguages("BAN_SPECIFY_UNIT", client, interaction.guild!.id), ephemeral: true})
                return
            } else if(!interaction.options.getNumber("duration", false) && interaction.options.getString("time", false)) {
                await interaction.reply({content: client.handleLanguages("BAN_SPECIFY_TIME", client, interaction.guild!.id), ephemeral: true})
                return
            }
            if(interaction.options.getNumber("duration", false)) {
                if(interaction.options.getNumber("duration", false)! < 0) {
                    await interaction.reply({content: client.handleLanguages("BAN_INVALID_TIME", client, interaction.guild!.id), ephemeral: true})
                    return
                }
                const duration = ms(`${interaction.options.getNumber("duration", true)}${interaction.options.getString("time", true)}`)
                let longduration = ms(duration!, {long: true})
                if(lang === "tr") {
                    longduration = longduration.replace(/minutes|minute/, "dakika").replace(/hours|hour/, "saat").replace(/days|day/, "gün")
                }
                await targetMember.ban({reason: reason})
                try{
                    await targetMember.send(replaceMassString(
                        client.handleLanguages("BAN_USER_DURATION_DM", client, interaction.guild!.id),
                        {
                            "{guild_name}": interaction.guild!.name,
                            "{duration}": longduration,
                            "{reason}": reason
                        })!)
                    await interaction.channel!.send(replaceMassString(
                        client.handleLanguages("BAN_USER_DURATION_MESSAGE", client, interaction.guild!.id),
                        {
                            "{targetMember_username}": targetMember.user.tag,
                            "{duration}": longduration,
                            "{reason}": reason,
                            "{case}": data.case.toString()
                        }
                    )!)
                } catch {
                    await interaction.channel!.send(replaceMassString(
                        client.handleLanguages("BAN_USER_DURATION_MESSAGE_FAIL", client, interaction.guild!.id),
                        {
                            "{targetMember_username}": targetMember.user.tag,
                            "{duration}": longduration,
                            "{reason}": reason,
                            "{case}": data.case.toString()
                        }
                    )!)
                }
                await targetMember.ban({reason, deleteMessageSeconds: daysToSeconds(7)})
                if(interaction.guild!.channels.cache.get(data.config.modlogChannel)) {
                    try {
                        await modlog({
                            guild: interaction.guild!,
                            user: targetMember.user,
                            action: "TIMED_BAN",
                            actionmaker: interaction.user,
                            reason,
                            duration
                        }, client)
                    } catch {
                        await interaction.followUp({content: client.handleLanguages("NO_PERMISSION_MODLOG", client, interaction.guild!.id), ephemeral: true})
                    }
                }
                await new Punishment({guildID: interaction.guild!.id, userId: targetMember.id, staffId: interaction.user.id, reason, expires: new Date(Date.now() + duration), type: "ban"}).save()

            } else {
                try{
                    await targetMember.send(replaceMassString(
                        client.handleLanguages("BAN_USER_DM", client, interaction.guild!.id),
                        {
                            "{guild_name}": interaction.guild!.name,
                            "{reason}": reason
                        }
                    )!)
                    await interaction.channel!.send(replaceMassString(
                        client.handleLanguages("BAN_USER_MESSAGE", client, interaction.guild!.id),
                        {
                            "{targetMember_username}": targetMember.user.tag,
                            "{case}": data.case.toString(),
                        }
                    )!)
                } catch {
                    await interaction.channel!.send(replaceMassString(
                        client.handleLanguages("BAN_USER_MESSAGE_FAIL", client, interaction.guild!.id),
                        {
                            "{targetMember_username}": targetMember.user.tag,
                            "{case}": data.case.toString(),
                        }
                    )!)
                }
                if(interaction.guild!.channels.cache.get(data.config.modlogChannel)) {
                    try {
                        await modlog({
                            guild: interaction.guild!,
                            user: targetMember.user,
                            action: "BAN",
                            actionmaker: interaction.user,
                            reason
                        }, client)
                    } catch {
                           await interaction.followUp({content: client.handleLanguages("NO_PERMISSION_MODLOG", client, interaction.guild!.id), ephemeral: true})
                    }
                }
                await targetMember.ban({reason})
            }

        } else if(subCommand === "force") {
            let fetchUser
            try {
                fetchUser = await client.users.fetch(`${interaction.options.getString("id", true)}`)
            } catch {
                const embed = new EmbedBuilder()
                    .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
                    .setColor("Red")
                    .setDescription(client.handleLanguages("BAN_FORCE_USER_NOT_FOUND", client, interaction.guild!.id))
                await interaction.reply({embeds: [embed], ephemeral: true})
                return
            }
            if(interaction.options.getString("duration", false) && !interaction.options.getString("time", false)) {
                await interaction.reply({content: client.handleLanguages("BAN_SPECIFY_UNIT", client, interaction.guild!.id), ephemeral: true})
                return
            } else if(!interaction.options.getString("duration", false) && interaction.options.getString("time", false)) {
                await interaction.reply({content: client.handleLanguages("BAN_SPECIFY_TIME", client, interaction.guild!.id), ephemeral: true})
                return
            }
            if(interaction.options.getString("duration", false)) {
                const duration = ms(`${interaction.options.getString("duration", true) || "0"}${interaction.options.getString("time", true) || "s"}`)
                let longduration = ms(duration!, {long: true})
                if(lang === "tr") {
                    longduration = longduration.replace(/minutes|minute/, "dakika").replace(/hours|hour/, "saat").replace(/days|day/, "gün")
                }
                const reason = interaction.options.getString("reason", false) || client.handleLanguages("BAN_NO_REASON", client, interaction.guild!.id)
                await interaction.channel!.send(replaceMassString(
                    client.handleLanguages("BAN_USER_DURATION_MESSAGE", client, interaction.guild!.id),
                    {
                        "{targetMember_username}": fetchUser.tag,
                        "{duration}": longduration
                    }
                )!)
                await interaction.guild!.bans.create(fetchUser.id)
                if(interaction.guild!.channels.cache.get(data.config.modlogChannel)) {
                    try {
                        await modlog({
                            guild: interaction.guild!,
                            user: fetchUser,
                            action: "FORCED_TIMED_BAN",
                            actionmaker: interaction.user,
                            reason,
                            duration
                        }, client)
                    } catch {
                        await interaction.followUp({content: client.handleLanguages("NO_PERMISSION_MODLOG", client, interaction.guild!.id), ephemeral: true})
                    }
                }
                await new Punishment({guildID: interaction.guild!.id, userId: fetchUser.id, staffId: interaction.user.id, reason, expires: new Date(Date.now() + duration), type: "ban"}).save()

            } else {
                const reason = interaction.options.getString("reason", false) || client.handleLanguages("BAN_NO_REASON", client, interaction.guild!.id)
                await interaction.channel!.send(replaceMassString(
                    client.handleLanguages("BAN_FORCE_MESSAGE", client, interaction.guild!.id),
                    {
                        "{targetMember_username}": fetchUser.tag,
                        "{case}": data.case.toString(),
                    }
                )!)
                await interaction.guild!.bans.create(fetchUser.id)
                if(interaction.guild!.channels.cache.get(data.config.modlogChannel)) {
                    try {
                        await modlog({
                            guild: interaction.guild!,
                            user: fetchUser,
                            action: "FORCED_BAN",
                            actionmaker: interaction.user,
                            reason
                        }, client)
                    } catch {
                        await interaction.followUp({content: client.handleLanguages("NO_PERMISSION_MODLOG", client, interaction.guild!.id), ephemeral: true})
                    }
                }
            }
        }
    }
} as slashCommandBase