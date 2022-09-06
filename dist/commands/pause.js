export default {
    name: "pause",
    category: "Müzik",
    description: "Müziği duraklatır.",
    usage: "{prefix}pause",
    examples: "{prefix}pause",
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
        if (player.paused) {
            message.channel.send("|❌| **Müzik zaten duraklatılmış.**");
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
        player.pause(true);
        message.channel.send("|✅| **Müzik duraklatıldı.**");
        await message.react("✅");
    }
};
//# sourceMappingURL=pause.js.map