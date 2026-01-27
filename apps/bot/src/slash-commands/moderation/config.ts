import type { SlashCommandBase } from "@types";
import { InteractionContextType, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { MiscConfigPanel } from "../../config-functions/index.js";

export default {
  memberPermissions: [PermissionsBitField.Flags.Administrator],
  data: new SlashCommandBuilder()
    .setName("config")
    .setNameLocalizations({ tr: "ayarlar" })
    .setDescription("Configure your server's settings.")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .setContexts(InteractionContextType.Guild)
    .addStringOption((option) =>
      option
        .setName("setting")
        .setDescription("The setting category you want to configure.")
        .setRequired(false)
        .addChoices(
          { name: "Register", value: "register" },
          { name: "Welcome-Leave", value: "welcomeLeave" },
          { name: "Moderation", value: "moderation" },
          { name: "Role", value: "role" },
          { name: "Misc", value: "misc" },
          { name: "Log", value: "log" },
        ),
    ),
  async execute(interaction, guildConfig) {
    const setting = interaction.options.getString("setting") || "misc";
    switch (setting) {
      case "misc":
        await new MiscConfigPanel(guildConfig, interaction.client).show(interaction, setting);
        break;
    }
  },
} as SlashCommandBase;
