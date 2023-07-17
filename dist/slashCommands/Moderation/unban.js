import { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } from "discord.js";
import modlog from "../../utils/modlog.js";
export default {
    help: {
        name: "unban",
        description: "Bir kullanıcının yasağını kaldırır",
        usage: "unban <id> [sebep]",
        examples: ["unban 1007246359696515125", "unban 1007246359696515125 sebep"],
        category: "Moderasyon"
    },
    data: new SlashCommandBuilder()
        .setName("unban")
        .setDescription("Bir kullanıcının yasağını kaldırır")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers)
        .setDMPermission(false)
        .addStringOption(option => option.setName("id").setDescription("Yasağını kaldırılacak kullanıcın ID'si").setRequired(true))
        .addStringOption(option => option.setName("sebep").setDescription("Yasağın kaldırılma sebebi")),
    execute: async ({ interaction, client }) => {
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            await interaction.reply({ content: "Bu komutu kullanabilmek için `Üyeleri Yasakla` yetkim yok!", ephemeral: true });
            return;
        }
        const id = interaction.options.getNumber("id", true).toString();
        const reason = interaction.options.getString("sebep", false) || "Sebep belirtilmedi";
        const banned = await interaction.guild.bans.fetch();
        const user = banned.get(id);
        const data = client.guildsConfig.get(interaction.guild.id);
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers))
            return interaction.reply({ content: "Bu komutu kullanmak için yeterli yetkin yok.", ephemeral: true });
        if (!user) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setColor("Red")
                .setDescription("Bu kullanıcı yasaklı değil!");
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        await interaction.guild.members.unban(user.user, reason);
        if (interaction.guild.channels.cache.get(data.config.modlogChannel)) {
            try {
                await modlog({
                    guild: interaction.guild,
                    user: user.user,
                    actionmaker: interaction.user,
                    reason,
                    action: "BAN_KALDIR"
                }, client);
            }
            catch {
                await interaction.followUp({ content: "Modlog kanalına mesaj göndermek için yetkim yok!", ephemeral: true });
            }
        }
        const embed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setColor("Green")
            .setDescription(`${user.user.tag} adlı kullanıcının yasağı kaldırıldı!`);
        await interaction.reply({ embeds: [embed] });
    }
};
//# sourceMappingURL=unban.js.map