import {HolyClient} from "../types";
import {ChannelType, Interaction, EmbedBuilder, TextChannel} from "discord.js";
import guildConfig from "../schemas/guildSchema.js";
import {log, percentageChance} from "../utils/utils.js";

export default async (client: HolyClient, interaction: Interaction) => {
    if(interaction.isChatInputCommand()) {
        if(interaction.channel!.type ===  ChannelType.DM) return interaction.reply({content: "Slash command unavailable in DMs!", ephemeral: true});
        if(!(interaction.channel as TextChannel)!.permissionsFor(interaction.guild!.members.me!)!.has("SendMessages")){
            return interaction.reply(client.handleLanguages("NO_SEND_MESSAGE_PERMS", client, interaction.guild!.id));
        }
        if(client.guildsConfig.get(interaction.guild!.id) === undefined) {
            const data = await guildConfig.findOne({guildID: interaction.guild!.id});
            if(!data) {
                const newData = await guildConfig.findOneAndUpdate({guildID: interaction.guild!.id}, {}, {upsert: true, new: true, setDefaultsOnInsert: true});
                client.guildsConfig.set(interaction.guild!.id, newData.toObject());
            } else {
                client.guildsConfig.set(interaction.guild!.id, data.toObject());
            }
        }
        const cmd = client.slashCommands.get(interaction.commandName);
        if(!cmd) return;
        const sendMessage = percentageChance(["true", "false"], [1, 99]);
        if(sendMessage === "true") {
            const embed = new EmbedBuilder()
                .setColor("Random")
                .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
                .setDescription(`${client.handleLanguages("HAPPY_TO_USE", client, interaction.guild!.id)}`)
                .setTimestamp()
                interaction.channel!.send({embeds: [embed]});

        }
        try {
            await cmd.execute({client, interaction});
            log("SUCCESS", "Slash Command", `${interaction.user.tag} (${interaction.user.id}) executed ${interaction.commandName} in ${interaction.guild!.name} (${interaction.guild!.id})`)
        } catch (e) {
            log("ERROR", "unknwn", `${interaction.commandName} returned an error: ${e}`)
            console.error(e)
            if(!interaction.replied){
                await interaction.reply({content: client.handleLanguages("ERROR_ON_INTERACTION", client, interaction.guild!.id), ephemeral: true});
            } else {
                await interaction.followUp({content: client.handleLanguages("ERROR_ON_INTERACTION", client, interaction.guild!.id), ephemeral: true});
            }
        }
    }
}