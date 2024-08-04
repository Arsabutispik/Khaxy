import { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, ChannelType } from "discord.js";
import fs from "fs/promises";
import { replaceMassString } from "../../utils/utils.js";
export default {
    help: {
        name: "kapat",
        description: "Aktif bir modmaili kapatır.",
        usage: "kapat",
        examples: ["kapat"],
        category: "Moderasyon",
    },
    data: new SlashCommandBuilder()
        .setName("closemail")
        .setNameLocalizations({
        "tr": "mailkapat"
    })
        .setDMPermission(false)
        .setDescription("Closes an active modmail")
        .setDescriptionLocalizations({
        "tr": "Aktif bir modmaili kapatır."
    }),
    async execute({ client, interaction }) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild))
            return interaction.reply({ content: client.handleLanguages("CLOSEMAIL_NO_PERMS", client, interaction.guild.id), ephemeral: true });
        const ticket = client.userTickets.find((t) => t === interaction.channel.id);
        const user = client.userTickets.findKey((t) => t === interaction.channel.id);
        if (!ticket)
            return interaction.reply({ content: client.handleLanguages("CLOSEMAIL_NOT_MODMAIL", client, interaction.guild.id), ephemeral: true });
        await interaction.reply({ content: client.handleLanguages("CLOSEMAIL_CLOSE", client, interaction.guild.id), ephemeral: true });
        let logChannel = interaction.guild.channels.cache.get(client.guildsConfig.get(interaction.guildId).config.modmail.logChannel);
        if (!logChannel) {
            try {
                logChannel = await interaction.guild.channels.create({
                    name: "modmail-logs",
                    type: ChannelType.GuildText,
                    parent: client.guildsConfig.get(interaction.guildId).config.modmail.category,
                });
            }
            catch (e) {
                return interaction.channel.send({ content: client.handleLanguages("CLOSEMAIL_LOG_CHANNEL_ERROR", client, interaction.guild.id) });
            }
        }
        await fs.mkdir("./logs", { recursive: true });
        await fs.writeFile(`./logs/${interaction.guild.members.cache.get(user).user.username}.txt`, client.ticketMessages.get(interaction.channel.id));
        const lastEmbed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(replaceMassString(JSON.parse(JSON.stringify(client.handleLanguages("CLOSEMAIL_LOG_MESSAGE", client, guild.id))), {
            "{userName}": interaction.user.username,
            "{mailChannelName}": interaction.channel.name,
        }))
            .setColor("Greyple")
            .setTimestamp();
        if (logChannel) {
            await logChannel.send({ embeds: [lastEmbed], files: [`./logs/${interaction.guild.members.cache.get(user).user.username}.txt`]
            });
        }
        client.userTickets.delete(user);
        client.ticketMessages.delete(ticket);
        if (interaction.guild.members.me?.permissionsIn(interaction.channel).has(PermissionsBitField.Flags.ManageChannels)) {
            interaction.channel.delete();
        }
        else {
            interaction.channel.send({ content: client.handleLanguages("CLOSEMAIL_NO_PERM_TO_DELETE", client, interaction.guild.id) });
        }
        const userDM = await client.users.fetch(user);
        const closeEmbed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(client.handleLanguages("CLOSEMAIL_NOTIFY", client, interaction.guild.id))
            .setColor("Red")
            .setTimestamp();
        await userDM.send({ embeds: [closeEmbed], files: [`./logs/${interaction.guild.members.cache.get(user).user.username}.txt`] });
        await fs.rm("./logs", { recursive: true, force: true });
    }
};
//# sourceMappingURL=close.js.map