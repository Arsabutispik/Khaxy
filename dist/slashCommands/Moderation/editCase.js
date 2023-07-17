import { ButtonBuilder, EmbedBuilder, ActionRowBuilder, SlashCommandBuilder, ButtonStyle, ComponentType, PermissionsBitField } from "discord.js";
import modlog from "../../utils/modlog.js";
const rejectButton = new ButtonBuilder()
    .setCustomId("reddet")
    .setEmoji("✖️")
    .setDisabled(false)
    .setStyle(ButtonStyle.Danger);
const acceptButton = new ButtonBuilder()
    .setCustomId("kabul")
    .setEmoji("✔️")
    .setDisabled(false)
    .setStyle(ButtonStyle.Success);
const actionRow = new ActionRowBuilder()
    .addComponents(acceptButton, rejectButton);
export default {
    help: {
        name: "editcase",
        description: "Bir cezanın sebebini değiştirir",
        usage: "editcase <id> <sebep>",
        examples: ["editcase 1 Küfür"],
        category: "Moderasyon"
    },
    data: new SlashCommandBuilder()
        .setName("editcase")
        .setDescription("Bir cezanın sebebini değiştirir")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles)
        .setDMPermission(false)
        .addNumberOption(option => option.setName("id").setDescription("Değiştirilecek cezanın ID'si").setRequired(true))
        .addStringOption(option => option.setName("sebep").setDescription("Yeni ceza sebebi").setRequired(true)),
    execute: async ({ interaction, client }) => {
        const id = interaction.options.getNumber("id", true);
        const reason = interaction.options.getString("sebep", true);
        const data = client.guildsConfig.get(interaction.guild.id);
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild))
            return interaction.reply({ content: "Bu komutu kullanmak için yeterli yetkin yok.", ephemeral: true });
        if (!data.config.modlogChannel) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setColor("Red")
                .setDescription("Bu komutu kullanabilmek için önce modlog kanalını ayarlamalısınız!");
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        else if (!interaction.guild.channels.cache.get(data.config.modlogChannel)) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setColor("Red")
                .setDescription("Bu komutu kullanabilmek için önce modlog kanalını ayarlamalısınız!");
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        else if (!interaction.guild.channels.cache.get(data.config.modlogChannel).permissionsFor(interaction.guild.members.me).has(PermissionsBitField.Flags.SendMessages)) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setColor("Red")
                .setDescription("Bu komutu kullanabilmek için önce modlog kanalına mesaj gönderme yetkisine sahip olmalıyım!");
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        if ((data.case < id) || (id < 1)) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setColor("Red")
                .setDescription("Bu ID'ye sahip bir ceza bulunamadı!");
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        const embed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setDescription("Değişiklikleri onaylamak için düğmelerden ✔️, iptal etmek için ✖️ tuşuna basınız.")
            .addFields({
            name: "Yeni Moderatör",
            value: interaction.user.tag
        }, {
            name: "Yeni Sebep",
            value: reason
        });
        await interaction.reply({ embeds: [embed], components: [actionRow] });
        const msg = await interaction.fetchReply();
        const filter = (m) => (m.customId === "reddet" || m.customId === "kabul") && (m.user.id === interaction.user.id);
        let response;
        try {
            response = (await msg.awaitMessageComponent({ filter, time: 300000, componentType: ComponentType.Button }));
        }
        catch {
            await interaction.followUp({ content: "Onay zamanında gelmedi.", ephemeral: true });
            return;
        }
        switch (response.customId) {
            case "reddet":
                await response.reply({ content: "Komut iptal edildi.", ephemeral: true });
                embed.setColor("Red");
                await msg.edit({ embeds: [embed] });
                break;
            case "kabul":
                embed.setColor("Green");
                await msg.edit({ embeds: [embed], components: [] });
                await modlog({ guild: interaction.guild, casenumber: id, reason, actionmaker: interaction.user, action: "DEĞİŞİKLİK", user: interaction.user }, client);
                await response.reply({ content: "Değişiklikler yapıldı.", ephemeral: true });
                break;
        }
    }
};
//# sourceMappingURL=editCase.js.map