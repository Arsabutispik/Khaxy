import { EmbedBuilder, Role, User } from "discord.js";
import { TFunction } from "i18next";
import { diffPermissions } from "@utils"; // Ensure this path matches your utils export

// --- Helper: Base Embed ---
function createBaseEmbed(role: Role, executor: User | null, t: TFunction) {
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
    embed.setFooter({ text: t("unknown_executor") });
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

export function buildRoleNameEmbed(oldRole: Role, newRole: Role, executor: User | null, t: TFunction) {
  return createBaseEmbed(newRole, executor, t)
    .setTitle(t("name_change.embed.title"))
    .setDescription(
      t("name_change.embed.description", {
        role: newRole,
        old_name: oldRole.name,
        new_name: newRole.name,
      }),
    );
}

export function buildRoleColorEmbed(oldRole: Role, newRole: Role, executor: User | null, t: TFunction) {
  return createBaseEmbed(newRole, executor, t)
    .setTitle(t("color_change.embed.title"))
    .setDescription(
      t("color_change.embed.description", {
        role: newRole,
        old_color: `#${oldRole.color.toString(16).padStart(6, "0").toUpperCase()}`,
        new_color: `#${newRole.color.toString(16).padStart(6, "0").toUpperCase()}`,
      }),
    );
}

export function buildRoleHoistEmbed(oldRole: Role, newRole: Role, executor: User | null, t: TFunction) {
  return createBaseEmbed(newRole, executor, t)
    .setTitle(t("hoist_change.embed.title"))
    .setDescription(
      t("hoist_change.embed.description", {
        role: newRole,
        old_hoist: getBoolEmoji(oldRole, oldRole.hoist),
        new_hoist: getBoolEmoji(newRole, newRole.hoist),
      }),
    );
}

export function buildRoleMentionableEmbed(oldRole: Role, newRole: Role, executor: User | null, t: TFunction) {
  return createBaseEmbed(newRole, executor, t)
    .setTitle(t("mentionable_change.embed.title"))
    .setDescription(
      t("mentionable_change.embed.description", {
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
  t: TFunction,
) {
  const diff = diffPermissions(newRole.client, oldRole, newRole, language);
  // If diff is empty for some reason, don't build embed
  if (!diff) return null;

  return createBaseEmbed(newRole, executor, t)
    .setTitle(t("permissions_change.embed.title"))
    .setDescription(
      t("permissions_change.embed.description", {
        role: newRole,
        changes: diff,
      }),
    );
}

export function buildRoleIconEmbed(oldRole: Role, newRole: Role, executor: User | null, t: TFunction) {
  return createBaseEmbed(newRole, executor, t)
    .setTitle(t("icon_change.embed.title"))
    .setDescription(
      t("icon_change.embed.description", {
        role: newRole,
        old_icon: oldRole.iconURL() ?? "N/A",
        new_icon: newRole.iconURL() ?? "N/A",
      }),
    );
}
