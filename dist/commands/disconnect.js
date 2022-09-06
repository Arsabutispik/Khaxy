export default {
    name: "disconnect",
    category: "Müzik",
    description: "Müziği durdurur.",
    usage: "{prefix}disconnect",
    examples: "{prefix}disconnect",
    execute: async ({ client, message }) => {
        let player = await client.manager.get(message.guild.id);
        if (!message.member.voice.channel) {
            message.channel.send("|❌| **Bir sesli kanala girmek zorundasınız**");
            return;
        }
        if (!player) {
            message.channel.send("|❌| **Bot şu anda müzik çalmıyor.**");
            return;
        }
        message.channel.send("|✅| **Müzik durduruldu.**");
        await message.react("✅");
        player.destroy();
    }
};
//# sourceMappingURL=disconnect.js.map