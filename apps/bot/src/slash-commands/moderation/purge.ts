import { SlashCommandBase } from "@types";
import {
  ChannelType,
  InteractionContextType,
  MessageFlags,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import { logger } from "@lib";

export default {
  memberPermissions: [PermissionsBitField.Flags.ManageMessages],
  clientPermissions: [PermissionsBitField.Flags.ManageMessages],
  data: new SlashCommandBuilder()
    .setName("purge")
    .setNameLocalizations({
      tr: "temizle",
    })
    .setDescription("Purge messages from a channel")
    .setDescriptionLocalizations({
      tr: "Bir kanaldan mesajları temizler",
    })
    .setContexts(InteractionContextType.Guild)
    .addSubcommand((option) =>
      option
        .setName("any")
        .setNameLocalizations({
          tr: "herhangi",
        })
        .setDescription("Purge any messages from the channel")
        .setDescriptionLocalizations({
          tr: "Kanaldan herhangi bir mesajı temizle",
        })
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setNameLocalizations({
              tr: "miktar",
            })
            .setDescription("Number of messages to purge")
            .setDescriptionLocalizations({
              tr: "Temizlenecek mesajların sayısı",
            })
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(100),
        ),
    )
    .addSubcommand((option) =>
      option
        .setName("bots")
        .setNameLocalizations({
          tr: "botlar",
        })
        .setDescription("Purge messages from bots in the channel")
        .setDescriptionLocalizations({
          tr: "Bot mesajlarını kanaldan temizler",
        })
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setNameLocalizations({
              tr: "miktar",
            })
            .setDescription("Number of bot messages to purge")
            .setDescriptionLocalizations({
              tr: "Temizlenecek bot mesajlarının sayısı",
            })
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(100),
        ),
    )
    .addSubcommand((option) =>
      option
        .setName("user")
        .setNameLocalizations({
          tr: "kullanıcı",
        })
        .setDescription("Purge messages from a specific user in the channel")
        .setDescriptionLocalizations({
          tr: "Belirli bir kullanıcının mesajlarını kanaldan temizler",
        })
        .addUserOption((option) =>
          option
            .setName("target")
            .setNameLocalizations({
              tr: "hedef",
            })
            .setDescription("The user whose messages you want to purge")
            .setDescriptionLocalizations({
              tr: "Mesajlarını temizlemek istediğiniz kullanıcı",
            })
            .setRequired(true),
        )
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setNameLocalizations({
              tr: "miktar",
            })
            .setDescription("Number of messages to purge from the user")
            .setDescriptionLocalizations({
              tr: "Kullanıcıdan temizlenecek mesajların sayısı",
            })
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(100),
        ),
    ),
  execute: async (interaction, guildConfig) => {
    const t = interaction.client.i18next.getFixedT(guildConfig.language, "commands", "purge");
    if (interaction.channel?.type !== ChannelType.GuildText) {
      return interaction.reply({
        content: t(($) => $.not_text_channel),
        flags: MessageFlags.Ephemeral,
      });
    }
    const subcommand = interaction.options.getSubcommand();
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    if (subcommand === "any") {
      const amount = interaction.options.getInteger("amount", true);
      try {
        const messages = await interaction.channel.bulkDelete(amount, true);
        return interaction.editReply({
          content: t(($) => $.any.success, {
            count: messages.size,
            confirm: interaction.client.allEmojis.get(interaction.client.config.emojis.confirm.id)!.format,
          }),
        });
      } catch (error) {
        logger.log({
          level: "error",
          message: `Failed to purge messages in ${interaction.guildId}`,
          error,
        });
        return interaction.editReply({
          content: t(($) => $.any.error),
        });
      }
    } else if (subcommand === "bots") {
      const amount = interaction.options.getInteger("amount", true);
      try {
        const messages = await interaction.channel.messages.fetch({ limit: amount });
        const botMessages = messages.filter((msg) => msg.author.bot);
        const deletedMessages = await interaction.channel.bulkDelete(botMessages, true);
        return interaction.editReply({
          content: t(($) => $.bots.success, {
            count: deletedMessages.size,
            confirm: interaction.client.allEmojis.get(interaction.client.config.emojis.confirm.id)!.format,
          }),
        });
      } catch (error) {
        logger.log({
          level: "error",
          message: `Failed to purge bot messages in ${interaction.guildId}`,
          error,
        });
        return interaction.editReply({
          content: t(($) => $.bots.error),
        });
      }
    } else if (subcommand === "user") {
      const target = interaction.options.getUser("target", true);
      const amount = interaction.options.getInteger("amount", true);
      try {
        const messages = await interaction.channel.messages.fetch({ limit: amount });
        const userMessages = messages.filter((msg) => msg.author.id === target.id);
        const deletedMessages = await interaction.channel.bulkDelete(userMessages, true);
        return interaction.editReply({
          content: t(($) => $.user.success, {
            count: deletedMessages.size,
            user: target.toString(),
            confirm: interaction.client.allEmojis.get(interaction.client.config.emojis.confirm.id)!.format,
          }),
        });
      } catch (error) {
        logger.log({
          level: "error",
          message: `Failed to purge user messages in ${interaction.guildId}`,
          error,
        });
        return interaction.editReply({
          content: t(($) => $.user.error),
        });
      }
    }
  },
} as SlashCommandBase;
