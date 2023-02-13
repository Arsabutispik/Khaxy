import { EmbedBuilder } from "discord.js";
export default async (client, oldState, newState) => {
    if (oldState.channelId === newState.channelId)
        return;
    if (newState.channelId === null && oldState.channelId !== null && oldState.member?.id === client.user.id) {
        const player = client.manager.get(oldState.guild.id);
        if (player) {
            const textChannel = await oldState.guild.channels.fetch(player.textChannel);
            if (textChannel) {
                const leaveEmbed = new EmbedBuilder()
                    .setAuthor({ name: `Kanaldan Atıldım!`, iconURL: "https://cdn.discordapp.com/attachments/972754239447261264/1074662659737276466/a26bb800-b7ee-11eb-8909-43ff37955c81.png" })
                    .setTitle("Sesli kanaldan atıldım!")
                    .setDescription("Sesli kanaldan atıldığımdan dolayı müzik kapatıldı.")
                    .setColor("Red")
                    .setTimestamp();
                await textChannel.send({ embeds: [leaveEmbed] });
            }
            await player.destroy();
        }
    }
};
//# sourceMappingURL=voiceStateUpdate.js.map