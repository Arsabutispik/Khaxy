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

export default async function welcomeConfig(interaction: ChatInputCommandInteraction, client: KhaxyClient) {
  await interaction.reply(client.handleLanguages("WELCOME_CONFIG_PROMPT", client, interaction.guildId!));
  const msg = (await interaction.fetchReply()) as Message;
  const filter = (i: SelectMenuInteraction) => i.customId === "welcomeConfig" && i.user.id === interaction.user.id;
  try {
    const collector = await msg.awaitMessageComponent({
      filter,
      componentType: ComponentType.SelectMenu,
      time: 60000,
    });
    if (collector) {
      switch (collector.values[0]) {
        case "welcomeChannel":
          await welcomeChannel(collector, client);
          break;
        case "welcomeMessage":
          await welcomeMessage(collector, client);
          break;
        case "goodbyeChannel":
          await goodbyeChannel(collector, client);
          break;
        case "goodbyeMessage":
          await goodbyeMessage(collector, client);
          break;
      }
    }
  } catch (error) {
    await handleErrors(client, error, "welcomeConfig.ts", interaction);
  }
}

async function welcomeChannel(interaction: SelectMenuInteraction, client: KhaxyClient) {
  const raw = client.handleLanguages("WELCOME_CHANNEL_PROMPT", client, interaction.guildId!);
  raw.components[0].components[0].default_values.shift();
  const welcomeChannel = client.guildsConfig.get(interaction.guild!.id)?.config.welcomeChannel;
  if (welcomeChannel) {
    raw.components[0].components[0].default_values.push({
      id: welcomeChannel,
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
          "config.welcomeChannel": channel.id,
        },
      };
      await client.updateGuildConfig({
        guildId: interaction.guild!.id,
        config,
      });
      await collector.reply({
        content: client.handleLanguages("WELCOME_CHANNEL_SUCCESS", client, interaction.guildId!),
        ephemeral: true,
      });
    }
  } catch (error) {
    await handleErrors(client, error, "welcomeConfig.ts", interaction);
  }
}

