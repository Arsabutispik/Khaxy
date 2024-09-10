import { slashCommandBase } from "../../../@types/types";
import { PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { handleErrors } from "../../utils/utils.js";

export default {
  data: new SlashCommandBuilder()
    .setName("snippets")
    .setNameLocalizations({
      tr: "snippetler",
    })
    .setDescription("Manage snippets that are used as a quick response to the modmail messages.")
    .setDescriptionLocalizations({
      tr: "Modmail mesajlarına hızlı yanıt olarak kullanılan snippetleri yönetin.",
    })
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
    .setContexts([0])
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setNameLocalizations({
          tr: "ekle",
        })
        .setDescription("Add a new snippet.")
        .setDescriptionLocalizations({
          tr: "Yeni bir snippet ekleyin.",
        })
        .addStringOption((option) =>
          option
            .setName("name")
            .setNameLocalizations({
              tr: "isim",
            })
            .setDescription("Name of the snippet.")
            .setDescriptionLocalizations({
              tr: "Snippetin adı.",
            })
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("content")
            .setNameLocalizations({
              tr: "içerik",
            })
            .setDescription("Content of the snippet.")
            .setDescriptionLocalizations({
              tr: "Snippetin içeriği.",
            })
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setNameLocalizations({
          tr: "sil",
        })
        .setDescription("Remove a snippet.")
        .setDescriptionLocalizations({
          tr: "Bir snippeti silin.",
        })
        .addStringOption((option) =>
          option
            .setName("name")
            .setNameLocalizations({
              tr: "isim",
            })
            .setDescription("Name of the snippet.")
            .setDescriptionLocalizations({
              tr: "Snippetin adı.",
            })
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("find")
        .setNameLocalizations({
          tr: "bul",
        })
        .setDescription("Find a snippet.")
        .setDescriptionLocalizations({
          tr: "Bir snippeti bulun.",
        })
        .addStringOption((option) =>
          option
            .setName("name")
            .setNameLocalizations({
              tr: "isim",
            })
            .setDescription("Name of the snippet.")
            .setDescriptionLocalizations({
              tr: "Snippetin adı.",
            })
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("list")
        .setNameLocalizations({
          tr: "liste",
        })
        .setDescription("List all snippets.")
        .setDescriptionLocalizations({
          tr: "Tüm snippetleri listeler.",
        }),
    ),
  async execute({ interaction, client }) {
    const subcommand = interaction.options.getSubcommand() as "add" | "remove" | "find" | "list";
    if (subcommand === "add") {
      const name = interaction.options.getString("name", true);
      const content = interaction.options.getString("content", true);
      // Add the snippet to the database
      try {
        await client.updateGuildConfig({
          guildId: interaction.guildId!,
          config: {
            $push: {
              "config.modmail.snippets": {
                name,
                message: content,
              },
            },
          },
        });
        await interaction.reply(`Snippet added: ${name}`);
      } catch (error) {
        await handleErrors(client, error, "snippets.ts", interaction);
      }
    } else if (subcommand === "remove") {
      const name = interaction.options.getString("name", true);
      // Remove the snippet from the database
      try {
        await client.updateGuildConfig({
          guildId: interaction.guildId!,
          config: {
            $pull: {
              "config.modmail.snippets": {
                name,
              },
            },
          },
        });
        await interaction.reply(`Snippet removed: ${name}`);
      } catch (error) {
        await handleErrors(client, error, "snippets.ts", interaction);
      }
    } else if (subcommand === "find") {
      const name = interaction.options.getString("name", true);
      // Find the snippet in the database
      try {
        const guildConfig = client.guildsConfig.get(interaction.guildId!);
        if (!guildConfig) return await interaction.reply("Guild config not found.");
        const config = guildConfig.config;
        const snippet = config.modmail.snippets.find((snippet: { name: string }) => snippet.name === name);
        if (!snippet) return await interaction.reply("Snippet not found.");
        await interaction.reply(`Snippet found: \`\`\`${snippet.message}\`\`\``);
      } catch (error) {
        await handleErrors(client, error, "snippets.ts", interaction);
      }
    } else if (subcommand === "list") {
      // List all snippets in the database
      try {
        const guildConfig = client.guildsConfig.get(interaction.guildId!);
        if (!guildConfig) return await interaction.reply("Guild config not found.");
        const config = guildConfig.config;
        const snippets = config.modmail.snippets.map((snippet: { name: string }) => snippet.name);
        await interaction.reply(`Snippets: \`\`\`${snippets.join(", ")}\`\`\``);
      } catch (error) {
        await handleErrors(client, error, "snippets.ts", interaction);
      }
    }
  },
} as slashCommandBase;
