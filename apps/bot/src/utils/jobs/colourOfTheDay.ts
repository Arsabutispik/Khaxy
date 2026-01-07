import { Client, Guild, PermissionsBitField } from "discord.js";
import type { ColorResolvable } from "discord.js";
import { ntc } from "@utils";
import dayjs from "dayjs";
import { logger } from "@lib";
import { getOrCreateGuild, getGuildConfigs, GuildWithLogs, updateGuildConfig, updateCronJob } from "@repo/database";

export async function colorUpdate(client: Client) {
  // Fetch guild configurations from the database
  const guilds = await getGuildConfigs();
  for (const guildData of guilds) {
    const guild = client.guilds.cache.get(guildData.id);
    if (!guild) continue;
    await proccesColorUpdate(guild, guildData);
  }
}

export async function specificGuildColorUpdate(client: Client, guildId: string) {
  // Fetch guild configuration for the specific guild
  const guildConfig = await getOrCreateGuild(guildId);
  if (!guildConfig) {
    logger.warn(`Guild config for ${guildId} not found.`);
    return;
  }
  const guild = client.guilds.cache.get(guildConfig.id);
  if (!guild) {
    logger.warn(`Guild ${guildConfig.id} not found.`);
    return;
  }
  await proccesColorUpdate(guild, guildConfig);
}

async function proccesColorUpdate(guild: Guild, config: GuildWithLogs) {
  const { colourIdOfTheDay, colourNameOfTheDay, id } = config;
  if (!guild.members.me) {
    logger.warn(`Bot is not in guild ${id}.`);
    return;
  }
  // Check if the bot has permission to manage roles
  if (!guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
    logger.warn(`Bot doesn't have permission to manage roles in guild ${id}.`);
    return;
  }
  if (!colourIdOfTheDay) return;
  const role = guild.roles.cache.get(colourIdOfTheDay);
  if (!role) {
    logger.warn(`Role ${colourIdOfTheDay} not found in guild ${id}.`);
    return;
  }
  // Check if the bot's highest role is higher than the target role
  if (role.position >= guild.members.me.roles.highest.position) {
    logger.warn(`Bot's highest role is lower than the target role in guild ${id}.`);
    return;
  }
  const name = role.name.replace(colourNameOfTheDay || "", "");
  // Generate a random color
  const x = Math.round(0xffffff * Math.random()).toString(16);
  const y = 6 - x.length;
  const z = "000000";
  const z1 = z.substring(0, y);
  const color = `#${z1 + x}` as ColorResolvable;
  const cresult = ntc.name(color);
  const colorName = cresult[1];
  try {
    // Update the color name in the database
    await updateGuildConfig(guild.id, {
      colourNameOfTheDay: colorName as string,
    });
    // Edit the role with the new color and name
    await role.edit({
      name: `${name}${colorName}`,
      color: color,
      reason: "Color of the day has been updated.",
    });
    // Update the color change time in the database
    await updateCronJob(guild.id, {
      colorTime: dayjs().add(1, "day").toDate(),
    });
  } catch (error) {
    logger.log({
      level: "error",
      message: "Error updating color of the day",
      error: error,
      meta: {
        guildID: id,
      },
    });
  }
}
