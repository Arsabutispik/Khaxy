import { SlashCommandBase } from "@types";
import { EmbedBuilder, MessageFlags, SlashCommandBuilder, Locale, InteractionContextType } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setNameLocalizations({
      tr: "yardım",
    })
    .setDescription("Get help with the bot's commands")
    .setDescriptionLocalizations({
      tr: "Botun komutları hakkında yardım al",
    })
    .setContexts(InteractionContextType.Guild)
    .addStringOption((option) =>
      option
        .setName("command")
        .setNameLocalizations({
          tr: "komut",
        })
        .setDescription("The command you need help with")
        .setDescriptionLocalizations({
          tr: "Yardım almak istediğiniz komut",
        })
        .setRequired(true),
    ),
  async execute(interaction, guildConfig) {
    const t = interaction.client.i18next.getFixedT(guildConfig.language, "commands", "help");
    const helpt = interaction.client.i18next.getFixedT(guildConfig.language, "help");
    const commandName = interaction.options.getString("command", true);
    let commandCollection;
    if (process.env.NODE_ENV === "development") {
      commandCollection =
        interaction.client.application.commands.cache.size > 0
          ? interaction.client.application.commands.cache
          : await interaction.client.application.commands
              .fetch({ guildId: process.env.GUILD_ID, withLocalizations: true })
              .catch(() => null);
    } else {
      commandCollection =
        interaction.client.application.commands.cache.size > 0
          ? interaction.client.application.commands.cache
          : await interaction.client.application.commands.fetch({ withLocalizations: true });
    }
    const command = commandCollection?.find(
      (cmd) =>
        cmd.name === commandName ||
        cmd.nameLocalizations?.[guildConfig.language.split("-")[0] as Locale] === commandName,
    );
    if (!command) {
      await interaction.reply({
        content: t(($) => $.commandNotFound, { command: commandName }),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const embed = new EmbedBuilder()
      .setTitle(helpt(`${command.name}.title`))
      .setDescription(helpt(`${command.name}.description`))
      .setColor("Random")
      .setFooter({
        text: t(($) => $.footer),
      })
      .addFields({
        name: t(($) => $.commandUsage),
        value: helpt(`${command.name}.usage`, { command }),
      })
      .addFields({
        name: t(($) => $.permissions),
        value: helpt(`${command.name}.permissions`, { joinArrays: "\n" }),
      })
      .addFields({
        name: t(($) => $.examples),
        value: helpt(`${command.name}.examples`, { joinArrays: "\n" }),
      });

    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
  },
} as SlashCommandBase;
