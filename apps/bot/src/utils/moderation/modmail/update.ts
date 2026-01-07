import { Message, PartialMessage } from "discord.js";
import { getOrCreateGuild, findAnyOpenThread, updateModMailMessage } from "@repo/database";

export async function handleModMailMessageUpdate(
  oldMessage: Message | PartialMessage,
  newMessage: Message | PartialMessage,
) {
  // 1. Validation: Only DM updates, ignore bots, content must actually change
  if (oldMessage.inGuild() || oldMessage.author?.bot) return;
  if (oldMessage.content === newMessage.content) return;

  // 2. Find the active thread for this user
  // We use findAnyOpenThread because in a DM, we don't know the Guild ID yet
  const thread = await findAnyOpenThread(oldMessage.author!.id);
  if (!thread) return;

  // 3. Get Guild & Config
  const guild = newMessage.client.guilds.cache.get(thread.guildId);
  if (!guild) return;

  const guildConfig = await getOrCreateGuild(thread.guildId);
  if (!guildConfig) return;

  // 4. Get the Staff Channel (Thread Channel)
  const channel = guild.channels.cache.get(thread.channelId);
  if (!channel || !channel.isTextBased()) return;

  // 5. Send "Edit" Notification to Staff
  const t = oldMessage.client.i18next.getFixedT(guildConfig.language, "events", "messageUpdate");

  // Format the notification text
  const editNotification = t("message_edit", {
    oldContent: oldMessage.content || t("errors.unknown_content"),
    newContent: newMessage.content || t("errors.unknown_content"),
  });

  await channel.send(editNotification);

  // 6. Update User's DM Reactions
  const client = newMessage.client;
  const confirmEmoji = client.allEmojis.get(client.config.emojis.confirm.id);
  const editEmoji = client.allEmojis.get(client.config.emojis.edit.id);

  try {
    if (confirmEmoji) {
      const reaction = newMessage.reactions.cache.get(confirmEmoji.id || confirmEmoji.format);
      if (reaction) await reaction.users.remove(client.user!.id);
    }

    if (editEmoji) {
      await newMessage.react(editEmoji.format);
    }
  } catch (err) {
    // Ignore reaction errors (e.g. if user blocked bot)
  }

  // 7. Sync Update to Database
  await updateModMailMessage(oldMessage.id, `**${editNotification}**`);
}
