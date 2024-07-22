import {DMChannel, NonThreadGuildBasedChannel} from "discord.js";
import {KhaxyClient} from "../../types";
import openMailsSchema from "../schemas/openMailsSchema.js";

export default async (_client: KhaxyClient, channel: DMChannel | NonThreadGuildBasedChannel) => {
    const data = await openMailsSchema.findOne({
        channelID: channel.id
    });
    if(data) {
        await openMailsSchema.findOneAndDelete({
            channelID: channel.id
        });
    }
}