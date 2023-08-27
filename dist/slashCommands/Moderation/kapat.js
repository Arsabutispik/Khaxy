import { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } from "discord.js";
import fetch, { Headers } from "node-fetch";
import FormData from "form-data";
export default {
    help: {
        name: "kapat",
        description: "Aktif bir modmaili kapatır.",
        usage: "kapat",
        examples: ["kapat"],
        category: "Moderasyon",
    },
    data: new SlashCommandBuilder()
        .setName("kapat")
        .setDMPermission(false)
        .setDescription("Aktif bir modmaili kapatır.")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),
    async execute({ client, interaction }) {
        const ticket = client.userTickets.find((t) => t === interaction.channel.id);
        const user = client.userTickets.findKey((t) => t === interaction.channel.id);
        if (!ticket)
            return interaction.reply({ content: "Bu kanal bir modmail kanalı değil.", ephemeral: true });
        await interaction.reply({ content: "Modmail kapatılıyor...", ephemeral: true });
        const myHeaders = new Headers();
        myHeaders.append("Accept", "application/json");
        const formdata = new FormData();
        formdata.append("username", "arsabutispik");
        formdata.append("password", "G7jqT9c4JShir@O");
        const login = await fetch("https://pastes.io/api/login", {
            method: "POST",
            headers: myHeaders,
            body: formdata,
            redirect: "follow",
        });
        const loginResponse = await login.json();
        const myPostHeaders = new Headers();
        myPostHeaders.append("Accept", "application/json");
        myPostHeaders.append("Authorization", "Bearer " + loginResponse.success.api_token);
        const postformdata = new FormData();
        postformdata.append("content", client.ticketMessages.get(user));
        postformdata.append("status", "2");
        postformdata.append("expire", "N");
        postformdata.append("title", `${interaction.channel.name} - ${interaction.user.username} Tarafından yanıtlanan mail`);
        postformdata.append("syntax", "none");
        const pasteio = await fetch("https://pastes.io/api/paste/create", {
            method: "POST",
            headers: myPostHeaders,
            body: postformdata,
            redirect: "follow",
        });
        const response = await pasteio.json();
        const lastEmbed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(`${interaction.user.username} tarafından ${interaction.channel.name} maili kapatıldı. Konuşma logları [BURADA](https://pastes.io/raw/${response.success.slug}) bulunabilir`)
            .setColor("Greyple")
            .setTimestamp();
        const logChannel = interaction.guild.channels.cache.get(client.guildsConfig.get(interaction.guildId).config.modmail.logChannel);
        if (logChannel) {
            await logChannel.send({ embeds: [lastEmbed] });
        }
        client.userTickets.delete(user);
        client.ticketMessages.delete(ticket);
        if (interaction.guild.members.me?.permissionsIn(interaction.channel).has(PermissionsBitField.Flags.ManageChannels)) {
            interaction.channel.delete();
        }
        else {
            interaction.channel.send({ content: "Bu kanalı silmek için yeterli yetkim yok." });
        }
        const userDM = await client.users.fetch(user);
        const closeEmbed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setDescription("Modmailiniz kapatıldı")
            .setColor("Red")
            .setTimestamp();
        await userDM.send({ embeds: [closeEmbed] });
    }
};
//# sourceMappingURL=kapat.js.map