async function welcomeMessage(interaction: SelectMenuInteraction, client: KhaxyClient) {
  if (client.guildsConfig.get(interaction.guild!.id)?.config.welcomeMessage) {
    await interaction.reply(client.handleLanguages("WELCOME_MESSAGE_ALREADY_SETUP", client, interaction.guildId!));
    const msg = (await interaction.fetchReply()) as Message;
    const buttonFilter = (i: MessageComponentInteraction) =>
      (i.customId === "welcomeMessageReject" ||
        i.customId === "welcomeMessageAccept" ||
        i.customId === "welcomeMessageDelete") &&
      i.user.id === interaction.user.id;
    try {
      const collector = await msg.awaitMessageComponent({
        filter: buttonFilter,
        componentType: ComponentType.Button,
        time: 60000,
      });
      if (collector.customId === "welcomeMessageReject") {
        await collector.reply({
          content: client.handleLanguages("WELCOME_MESSAGE_CANCEL", client, interaction.guildId!),
          ephemeral: true,
        });
      } else if (collector.customId === "welcomeMessageAccept") {
        await collector.reply(client.handleLanguages("WELCOME_MESSAGE_SETUP", client, interaction.guildId!));
        const msg = (await collector.fetchReply()) as Message;
        const buttonFilter = (i: MessageComponentInteraction) =>
          i.customId === "welcomeMessage" && i.user.id === interaction.user.id;
        try {
          const modalcollector = await msg.awaitMessageComponent({
            filter: buttonFilter,
            componentType: ComponentType.Button,
            time: 60000,
          });
          if (modalcollector) {
            await modalcollector.showModal(
              client.handleLanguages("WELCOME_MESSAGE_MODAL", client, interaction.guildId!),
            );
            const filter = (i: ModalSubmitInteraction) =>
              i.customId === "welcomeMessage" && i.user.id === interaction.user.id;
            try {
              const collector = await modalcollector.awaitModalSubmit({
                filter,
                time: 60000,
              });
              const data = collector.fields.getTextInputValue("welcomeMessage");
              const config = {
                $set: {
                  "config.welcomeMessage": data,
                },
              };
              await client.updateGuildConfig({
                guildId: interaction.guild!.id,
                config,
              });
              await collector.reply({
                content: client.handleLanguages("WELCOME_MESSAGE_SUCCESS", client, interaction.guildId!),
                ephemeral: true,
              });
            } catch (error) {
              await handleErrors(client, error, "welcomeConfig.ts", interaction);
            }
          }
        } catch (error) {
          await handleErrors(client, error, "welcomeConfig.ts", interaction);
        }
      } else if (collector.customId === "welcomeMessageDelete") {
        const config = {
          $set: {
            "config.welcomeMessage": null,
          },
        };
        await client.updateGuildConfig({
          guildId: interaction.guild!.id,
          config,
        });
        await collector.reply({
          content: client.handleLanguages("WELCOME_MESSAGE_DELETED", client, interaction.guildId!),
          ephemeral: true,
        });
      }
    } catch (error) {
      await handleErrors(client, error, "welcomeConfig.ts", interaction);
    }
  } else {
    await interaction.reply(client.handleLanguages("WELCOME_MESSAGE_SETUP", client, interaction.guildId!));
    const msg = (await interaction.fetchReply()) as Message;
    const buttonFilter = (i: MessageComponentInteraction) =>
      i.customId === "welcomeMessage" && i.user.id === interaction.user.id;
    try {
      const collector = await msg.awaitMessageComponent({
        filter: buttonFilter,
        componentType: ComponentType.Button,
        time: 60000,
      });
      if (collector) {
        await collector.showModal(client.handleLanguages("WELCOME_MESSAGE_MODAL", client, interaction.guildId!));
        const filter = (i: ModalSubmitInteraction) =>
          i.customId === "welcomeMessage" && i.user.id === interaction.user.id;
        try {
          const collector = await interaction.awaitModalSubmit({
            filter,
            time: 60000,
          });
          const data = collector.fields.getTextInputValue("welcomeMessage");
          const config = {
            $set: {
              "config.welcomeMessage": data,
            },
          };
          await client.updateGuildConfig({
            guildId: interaction.guild!.id,
            config,
          });
          await collector.reply({
            content: client.handleLanguages("WELCOME_MESSAGE_SUCCESS", client, interaction.guildId!),
            ephemeral: true,
          });
        } catch (error) {
          await handleErrors(client, error, "welcomeConfig.ts", interaction);
        }
      }
    } catch (error) {
      await handleErrors(client, error, "welcomeConfig.ts", interaction);
    }
  }
}

async function goodbyeChannel(interaction: SelectMenuInteraction, client: KhaxyClient) {
  const raw = client.handleLanguages("GOODBYE_CHANNEL_PROMPT", client, interaction.guildId!);
  raw.components[0].components[0].default_values.shift();
  const goodbyeChannel = client.guildsConfig.get(interaction.guild!.id)?.config.leaveChannel;
  if (goodbyeChannel) {
    raw.components[0].components[0].default_values.push({
      id: goodbyeChannel,
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
          "config.leaveChannel": channel.id,
        },
      };
      await client.updateGuildConfig({
        guildId: interaction.guild!.id,
        config,
      });
      await collector.reply({
        content: client.handleLanguages("GOODBYE_CHANNEL_SUCCESS", client, interaction.guildId!),
        ephemeral: true,
      });
    }
  } catch (error) {
    await handleErrors(client, error, "welcomeConfig.ts", interaction);
  }
}

