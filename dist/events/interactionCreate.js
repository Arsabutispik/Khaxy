import { ChannelType, EmbedBuilder } from "discord.js";
import guildConfig from "../schemas/guildSchema.js";
import { percentageChance } from "src/utils/utils";
export default async (client, interaction) => {
    if (interaction.isChatInputCommand()) {
        if (interaction.channel.type === ChannelType.DM)
            return interaction.reply({ content: "DM'de komutlar kullanılamaz!", ephemeral: true });
        if (!interaction.guild.members.me.permissions.has("Administrator")) {
            return interaction.reply("Botun kullanılabilir olması için yönetici olması gerekiyor!");
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
        const sendMessage = percentageChance(["true", "false"], [10, 90]);
        if (sendMessage === "true") {
            const embed = new EmbedBuilder()
                .setColor("Random")
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setDescription(`**${interaction.user.tag}** adlı kullanıcı \`${interaction.commandName}\` komutunu kullandı!`)
                .setTimestamp();
            interaction.channel.send({ embeds: [embed] });
        }
        try {
            await cmd.execute({ client, interaction });
        }
        catch (e) {
            console.log(e);
            if (interaction.isRepliable()) {
                await interaction.reply({ content: "Bir hata oluştu!", ephemeral: true });
            }
        }
    }
};
//# sourceMappingURL=interactionCreate.js.map