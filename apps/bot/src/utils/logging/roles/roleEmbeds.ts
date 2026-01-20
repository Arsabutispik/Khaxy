import { EmbedBuilder, Role, User } from "discord.js";
import { TFunction } from "i18next";
import { diffPermissions } from "@utils"; // Ensure this path matches your utils export

// --- Helper: Base Embed ---
function createBaseEmbed(role: Role, executor: User | null, t: TFunction<"loggers", "roleEvents">) {
  const embed = new EmbedBuilder()
    .setColor("Yellow")
    .setThumbnail(role.iconURL() ?? role.guild.iconURL() ?? null)
    .setTimestamp();

  if (executor) {
    embed.setFooter({
      text: executor.username,
      iconURL: executor.displayAvatarURL(),
    });
  } else {
    embed.setFooter({ text: t(($) => $.unknownExecutor) });
  }

  return embed;
}

// --- Helper: Get Boolean Emoji (Confirm/Reject) ---
function getBoolEmoji(role: Role, value: boolean) {
  const config = role.client.config;
  const emoji = value
    ? role.client.allEmojis.get(config.emojis.confirm.id)
    : role.client.allEmojis.get(config.emojis.reject.id);

  return emoji?.format || (value ? "✅" : "❌");
}

export function buildRoleNameEmbed(
  oldRole: Role,
  newRole: Role,
  executor: User | null,
  t: TFunction<"loggers", "roleEvents">,
) {
  return createBaseEmbed(newRole, executor, t)
    .setTitle(t(($) => $.roleUpdate.nameChange.embed.title))
    .setDescription(
      t(($) => $.roleUpdate.nameChange.embed.description, {
        role: newRole,
        old_name: oldRole.name,
        new_name: newRole.name,
      }),
    );
}

export function buildRoleColorEmbed(
  oldRole: Role,
  newRole: Role,
  executor: User | null,
  t: TFunction<"loggers", "roleEvents">,
) {
  return createBaseEmbed(newRole, executor, t)
    .setTitle(t(($) => $.roleUpdate.colorChange.embed.title))
    .setDescription(
      t(($) => $.roleUpdate.colorChange.embed.description, {
        role: newRole,
        old_color: `#${oldRole.color.toString(16).padStart(6, "0").toUpperCase()}`,
        new_color: `#${newRole.color.toString(16).padStart(6, "0").toUpperCase()}`,
      }),
    );
}

export function buildRoleHoistEmbed(
  oldRole: Role,
  newRole: Role,
  executor: User | null,
  t: TFunction<"loggers", "roleEvents">,
) {
  return createBaseEmbed(newRole, executor, t)
    .setTitle(t(($) => $.roleUpdate.hoistChange.embed.title))
    .setDescription(
      t(($) => $.roleUpdate.hoistChange.embed.description, {
        role: newRole,
        old_hoist: getBoolEmoji(oldRole, oldRole.hoist),
        new_hoist: getBoolEmoji(newRole, newRole.hoist),
      }),
    );
}

export function buildRoleMentionableEmbed(
  oldRole: Role,
  newRole: Role,
  executor: User | null,
  t: TFunction<"loggers", "roleEvents">,
) {
  return createBaseEmbed(newRole, executor, t)
    .setTitle(t(($) => $.roleUpdate.mentionableChange.embed.title))
    .setDescription(
      t(($) => $.roleUpdate.mentionableChange.embed.description, {
        role: newRole,
        old_mentionable: getBoolEmoji(oldRole, oldRole.mentionable),
        new_mentionable: getBoolEmoji(newRole, newRole.mentionable),
      }),
    );
}

export function buildRolePermissionsEmbed(
  oldRole: Role,
  newRole: Role,
  executor: User | null,
  language: string,
  t: TFunction<"loggers", "roleEvents">,
) {
  const diff = diffPermissions(newRole.client, oldRole, newRole, language);
  // If diff is empty for some reason, don't build embed
  if (!diff) return null;

  return createBaseEmbed(newRole, executor, t)
    .setTitle(t(($) => $.roleUpdate.permissionsChange.embed.title))
    .setDescription(
      t(($) => $.roleUpdate.permissionsChange.embed.description, {
        role: newRole,
        changes: diff,
      }),
    );
}

export function buildRoleIconEmbed(
  oldRole: Role,
  newRole: Role,
  executor: User | null,
  t: TFunction<"loggers", "roleEvents">,
) {
  return createBaseEmbed(newRole, executor, t)
    .setTitle(t(($) => $.roleUpdate.iconChange.embed.title))
    .setDescription(
      t(($) => $.roleUpdate.iconChange.embed.description, {
        role: newRole,
        old_icon: oldRole.iconURL() ?? "N/A",
        new_icon: newRole.iconURL() ?? "N/A",
      }),
    );
}
