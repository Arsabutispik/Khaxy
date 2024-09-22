import { ComponentType } from "discord.js";
import { handleErrors } from "../utils/utils.js";
export default async function miscConfig(interaction, client) {
  await interaction.reply(client.handleLanguages("MISC_CONFIG_PROMPT", client, interaction.guildId));
  const msg = await interaction.fetchReply();
  const filter = (i) => i.customId === "miscConfig" && i.user.id === interaction.user.id;
  try {
    const collector = await msg.awaitMessageComponent({
      filter,
      componentType: ComponentType.SelectMenu,
      time: 60000,
    });
    if (collector.customId === "miscConfig") {
      switch (collector.values[0]) {
        case "bumpLeaderboardChannel":
          await bumpLeaderboardChannel(collector, client);
          break;
        case "modMailMessage":
          await modMailMessage(collector, client);
          break;
      }
    }
  } catch (error) {
    await handleErrors(client, error, "miscConfig.ts", interaction);
  }
}
async function bumpLeaderboardChannel(interaction, client) {
  const raw = client.handleLanguages("BUMP_LEADERBOARD_CHANNEL_PROMPT", client, interaction.guildId);
  raw.components[0].components[0].default_values.shift();
  const bumpLeaderboardChannel = client.guildsConfig.get(interaction.guild.id)?.config.bumpLeaderboardChannel;
  if (bumpLeaderboardChannel) {
    raw.components[0].components[0].default_values.push({
      id: bumpLeaderboardChannel,
      type: "channel",
    });
  }
  await interaction.reply(raw);
  const msg = await interaction.fetchReply();
  const filter = (i) => i.user.id === interaction.user.id;
  try {
    const collector = await msg.awaitMessageComponent({
      filter: filter,
      componentType: ComponentType.ChannelSelect,
      time: 60000,
    });
    if (collector) {
      const data = collector.values[0];
      const channel = interaction.guild.channels.cache.get(data);
      const config = {
        $set: {
          "config.bumpLeaderboardChannel": channel.id,
        },
      };
      await client.updateGuildConfig({
        guildId: interaction.guild.id,
        config,
      });
      await collector.reply({
        content: client.handleLanguages("BUMP_LEADERBOARD_CHANNEL_SUCCESS", client, interaction.guildId),
        ephemeral: true,
      });
    }
  } catch (error) {
    await handleErrors(client, error, "miscConfig.ts", interaction);
  }
}
async function modMailMessage(interaction, client) {
  if (client.guildsConfig.get(interaction.guildId)?.config.modmail.newThreadMessage) {
    await interaction.reply(client.handleLanguages("MODMAIL_MESSAGE_ALREADY_SETUP", client, interaction.guildId));
    const filter = (i) =>
      (i.customId === "modMailMessageReject" ||
        i.customId === "modMailMessageAccept" ||
        i.customId === "modMailMessageDelete") &&
      i.user.id === interaction.user.id;
    try {
      const collector = await interaction.fetchReply();
      const collector2 = await collector.awaitMessageComponent({
        filter,
        componentType: ComponentType.Button,
        time: 60000,
      });
      if (collector2) {
        if (collector2.customId === "modMailMessageReject") {
          await collector2.reply({
            content: client.handleLanguages("MODMAIL_MESSAGE_CANCEL", client, interaction.guildId),
            ephemeral: true,
          });
        } else if (collector2.customId === "modMailMessageAccept") {
          await collector2.reply(client.handleLanguages("MODMAIL_MESSAGE_SETUP", client, interaction.guildId));
          const msg = await collector2.fetchReply();
          const buttonFilter = (i) => i.customId === "modMailMessage" && i.user.id === interaction.user.id;
          try {
            const modalcollector = await msg.awaitMessageComponent({
              filter: buttonFilter,
              componentType: ComponentType.Button,
              time: 60000,
            });
            if (modalcollector) {
              await modalcollector.showModal(
                client.handleLanguages("MODMAIL_MESSAGE_MODAL", client, interaction.guildId),
              );
              const filter = (i) => i.customId === "modMailMessage" && i.user.id === interaction.user.id;
              try {
                const collector = await modalcollector.awaitModalSubmit({
                  filter,
                  time: 60000,
                });
                const data = collector.fields.getTextInputValue("modMailMessage");
                const config = {
                  $set: {
                    "config.modmail.newThreadMessage": data,
                  },
                };
                await client.updateGuildConfig({
                  guildId: interaction.guild.id,
                  config,
                });
                await collector.reply({
                  content: client.handleLanguages("MODMAIL_MESSAGE_SUCCESS", client, interaction.guildId),
                  ephemeral: true,
                });
              } catch (error) {
                await handleErrors(client, error, "miscConfig.ts", interaction);
              }
            }
          } catch (error) {
            await handleErrors(client, error, "miscConfig.ts", interaction);
          }
        } else if (collector2.customId === "modMailMessageDelete") {
          const config = {
            $set: {
              "config.modmail.newThreadMessage": null,
            },
          };
          await client.updateGuildConfig({ guildId: interaction.guild.id, config });
          await collector2.reply({
            content: client.handleLanguages("MODMAIL_MESSAGE_DELETED", client, interaction.guildId),
            ephemeral: true,
          });
        }
      }
    } catch (error) {
      await handleErrors(client, error, "miscConfig.ts", interaction);
    }
  } else {
    await interaction.reply(client.handleLanguages("MODMAIL_MESSAGE_SETUP", client, interaction.guildId));
    const msg = await interaction.fetchReply();
    const buttonFilter = (i) => i.customId === "modMailMessage" && i.user.id === interaction.user.id;
    try {
      const modalcollector = await msg.awaitMessageComponent({
        filter: buttonFilter,
        componentType: ComponentType.Button,
        time: 60000,
      });
      if (modalcollector) {
        await modalcollector.showModal(client.handleLanguages("MODMAIL_MESSAGE_MODAL", client, interaction.guildId));
        const filter = (i) => i.customId === "modMailMessage" && i.user.id === interaction.user.id;
        try {
          const collector = await modalcollector.awaitModalSubmit({
            filter,
            time: 60000,
          });
          const data = collector.fields.getTextInputValue("modMailMessage");
          const config = {
            $set: {
              "config.modmail.newThreadMessage": data,
            },
          };
          await client.updateGuildConfig({
            guildId: interaction.guild.id,
            config,
          });
          await collector.reply({
            content: client.handleLanguages("MODMAIL_MESSAGE_SUCCESS", client, interaction.guildId),
            ephemeral: true,
          });
        } catch (error) {
          await handleErrors(client, error, "miscConfig.ts", interaction);
        }
      }
    } catch (error) {
      await handleErrors(client, error, "miscConfig.ts", interaction);
    }
  }
}
//# sourceMappingURL=miscConfig.js.map
