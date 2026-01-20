import type { SlashCommandBase } from "@types";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ComponentType,
  PermissionsBitField,
  SlashCommandBuilder,
  InteractionContextType,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { logger, modMailLog } from "@lib";
import {
  getThreadByChannelId,
  scheduleThreadClose,
  addMessageToThread,
  ModMailAuthorType,
  ModMailSentToType,
  closeThread,
  GuildWithLogs,
  ModMailThread,
} from "@repo/database";
import { TFunction } from "i18next";

dayjs.extend(duration);
dayjs.extend(relativeTime);

export default {
  memberPermissions: [PermissionsBitField.Flags.ModerateMembers],
  clientPermissions: [PermissionsBitField.Flags.ManageChannels],
  data: new SlashCommandBuilder()
    .setName("close")
    .setNameLocalizations({ tr: "kapat" })
    .setDescription("Close the mod mail thread")
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers)
    .addNumberOption((opt) => opt.setName("duration").setMinValue(1).setMaxValue(99))
    .addStringOption((opt) =>
      opt
        .setName("time")
        .addChoices(
          { name: "Minute(s)", value: "minute" },
          { name: "Hour(s)", value: "hour" },
          { name: "Day(s)", value: "day" },
        ),
    ),

  async execute(interaction: ChatInputCommandInteraction, guildConfig) {
    const { client, channel, channelId, user: moderator } = interaction;
    const t = client.i18next.getFixedT(guildConfig.language, "commands", "close");

    if (channel?.type !== ChannelType.GuildText) return interaction.reply(t(($) => $.noThread));

    const thread = await getThreadByChannelId(channelId);
    if (!thread) return interaction.reply(t(($) => $.noThread));

    // 1. Handle Existing Scheduled Close (Interruption)
    if (thread.scheduledCloseAt) {
      const confirmed = await handleExistingSchedule(interaction, thread.scheduledCloseAt, t, guildConfig.language);
      if (!confirmed) {
        const cancelMessage = t(($) => $.threadCloseDate);
        if (!interaction.deferred && !interaction.replied) {
          await interaction.reply({ content: cancelMessage, flags: MessageFlags.Ephemeral });
        } else {
          await interaction.followUp({ content: cancelMessage, flags: MessageFlags.Ephemeral });
        }
        return; // User rejected or timed out
      }
    }

    const durationVal = interaction.options.getNumber("duration");
    const unit = interaction.options.getString("time");

    // 2. Scheduled Close Flow
    if (durationVal || unit) {
      if (!durationVal || !unit) return interaction.reply(t(($) => $.noDuration));

      const closeDate = dayjs().add(dayjs.duration(durationVal, unit as any));
      const longDuration = closeDate.locale(guildConfig.language || "en").fromNow(true);

      try {
        await scheduleThreadClose(channelId, closeDate.toDate(), moderator.id);

        const content = t(($) => $.closeDuration, { duration: longDuration });
        await interaction.reply({ content });

        await addMessageToThread(
          channelId,
          content,
          moderator.id,
          ModMailAuthorType.SYSTEM,
          ModMailSentToType.THREAD,
          interaction.id,
        );
      } catch (error) {
        logger.error({ message: "Error scheduling close", error });
        await interaction.reply(t(($) => $.error));
      }
      return;
    }

    // 3. Immediate Close Flow
    await performImmediateClose(interaction, thread, guildConfig, t);
  },
} as SlashCommandBase;

/**
 * Handles the confirmation buttons if a thread is already scheduled to close.
 */
async function handleExistingSchedule(
  interaction: ChatInputCommandInteraction,
  date: Date,
  t: TFunction<"commands", "close">,
  lang: string,
): Promise<boolean> {
  const timeStr = dayjs(date)
    .locale(lang || "en")
    .fromNow(true);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("accept")
      .setLabel(t(($) => $.accept))
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("reject")
      .setLabel(t(($) => $.reject))
      .setStyle(ButtonStyle.Danger),
  );

  const response = await interaction.reply({
    content: t(($) => $.threadCloseDate, { date: timeStr }),
    components: [row],
    withResponse: true,
  });

  try {
    const component = await response.resource!.message!.awaitMessageComponent({
      filter: (i) => i.user.id === interaction.user.id,
      time: 30000,
      componentType: ComponentType.Button,
    });

    if (component.customId === "reject") {
      await component.update({ content: t(($) => $.threadCloseDateRejected), components: [] });
      return false;
    }

    await component.update({ content: t(($) => $.threadCloseDateAccepted), components: [] });
    return true;
  } catch {
    await interaction.editReply({ content: t(($) => $.timeout), components: [] });
    return false;
  }
}

/**
 * Finalizes the thread: logs, DMs the user, and deletes the channel.
 */
async function performImmediateClose(
  interaction: ChatInputCommandInteraction,
  thread: ModMailThread,
  config: GuildWithLogs,
  t: TFunction<"commands", "close">,
) {
  const { guild, channel, channelId, user: moderator, client } = interaction;

  try {
    await closeThread(channelId, moderator.id);

    const replyContent = t(($) => $.close);
    if (interaction.replied || interaction.deferred) await interaction.followUp(replyContent);
    else await interaction.reply(replyContent);

    // DM the user
    const targetUser = await client.users.fetch(thread.userId).catch(() => null);
    if (targetUser) {
      await targetUser.send(t(($) => $.threadClosedDm, { guild: guild!.name })).catch(() => null);
    }

    // System Log entry
    await addMessageToThread(
      channelId,
      replyContent,
      moderator.id,
      ModMailAuthorType.SYSTEM,
      ModMailSentToType.THREAD,
      interaction.id,
    );

    // ModMail Log (The modular logic we refactored earlier)
    if (config.modMailChannelId) {
      await modMailLog(client, channel as any, targetUser, moderator);
    }

    // Delete Channel
    await channel?.delete().catch((err) => logger.error({ message: "Failed to delete modmail channel", error: err }));
  } catch (error) {
    logger.error({ message: "Error during immediate close", error });
    if (!interaction.replied) await interaction.reply(t(($) => $.error));
  }
}
