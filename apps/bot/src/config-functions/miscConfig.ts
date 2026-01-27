import {
  ActionRowBuilder,
  ContainerBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextDisplayBuilder,
} from "discord.js";
import { BaseConfigPanel } from "./utils.js";
import { localeFlags } from "@constants";

export class MiscConfigPanel extends BaseConfigPanel {
  override async render() {
    return new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## ${this.t(($) => $.miscConfig.language.description)}`),
      )
      .addActionRowComponents(
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          new StringSelectMenuBuilder().setCustomId("config:misc:language").addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel(localeFlags["en-GB"])
              .setValue("en-GB")
              .setEmoji("🇬🇧")
              .setDefault(this.guildData.language === "en-GB"),
            new StringSelectMenuOptionBuilder()
              .setLabel(localeFlags["tr-TR"])
              .setValue("tr-TR")
              .setEmoji("🇹🇷")
              .setDefault(this.guildData.language === "tr-TR"),
          ),
        ),
      );
  }
}
