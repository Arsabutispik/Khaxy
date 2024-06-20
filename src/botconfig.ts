export default {
    IconURL: "https://cdn.discordapp.com/attachments/933095626844037224/1016257179872923708/music-disc.gif",
    Lavalink: {
        id: "Main", //- Used for identifier. You can set this to whatever you want.
        host: "lavalink.devamop.in", //- The host name or IP of the lavalink server.
        port: 443, // The port that lavalink is listening to. This must be a number!
        pass: "DevamOP", //- The password of the lavalink server.
        secure: true, // Set this to true if the lavalink uses SSL. if not set it to false.
        retryAmount: 50, //- The amount of times to retry connecting to the node if connection got dropped.
        retryDelay: 40, //- Delay between reconnect attempts if connection is lost.
    },
    Spotify: {
        clientID: "73955b6660ef46798fc0881b036f0623", //- Your spotify client id.
        clientSecret: "8443f5c681aa43b39cb30881a2cd6275", //- Your spotify client secret.
    }
}