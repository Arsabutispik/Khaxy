import { ChannelType, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import openMailsSchema from "../../schemas/openMailsSchema.js";
export default {
  data: new SlashCommandBuilder()
    .setName("mail")
    .setNameLocalizations({
      tr: "mail",
    })
    .setDescription("Open a mail ticket")
    .setDescriptionLocalizations({
      tr: "Bir mail ticketı aç veya açtığın maile mesaj gönder",
    })
    .addStringOption((option) =>
      option
        .setName("message")
        .setNameLocalizations({
          tr: "mesaj",
        })
        .setDescription("The message you want to send")
        .setDescriptionLocalizations({
          tr: "Göndermek istediğiniz mesaj",
        })
        .setRequired(true),
    )
    .addAttachmentOption((option) =>
      option
        .setName("attachment")
        .setNameLocalizations({
          tr: "ek",
        })
        .setDescription("The attachment you want to send")
        .setDescriptionLocalizations({
          tr: "Göndermek istediğiniz ek",
        })
        .setRequired(false),
    )
    .setDMPermission(false),
  async execute({ interaction, client }) {
    const message = interaction.options.getString("message", true);
    const attachment = interaction.options.getAttachment("attachment");
    const data = client.guildsConfig.get(interaction.guild.id);
    if (!data)
      return interaction.reply(client.handleLanguages("SERVER_HAS_NO_CONFIGURATION", client, interaction.guildId));
    if (!data.config.modmail)
      return interaction.reply(client.handleLanguages("MAIL_CHANNEL_NOT_SET", client, interaction.guildId));
    if (client.userTickets.has(interaction.user.id)) {
      console.log(client.userTickets.get(interaction.user.id));
      const channel = interaction.guild.channels.cache.get(client.userTickets.get(interaction.user.id));
      const raw = client.handleLanguages("MAIL_FOLLOWUP_MESSAGE", client, interaction.guildId);
      raw.embeds[0].author.name = interaction.user.username;
      raw.embeds[0].author.icon_url = interaction.user.displayAvatarURL();
      raw.embeds[0].description = message;
      let x = Math.round(0xffffff * Math.random()).toString(16);
      let y = 6 - x.length;
      let z = "000000";
      let z1 = z.substring(0, y);
      raw.embeds[0].color = Number(`0x${z1 + x}`);
      await channel.send(raw);
      await interaction.reply(client.handleLanguages("MESSAGE_SENT", client, interaction.guildId));
      if (attachment) {
        await channel.send({
          content: client.handleLanguages("MAIL_SENT_ATTACHMENT", client, interaction.guildId),
          files: [attachment],
        });
      }
      client.ticketMessages.set(
        channel.id,
        client.ticketMessages.get(channel.id) +
          `\n\n${message}${attachment ? `\n\nAttachment: ${attachment.url}` : ""}`,
      );
      await openMailsSchema.findOneAndUpdate(
        {
          guildID: interaction.guild.id,
          channelID: channel.id,
        },
        {
          guildID: interaction.guild.id,
          channelID: channel.id,
          userID: interaction.user.id,
          messages: client.ticketMessages.get(channel.id),
        },
        {
          upsert: true,
        },
      );
    } else {
      const channel = await interaction.guild.channels.create({
        name: `ticket-${data.config.modmail.tickets}`,
        type: ChannelType.GuildText,
        parent: data.config.modmail.category,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
        ],
      });
      const config = {
        $inc: {
          "config.modmail.tickets": 1,
        },
      };
      await client.updateGuildConfig({
        guildId: interaction.guild.id,
        config,
      });
      await interaction.reply(client.handleLanguages("MAIL_OPENED", client, interaction.guildId));
      const raw = client.handleLanguages("MAIL_OPENED_MESSAGE", client, interaction.guildId);
      raw.embeds[0].author.name = interaction.user.username;
      raw.embeds[0].author.icon_url = interaction.user.displayAvatarURL();
      raw.embeds[0].description = message;
      raw.content = raw.content.replace("{user}", interaction.user.toString());
      let x = Math.round(0xffffff * Math.random()).toString(16);
      let y = 6 - x.length;
      let z = "000000";
      let z1 = z.substring(0, y);
      raw.embeds[0].color = Number(`0x${z1 + x}`);
      await channel.send(raw);
      if (attachment) {
        await channel.send({
          content: client.handleLanguages("MAIL_SENT_ATTACHMENT", client, interaction.guildId),
          files: [attachment],
        });
      }
      client.userTickets.set(interaction.user.id, channel.id);
      client.ticketMessages.set(
        channel.id,
        `[${new Date().toString()}] - ${interaction.user.username}(${interaction.user.id}): ${message} ${attachment ? `\n\nAttachment: ${attachment.url}` : ""}`,
      );
      await openMailsSchema.findOneAndUpdate(
        {
          guildID: interaction.guild.id,
        },
        {
          guildID: interaction.guild.id,
          channelID: channel.id,
          userID: interaction.user.id,
          messages: `[${new Date().toString()}] - ${interaction.user.username}(${interaction.user.id}): ${message} ${attachment ? `\n\nAttachment: ${attachment.url}` : ""}`,
        },
        {
          upsert: true,
        },
      );
    }
  },
};
//# sourceMappingURL=openmail.js.map
