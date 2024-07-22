import {slashCommandBase} from "../../../types";
import {PermissionsBitField, SlashCommandBuilder} from "discord.js";
import {OAuth2Scopes} from "discord-api-types/v10";
import {replaceMassString} from "../../utils/utils.js";
export default {
    help: {
        name: "invite",
        description: "Botun davet linkini gönderir",
        usage: "invite",
        examples: ["invite"],
        category: "Diğer"
    },
    data: new SlashCommandBuilder()
        .setName("invite")
        .setNameLocalizations({
            "tr": "davet",
        })
        .setDescription("Sends a link to invite the bot")
        .setDescriptionLocalizations({
            "tr": "Botun davet linkini gönderir"
            }),
    execute: async ({interaction, client}) => {
        const permFlags = [
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.BanMembers,
            PermissionsBitField.Flags.Speak,
            PermissionsBitField.Flags.Connect,
            PermissionsBitField.Flags.ManageMessages,
            PermissionsBitField.Flags.EmbedLinks,
            PermissionsBitField.Flags.UseExternalEmojis,
            PermissionsBitField.Flags.ManageRoles,
            PermissionsBitField.Flags.ManageGuild,
            PermissionsBitField.Flags.ViewAuditLog,
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.KickMembers,
            PermissionsBitField.Flags.ManageChannels,
            PermissionsBitField.Flags.AddReactions
            ]
        const link = client.generateInvite({
            permissions: permFlags,
            scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands]
        })
        const discordLink = await (await client.guilds.fetch("1033954657569099878")).invites.create("1038758642620567552", {temporary: true, maxAge: 12*10000, maxUses: 1})
        const {embeds} = client.handleLanguages("INVITE_EMBED", client, interaction.guildId!)
        embeds[0].url = link
        embeds[0].description = replaceMassString(embeds[0].description, {
            "{inviteLink}": link,
            "{discordLink}": discordLink.url
        })!
        await interaction.reply({embeds});
    }} as slashCommandBase