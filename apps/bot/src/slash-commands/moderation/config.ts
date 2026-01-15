import type { SlashCommandBase } from "@types";
import {
  MessageFlagsBitField,
  PermissionsBitField,
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
  EmbedBuilder,
  InteractionContextType,
} from "discord.js";
import {
  logConfig,
  miscConfig,
  moderationConfig,
  registerConfig,
  roleConfig,
  welcomeLeaveConfig,
} from "../../config-functions/index.js";
import { localeFlags } from "@constants";

export default {
  memberPermissions: [PermissionsBitField.Flags.Administrator],
  data: new SlashCommandBuilder()
    .setName("config")
    .setNameLocalizations({ tr: "ayarlar" })
    .setDescription("Configure your server's settings.")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .setContexts(InteractionContextType.Guild)
    .addStringOption((option) =>
      option
        .setName("setting")
        .setDescription("The setting category you want to configure.")
        .setRequired(false)
        .addChoices(
          { name: "Register", value: "register" },
          { name: "Welcome-Leave", value: "welcomeLeave" },
          { name: "Moderation", value: "moderation" },
          { name: "Role", value: "role" },
          { name: "Misc", value: "misc" },
          { name: "Log", value: "log" },
        ),
    ),
  async execute(interaction, guildConfig) {
    const { client } = interaction;

    if (!guildConfig) {
      return interaction.reply({
        content: "This server is not registered in the database.",
        flags: MessageFlagsBitField.Flags.Ephemeral,
      });
    }

    const t = client.i18next.getFixedT(guildConfig.language, "commands", "config");
    const settingOption = interaction.options.getString("setting") as
      | "register"
      | "welcomeLeave"
      | "moderation"
      | "role"
      | "misc"
      | "log"
      | null;

    // Direct routing if an option was selected in the Slash Command
    if (settingOption) {
      switch (settingOption) {
        case "role":
          return await roleConfig(interaction, guildConfig);
        case "register":
          return await registerConfig(interaction, guildConfig);
        case "welcomeLeave":
          return await welcomeLeaveConfig(interaction, guildConfig);
        case "moderation":
          return await moderationConfig(interaction, guildConfig);
        case "misc":
          return await miscConfig(interaction, guildConfig);
        case "log":
          return await logConfig(interaction, guildConfig);
      }
    }

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("configSelector")
      .setOptions(
        { label: t(($) => $.selectMenu.moderation), value: "moderation", emoji: "⚖️" },
        { label: t(($) => $.selectMenu.register), value: "register", emoji: "📝" },
        { label: t(($) => $.selectMenu.welcomeLeave), value: "welcomeLeave", emoji: "👋" },
        { label: t(($) => $.selectMenu.role), value: "role", emoji: "🔒" },
        { label: t(($) => $.selectMenu.misc), value: "misc", emoji: "🔧" },
        { label: t(($) => $.selectMenu.log), value: "log", emoji: "📜" },
      );

    const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    const response = await interaction.reply({
      content: t(($) => $.noSetting),
      flags: MessageFlagsBitField.Flags.Ephemeral,
      withResponse: true,
      components: [actionRow],
    });

    const collector = response.resource?.message?.createMessageComponentCollector({
      filter: (i) => i.customId === "configSelector" && i.user.id === interaction.user.id,
      componentType: ComponentType.StringSelect,
      time: 300_000,
    });

    collector?.on("collect", async (i) => {
      const selected = i.values[0];
      const embed = new EmbedBuilder().setColor("Random");
      const docsUrl = process.env.DOCS_URL || "https://docs.khaxy.net";
      const check = (val: any) =>
        val
          ? client.allEmojis.get(client.config.emojis.confirm.id)!.format
          : client.allEmojis.get(client.config.emojis.reject.id)!.format;

      // Update UI state
      selectMenu.setOptions(
        selectMenu.options.map((opt) => {
          opt.setDefault(opt.data.value === selected);
          return opt;
        }),
      );

      if (selected === "register") {
        embed
          .setTitle(t(($) => $.embed.register.title))
          .setURL(`${docsUrl}/${guildConfig.language.split("-")[0]}/configuration/register-settings`)
          .addFields(
            {
              name: t(($) => $.embed.register.fields.registerJoinChannel),
              value: guildConfig.registerJoinChannelId ? `<#${guildConfig.registerJoinChannelId}>` : t(($) => $.none),
              inline: true,
            },
            {
              name: t(($) => $.embed.register.fields.registerChannel),
              value: guildConfig.registerChannelId ? `<#${guildConfig.registerChannelId}>` : t(($) => $.none),
              inline: true,
            },
            {
              name: t(($) => $.embed.register.fields.registerJoinMessage),
              value: check(guildConfig.registerJoinMessage),
              inline: true,
            },
            {
              name: t(($) => $.embed.register.fields.registerChannelClear),
              value: check(guildConfig.registerChannelClear),
              inline: true,
            },
          );
      } else if (selected === "welcomeLeave") {
        embed.setTitle(t(($) => $.embed.welcomeLeave.title)).addFields(
          {
            name: t(($) => $.embed.welcomeLeave.fields.welcomeChannel),
            value: guildConfig.joinChannelId ? `<#${guildConfig.joinChannelId}>` : t(($) => $.none),
            inline: true,
          },
          {
            name: t(($) => $.embed.welcomeLeave.fields.welcomeMessage),
            value: check(guildConfig.joinMessage),
            inline: true,
          },
          {
            name: t(($) => $.embed.welcomeLeave.fields.leaveChannel),
            value: guildConfig.leaveChannelId ? `<#${guildConfig.leaveChannelId}>` : t(($) => $.none),
            inline: true,
          },
          { name: t(($) => $.embed.welcomeLeave.fields.leaveMessage), value: check(guildConfig.leaveMessage), inline: true },
        );
      } else if (selected === "moderation") {
        embed.setTitle(t(($) => $.embed.moderation.title)).addFields(
          {
            name: t(($) => $.embed.moderation.fields.modLogChannel),
            value: guildConfig.logConfig?.modLogsChannelId ? `<#${guildConfig.logConfig.modLogsChannelId}>` : t(($) => $.none),
            inline: true,
          },
          {
            name: t(($) => $.embed.moderation.fields.staffRole),
            value: guildConfig.staffRoleId ? `<@&${guildConfig.staffRoleId}>` : t(($) => $.none),
            inline: true,
          },
          {
            name: t(($) => $.embed.moderation.fields.muteGetAllRoles),
            value: check(guildConfig.muteGetAllRoles),
            inline: true,
          },
          {
            name: t(($) => $.embed.moderation.fields.registerDayLimit),
            value: guildConfig.daysToKick.toString(),
            inline: true,
          },
        );
      } else if (selected === "log") {
        embed.setTitle(t(($) => $.embed.log.title)).addFields(
          {
            name: t(($) => $.embed.log.fields.messageLogsChannel),
            value: guildConfig.logConfig?.messageLogsChannelId
              ? `<#${guildConfig.logConfig.messageLogsChannelId}>`
              : t(($) => $.none),
            inline: true,
          },
          {
            name: t(($) => $.embed.log.fields.guildLogsChannel),
            value: guildConfig.logConfig?.guildLogsChannelId
              ? `<#${guildConfig.logConfig.guildLogsChannelId}>`
              : t(($) => $.none),
            inline: true,
          },
        );
      } else if (selected === "misc") {
        embed.setTitle(t(($) => $.embed.misc.title)).addFields(
          {
            name: t(($) => $.embed.misc.fields.language),
            value: localeFlags[guildConfig.language] || guildConfig.language,
            inline: true,
          },
          { name: t(($) => $.embed.misc.fields.modMailMessage), value: check(guildConfig.modMailMessage), inline: true },
        );
      } else if (selected === "role") {
        embed.setTitle(t(($) => $.embed.role.title)).addFields({
          name: t(($) => $.embed.role.fields.colorOfTheDay),
          value: guildConfig.colourIdOfTheDay ? `<@&${guildConfig.colourIdOfTheDay}>` : t(($) => $.none),
          inline: true,
        });
      }

      await i.update({ embeds: [embed], components: [actionRow] });
    });

    collector?.on("end", () => {
      interaction.editReply({ components: [] }).catch(() => null);
    });
  },
} as SlashCommandBase;
