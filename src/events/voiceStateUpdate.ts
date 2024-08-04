import { KhaxyClient } from "../../@types/types";
import {VoiceState} from "discord.js";
import {useQueue} from "discord-player";

export default async (client: KhaxyClient, oldState: VoiceState, newState: VoiceState) => {
    if(oldState.channelId === newState.channelId) return;
    if(oldState.channelId !== null) {
        if(oldState.channel?.members.find(user => user.id === client.user!.id) && oldState.channel?.members.size === 1) {
            const player = useQueue(oldState.guild.id);
            if(player) {
                const textChannel = player.channel
                if(textChannel) {
                    await textChannel.send(client.handleLanguages("NO_ONE_IN_VOICE", client, oldState.guild.id))
                }
                player.node.stop();
            }
        }
        if(newState.channelId === null && oldState.member?.id === client.user!.id) {
            const player = useQueue(oldState.guild.id);
            if(player) {
                const textChannel = player.channel
                if(textChannel) {
                    await textChannel.send(client.handleLanguages("KICKED_FROM_VOICE", client, oldState.guild.id))
                }
                player.node.stop();
            }
        }
    }
}