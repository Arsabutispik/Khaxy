import {
  ChannelType,
  ChatInputCommandInteraction,
  ComponentType,
  Message,
  MessageComponentInteraction,
  PermissionsBitField,
  RoleSelectMenuInteraction,
  SelectMenuInteraction,
  TextChannel,
} from "discord.js";
import { KhaxyClient } from "../../@types/types";
import { handleErrors } from "../utils/utils.js";

export default async function moderationConfig(interaction: ChatInputCommandInteraction, client: KhaxyClient) {
  await interaction.reply(client.handleLanguages("MODERATION_CONFIG_PROMPT", client, interaction.guildId!));
  const msg = (await interaction.fetchReply()) as Message;
  const filter = (i: SelectMenuInteraction) =>
    (i.customId === "moderationConfig" || i.customId === "muteGetAllRoles") && i.user.id === interaction.user.id;
  try {
    const collector = await msg.awaitMessageComponent({
      filter,
      componentType: ComponentType.SelectMenu,
      time: 60000,
    });
    if (collector.customId === "moderationConfig") {
      switch (collector.values[0]) {
        case "modLogChannel":
          await modLogChannel(collector, client);
          break;
        case "muteGetAllRoles":
          await muteGetAllRoles(collector, client);
          break;
        case "staffRoles":
          await staffRole(collector, client);
          break;
        case "modMail":
          await modMail(collector, client);
          break;
        case "language":
          await languageHandler(collector, client);
          break;
        case "daysForMembersToRegister":
          await daysForMembersToRegister(collector, client);
          break;
      }
    }
  } catch (error) {
    await handleErrors(client, error, "moderationConfig.ts", interaction);
  }
}

async function modLogChannel(interaction: SelectMenuInteraction, client: KhaxyClient) {
  const raw = client.handleLanguages("MODLOG_CHANNEL_PROMPT", client, interaction.guildId!);
  raw.components[0].components[0].default_values.shift();
  const modLogChannel = client.guildsConfig.get(interaction.guild!.id)?.config.modlogChannel;
  if (modLogChannel) {
    raw.components[0].components[0].default_values.push({
      id: modLogChannel,
      type: "channel",
    });
  }
  //@ts-ignore
  await interaction.reply(raw);
  const msg = (await interaction.fetchReply()) as Message;
  const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id;
  try {
    const collector = await msg.awaitMessageComponent({
      filter: filter,
      componentType: ComponentType.ChannelSelect,
      time: 60000,
    });
    if (collector) {
      const data = collector.values[0];
      const channel = interaction.guild!.channels.cache.get(data) as TextChannel;
      const config = {
        $set: {
          "config.modlogChannel": channel.id,
        },
      };
      await client.updateGuildConfig({
        guildId: interaction.guild!.id,
        config,
      });
      await collector.reply({
        content: client.handleLanguages("MODLOG_CHANNEL_SUCCESS", client, interaction.guildId!),
        ephemeral: true,
      });
    }
  } catch (error) {
    await handleErrors(client, error, "moderationConfig.ts", interaction);
  }
}

async function muteGetAllRoles(interaction: SelectMenuInteraction, client: KhaxyClient) {
  if (!client.guildsConfig.get(interaction.guild!.id)?.config.muteGetAllRoles) {
    const config = {
      $set: {
        "config.muteGetAllRoles": true,
      },
    };
    await client.updateGuildConfig({ guildId: interaction.guild!.id, config });
    await interaction.reply({
      content: client.handleLanguages("MUTE_GET_ALL_ROLES_TRUE", client, interaction.guildId!),
      ephemeral: true,
    });
  } else {
    const config = {
      $set: {
        "config.muteGetAllRoles": false,
      },
    };
    await client.updateGuildConfig({ guildId: interaction.guild!.id, config });
    await interaction.reply({
      content: client.handleLanguages("MUTE_GET_ALL_ROLES_FALSE", client, interaction.guildId!),
      ephemeral: true,
    });
  }
}

async function staffRole(interaction: SelectMenuInteraction, client: KhaxyClient) {
  const raw = client.handleLanguages("STAFF_ROLES_PROMPT", client, interaction.guildId!);
  raw.components[0].components[0].default_values.shift();
  const staffRoles = client.guildsConfig.get(interaction.guild!.id)?.config.staffRole || [];
  for (const role of staffRoles) {
    raw.components[0].components[0].default_values.push({
      id: role,
      type: "role",
    });
  }
  //Discord typing doesn't match with the API, so it complains about the type
  //@ts-ignore
  await interaction.reply(raw);
  const msg = await interaction.fetchReply();
  const filter = (i: RoleSelectMenuInteraction) => i.user.id === interaction.user.id;
  try {
    const collector = await msg.awaitMessageComponent({
      filter: filter,
      componentType: ComponentType.RoleSelect,
      time: 60000,
    });
    if (collector) {
      const roles = collector.values;
      const config = {
        $set: {
          "config.staffRole": roles,
        },
      };
      await client.updateGuildConfig({
        guildId: interaction.guild!.id,
        config,
      });
      await collector.reply({
        content: client.handleLanguages("STAFF_ROLES_SUCCESS", client, interaction.guildId!),
        ephemeral: true,
      });
    }
  } catch (error) {
    await handleErrors(client, error, "moderationConfig.ts", interaction);
  }
}

