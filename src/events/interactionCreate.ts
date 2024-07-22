import {KhaxyClient} from "../../types";
import {ChannelType, Interaction, EmbedBuilder, TextChannel, ModalSubmitInteraction} from "discord.js";
import guildConfig from "../schemas/guildSchema.js";
import {log, percentageChance} from "../utils/utils.js";
import openMailsSchema from "../schemas/openMailsSchema.js";

export default async (client: KhaxyClient, interaction: Interaction) => {
    if(interaction.isButton()){
        if (interaction.customId === "modMailReply") {
            const data = await openMailsSchema.findOne({
                guildID: interaction.guild!.id,
                channelID: interaction.channel!.id
            });
            if (!data) return interaction.reply({content: "This is not a modmail channel!", ephemeral: true});
            const user = interaction.guild!.members.cache.get(data.userID);
            if (!user) return interaction.reply({content: "User not found!", ephemeral: true});
            await interaction.showModal(client.handleLanguages("BUTTON_CLICK_MODAL", client, interaction.guildId!))
            const filter = (m: ModalSubmitInteraction) => m.user.id === interaction.user.id;
            try {
                const modalSubmit = await interaction.awaitModalSubmit({filter, time: 60000});
                const raw = client.handleLanguages("MAIL_FOLLOWUP_DM_MESSAGE", client, interaction.guildId!)
                raw.content = raw.content.replace("{server}", interaction.guild!.name)
                raw.embeds[0].author.name = interaction.user.username
                raw.embeds[0].author.icon_url = interaction.user.displayAvatarURL()
                raw.embeds[0].description = modalSubmit.fields.getTextInputValue("buttonClick")
                let x = Math.round(0xffffff * Math.random()).toString(16);
                let y = (6 - x.length);
                let z = "000000";
                let z1 = z.substring(0, y);
                raw.embeds[0].color = Number(`0x${z1 + x}`)
                await user.send(raw)
                await modalSubmit.reply(client.handleLanguages("MESSAGE_SENT", client, interaction.guildId!));
                const raw2 = client.handleLanguages("MESSAGE_SENT_INFORMATION", client, interaction.guildId!)
                raw2.content = raw2.content.replace("{user}", interaction.user.toString())
                raw2.embeds[0].author.name = interaction.user.username
                raw2.embeds[0].author.icon_url = interaction.user.displayAvatarURL()
                raw2.embeds[0].description = modalSubmit.fields.getTextInputValue("buttonClick")
                let x2 = Math.round(0xffffff * Math.random()).toString(16);
                let y2 = (6 - x2.length);
                let z2 = "000000";
                let z3 = z2.substring(0, y2);
                raw2.embeds[0].color = Number(`0x${z3 + x2}`)
                await modalSubmit.followUp(raw2)
                client.ticketMessages.set(interaction.channel!.id, client.ticketMessages.get(interaction.channel!.id) + `\n\n[${new Date().toString()}] - ${interaction.user.username}(${interaction.user.id}): ${modalSubmit.fields.getTextInputValue("buttonClick")}`);
                await openMailsSchema.findOneAndUpdate({
                    guildID: interaction.guild!.id,
                    channelID: interaction.channel!.id,
                }, {
                    guildID: interaction.guild!.id,
                    channelID: interaction.channel!.id,
                    userID: data.userID,
                    messages: client.ticketMessages.get(interaction.channel!.id)
                }, {
                    upsert: true
                });
            } catch (e) {
                return interaction.reply({content: "User didn't respond in time!", ephemeral: true});
            }
        } else if (interaction.customId === "modMailReplyDM") {
            const data = await openMailsSchema.findOne({
                userID: interaction.user.id,
            });
            if (!data) return interaction.reply({content: "You don't have an open modmail", ephemeral: true});
            const guild = client.guilds.cache.get(data.guildID);
            if (!guild) return interaction.reply({content: "Guild not found!", ephemeral: true});
            const channel = guild.channels.cache.get(data.channelID) as TextChannel;
            if (!channel) return interaction.reply({content: "Channel not found!", ephemeral: true});
            await interaction.showModal(client.handleLanguages("BUTTON_CLICK_MODAL", client, interaction.guildId!))
            const filter = (m: ModalSubmitInteraction) => m.user.id === interaction.user.id;
            try {
                const modalSubmit = await interaction.awaitModalSubmit({filter, time: 60000});
                const raw = client.handleLanguages("MAIL_FOLLOWUP_MESSAGE", client, interaction.guildId!)
                raw.content = raw.content.replace("{user}", interaction.user.toString())
                raw.embeds[0].author.name = interaction.user.username
                raw.embeds[0].author.icon_url = interaction.user.displayAvatarURL()
                raw.embeds[0].description = modalSubmit.fields.getTextInputValue("buttonClick")
                let x = Math.round(0xffffff * Math.random()).toString(16);
                let y = (6 - x.length);
                let z = "000000";
                let z1 = z.substring(0, y);
                raw.embeds[0].color = Number(`0x${z1 + x}`)
                await channel.send(raw)
                await modalSubmit.reply(client.handleLanguages("MESSAGE_SENT", client, interaction.guildId!));
                client.ticketMessages.set(channel.id, client.ticketMessages.get(channel.id) + `\n\n[${new Date().toString()}] - ${interaction.user.username}(${interaction.user.id}): ${modalSubmit.fields.getTextInputValue("buttonClick")}`);
                await openMailsSchema.findOneAndUpdate({
                    guildID: channel.guild.id,
                    channelID: channel.id,
                }, {
                    guildID: channel.guild.id,
                    channelID: channel.id,
                    userID: data.userID,
                    messages: client.ticketMessages.get(channel.id)
                }, {
                    upsert: true
                });
            } catch (e) {
                console.error(e)
                return interaction.followUp({content: "User didn't respond in time!", ephemeral: true});
            }
        }
    }
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