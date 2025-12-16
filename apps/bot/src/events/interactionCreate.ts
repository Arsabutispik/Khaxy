import type { EventBase } from "src/types/index.js";
import { Events, Locale, MessageFlags, MessageFlagsBitField, ApplicationCommandOptionType } from "discord.js";
import { missingPermissionsAsString } from "src/utils/index.js";
import { logger } from "src/lib/index.js";
import {
  getOrCreateGuild,
  getThreadByChannelId,
  addMessageToThread,
  ModMailAuthorType,
  ModMailSentToType,
} from "@repo/database";

export default {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction) {
    // Check if the interaction is a chat input command
    if (interaction.isChatInputCommand()) {
      if (!interaction.inCachedGuild()) return;
      const guildData = await getOrCreateGuild(interaction.guildId);
      // Retrieve the command from the client's slash commands collection
      const command = interaction.client.slashCommands.get(interaction.commandName);
      if (!command) {
        logger.log({
          level: "warn",
          message: `Command ${interaction.commandName} not found in the client's slash commands collection.`,
          discord: false,
        });
        await interaction.reply({
          content: "This command does not exist or is not available in this server.",
          flags: MessageFlagsBitField.Flags.Ephemeral,
        });
        return;
      }
      // Retrieve the language from the guild configuration
      const language = guildData.language || "en";
      // Retrieve the translation function
      const t = interaction.client.i18next.getFixedT(language);
      // Check if the member has the required permissions to execute the command
      if (
        command.memberPermissions &&
        interaction.member &&
        !interaction.member.permissions.has(command.memberPermissions)
      ) {
        const missingPermissions = missingPermissionsAsString(
          interaction.client,
          interaction.member.permissions.missing(command.memberPermissions),
          language,
        );
        await interaction.reply({
          content: t("events:interactionCreate.memberMissingPermissions", { permissions: missingPermissions }),
          flags: MessageFlagsBitField.Flags.Ephemeral,
        });
        return;
      }
      // Check if the client has the required permissions to execute the command
      if (
        command.clientPermissions &&
        interaction.guild &&
        !interaction.guild.members.me!.permissions.has(command.clientPermissions)
      ) {
        const missingPermissions = missingPermissionsAsString(
          interaction.client,
          interaction.guild.members.me!.permissions.missing(command.clientPermissions),
          language,
        );
        await interaction.reply({
          content: t("events:interactionCreate.botMissingPermissions", { permissions: missingPermissions }),
          flags: MessageFlagsBitField.Flags.Ephemeral,
        });
        return;
      }
      try {
        // Execute the command
        command.execute(interaction, guildData);
        // If the command is used in a mod mail thread keep track of the command execution
        const modMailThread = await getThreadByChannelId(interaction.channelId);
        if (modMailThread) {
          const commandName =
            interaction.command?.nameLocalizations?.[guildData.language.split("-")[0] as Locale] ||
            interaction.command?.name;
          let message = "";
          for (const option of interaction.options.data) {
            if (option.type === ApplicationCommandOptionType.Attachment) continue;
            message += `${option.name}: ${option.value} `;
          }
          const content = interaction.options.getAttachment("attachment")
            ? `/${commandName} ${message} ${interaction.options.getAttachment("attachment")?.url}`
            : `/${commandName} ${message}`;
          await addMessageToThread(
            modMailThread.channelId,
            content,
            interaction.user.id,
            ModMailAuthorType.STAFF,
            ModMailSentToType.COMMAND,
          );
        }
        logger.log({
          level: "info",
          message: `Command ${interaction.commandName} executed by ${interaction.user.username} in ${Date.now() - interaction.createdTimestamp}ms successfully.`,
          discord: false,
        });
      } catch (error) {
        logger.log({
          level: "error",
          message: "Error executing command",
          error: error,
          command: interaction.commandName,
          guildId: interaction.guildId,
          userId: interaction.user.id,
        });
        // Handle errors during command execution
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: "There was an unexpected error while executing this command!",
            flags: MessageFlags.Ephemeral,
          });
        } else {
          await interaction.reply({
            content: "There was an unexpected error while executing this command!",
            flags: MessageFlags.Ephemeral,
          });
        }
      }
    }
  },
} satisfies EventBase<Events.InteractionCreate>;
