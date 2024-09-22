import {
  ChatInputCommandInteraction,
  ComponentType,
  Message,
  MessageComponentInteraction,
  ModalSubmitInteraction,
  SelectMenuInteraction,
  TextChannel,
} from "discord.js";
import { KhaxyClient } from "../../@types/types";
import { handleErrors } from "../utils/utils.js";

export default async function registerConfig(interaction: ChatInputCommandInteraction, client: KhaxyClient) {
  const SelectMenu = client.handleLanguages("REGISTER_CONFIG_PROMPT", client, interaction.guildId!);
  await interaction.reply(SelectMenu);
  const selectMsg = (await interaction.fetchReply()) as Message;
  const selectFilter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id;
  try {
    const selectCollector = await selectMsg.awaitMessageComponent({
      filter: selectFilter,
      componentType: ComponentType.SelectMenu,
      time: 60000,
    });
    if (selectCollector.customId === "registerConfig") {
      switch (selectCollector.values[0]) {
        case "registerChannel":
          await registerChannel(selectCollector, client);
          break;
        case "registerMessage":
          await registerMessage(selectCollector, client);
          break;
        case "registerWelcomeChannel":
          await registerMessageChannel(selectCollector, client);
          break;
        case "registerMessageClear":
          await registerMessageClear(selectCollector, client);
          break;
        case "registerChannelClear":
          await registerChannelClear(selectCollector, client);
          break;
      }
    }
  } catch (error) {
    await handleErrors(client, error, "registerConfig.ts", interaction);
  }
}

async function registerChannel(interaction: SelectMenuInteraction, client: KhaxyClient) {
  const raw = client.handleLanguages("REGISTER_CHANNEL_PROMPT", client, interaction.guildId!);
  raw.components[0].components[0].default_values.shift();
  const registerChannel = client.guildsConfig.get(interaction.guild!.id)?.config.registerChannel;
  if (registerChannel) {
    raw.components[0].components[0].default_values.push({
      id: registerChannel,
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
          "config.registerChannel": channel.id,
        },
      };
      await client.updateGuildConfig({
        guildId: interaction.guild!.id,
        config,
      });
      await collector.reply({
        content: client.handleLanguages("REGISTER_CHANNEL_SUCCESS", client, interaction.guildId!),
        ephemeral: true,
      });
    }
  } catch (error) {
    await handleErrors(client, error, "registerConfig.ts", interaction);
  }
}

async function registerMessage(interaction: SelectMenuInteraction, client: KhaxyClient) {
  if (client.guildsConfig.get(interaction.guild!.id)?.config.registerMessage) {
    const raw = client.handleLanguages("REGISTER_MESSAGE_ALREADY_SETUP", client, interaction.guildId!);
    await interaction.reply(raw);
    const msg = (await interaction.fetchReply()) as Message;
    const buttonFilter = (i: MessageComponentInteraction) =>
      (i.customId === "staffRoleReject" || i.customId === "staffRoleAccept" || i.customId === "staffRoleDelete") &&
      i.user.id === interaction.user.id;
    try {
      const collector = await msg.awaitMessageComponent({
        filter: buttonFilter,
        componentType: ComponentType.Button,
        time: 60000,
      });
      if (collector) {
        if (collector.customId === "registerMessageReject") {
          await collector.reply({
            content: client.handleLanguages("REGISTER_MESSAGE_CANCEL", client, interaction.guildId!),
            components: [],
            ephemeral: true,
          });
        } else if (collector.customId === "registerMessageRoleAccept") {
          const modal = client.handleLanguages("REGISTER_MESSAGE_MODAL", client, interaction.guildId!);

          await collector.reply(client.handleLanguages("REGISTER_MESSAGE_SETUP", client, interaction.guildId!));
          const msg = (await collector.fetchReply()) as Message;
          const buttonFilter = (i: MessageComponentInteraction) =>
            i.customId === "registerMessage" && i.user.id === interaction.user.id;
          try {
            const collector = await msg.awaitMessageComponent({
              filter: buttonFilter,
              componentType: ComponentType.Button,
              time: 60000,
            });
            if (collector) {
              await collector.showModal(modal);
              const filter = (i: ModalSubmitInteraction) =>
                i.customId === "registerMessage" && i.user.id === interaction.user.id;
              try {
                const collector = await interaction.awaitModalSubmit({
                  filter,
                  time: 60000,
                });
                const data = collector.fields.getTextInputValue("registerMessage");
                const config = {
                  $set: {
                    "config.registerMessage": data,
                  },
                };
                await client.updateGuildConfig({
                  guildId: interaction.guild!.id,
                  config,
                });
                await collector.reply({
                  content: client.handleLanguages("REGISTER_MESSAGE_SUCCESS", client, interaction.guildId!),
                  ephemeral: true,
                });
              } catch (e) {
                await collector.reply({
                  content: client.handleLanguages("REGISTER_MESSAGE_ERROR_OR_EXPIRED", client, interaction.guildId!),
                  ephemeral: true,
                });
                console.log(e);
              }
            }
          } catch (e) {
            await interaction.followUp({
              content: client.handleLanguages("REGISTER_MESSAGE_ERROR_OR_EXPIRED", client, interaction.guildId!),
              ephemeral: true,
            });
            console.log(e);
          }
        } else if (collector.customId === "registerMessageDelete") {
          const config = {
            $set: {
              "config.registerMessage": null,
            },
          };
          await client.updateGuildConfig({
            guildId: interaction.guild!.id,
            config,
          });
          await collector.reply({
            content: client.handleLanguages("REGISTER_MESSAGE_DELETED", client, interaction.guildId!),
            ephemeral: true,
          });
        }
      }
    } catch (error) {
      await handleErrors(client, error, "registerConfig.ts", interaction);
    }
  } else {
    const modal = client.handleLanguages("REGISTER_MESSAGE_MODAL", client, interaction.guildId!);

    await interaction.reply(client.handleLanguages("REGISTER_MESSAGE_SETUP", client, interaction.guildId!));
    const msg = (await interaction.fetchReply()) as Message;
    const buttonFilter = (i: MessageComponentInteraction) =>
      i.customId === "registerMessage" && i.user.id === interaction.user.id;
    try {
      const collector = await msg.awaitMessageComponent({
        filter: buttonFilter,
        componentType: ComponentType.Button,
        time: 60000,
      });
      if (collector) {
        await collector.showModal(modal);
        const filter = (i: ModalSubmitInteraction) =>
          i.customId === "registerMessage" && i.user.id === interaction.user.id;
        try {
          const collector = await interaction.awaitModalSubmit({
            filter,
            time: 60000,
          });
          const data = collector.fields.getTextInputValue("registerMessage");
          const config = {
            $set: {
              "config.registerMessage": data,
            },
          };
          await client.updateGuildConfig({
            guildId: interaction.guild!.id,
            config,
          });
          await collector.reply({
            content: client.handleLanguages("REGISTER_MESSAGE_SUCCESS", client, interaction.guildId!),
            ephemeral: true,
          });
        } catch (e) {
          await collector.reply({
            content: client.handleLanguages("REGISTER_MESSAGE_ERROR_OR_EXPIRED", client, interaction.guildId!),
            ephemeral: true,
          });
          console.log(e);
        }
      }
    } catch (error) {
      await handleErrors(client, error, "registerConfig.ts", interaction);
    }
  }
}

