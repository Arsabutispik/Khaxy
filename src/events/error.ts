import {KhaxyClient} from "../../types";
import {log} from "../utils/utils.js";
import {EmbedBuilder} from "discord.js";
export default async(client: KhaxyClient, error: Error) => {
    log("ERROR", "events/error.js", "Error is displayed below:");
    console.error(error);
    const owner = await client.users.fetch("903233069245419560")
    const errorEmbed = new EmbedBuilder()
        .setTitle(`HATA! ${error.name}`)
        .setDescription(error.message)
        .setColor("Red")
    owner?.send({embeds: [errorEmbed]})
}