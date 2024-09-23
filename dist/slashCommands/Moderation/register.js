import { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } from "discord.js";
import { handleErrors, replaceMassString, sleep } from "../../utils/utils.js";
export default {
  help: {
    name: "kayıt",
    description: "Kayıt işlemini yapar.",
    usage: "kayıt <kullanıcı> <cinsiyet>",
    examples: ["kayıt @Khaxy üye", "kayıt @Khaxy erkek", "kayıt @Khaxy kadın"],
    category: "Moderasyon",
  },
  data: new SlashCommandBuilder()
    .setName("register")
    .setNameLocalizations({
      tr: "kayıt",
    })
    .setDescription("Manages the register process")
    .setDescriptionLocalizations({
      tr: "Kayıt işlemeni yapar",
    })
    .setDMPermission(false)
    .addUserOption((option) =>
      option
        .setName("user")
        .setNameLocalizations({
          tr: "kullanıcı",
        })
        .setDescription("Choose the user to register")
        .setDescriptionLocalizations({
          tr: "Kayıt edilecek kullanıcıyı seçin",
        })
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("gender")
        .setNameLocalizations({
          tr: "cinsiyet",
        })
        .setDescription("The gender of the member to register")
        .setDescriptionLocalizations({
          tr: "Kayıt edilecek üyenin cinsiyeti cinsi",
        })
        .setRequired(true)
        .addChoices(
          {
            name: "Male 👨",
            value: "male",
          },
          {
            name: "Woman 👩",
            value: "woman",
          },
          {
            name: "None 👤",
            value: "none",
          },
        ),
    ),
  execute: async ({ interaction, client }) => {
    const guildConfig = client.guildsConfig.get(interaction.guild.id);
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setColor("Red")
        .setDescription(client.handleLanguages("REGISTER_NOT_ENOUGH_PERMS", client, interaction.guild.id));
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }
    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      await interaction.reply({
        content: client.handleLanguages("REGISTER_NOT_ENOUGH_BOT_PERMS", client, interaction.guildId),
        ephemeral: true,
      });
      return;
    }
    const user = interaction.options.getUser("user");
    const targetMember = interaction.guild.members.cache.get(user.id);
    const gender = interaction.options.getString("gender", true);
    if (!guildConfig.config) {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setColor("Red")
        .setDescription(client.handleLanguages("REGISTER_NO_CONFIG", client, interaction.guildId));
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    } else if (!guildConfig.config.registerChannel) {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setColor("Red")
        .setDescription(client.handleLanguages("REGISTER_NO_REGISTER_CHANNEL", client, interaction.guildId));
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    } else if (guildConfig.config.registerChannel !== interaction.channel.id) {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setColor("Red")
        .setDescription(client.handleLanguages("REGISTER_NOT_THE_REGISTER_CHANNEL", client, interaction.guildId));
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    } else if (targetMember.user.id === interaction.user.id) {
      await interaction.reply({
        content: client.handleLanguages("REGISTER_CANT_REGISTER_YOURSELF", client, interaction.guildId),
        ephemeral: true,
      });
      return;
    }
    if (gender === "male") {
      if (!interaction.guild.roles.cache.get(guildConfig.config.maleRole)) {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setColor("Red")
          .setDescription(client.handleLanguages("REGISTER_NO_MALE_ROLE", client, interaction.guildId));
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      } else if (!interaction.guild.roles.cache.get(guildConfig.config.memberRole)) {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setColor("Red")
          .setDescription(client.handleLanguages("REGISTER_NO_MEMBER_ROLE", client, interaction.guildId));
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }
      try {
        await targetMember.roles.add(guildConfig.config.maleRole);
        await targetMember.roles.add(guildConfig.config.memberRole);
      } catch (e) {
        await handleErrors(client, e, "register.ts", interaction);
      }
    } else if (gender === "woman") {
      if (!interaction.guild.roles.cache.get(guildConfig.config.femaleRole)) {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setColor("Red")
          .setDescription(client.handleLanguages("REGISTER_NO_WOMAN_ROLE", client, interaction.guildId));
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      } else if (!interaction.guild.roles.cache.get(guildConfig.config.memberRole)) {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setColor("Red")
          .setDescription(client.handleLanguages("REGISTER_NO_MEMBER_ROLE", client, interaction.guildId));
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }
      try {
        await targetMember.roles.add(guildConfig.config.femaleRole);
        await targetMember.roles.add(guildConfig.config.memberRole);
      } catch (e) {
        await handleErrors(client, e, "register.ts", interaction);
      }
    } else if (gender === "none") {
      if (!interaction.guild.roles.cache.get(guildConfig.config.memberRole)) {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setColor("Red")
          .setDescription(client.handleLanguages("REGISTER_NO_MEMBER_ROLE", client, interaction.guildId));
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }
      try {
        await targetMember.roles.add(guildConfig.config.memberRole);
      } catch (e) {
        await handleErrors(client, e, "register.ts", interaction);
      }
    }
    await interaction.reply({
      content: replaceMassString(
        JSON.parse(JSON.stringify(client.handleLanguages("REGISTER_SUCCESS", client, interaction.guildId))),
        {
          "{targetMember}": targetMember.toString(),
        },
      ),
      ephemeral: true,
    });
    await sleep(1000);
    if (guildConfig.config.registerChannelClear) {
      if (!interaction.inCachedGuild()) return;
      const msgs = await interaction.channel.messages.fetch();
      await interaction.channel.bulkDelete(msgs.filter((m) => !m.pinned));
    }
    if (guildConfig.config.registerMessageClear) {
      const welcomeChannel = interaction.guild.channels.cache.get(guildConfig.config.registerWelcomeChannel);
      const wmsgs = await welcomeChannel.messages.fetch({ cache: true });
      await welcomeChannel.messages.delete(wmsgs.find((m) => m.mentions.members?.first()?.id === targetMember.id));
    }
  },
};
//# sourceMappingURL=register.js.map
