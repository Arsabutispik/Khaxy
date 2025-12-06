import { SlashCommandBase } from "src/types/index.js";
import { EmbedBuilder, InteractionContextType, MessageFlags, SlashCommandBuilder } from "discord.js";
import { getGuildConfig } from "src/database/index.js";
import { logger } from "src/lib/index.js";

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
  async execute(interaction) {
    const guildConfig = await getGuildConfig(interaction.guildId);
    if (!guildConfig) {
      await interaction.reply({
        content: "This server is not registered in the database. This shouldn't happen, please contact developers",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const t = interaction.client.i18next.getFixedT(guildConfig.language, "commands", "support");
    const devGuild = interaction.client.guilds.cache.get(process.env.GUILD_ID!);
    if (!devGuild) {
      await interaction.reply({
        content: t("guild_not_found"),
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
            name: t("embed.fields.support_server"),
            value: invite.url,
          },
          {
            name: t("embed.fields.docs_site"),
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
