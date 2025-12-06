import type { EventBase } from "src/types/index.js";
import { Events, Locale, MessageFlags, MessageFlagsBitField, ApplicationCommandOptionType } from "discord.js";
import { missingPermissionsAsString } from "src/utils/index.js";
import { logger } from "src/lib/index.js";
import {
  createGuildConfig,
  createModMailMessage,
  getGuildConfig,
  getModMailThread,
} from "src/database/index.js";
import { ModMailMessageSentTo, ModMailMessageType } from "src/constants/index.js";

export default {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction) {
    // Check if the interaction is a chat input command
    if (interaction.isChatInputCommand()) {
      if (!interaction.inCachedGuild()) return;
      let guildConfig = await getGuildConfig(interaction.guildId);
      // Check if the guild configuration exists in the database
      if (interaction.guildId && !guildConfig) {
        logger.log({
          level: "warn",
          message: `Guild config for ${interaction.guildId} not found. Creating...`,
          discord: false,
        });
        try {
          // Insert a new guild configuration into the database
          await createGuildConfig(interaction.guildId, {});
          logger.log({
            level: "info",
            message: `Guild config for ${interaction.guildId} created.`,
            discord: false,
          });
          guildConfig = await getGuildConfig(interaction.guildId);
          if (!guildConfig) {
            logger.log({
              level: "error",
              message: `Failed to create guild config for ${interaction.guild.name}.`,
              guildId: interaction.guildId,
            });
            await interaction.reply({
              content: "An error occurred while creating the guild configuration. Please try again later.",
              flags: MessageFlagsBitField.Flags.Ephemeral,
            });
            return;
          }
        } catch (error) {
          logger.log({
            level: "error",
            message: `Error creating guild config for ${interaction.guildId}`,
            error: error,
          });
          return;
        }
      }

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
      const language = guildConfig?.language || "en";
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
        command.execute(interaction);
        // If the command is used in a mod mail thread keep track of the command execution
        const modMailThread = await getModMailThread(interaction.channelId);
        if (modMailThread) {
          const commandName =
            interaction.command?.nameLocalizations?.[guildConfig!.language.split("-")[0] as Locale] ||
            interaction.command?.name;
          let message = "";
          for (const option of interaction.options.data) {
            if (option.type === ApplicationCommandOptionType.Attachment) continue;
            message += `${option.name}: ${option.value} `;
          }
          await createModMailMessage(interaction.channelId, {
            author_id: BigInt(interaction.member.id),
            sent_at: new Date(),
            author_type: ModMailMessageType.STAFF,
            content: interaction.options.getAttachment("attachment")
              ? `/${commandName} ${message} ${interaction.options.getAttachment("attachment")?.url}`
              : `/${commandName} ${message}`,
            sent_to: ModMailMessageSentTo.COMMAND,
            message_id: BigInt(interaction.id),
          });
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
