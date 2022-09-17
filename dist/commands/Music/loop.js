export default {
    name: "loop",
    description: "Müziği tekrarlar.",
    category: "Müzik",
    examples: "{prefix}loop",
    usage: "{prefix}loop",
    async execute({ client, message }) {
        const player = await client.manager.get(message.guild.id);
        if (!player) {
            return message.channel.send("|❌| **Şu anda hiçbir şey çalmıyor.**");
        }
        if (!message.member.voice.channel) {
            return message.channel.send("|❌| **Bir ses kanalında olmanız gerekir.**");
        }
        if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) {
            return message.channel.send("|❌| **Bu komutu kullanmak için aynı ses kanalında olmanız gerekir.**");
        }
        if (!message.member.permissions.has("ADMINISTRATOR")) {
            if (!message.member.roles.cache.has("798592379204010024")) {
                message.channel.send("|❌| **Bu komutu kullanmak için yeterli yetkiniz yok.**");
                return;
            }
            else {
                const success = player.setTrackRepeat(!player.trackRepeat);
                message.channel.send(`|${success.trackRepeat ? "✅" : "❌"}| **Şarkı tekrarı ${success.trackRepeat ? "açıldı" : "kapatıldı"}.**`);
                return;
            }
        }
        if (!player.queue.current) {
            return message.channel.send("|❌| **Şu anda hiçbir şey çalmıyor.**");
        }
        const success = player.setTrackRepeat(!player.trackRepeat);
        return message.channel.send(`|${success.trackRepeat ? "✅" : "❌"}| **Şarkı tekrarı ${success.trackRepeat ? "açıldı" : "kapatıldı"}.**`);
    }
};
//# sourceMappingURL=loop.js.map