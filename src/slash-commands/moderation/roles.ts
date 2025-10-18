import { SlashCommandBase } from "@customTypes";
import { MessageFlags, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { getGuildConfig } from "@database";
import { logger } from "@lib";

export default {
  memberPermissions: [PermissionsBitField.Flags.ManageRoles],
  clientPermissions: [PermissionsBitField.Flags.ManageRoles],
  data: new SlashCommandBuilder()
    .setName("roles")
    .setNameLocalizations({
      tr: "roller",
    })
    .setDescription("Add or remove roles from a user")
    .setDescriptionLocalizations({
      tr: "Bir kullanıcıdan rol ekleyin veya kaldırın",
    })
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setNameLocalizations({
          tr: "ekle",
        })
        .setDescription("Add a role to a user")
        .setDescriptionLocalizations({
          tr: "Bir kullanıcıya rol ekle",
        })
        .addUserOption((option) =>
          option
            .setName("user")
            .setNameLocalizations({
              tr: "kullanıcı",
            })
            .setDescription("The user to add the role to")
            .setDescriptionLocalizations({
              tr: "Rol eklenecek kullanıcı",
            })
            .setRequired(true),
        )
        .addRoleOption((option) =>
          option
            .setName("role")
            .setNameLocalizations({
              tr: "rol",
            })
            .setDescription("The role to add")
            .setDescriptionLocalizations({
              tr: "Eklenecek rol",
            })
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setNameLocalizations({
          tr: "kaldır",
        })
        .setDescription("Remove a role from a user")
        .setDescriptionLocalizations({
          tr: "Bir kullanıcıdan rol kaldır",
        })
        .addUserOption((option) =>
          option
            .setName("user")
            .setNameLocalizations({
              tr: "kullanıcı",
            })
            .setDescription("The user to remove the role from")
            .setDescriptionLocalizations({
              tr: "Rol kaldırılacak kullanıcı",
            })
            .setRequired(true),
        )
        .addRoleOption((option) =>
          option
            .setName("role")
            .setNameLocalizations({
              tr: "rol",
            })
            .setDescription("The role to remove")
            .setDescriptionLocalizations({
              tr: "Kaldırılacak rol",
            })
            .setRequired(true),
        ),
    ),
  async execute(interaction) {
    const guildConfig = await getGuildConfig(interaction.guildId);
    if (!guildConfig) {
      await interaction.reply({
        content: "Guild configuration not found.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const t = interaction.client.i18next.getFixedT(guildConfig.language, "commands", "roles");

    const subcommand = interaction.options.getSubcommand();
    const member = interaction.options.getMember("user");
    const role = interaction.options.getRole("role", true);
    if (!member || !interaction.guild?.members.cache.has(member.id)) {
      await interaction.reply({
        content: t("user_not_found"),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    if (subcommand === "add") {
      if (member.roles.cache.has(role.id)) {
        await interaction.reply({
          content: t("role_already_assigned", { user: member.user.tag, role: role.name }),
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      await member.roles.add(role).catch(async (error) => {
        logger.log({
          level: "error",
          error,
          message: `Failed to add role ${role.id} to user ${member.user.id} in guild ${interaction.guild.name} (${interaction.guildId})`,
        });
        await interaction.reply({
          content: t("role_add_error"),
          flags: MessageFlags.Ephemeral,
        });
      });
      await interaction.reply({
        content: t("role_added", { user: member.user.tag, role: role.name }),
      });
    } else if (subcommand === "remove") {
      if (!member.roles.cache.has(role.id)) {
        await interaction.reply({
          content: t("role_not_assigned", { user: member.user.tag, role: role.name }),
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      await member.roles.remove(role).catch(async (error) => {
        await interaction.reply({
          content: t("role_remove_error", { error: error.message }),
          flags: MessageFlags.Ephemeral,
        });
      });

      await interaction.reply({
        content: t("role_removed", { user: member.user.tag, role: role.name }),
      });
    }
  },
} as SlashCommandBase;