async function modMail(interaction: SelectMenuInteraction, client: KhaxyClient) {
  if (client.guildsConfig.get(interaction.guild!.id)?.config.modmail.logChannel) {
    await interaction.reply(client.handleLanguages("MODMAIL_PROMPT", client, interaction.guildId!));
    const msg = (await interaction.fetchReply()) as Message;
    const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id;
    try {
      const collector = await msg.awaitMessageComponent({
        filter: filter,
        componentType: ComponentType.Button,
        time: 60000,
      });
      if (collector) {
        if (collector.customId === "modMailDelete") {
          const config = {
            $set: {
              "config.modmail": null,
            },
          };
          await client.updateGuildConfig({
            guildId: interaction.guild!.id,
            config,
          });
          await collector.reply({
            content: client.handleLanguages("MODMAIL_DELETE", client, interaction.guildId!),
            ephemeral: true,
          });
        } else if (collector.customId === "modMailReject") {
          await collector.reply({
            content: client.handleLanguages("MODMAIL_REJECT", client, interaction.guildId!),
            ephemeral: true,
          });
        }
      }
    } catch (error) {
      await handleErrors(client, error, "moderationConfig.ts", interaction);
    }
  } else {
    try {
      const parent = await interaction.guild!.channels.create({
        name: "ModMail",
        type: ChannelType.GuildCategory,
        permissionOverwrites: [
          {
            id: interaction.guild!.id,
            deny: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel],
          },
        ],
      });
      const child = await parent.children.create({
        name: "ModMail Log",
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: interaction.guild!.id,
            deny: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel],
          },
        ],
      });
      const config = {
        $set: {
          "config.modmail": {
            category: parent.id,
            logChannel: child.id,
          },
        },
      };
      await client.updateGuildConfig({
        guildId: interaction.guild!.id,
        config,
      });
      await interaction.reply({
        content: client.handleLanguages("MODMAIL_SUCCESS", client, interaction.guildId!),
        ephemeral: true,
      });
    } catch (error) {
      await handleErrors(client, error, "moderationConfig.ts", interaction);
    }
  }
}

async function languageHandler(interaction: SelectMenuInteraction, client: KhaxyClient) {
  const raw = client.handleLanguages("LANGUAGE_PROMPT", client, interaction.guildId!);
  const language = client.guildsConfig.get(interaction.guild!.id)?.config.language;
  if (language) {
    raw.components[0].components[0].placeholder = language.charAt(0).toUpperCase() + language.slice(1);
  }
  await interaction.reply(raw);
  const msg = (await interaction.fetchReply()) as Message;
  const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id;
  try {
    const collector = await msg.awaitMessageComponent({
      filter: filter,
      componentType: ComponentType.SelectMenu,
      time: 60000,
    });
    if (collector) {
      const data = collector.values[0];
      const config = {
        $set: {
          "config.language": data,
        },
      };
      await client.updateGuildConfig({
        guildId: interaction.guild!.id,
        config,
      });
      await collector.reply({
        content: client.handleLanguages("LANGUAGE_SUCCESS", client, interaction.guildId!),
        ephemeral: true,
      });
    }
  } catch (error) {
    await handleErrors(client, error, "moderationConfig.ts", interaction);
  }
}

async function daysForMembersToRegister(interaction: SelectMenuInteraction, client: KhaxyClient) {
  const raw = client.handleLanguages("DAYS_FOR_MEMBERS_TO_REGISTER_PROMPT", client, interaction.guildId!);
  const daysForMembersToRegister = client.guildsConfig.get(interaction.guild!.id)?.config.daysToKick;
  if (daysForMembersToRegister) {
    raw.components[0].components[0].placeholder = daysForMembersToRegister.toString();
  }
  await interaction.reply(raw);
  const msg = (await interaction.fetchReply()) as Message;
  const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id;
  try {
    const collector = await msg.awaitMessageComponent({
      filter: filter,
      componentType: ComponentType.SelectMenu,
      time: 60000,
    });
    if (collector) {
      const data = collector.values[0];
      const config = {
        $set: {
          "config.daysToKick": parseInt(data),
        },
      };
      await client.updateGuildConfig({
        guildId: interaction.guild!.id,
        config,
      });
      await collector.reply({
        content: client.handleLanguages("DAYS_FOR_MEMBERS_TO_REGISTER_SUCCESS", client, interaction.guildId!),
        ephemeral: true,
      });
    }
  } catch (error) {
    await handleErrors(client, error, "moderationConfig.ts", interaction);
  }
}
