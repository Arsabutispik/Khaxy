export default {
    name: "loopqueue",
    description: "Kuyruğu tekrarlar.",
    category: "Müzik",
    examples: "{prefix}loopqueue",
    usage: "{prefix}loopqueue",
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
                const success = player.setQueueRepeat(!player.queueRepeat);
                message.channel.send(`|${success.queueRepeat ? "✅" : "❌"}| **Kuyruk tekrarı ${success.queueRepeat ? "açıldı" : "kapatıldı"}.**`);
                return;
            }
        }
        if (player.queue.size === 0) {
            return message.channel.send("|❌| **Kuyruk boş.**");
        }
        const success = player.setQueueRepeat(!player.queueRepeat);
        return message.channel.send(`|${success.queueRepeat ? "✅" : "❌"}| **Kuyruk tekrarı ${success.queueRepeat ? "açıldı" : "kapatıldı"}.**`);
    }
};
//# sourceMappingURL=loopqueque.js.map