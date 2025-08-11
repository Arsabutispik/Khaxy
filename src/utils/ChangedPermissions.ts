import { Client, GuildChannel, PermissionOverwriteManager, PermissionsBitField } from "discord.js";

function mapOverwrites(overwrites: PermissionOverwriteManager) {
  return Object.fromEntries(
    overwrites.cache.map((po) => [`${po.type}-${po.id}`, { allow: po.allow.bitfield, deny: po.deny.bitfield }]),
  );
}

export function diffOverwrites(
  client: Client,
  oldChannel: GuildChannel,
  newChannel: GuildChannel,
  locale: string,
): string | null {
  const t = client.i18next.getFixedT(locale, "permissions");

  const oldMap = mapOverwrites(oldChannel.permissionOverwrites);
  const newMap = mapOverwrites(newChannel.permissionOverwrites);

  let diffText = "";
  const allKeys = new Set([...Object.keys(oldMap), ...Object.keys(newMap)]);

  for (const key of allKeys) {
    const old = oldMap[key] || { allow: 0n, deny: 0n };
    const now = newMap[key] || { allow: 0n, deny: 0n };

    if (old.allow === now.allow && old.deny === now.deny) continue;

    const [, id] = key.split("-");
    const mention = key.startsWith("0-") ? `<@&${id}>` : `<@${id}>`;

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

      // + Allowed: permission newly allowed (was not allowed before)
      if (!wasAllowed && isAllowed) {
        addedAllowed.push(translatedName);
      }

      // - Denied: permission newly denied (was not denied before)
      if (!wasDenied && isDenied) {
        removedDenied.push(translatedName);
      }

      // :/ Unset: permission that was allowed or denied before but now is neither
      if ((wasAllowed || wasDenied) && !isAllowed && !isDenied) {
        unset.push(translatedName);
      }
    }

    if (addedAllowed.length || removedDenied.length || unset.length) {
      diffText += `**${mention}**\n\`\`\`diff\n`;

      if (addedAllowed.length) diffText += `+ ${t("allowed")}: ${addedAllowed.join(", ")}\n`;
      if (removedDenied.length) diffText += `- ${t("denied")}: ${removedDenied.join(", ")}\n`;
      if (unset.length) diffText += `/ ${t("unset")}: ${unset.join(", ")}\n`;

      diffText += `\`\`\`\n`;
    }
  }

  return diffText || null;
}
