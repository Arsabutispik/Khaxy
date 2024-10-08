import {
  EmbedBuilder,
  SlashCommandBuilder,
  ComponentType,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import modlog from "../../utils/modlog.js";
import { replaceMassString } from "../../utils/utils.js";
import { editInfraction } from "../../utils/infractionsHandler.js";
export default {
  help: {
    name: "editcase",
    description: "Bir cezanın sebebini değiştirir",
    usage: "editcase <id> <sebep>",
    examples: ["editcase 1 Küfür"],
    category: "Moderasyon",
  },
  data: new SlashCommandBuilder()
    .setName("editcase")
    .setNameLocalizations({
      tr: "düzenle",
    })
    .setDescription("Changes the reason of a punishment")
    .setDescriptionLocalizations({
      tr: "Bir cezanın sebebini değiştirir",
    })
    .setDMPermission(false)
    .addNumberOption((option) =>
      option.setName("id").setDescription("The ID of the punishment").setRequired(true).setDescriptionLocalizations({
        tr: "Cezanın ID'si",
      }),
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("New punishment reason").setRequired(true).setDescriptionLocalizations({
        tr: "Yeni ceza sebebi",
      }),
    ),
  execute: async ({ interaction, client }) => {
    const id = interaction.options.getNumber("id", true);
    const reason = interaction.options.getString("reason", true);
    const data = client.guildsConfig.get(interaction.guild.id);
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild))
      return interaction.reply({
        content: client.handleLanguages("EDITCASE_NO_PERMS", client, interaction.guild.id),
        ephemeral: true,
      });
    if (!data.config.modlogChannel) {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setColor("Red")
        .setDescription(client.handleLanguages("EDITCASE_NO_MODLOG", client, interaction.guild.id));
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    } else if (!interaction.guild.channels.cache.get(data.config.modlogChannel)) {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setColor("Red")
        .setDescription(client.handleLanguages("EDITCASE_NO_MODLOG_CHANNEL", client, interaction.guild.id));
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    } else if (
      !interaction.guild.channels.cache
        .get(data.config.modlogChannel)
        .permissionsFor(interaction.guild.members.me)
        .has(PermissionsBitField.Flags.SendMessages)
    ) {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setColor("Red")
        .setDescription(client.handleLanguages("EDITCASE_NO_MODLOG_PERMS", client, interaction.guild.id));
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }
    if (data.case < id || id < 1) {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setColor("Red")
        .setDescription(client.handleLanguages("EDITCASE_NO_CASE", client, interaction.guild.id));
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }
    const acceptButton = new ButtonBuilder()
      .setCustomId("accept")
      .setEmoji(client.allEmojis.get(client.config.Emojis.confirm).format)
      .setStyle(ButtonStyle.Success);
    const rejectedButton = new ButtonBuilder()
      .setCustomId("reject")
      .setEmoji(client.allEmojis.get(client.config.Emojis.reject).format)
      .setStyle(ButtonStyle.Danger);
    const row = new ActionRowBuilder().addComponents(acceptButton, rejectedButton);
    const editCaseMessage = JSON.parse(
      JSON.stringify(client.handleLanguages("EDITCASE_MESSAGE", client, interaction.guildId)),
    );
    for (const embeds of editCaseMessage.embeds) {
      const x = Math.round(0xffffff * Math.random()).toString(16);
      const y = 6 - x.length;
      const z = "000000";
      const z1 = z.substring(0, y);
      embeds.color = Number(`0x${z1 + x}`);
      embeds.description = replaceMassString(embeds.description, {
        "{confirm}": client.allEmojis.get(client.config.Emojis.confirm).format,
        "{reject}": client.allEmojis.get(client.config.Emojis.reject).format,
      });
      const oldInfractions = data.config.infractions.find((x) => x.case === id);
      let oldStaff;
      let oldReason;
      if (oldInfractions.oldInfractions?.length) {
        const lastInfraction = oldInfractions.oldInfractions[oldInfractions.oldInfractions.length - 1];
        oldStaff = interaction.guild.members.cache.get(lastInfraction.moderator) || lastInfraction.moderator;
        oldReason = lastInfraction.reason;
      } else {
        oldStaff = interaction.guild.members.cache.get(oldInfractions.moderator) || oldInfractions.moderator;
        oldReason = oldInfractions.reason;
      }
      for (const values of embeds.fields) {
        values.value = replaceMassString(values.value, {
          "{newStaff}": interaction.user.toString(),
          "{newReason}": reason,
          "{oldStaff}": oldStaff.toString(),
          "{oldReason}": oldReason,
        });
        Object.assign(embeds.fields, values);
      }
    }
    await interaction.reply({ ...editCaseMessage, components: [row] });
    const embed = new EmbedBuilder(editCaseMessage.embeds[0]);
    const msg = await interaction.fetchReply();
    const filter = (m) => (m.customId === "reject" || m.customId === "accept") && m.user.id === interaction.user.id;
    let response;
    try {
      response = await msg.awaitMessageComponent({
        filter,
        time: 300000,
        componentType: ComponentType.Button,
      });
    } catch {
      await interaction.followUp({
        content: client.handleLanguages("EDITCASE_CONFIRMATION_TIMEOVER", client, interaction.guild.id),
        ephemeral: true,
      });
      return;
    }
    switch (response.customId) {
      case "reject":
        await response.reply({
          content: client.handleLanguages("EDITCASE_CONFIRMATION_CANCEL", client, interaction.guild.id),
          ephemeral: true,
        });
        embed.setColor("Red");
        await msg.edit({ embeds: [embed] });
        break;
      case "accept":
        const infractions = data.config.infractions.find((x) => x.case === id);
        embed.setColor("Green");
        await msg.edit({ embeds: [embed], components: [] });
        await modlog(
          {
            guild: interaction.guild,
            casenumber: id,
            reason,
            actionmaker: interaction.user,
            action: "CHANGES",
            user: interaction.user,
          },
          client,
        );
        await response.reply({
          content: client.handleLanguages("EDITCASE_CONFIRMATION_SUCCESS", client, interaction.guild.id),
          ephemeral: true,
        });
        await editInfraction({
          client,
          guild: interaction.guild,
          caseNumber: id,
          reason,
          member: infractions.memberId,
          type: infractions.type,
          moderator: interaction.user.id,
        });
        break;
    }
  },
};
//# sourceMappingURL=editCase.js.map