async function goodbyeMessage(interaction: SelectMenuInteraction, client: KhaxyClient) {
  if (client.guildsConfig.get(interaction.guild!.id)?.config.leaveMessage) {
    await interaction.reply(client.handleLanguages("GOODBYE_MESSAGE_ALREADY_SETUP", client, interaction.guildId!));
    const filter = (i: MessageComponentInteraction) =>
      (i.customId === "goodByeMessageReject" ||
        i.customId === "goodByeMessageAccept" ||
        i.customId === "goodByeMessageDelete") &&
      i.user.id === interaction.user.id;
    try {
      const collector = (await interaction.fetchReply()) as Message;
      const collector2 = await collector.awaitMessageComponent({
        filter,
        componentType: ComponentType.Button,
        time: 60000,
      });
      if (collector2) {
        if (collector2.customId === "goodByeMessageReject") {
          await collector2.reply({
            content: client.handleLanguages("GOODBYE_MESSAGE_CANCEL", client, interaction.guildId!),
            ephemeral: true,
          });
        } else if (collector2.customId === "goodByeMessageAccept") {
          await collector2.reply(client.handleLanguages("GOODBYE_MESSAGE_SETUP", client, interaction.guildId!));
          const msg = (await collector2.fetchReply()) as Message;
          const buttonFilter = (i: MessageComponentInteraction) =>
            i.customId === "goodbyeMessage" && i.user.id === interaction.user.id;
          try {
            const modalcollector = await msg.awaitMessageComponent({
              filter: buttonFilter,
              componentType: ComponentType.Button,
              time: 60000,
            });
            if (modalcollector) {
              await modalcollector.showModal(
                client.handleLanguages("GOODBYE_MESSAGE_MODAL", client, interaction.guildId!),
              );
              const filter = (i: ModalSubmitInteraction) =>
                i.customId === "goodbyeMessage" && i.user.id === interaction.user.id;
              try {
                const collector = await modalcollector.awaitModalSubmit({
                  filter,
                  time: 60000,
                });
                const data = collector.fields.getTextInputValue("goodbyeMessage");
                const config = {
                  $set: {
                    "config.leaveMessage": data,
                  },
                };
                await client.updateGuildConfig({
                  guildId: interaction.guild!.id,
                  config,
                });
                await collector.reply({
                  content: client.handleLanguages("GOODBYE_MESSAGE_SUCCESS", client, interaction.guildId!),
                  ephemeral: true,
                });
              } catch (error) {
                await handleErrors(client, error, "welcomeConfig.ts", interaction);
              }
            }
          } catch (error) {
            await handleErrors(client, error, "welcomeConfig.ts", interaction);
          }
        } else if (collector2.customId === "goodByeMessageDelete") {
          const config = {
            $set: {
              "config.leaveMessage": null,
            },
          };
          await client.updateGuildConfig({
            guildId: interaction.guild!.id,
            config,
          });
          await collector2.reply({
            content: client.handleLanguages("GOODBYE_MESSAGE_DELETED", client, interaction.guildId!),
            ephemeral: true,
          });
        }
      }
    } catch (error) {
      await handleErrors(client, error, "welcomeConfig.ts", interaction);
    }
  } else {
    await interaction.reply(client.handleLanguages("GOODBYE_MESSAGE_SETUP", client, interaction.guildId!));
    const msg = (await interaction.fetchReply()) as Message;
    const buttonFilter = (i: MessageComponentInteraction) =>
      i.customId === "goodbyeMessage" && i.user.id === interaction.user.id;
    try {
      const collector = await msg.awaitMessageComponent({
        filter: buttonFilter,
        componentType: ComponentType.Button,
        time: 60000,
      });
      if (collector) {
        await collector.showModal(client.handleLanguages("GOODBYE_MESSAGE_MODAL", client, interaction.guildId!));
        const filter = (i: ModalSubmitInteraction) =>
          i.customId === "goodbyeMessage" && i.user.id === interaction.user.id;
        try {
          const collector = await interaction.awaitModalSubmit({
            filter,
            time: 60000,
          });
          const data = collector.fields.getTextInputValue("goodbyeMessage");
          const config = {
            $set: {
              "config.leaveMessage": data,
            },
          };
          await client.updateGuildConfig({
            guildId: interaction.guild!.id,
            config,
          });
          await collector.reply({
            content: client.handleLanguages("GOODBYE_MESSAGE_SUCCESS", client, interaction.guildId!),
            ephemeral: true,
          });
        } catch (error) {
          await handleErrors(client, error, "welcomeConfig.ts", interaction);
        }
      }
    } catch (error) {
      await handleErrors(client, error, "welcomeConfig.ts", interaction);
    }
  }
}
