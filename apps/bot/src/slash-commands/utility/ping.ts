import { InteractionContextType, MessageFlags, SlashCommandBuilder } from "discord.js";
import type { SlashCommandBase } from "@types";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setNameLocalizations({
      tr: "ping",
    })
    .setContexts(InteractionContextType.Guild)
    .setDescription("Check the bot's latency")
    .setDescriptionLocalizations({
      tr: "Botun gecikmesini kontrol et",
    }),
  async execute(interaction, guildConfig) {
    await interaction.reply({
      content: `🏓 Pong! Websocket Latency is ${interaction.client.ws.ping}ms\nAPI Latency is ${Date.now() - interaction.createdTimestamp}ms`,
      flags: MessageFlags.Ephemeral,
    });
  },
} as SlashCommandBase;
