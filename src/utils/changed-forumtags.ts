import { GuildForumTag, GuildForumTagEmoji } from "discord.js";

type TagChangeValue = {
  old: string | boolean | null | GuildForumTagEmoji;
  new: string | boolean | null | GuildForumTagEmoji;
};

type TagChanges = {
  added: GuildForumTag[];
  removed: GuildForumTag[];
  updated: {
    id: string;
    changes: Record<string, TagChangeValue>;
  }[];
};

function diffGuildForumTags(oldTags: GuildForumTag[], newTags: GuildForumTag[]): TagChanges {
  const added = newTags.filter((n) => !oldTags.some((o) => o.id === n.id));
  const removed = oldTags.filter((o) => !newTags.some((n) => n.id === o.id));
  const updated: TagChanges["updated"] = [];

  for (const newTag of newTags) {
    const oldTag = oldTags.find((o) => o.id === newTag.id);
    if (!oldTag) continue;

    const changes: Record<string, TagChangeValue> = {};

    const fields: (keyof GuildForumTag)[] = ["name", "moderated", "emoji"];
    for (const key of fields) {
      const oldVal = oldTag[key];
      const newVal = newTag[key];

      if (key === "emoji") {
        // Merge emoji.id and emoji.name into a single value
        if (
          (oldVal as GuildForumTagEmoji | null)?.id !== (newVal as GuildForumTagEmoji | null)?.id ||
          (oldVal as GuildForumTagEmoji | null)?.name !== (newVal as GuildForumTagEmoji | null)?.name
        ) {
          changes[key] = { old: oldVal ?? null, new: newVal ?? null };
        }
      } else if (oldVal !== newVal) {
        changes[key] = { old: oldVal ?? null, new: newVal ?? null };
      }
    }

    if (Object.keys(changes).length > 0) {
      updated.push({ id: newTag.id, changes });
    }
  }

  return { added, removed, updated };
}

export { diffGuildForumTags };
