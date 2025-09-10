import { Client, GuildChannel, Role, PermissionOverwriteManager, PermissionsBitField } from "discord.js";
import { TFunction } from "i18next";

// Map channel overwrites into a simpler object
function mapOverwrites(overwrites: PermissionOverwriteManager) {
  return Object.fromEntries(
    overwrites.cache.map((po) => [`${po.type}-${po.id}`, { allow: po.allow.bitfield, deny: po.deny.bitfield }]),
  );
}

// Diff role permissions
function diffRole(oldRole: Role, newRole: Role, t: TFunction): string | null {
  const oldPerms = new PermissionsBitField(oldRole.permissions.bitfield);
  const newPerms = new PermissionsBitField(newRole.permissions.bitfield);

  const added: string[] = [];
  const removed: string[] = [];

  for (const [permName, permValue] of Object.entries(PermissionsBitField.Flags)) {
    const translatedName = t(`permissions.${permName}`) || permName;

    const had = oldPerms.has(permValue);
    const hasNow = newPerms.has(permValue);

    if (!had && hasNow) added.push(translatedName);
    if (had && !hasNow) removed.push(translatedName);
  }

  if (!added.length && !removed.length) return null;

  let diffText = `**${newRole.name}** (Role Permissions)\n\`\`\`diff\n`;
  if (added.length) diffText += `+ ${t("allowed")}: ${added.join(", ")}\n`;
  if (removed.length) diffText += `- ${t("removed")}: ${removed.join(", ")}\n`;
  diffText += `\`\`\`\n`;

  return diffText;
}

// Diff channel permission overwrites
function diffChannelOverwrites(oldChannel: GuildChannel, newChannel: GuildChannel, t: TFunction): string | null {
  const oldMap = mapOverwrites(oldChannel.permissionOverwrites);
  const newMap = mapOverwrites(newChannel.permissionOverwrites);

  let diffText = "";
  const allKeys = new Set([...Object.keys(oldMap), ...Object.keys(newMap)]);

  for (const key of allKeys) {
    const old = oldMap[key] || { allow: 0n, deny: 0n };
    const now = newMap[key] || { allow: 0n, deny: 0n };

    if (old.allow === now.allow && old.deny === now.deny) continue;

    const [type, id] = key.split("-");
    const mention = type === "role" ? `<@&${id}>` : `<@${id}>`;

    const addedAllowed: string[] = [];
    const removedDenied: string[] = [];
    const unset: string[] = [];

    const oldAllow = new PermissionsBitField(old.allow);
    const newAllow = new PermissionsBitField(now.allow);
    const oldDeny = new PermissionsBitField(old.deny);
    const newDeny = new PermissionsBitField(now.deny);

    for (const [permName, permValue] of Object.entries(PermissionsBitField.Flags)) {
      const translatedName = t(`permissions.${permName}`) || permName;

      const wasAllowed = oldAllow.has(permValue);
      const isAllowed = newAllow.has(permValue);
      const wasDenied = oldDeny.has(permValue);
      const isDenied = newDeny.has(permValue);

      if (!wasAllowed && isAllowed) addedAllowed.push(translatedName);
      if (!wasDenied && isDenied) removedDenied.push(translatedName);
      if ((wasAllowed || wasDenied) && !isAllowed && !isDenied) unset.push(translatedName);
    }

    if (addedAllowed.length || removedDenied.length || unset.length) {
      diffText += `**${mention}** (Channel Overwrites)\n\`\`\`diff\n`;
      if (addedAllowed.length) diffText += `+ ${t("allowed")}: ${addedAllowed.join(", ")}\n`;
      if (removedDenied.length) diffText += `- ${t("denied")}: ${removedDenied.join(", ")}\n`;
      if (unset.length) diffText += `/ ${t("unset")}: ${unset.join(", ")}\n`;
      diffText += `\`\`\`\n`;
    }
  }

  return diffText || null;
}

// Unified function
export function diffPermissions(
  client: Client,
  oldEntity: Role | GuildChannel,
  newEntity: Role | GuildChannel,
  locale: string,
): string | null {
  const t = client.i18next.getFixedT(locale, "permissions");

  if ("permissions" in oldEntity && "permissions" in newEntity) {
    // Role permissions
    return diffRole(oldEntity as Role, newEntity as Role, t);
  } else if ("permissionOverwrites" in oldEntity && "permissionOverwrites" in newEntity) {
    // Channel overwrites
    return diffChannelOverwrites(oldEntity as GuildChannel, newEntity as GuildChannel, t);
  }

  return null;
}
