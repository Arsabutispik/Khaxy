import { slashCommandBase } from "../../../@types/types";
import { GuildMember, SlashCommandBuilder, PermissionsBitField } from "discord.js";
import punishmentSchema from "../../schemas/punishmentSchema.js";
import { replaceMassString } from "../../utils/utils.js";
export default {
  help: {
    name: "unmute",
    description: "Bir kullanıcının susturulmasını kaldırır",
    usage: "unmute <kullanıcı>",
    examples: ["unmute @Khaxy"],
    category: "Moderasyon",
  },
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Unmutes a member")
    .setDescriptionLocalizations({
      tr: "Bir kullanıcının susturulmasını kaldırır",
    })
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles)
    .setDMPermission(false)
    .addUserOption((option) =>
      option
        .setName("member")
        .setNameLocalizations({
          tr: "kullanıcı",
        })
        .setDescription("The member to unmute")
        .setDescriptionLocalizations({
          tr: "Susturulacak kullanıcı",
        })
        .setRequired(true),
    ),
  execute: async ({ interaction, client }) => {
    if (!interaction.guild!.members.me!.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      await interaction.reply({
        content: client.handleLanguages("UNMUTE_APP_NOT_ENOUGH_PERMISSIONS", client, interaction.guildId!),
        ephemeral: true,
      });
      return;
    }
    const user = interaction.options.getUser("member");
    const guildConfig = client.guildsConfig.get(interaction.guild!.id)!;
    const member = interaction.guild!.members.cache.get(user!.id)!;
    if (!(interaction.member as GuildMember).permissions.has(PermissionsBitField.Flags.ManageRoles))
      return interaction.reply({
        content: client.handleLanguages("UNMUTE_USER_NOT_ENOUGH_PERMISSIONS", client, interaction.guildId!),
        ephemeral: true,
      });
    const data = await punishmentSchema.findOne({
      guildID: interaction.guild!.id,
      userID: member.id,
      type: "mute",
    });
    if (!data)
      return interaction.reply({
        content: client.handleLanguages("UNMUTE_NOT_MUTED", client, interaction.guildId!),
        ephemeral: true,
      });
    await member.roles.remove(guildConfig.config.muteRole);
    if (client.guildsConfig.get(interaction.guild!.id)!.config.muteGetAllRoles) {
      if (!data.previousRoles)
        return interaction.reply({
          content: client.handleLanguages("UNMUTE_NO_PREVIOUS_ROLES", client, interaction.guildId!),
          ephemeral: true,
        });
      for (const role of data.previousRoles) {
        if (!member.guild.roles.cache.get(role)) data.previousRoles?.splice(data.previousRoles?.indexOf(role), 1);
      }
      await member.roles.add(data.previousRoles!);
    }
    await interaction.reply({
      content: replaceMassString(
        JSON.parse(JSON.stringify(client.handleLanguages("UNMUTE_SUCESS", client, interaction.guildId!))),
        {
          "{user_username}": member.user.username,
        },
      )!,
      ephemeral: true,
    });
    await punishmentSchema.deleteOne({
      guildID: interaction.guild!.id,
      userId: member.id,
      type: "mute",
    });
  },
} as slashCommandBase;
