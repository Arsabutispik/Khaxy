import { EmbedBuilder } from "discord.js";
import { useQueue } from "discord-player";
export default async (client, oldState, newState) => {
    if (oldState.channelId === newState.channelId)
        return;
    if (oldState.channelId !== null) {
        if (oldState.channel?.members.find(user => user.id === client.user.id) && oldState.channel?.members.size === 1) {
            const player = useQueue(oldState.guild.id);
            if (player) {
                const textChannel = player.channel;
                if (textChannel) {
                    const noMember = new EmbedBuilder()
                        .setTitle("Sesli kanalda kimse kalmadı!")
                        .setDescription("Sesli kanalda kimse kalmadığı için müzik kapatıldı.")
                        .setColor("Red")
                        .setTimestamp();
                    await textChannel.send({ embeds: [noMember] });
                }
                player.node.stop();
            }
        }
        if (newState.channelId === null && oldState.member?.id === client.user.id) {
            const player = useQueue(oldState.guild.id);
            if (player) {
                const textChannel = player.channel;
                if (textChannel) {
                    const leaveEmbed = new EmbedBuilder()
                        .setAuthor({ name: `Kanaldan Atıldım!`, iconURL: "https://cdn.discordapp.com/attachments/972754239447261264/1074662659737276466/a26bb800-b7ee-11eb-8909-43ff37955c81.png" })
                        .setTitle("Sesli kanaldan atıldım!")
                        .setDescription("Sesli kanaldan atıldığımdan dolayı müzik kapatıldı.")
                        .setColor("Red")
                        .setTimestamp();
                    await textChannel.send({ embeds: [leaveEmbed] });
                }
                player.node.stop();
            }
        }
    }
};
//# sourceMappingURL=voiceStateUpdate.js.map