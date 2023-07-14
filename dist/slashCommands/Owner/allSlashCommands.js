import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
export default {
    help: {
        hidden: true,
    },
    data: new SlashCommandBuilder()
        .setName("allslashcommands")
        .setDescription("Tüm slash komutlarını gösterir, bot sahibine özeldir")
        .addStringOption(option => option.setName("id").setDescription("Silenecek komudun ID'si").setRequired(false)),
    ownerOnly: true,
    execute: async ({ interaction, client }) => {
        if (interaction.user.id !== "903233069245419560")
            return interaction.reply({ content: "Bu komutu sadece sahibim kullanabilir!", ephemeral: true });
        const commands = Array.from((await client.application.commands.fetch()).values()).concat(Array.from((await client.guilds.cache.get("1007285630427996292").commands.fetch()).values()));
        const embed = new EmbedBuilder()
            .setTitle("Tüm Slash Komutlar")
            .setDescription(commands.map(val => `${val.name} - ${val.id}`).join("\n"));
        const id = interaction.options.getString("id");
        if (!id)
            return await interaction.reply({ ephemeral: true, embeds: [embed] });
        const splitted = id.split(" ");
        const command = commands.filter(val => splitted.includes(val.id));
        if (!command)
            return interaction.reply({ content: "Böyle bir komut bulunamadı!", ephemeral: true });
        command.forEach(val => val.delete());
        await interaction.reply({ content: "Komutlar silindi!", ephemeral: true });
    }
};
//# sourceMappingURL=allSlashCommands.js.map