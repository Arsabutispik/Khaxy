import { SlashCommandBase } from "@types";
import { EmbedBuilder, InteractionContextType, MessageFlags, SlashCommandBuilder } from "discord.js";
import { logger } from "@lib";

export default {
  data: new SlashCommandBuilder()
    .setName("support")
    .setNameLocalizations({
      tr: "destek",
    })
    .setDescription("Support links for the bot")
    .setDescriptionLocalizations({
      tr: "Bot için destek linkleri",
    })
    .setContexts(InteractionContextType.Guild),
  async execute(interaction, guildConfig) {
    const t = interaction.client.i18next.getFixedT(guildConfig.language, "commands", "support");
    const devGuild = interaction.client.guilds.cache.get(process.env.GUILD_ID!);
    if (!devGuild) {
      await interaction.reply({
        content: t("guildNotFound"),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    try {
      const invite = await devGuild.invites.create(
        devGuild.channels.cache.filter((channel) => channel.isTextBased()).first()?.id || "0",
      );
      const embed = new EmbedBuilder()
        .setColor("Random")
        .setTitle(t("embed.title"))
        .setFields([
          {
            name: t("embed.fields.supportServer"),
            value: invite.url,
          },
          {
            name: t("embed.fields.docsSite"),
            value: `https://docs.khaxy.net/${guildConfig.language.split("-")[0]}/`,
          },
        ]);
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      await interaction.reply({
        content: t("error"),
        flags: MessageFlags.Ephemeral,
      });
      logger.log({
        level: "error",
        message: "Failed to get support links",
        error,
      });
    }
  },
} as SlashCommandBase;
