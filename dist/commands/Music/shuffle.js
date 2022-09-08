export default {
    name: "shuffle",
    category: "Müzik",
    description: "Müziği karıştırır.",
    usage: "{prefix}shuffle",
    examples: "{prefix}shuffle",
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
        if (!message.member.permissions.has("ADMINISTRATOR")) {
            if (!message.member.roles.cache.has("798592379204010024")) {
                message.channel.send("|❌| **Bu komutu kullanmak için yeterli yetkiniz yok.**");
                return;
            }
            else {
                player.pause(true);
                message.channel.send("|✅| **Müzik duraklatıldı.**");
                await message.react("✅");
                return;
            }
        }
        player.queue.shuffle();
        message.channel.send("|✅| **Müzik karıştırıldı.**");
        await message.react("✅");
    }
};
//# sourceMappingURL=shuffle.js.map