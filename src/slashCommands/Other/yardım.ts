import {slashCommandBase} from "../../types";
import {
    ActionRowBuilder, ComponentType,
    EmbedBuilder, MessageComponentInteraction,
    SlashCommandBuilder, StringSelectMenuBuilder,
} from "discord.js";
export default {
    help: {
        name: "yardım",
        description: "Tüm komutları gösterir",
        usage: "yardım",
        examples: ["yardım"],
        category: "Diğer"
    },
    data: new SlashCommandBuilder()
        .setName("yardım")
        .setDescription("Tüm komutları gösterir"),
    execute: async ({interaction, client}) => {
        const category = client.slashCommands.map((command) => command.help.category)
            .filter((value, index, self) => self.indexOf(value) === index)
            .filter((value) => value)
            .map((value) => ({label: value, value: value.toLowerCase()}))
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("help")
            .setPlaceholder("Kategori Seç")
            .addOptions(category)
        const row = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(selectMenu)
        const embed = new EmbedBuilder()
            .setColor("Random")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.displayAvatarURL()})
            .setDescription("Komutlar hakkında bilgi almak için kategori seçin")
        await interaction.reply({
            embeds: [embed],
            components: [row]
        })
        const message = await interaction.fetchReply()
        const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id
        const collector = message.createMessageComponentCollector({filter, time: 300000, componentType: ComponentType.SelectMenu})
        collector.on("collect", async (i) => {
            const category = i.values[0]
            const commands = client.slashCommands.filter((command) => command.help.category).filter((command) => command.help.category.toLowerCase() === category.toLowerCase())
            const embed = new EmbedBuilder()
                .setColor("Random")
                .setAuthor({name: interaction.user.username, iconURL: interaction.user.displayAvatarURL()})
                .setDescription(`**${category.replace(/(?<!\p{L}\p{M}*)\p{L}\p{M}*/gu, (char) => char.toUpperCase())}** Kategorisini görüntülüyorsunuz`)
            commands.forEach((command) => {
                if(!command.help.hidden) {
                    embed.addFields({name: `/${command.help.name}`, value: `Tanım: **${command.help.description}**\n\nKullanım: **${command.help.usage}**\n\nÖrnekler: ${command.help.examples.join("\n")}`, inline: true})
                }
            })
            await i.update({embeds: [embed]})
        })
        collector.on("end", async () => {
            const embed = new EmbedBuilder()
                .setColor("Random")
                .setAuthor({name: interaction.user.username, iconURL: interaction.user.displayAvatarURL()})
                .setDescription("Süre dolduğu için menü kapatıldı")
            await message.edit({embeds: [embed], components: []})
        })

    }
} as slashCommandBase