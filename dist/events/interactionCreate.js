import { ChannelType, EmbedBuilder } from "discord.js";
import guildConfig from "../schemas/guildSchema.js";
import { log, percentageChance } from "../utils/utils.js";
export default async (client, interaction) => {
    if (interaction.isChatInputCommand()) {
        if (interaction.channel.type === ChannelType.DM)
            return interaction.reply({ content: "DM'de komutlar kullanılamaz!", ephemeral: true });
        if (!interaction.channel.permissionsFor(interaction.guild.members.me).has("SendMessages")) {
            return interaction.reply("Botun düzgün çalışması için `Mesaj Gönder` yetkisine ihtiyacı var!");
        }
        if (client.guildsConfig.get(interaction.guild.id) === undefined) {
            const data = await guildConfig.findOne({ guildID: interaction.guild.id });
            if (!data) {
                const newData = await guildConfig.findOneAndUpdate({ guildID: interaction.guild.id }, {}, { upsert: true, new: true, setDefaultsOnInsert: true });
                client.guildsConfig.set(interaction.guild.id, newData.toObject());
            }
            else {
                client.guildsConfig.set(interaction.guild.id, data.toObject());
            }
        }
        const cmd = client.slashCommands.get(interaction.commandName);
        if (!cmd)
            return;
        const sendMessage = percentageChance(["true", "false"], [1, 99]);
        if (sendMessage === "true") {
            const embed = new EmbedBuilder()
                .setColor("Random")
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setDescription(`Bu botu kullanmaktan memnun musunuz? /invite ile bu botu sunucunuza davet edebilirsiniz!`)
                .setTimestamp();
            interaction.channel.send({ embeds: [embed] });
        }
        try {
            await cmd.execute({ client, interaction });
            log("SUCCESS", "Slash Command", `${interaction.user.tag} (${interaction.user.id}) executed ${interaction.commandName} in ${interaction.guild.name} (${interaction.guild.id})`);
        }
        catch (e) {
            log("ERROR", "Slash Command", `${interaction.commandName} returned an error: ${e}`);
            if (!interaction.replied) {
                await interaction.reply({ content: "Bir hata oluştu!", ephemeral: true });
            }
            else {
                await interaction.followUp({ content: "Bir hata oluştu!", ephemeral: true });
            }
        }
    }
};
//# sourceMappingURL=interactionCreate.js.map