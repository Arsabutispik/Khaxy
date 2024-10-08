import { slashCommandBase } from "../../../@types/types";
import {
  GuildMember,
  MessageComponentInteraction,
  PermissionsBitField,
  SlashCommandBuilder,
  ComponentType,
} from "discord.js";
import { replaceMassString } from "../../utils/utils.js";
import registerConfig from "../../configFunctions/registerConfig.js";
import welcomeConfig from "../../configFunctions/welcomeConfig.js";
import moderationConfig from "../../configFunctions/moderationConfig.js";
import roleConfig from "../../configFunctions/roleConfig.js";
import miscConfig from "../../configFunctions/miscConfig.js";
export default {
  help: {
    name: "config",
    description: "Sunucu için gerekli ayarları değiştirmeye yarar.",
    usage: "config [ayar]",
    examples: ["config", "config register", "config moderation"],
    category: "Moderasyon",
  },
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Change the necessary settings for the server.")
    .setDescriptionLocalizations({
      tr: "Sunucu için gerekli ayarları değiştirmeye yarar.",
    })
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .setDMPermission(false)
    .addStringOption((option) => {
      return option
        .setName("setting")
        .setNameLocalizations({
          tr: "ayar",
        })
        .setDescription("Setting to be changed.")
        .setDescriptionLocalizations({
          tr: "Değiştirilecek ayar.",
        })
        .setRequired(false)
        .addChoices(
          {
            name: "Register Settings",
            value: "register",
          },
          {
            name: "Welcome-Leave Settings",
            value: "welcome-leave",
          },
          {
            name: "Moderation Settings",
            value: "moderation",
          },
          {
            name: "Role Settings",
            value: "role",
          },
          {
            name: "Miscellanous Settings",
            value: "misc",
          },
        );
    }),
  execute: async ({ interaction, client }) => {
    const guildConfig = client.guildsConfig.get(interaction.guild!.id)!;
    const setting = interaction.options.getString("setting") as
      | "register"
      | "welcome-leave"
      | "moderation"
      | "role"
      | "misc"
      | undefined;
    const language = {
      tr: "🇹🇷 Türkçe",
      "en-US": "🇺🇸 English",
    };
    if (!(interaction.member as GuildMember).permissions.has(PermissionsBitField.Flags.Administrator))
      return interaction.reply({
        content: client.handleLanguages("CONFIG_NO_PERMS", client, interaction.guild!.id),
        ephemeral: true,
      });
    if (!setting) {
      await interaction.reply(client.handleLanguages("CONFIG_MESSAGE", client, interaction.guild!.id));
      const msg = await interaction.fetchReply();
      const filter = (i: MessageComponentInteraction) => i.customId === "config" && i.user.id === interaction.user.id;
      const collector = msg.createMessageComponentCollector({
        filter,
        componentType: ComponentType.StringSelect,
        time: 60000,
      });
      collector.on("collect", async (i) => {
        const setting = i.values[0] as "register" | "welcome-leave" | "moderation" | "role" | "misc";
        if (setting === "register") {
          const registerMessage = JSON.parse(
            JSON.stringify(client.handleLanguages("CONFIG_REGISTER_MESSAGE", client, interaction.guildId!)),
          );
          for (const embeds of registerMessage.embeds) {
            const x = Math.round(0xffffff * Math.random()).toString(16);
            const y = 6 - x.length;
            const z = "000000";
            const z1 = z.substring(0, y);
            embeds.color = Number(`0x${z1 + x}`);
            for (const values of embeds.fields) {
              values.value = replaceMassString(values.value, {
                "{registerChannel}": guildConfig.config.registerChannel
                  ? `<#${guildConfig.config.registerChannel}>`
                  : "N/A",
                "{registerMessage}": guildConfig.config.registerMessage
                  ? client.allEmojis.get(client.config.Emojis.confirm)!.format
                  : client.allEmojis.get(client.config.Emojis.reject)!.format,
                "{registerWelcomeChannel}": guildConfig.config.registerWelcomeChannel
                  ? `<#${guildConfig.config.registerWelcomeChannel}>`
                  : "N/A",
                "{registerChannelClear}": guildConfig.config.registerChannelClear
                  ? client.allEmojis.get(client.config.Emojis.confirm)!.format
                  : client.allEmojis.get(client.config.Emojis.reject)!.format,
                "{registerMessageClear}": guildConfig.config.registerMessageClear
                  ? client.allEmojis.get(client.config.Emojis.confirm)!.format
                  : client.allEmojis.get(client.config.Emojis.reject)!.format,
              })!;
              Object.assign(embeds.fields, values);
            }
          }
          await i.update(registerMessage);
        } else if (setting === "welcome-leave") {
          const welcomeLeaveMessage = JSON.parse(
            JSON.stringify(client.handleLanguages("CONFIG_WELCOME_LEAVE_MESSAGE", client, interaction.guildId!)),
          );
          for (const embeds of welcomeLeaveMessage.embeds) {
            const x = Math.round(0xffffff * Math.random()).toString(16);
            const y = 6 - x.length;
            const z = "000000";
            const z1 = z.substring(0, y);
            embeds.color = Number(`0x${z1 + x}`);
            for (const values of embeds.fields) {
              values.value = replaceMassString(values.value, {
                "{welcomeMessage}": guildConfig.config.welcomeMessage
                  ? client.allEmojis.get(client.config.Emojis.confirm)!.format
                  : client.allEmojis.get(client.config.Emojis.reject)!.format,
                "{welcomeChannel}": guildConfig.config.welcomeChannel
                  ? `<#${guildConfig.config.welcomeChannel}>`
                  : "N/A",
                "{leaveMessage}": guildConfig.config.leaveMessage
                  ? client.allEmojis.get(client.config.Emojis.confirm)!.format
                  : client.allEmojis.get(client.config.Emojis.reject)!.format,
                "{leaveChannel}": guildConfig.config.leaveChannel ? `<#${guildConfig.config.leaveChannel}>` : "N/A",
              })!;
              Object.assign(embeds.fields, values);
            }
          }
          await i.update(welcomeLeaveMessage);
        } else if (setting === "moderation") {
          const moderationMessage = JSON.parse(
            JSON.stringify(client.handleLanguages("CONFIG_MODERATION_MESSAGE", client, interaction.guildId!)),
          );
          for (const embeds of moderationMessage.embeds) {
            const x = Math.round(0xffffff * Math.random()).toString(16);
            const y = 6 - x.length;
            const z = "000000";
            const z1 = z.substring(0, y);
            embeds.color = Number(`0x${z1 + x}`);
            for (const values of embeds.fields) {
              values.value = replaceMassString(values.value, {
                "{modlogChannel}": guildConfig.config.modlogChannel ? `<#${guildConfig.config.modlogChannel}>` : "N/A",
                "{muteGetAllRoles}": guildConfig.config.muteGetAllRoles
                  ? client.allEmojis.get(client.config.Emojis.confirm)!.format
                  : client.allEmojis.get(client.config.Emojis.reject)!.format,
                "{staffRole}":
                  guildConfig.config.staffRole.length > 0
                    ? guildConfig.config.staffRole.map((x) => `<@&${x}>`).join(", ")
                    : "N/A",
                "{modmailChannel}": guildConfig.config.modmail.logChannel
                  ? `<#${guildConfig.config.modmail.logChannel}>`
                  : "N/A",
                "{language}": language[guildConfig.config.language],
                "{registerDayLimit}": guildConfig.config.daysToKick.toString(),
              })!;
              Object.assign(embeds.fields, values);
            }
          }
          await i.update(moderationMessage);
        } else if (setting === "role") {
          const roleMessage = JSON.parse(
            JSON.stringify(client.handleLanguages("CONFIG_ROLE_MESSAGE", client, interaction.guildId!)),
          );
          for (const embeds of roleMessage.embeds) {
            const x = Math.round(0xffffff * Math.random()).toString(16);
            const y = 6 - x.length;
            const z = "000000";
            const z1 = z.substring(0, y);
            embeds.color = Number(`0x${z1 + x}`);
            for (const values of embeds.fields) {
              values.value = replaceMassString(values.value, {
                "{registerRoles}": `👩: ${guildConfig.config.femaleRole ? `<@&${guildConfig.config.femaleRole}>` : "N/A"}\n👨: ${guildConfig.config.maleRole ? `<@&${guildConfig.config.maleRole}>` : "N/A"}`,
                "{memberRole}": guildConfig.config.memberRole ? `<@&${guildConfig.config.memberRole}>` : "N/A",
                "{muteRole}": guildConfig.config.muteRole ? `<@&${guildConfig.config.muteRole}>` : "N/A",
                "{colorOfTheDay}": guildConfig.config.roleOfTheDay ? `<@&${guildConfig.config.roleOfTheDay}>` : "N/A",
                "{djRole}": guildConfig.config.djRole ? `<@&${guildConfig.config.djRole}>` : "N/A",
              })!;
              Object.assign(embeds.fields, values);
            }
          }
          await i.update(roleMessage);
        } else if (setting === "misc") {
          const miscMessage = JSON.parse(
            JSON.stringify(client.handleLanguages("CONFIG_MISC_MESSAGE", client, interaction.guildId!)),
          );
          for (const embeds of miscMessage.embeds) {
            const x = Math.round(0xffffff * Math.random()).toString(16);
            const y = 6 - x.length;
            const z = "000000";
            const z1 = z.substring(0, y);
            embeds.color = Number(`0x${z1 + x}`);
            for (const values of embeds.fields) {
              values.value = replaceMassString(values.value, {
                "{bumpLeaderboard}": guildConfig.config.bumpLeaderboardChannel
                  ? `<#${guildConfig.config.bumpLeaderboardChannel}>`
                  : "N/A",
                "{modMailMessage}": guildConfig.config.modmail.newThreadMessage
                  ? client.allEmojis.get(client.config.Emojis.confirm)!.format
                  : client.allEmojis.get(client.config.Emojis.reject)!.format,
              })!;
              Object.assign(embeds.fields, values);
            }
          }
          await i.update(miscMessage);
        }
      });
      return;
    }
    switch (setting) {
      case "register":
        await registerConfig(interaction, client);
        break;
      case "welcome-leave":
        await welcomeConfig(interaction, client);
        break;
      case "moderation":
        await moderationConfig(interaction, client);
        break;
      case "role":
        await roleConfig(interaction, client);
        break;
      case "misc":
        await miscConfig(interaction, client);
    }
  },
} as slashCommandBase;
