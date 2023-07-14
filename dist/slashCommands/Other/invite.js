import { EmbedBuilder, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { OAuth2Scopes } from "discord-api-types/v10";
export default {
    data: new SlashCommandBuilder()
        .setName("invite")
        .setDescription("Botun davet linkini gönderir"), execute: async ({ interaction, client }) => {
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
            PermissionsBitField.Flags.KickMembers
        ];
        const link = client.generateInvite({
            permissions: permFlags,
            scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands]
        });
        const inviteEmbed = new EmbedBuilder()
            .setTitle("Davet Linki")
            .setURL(link)
            .setDescription(`Khaxy Bot'u kullandığınız için minnetarız :heart:\n\nEğer botu kendi sunucunuzda kullanmak istiyorsanız [buradan](${link}) davet edebilirsiniz\n\nDestek sunucumuz için [buraya tıkla](https://discord.gg/U7gAPuBP8F)`)
            .setColor("Random");
        await interaction.reply({ embeds: [inviteEmbed] });
    }
};
//# sourceMappingURL=invite.js.map