async function registerMessageChannel(interaction: SelectMenuInteraction, client: KhaxyClient) {
  const raw = client.handleLanguages("REGISTER_MESSAGE_CHANNEL_PROMPT", client, interaction.guildId!);
  raw.components[0].components[0].default_values.shift();
  const registerChannel = client.guildsConfig.get(interaction.guild!.id)?.config.registerWelcomeChannel;
  if (registerChannel) {
    raw.components[0].components[0].default_values.push({
      id: registerChannel,
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
          "config.registerWelcomeChannel": channel.id,
        },
      };
      await client.updateGuildConfig({
        guildId: interaction.guild!.id,
        config,
      });
      await collector.reply({
        content: client.handleLanguages("REGISTER_MESSAGE_CHANNEL_SUCCESS", client, interaction.guildId!),
        ephemeral: true,
      });
    }
  } catch (error) {
    await handleErrors(client, error, "registerConfig.ts", interaction);
  }
}

async function registerMessageClear(interaction: SelectMenuInteraction, client: KhaxyClient) {
  if (!client.guildsConfig.get(interaction.guild!.id)?.config.registerMessageClear) {
    const config = {
      $set: {
        "config.registerMessageClear": true,
      },
    };
    await client.updateGuildConfig({ guildId: interaction.guild!.id, config });
    await interaction.reply({
      content: client.handleLanguages("REGISTER_MESSAGE_DELETE_TRUE", client, interaction.guildId!),
      ephemeral: true,
    });
  } else {
    const config = {
      $set: {
        "config.registerMessageClear": false,
      },
    };
    await client.updateGuildConfig({ guildId: interaction.guild!.id, config });
    await interaction.reply({
      content: client.handleLanguages("REGISTER_MESSAGE_DELETE_FALSE", client, interaction.guildId!),
      ephemeral: true,
    });
  }
}

async function registerChannelClear(interaction: SelectMenuInteraction, client: KhaxyClient) {
  if (!client.guildsConfig.get(interaction.guild!.id)?.config.registerChannelClear) {
    const config = {
      $set: {
        "config.registerChannelClear": true,
      },
    };
    await client.updateGuildConfig({ guildId: interaction.guild!.id, config });
    await interaction.reply({
      content: client.handleLanguages("REGISTER_CHANNEL_DELETE_TRUE", client, interaction.guildId!),
      ephemeral: true,
    });
  } else {
    const config = {
      $set: {
        "config.registerChannelClear": false,
      },
    };
    await client.updateGuildConfig({ guildId: interaction.guild!.id, config });
    await interaction.reply({
      content: client.handleLanguages("REGISTER_CHANNEL_DELETE_TRUE", client, interaction.guildId!),
      ephemeral: true,
    });
  }
}
