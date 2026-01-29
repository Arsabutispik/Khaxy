import {
  ActionRowBuilder,
  ChannelSelectMenuInteraction,
  ChatInputCommandInteraction,
  Client,
  ComponentType,
  ContainerBuilder,
  MessageComponentInteraction,
  MessageFlags,
  MessageFlagsBitField,
  ModalSubmitInteraction,
  RoleSelectMenuInteraction,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  StringSelectMenuOptionBuilder,
  TextDisplayBuilder,
} from "discord.js";
import { logger } from "@lib";
import { GuildWithLogs, updateGuildConfig } from "@repo/database";
import { DbConfigKey } from "@constants";
import { TFunction } from "i18next";

export abstract class BaseConfigPanel {
  protected guildData: GuildWithLogs;
  private readonly client: Client;

  protected getTranslationFunction(client: Client) {
    return client.i18next.getFixedT(this.guildData.language, "translations", "configPanels");
  }
  constructor(guildData: GuildWithLogs, client: Client) {
    this.guildData = guildData;
    this.client = client;
    this.t = this.getTranslationFunction(client);
  }

  protected t: TFunction<"translations", "configPanels">;
  abstract render(): Promise<ContainerBuilder>;
  protected getNavigator(defaultValue: string) {
    return new ContainerBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(this.t(($) => $.navigation.prompt)))
      .addActionRowComponents(
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("config:navigation")
            .setPlaceholder(this.t(($) => $.navigation.placeholder))
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions(
              new StringSelectMenuOptionBuilder()
                .setLabel(this.t(($) => $.navigation.misc))
                .setValue("misc")
                .setEmoji("⚙️")
                .setDefault(defaultValue === "misc"),
              new StringSelectMenuOptionBuilder()
                .setLabel(this.t(($) => $.navigation.role))
                .setValue("role")
                .setEmoji("🎭")
                .setDefault(defaultValue === "role"),
              new StringSelectMenuOptionBuilder()
                .setLabel(this.t(($) => $.navigation.welcomeLeave))
                .setValue("welcomeLeave")
                .setEmoji("👋")
                .setDefault(defaultValue === "welcomeLeave"),
            ),
        ),
      );
  }
  async show(
    interaction:
      | ChatInputCommandInteraction<"cached">
      | MessageComponentInteraction<"cached">
      | ModalSubmitInteraction<"cached">,
    defaultValue: string,
  ) {
    const rendered = await this.render();
    const navigator = this.getNavigator(defaultValue);
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({
        components: [navigator, rendered],
        flags: MessageFlags.IsComponentsV2,
      });
    } else {
      await interaction.reply({
        components: [navigator, rendered],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
      });
    }
  }

  async updateAndRefresh(
    interaction:
      | ChatInputCommandInteraction<"cached">
      | MessageComponentInteraction<"cached">
      | ModalSubmitInteraction<"cached">,
    defaultValue: string,
    updates: Partial<GuildWithLogs>,
  ) {
    // Update guildData in memory
    Object.assign(this.guildData, updates);

    // Update translation function if language changed
    if ("language" in updates) {
      this.t = this.getTranslationFunction(this.client);
    }

    // Re-render the panel
    return await this.show(interaction, defaultValue);
  }
}
// --- Wait For Message Component ---
export async function waitForMessageComponent(
  interaction: ChatInputCommandInteraction<"cached"> | StringSelectMenuInteraction<"cached">,
  actionRow: ActionRowBuilder<StringSelectMenuBuilder>,
  language: string,
  customId: string,
) {
  const t = interaction.client.i18next.getFixedT(language, null, "waitForMessageComponent");
  const interactionCallbackResponse = await interaction.reply({
    content: t(($) => $.initial),
    components: [actionRow],
    flags: MessageFlagsBitField.Flags.Ephemeral,
  });

  const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id && i.customId === customId;

  return await interactionCallbackResponse
    .awaitMessageComponent({
      filter,
      time: 1000 * 60 * 5,
      componentType: ComponentType.StringSelect,
    })
    .catch(async () => {
      await interaction.editReply({ content: t(($) => $.timeout), components: [] });

      logger.log({
        level: "warn",
        message: `User ${interaction.user.tag} (${interaction.user.id}) did not respond in time for ${customId} in guild ${interaction.guild?.name} (${interaction.guildId})`,
        discord: false,
      });
      return null;
    });
}

// --- Dynamic Channel ---
export async function dynamicChannel(
  dbKey: Extract<DbConfigKey, `${string}ChannelId`>,
  interaction: ChannelSelectMenuInteraction<"cached">,
  guildData: GuildWithLogs,
  PanelClass: new (guildData: GuildWithLogs, client: Client) => BaseConfigPanel,
  defaultValue: string,
) {
  await interaction.deferUpdate();

  const newChannel = interaction.values[0];

  await updateGuildConfig(interaction.guildId, { [dbKey]: newChannel });

  const panel = new PanelClass(guildData, interaction.client);

  await panel.updateAndRefresh(interaction, defaultValue, {
    [dbKey]: newChannel,
  });
}

// --- Dynamic Message ---
export async function dynamicMessage(
  dbKey: Extract<DbConfigKey, `${string}Message`>,
  interaction: ModalSubmitInteraction<"cached">,
  guildData: GuildWithLogs,
  PanelClass: new (guildData: GuildWithLogs, client: Client) => BaseConfigPanel,
  defaultValue: string,
) {
  await interaction.deferUpdate();

  const messageValue = interaction.fields.getTextInputValue("message");
  const newValue = messageValue.trim();

  await updateGuildConfig(interaction.guildId, { [dbKey]: newValue });

  const panel = new PanelClass(guildData, interaction.client);
  await panel.updateAndRefresh(interaction, defaultValue, { [dbKey]: newValue });
}

export async function dynamicRole(
  dbKey: Extract<DbConfigKey, `${string}RoleId`> | "colourIdOfTheDay",
  interaction: RoleSelectMenuInteraction<"cached">,
  guildData: GuildWithLogs,
  PanelClass: new (guildData: GuildWithLogs, client: Client) => BaseConfigPanel,
  defaultValue: string,
) {
  await interaction.deferUpdate();
  const newRoleId = interaction.values[0] || null;

  await updateGuildConfig(interaction.guildId, { [dbKey]: newRoleId });

  const panel = new PanelClass(guildData, interaction.client);

  await panel.updateAndRefresh(interaction, defaultValue, {
    [dbKey]: newRoleId,
  });
}
