import { SlashCommandBase } from "@customTypes";
import { ChannelType, MessageFlags, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { getGuildConfig } from "@database";
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
    .addSubcommand((option) =>
      option
        .setName("any")
        .setNameLocalizations({
          tr: "herhangi",
        })
        .setDescription("Purge any messages from the channel")
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setNameLocalizations({
              tr: "miktar",
            })
            .setDescription("Number of messages to purge")
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(100),
        ),
    ),
  execute: async (interaction) => {
    const guildConfig = await getGuildConfig(interaction.guildId);
    if (!guildConfig) {
      return interaction.reply({
        content: "Guild configuration not found.",
        flags: MessageFlags.Ephemeral,
      });
    }
    const t = interaction.client.i18next.getFixedT(guildConfig.language, "commands", "purge");
    if (interaction.channel?.type !== ChannelType.GuildText) {
      return interaction.reply({
        content: t("not_text_channel"),
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
          content: t("any.success", {
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
          content: t("any.error"),
        });
      }
    }
  },
} as SlashCommandBase;
