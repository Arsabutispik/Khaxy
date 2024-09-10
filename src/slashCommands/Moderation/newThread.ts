import { slashCommandBase } from "../../../@types/types";
import { ChannelType, GuildMember, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { handleErrors, replaceMassString } from "../../utils/utils.js";
import humanizeDuration from "humanize-duration";
import _ from "lodash";
import openMailsSchema from "../../schemas/openMailsSchema.js";

export default {
  data: new SlashCommandBuilder()
    .setName("newthread")
    .setNameLocalizations({
      tr: "yenithread",
    })
    .setDescription("Create a new mod mail thread")
    .setDescriptionLocalizations({
      tr: "Yeni bir mod mail kanalı oluşturur",
    })
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
    .addUserOption((option) =>
      option
        .setName("user")
        .setNameLocalizations({
          tr: "kullanıcı",
        })
        .setDescription("The user to create a thread for")
        .setDescriptionLocalizations({
          tr: "Kanal oluşturulacak kullanıcı",
        })
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setNameLocalizations({
          tr: "mesaj",
        })
        .setDescription("The message to send to the user")
        .setDescriptionLocalizations({
          tr: "Kullanıcıya gönderilecek mesaj",
        })
        .setRequired(true),
    ),
  execute: async ({ interaction, client }) => {
    const user = interaction.options.getUser("user", true);
    if (user.bot)
      return interaction.reply({
        content: client.handleLanguages("NEWTHREAD_BOT_USER", client, interaction.guildId!),
        ephemeral: true,
      });
    if (user.id === interaction.user.id)
      return interaction.reply({
        content: client.handleLanguages("NEWTHREAD_SAME_USER", client, interaction.guildId!),
        ephemeral: true,
      });
    if (await openMailsSchema.exists({ userID: user.id }))
      return interaction.reply({
        content: client.handleLanguages("NEWTHREAD_ALREADY_OPEN", client, interaction.guildId!),
        ephemeral: true,
      });
    const message = interaction.options.getString("message", true);
    try {
      const member = await interaction.guild!.members.fetch(user.id);
      const data = client.guildsConfig.get(interaction.guild!.id);
      if (!data)
        return interaction.reply(client.handleLanguages("SERVER_HAS_NO_CONFIGURATION", client, interaction.guild!.id));
      const category = interaction.guild!.channels.cache.get(data.config.modmail.category);
      if (!category)
        return interaction.reply({
          content: client.handleLanguages("NEWTHREAD_NO_CATEGORY", client, interaction.guild!.id),
          ephemeral: true,
        });
      const threadChannel = await interaction.guild!.channels.create({
        name: Math.random().toString(36).slice(2),
        parent: category.id,
        type: ChannelType.GuildText,
        topic: `Modmail thread created by ${interaction.user.username} for ${user.username}`,
        permissionOverwrites: [
          {
            id: interaction.guild!.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          ...data.config.staffRole.map((role) => ({
            id: role,
            allow: [PermissionsBitField.Flags.ViewChannel],
          })),
        ],
      });
      const messages = [];
      const lang = data.config.language;
      const botThreadMessage = await threadChannel.send(
        replaceMassString(client.handleLanguages("MOD_MAIL_THREAD_CREATED", client, interaction.guildId!), {
          "{accountAge}": humanizeDuration(Date.now() - user.createdTimestamp, {
            largest: 2,
            round: true,
            language: lang,
            fallbacks: ["en"],
          }),
          "{id}": user.id,
          "{username}": user.username,
          "{userMention}": user.toString(),
          "{joinDate}": humanizeDuration(Date.now() - member.joinedTimestamp!, {
            largest: 2,
            round: true,
            language: lang,
            fallbacks: ["en"],
          }),
        })!,
      );
      await interaction.reply({
        content: client.handleLanguages("NEWTHREAD_SUCCESS", client, interaction.guildId!),
        ephemeral: true,
      });
      messages.push(
        `[${new Date().toLocaleString([lang, "en-US"], { timeZone: "UTC" })}] [BOT] ${botThreadMessage.content}`,
      );
      messages.push(
        `[${new Date().toLocaleString([lang, "en-US"], { timeZone: "UTC" })}] [TO USER] [${interaction.user.username}] (${_.startCase(_.capitalize((interaction.member as GuildMember).roles.highest.name))}) ${interaction.user.username}: ${message}`,
      );
      await threadChannel.send(
        `**(${_.startCase(_.capitalize((interaction.member as GuildMember).roles.highest.name))}) ${interaction.user.username}:** ${message}`,
      );
      await openMailsSchema.create({
        guildID: interaction.guild!.id,
        channelID: threadChannel.id,
        userID: user.id,
        messages: {
          $push: {
            $each: messages,
          },
        },
        messageCount: {
          modMessageCount: 1,
          userMessageCount: 0,
          internalMessageCount: 0,
        },
        threadNumber: data.config.modmail.tickets,
      });
    } catch (error) {
      await handleErrors(client, error, "newThread.ts", interaction);
    }
  },
} as slashCommandBase;
