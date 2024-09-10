import guildSchema from "../schemas/guildSchema.js";
import ntc from "../utils/ntc.js";
import cronjobsSchema from "../schemas/cronjobsSchema.js";
import { DateTime } from "luxon";
export default async (client) => {
  const guilds = await guildSchema.find();
  for (const guildConfig of guilds) {
    const guild = client.guilds.cache.get(guildConfig.guildID);
    if (!guild) continue;
    if (!guild.members.me.permissions.has("ManageRoles")) continue;
    if (!guildConfig.config) continue;
    if (!guildConfig.config.roleOfTheDay) continue;
    const role = guild.roles.cache.get(guildConfig.config.roleOfTheDay);
    if (!role) continue;
    if (role.position >= guild.members.me.roles.highest.position) continue;
    const name = role.name.replace(guildConfig.config.colorName, "");
    const x = Math.round(0xffffff * Math.random()).toString(16);
    const y = 6 - x.length;
    const z = "000000";
    const z1 = z.substring(0, y);
    const color = `#${z1 + x}`;
    const result = ntc.name(color);
    const colorName = result[1];
    try {
      await guildConfig.updateOne({
        $set: {
          "config.colorName": colorName,
        },
      });
      await role.edit({
        name: `${name}${colorName}`,
        color: color,
        reason: "Role of the day!",
      });
      await cronjobsSchema.findOneAndUpdate(
        { guildID: guild.id },
        {
          $pull: {
            cronjobs: {
              name: "colorCron",
            },
          },
        },
      );
      await cronjobsSchema.findOneAndUpdate(
        { guildID: guild.id },
        {
          $push: {
            cronjobs: {
              name: "colorCron",
              time: DateTime.now().plus({ days: 1 }).toJSDate(),
            },
          },
        },
      );
    } catch (e) {
      console.error(e);
    }
  }
};
async function specificGuildColorUpdate(client, guildId) {
  const guildConfig = await guildSchema.findOne({ guildID: guildId });
  if (!guildConfig) return;
  const guild = client.guilds.cache.get(guildConfig.guildID);
  if (!guild) return;
  if (!guild.members.me.permissions.has("ManageRoles")) return;
  if (!guildConfig.config) return;
  if (!guildConfig.config.roleOfTheDay) return;
  const role = guild.roles.cache.get(guildConfig.config.roleOfTheDay);
  if (!role) return;
  if (role.position >= guild.members.me.roles.highest.position) return;
  const name = role.name.replace(guildConfig.config.colorName, "");
  const x = Math.round(0xffffff * Math.random()).toString(16);
  const y = 6 - x.length;
  const z = "000000";
  const z1 = z.substring(0, y);
  const color = `#${z1 + x}`;
  const result = ntc.name(color);
  const colorName = result[1];
  try {
    await guildConfig.updateOne({
      $set: {
        "config.colorName": colorName,
      },
    });
    await role.edit({
      name: `${name}${colorName}`,
      color: color,
      reason: "Role of the day!",
    });
    await cronjobsSchema.findOneAndUpdate(
      { guildID: guild.id },
      {
        $pull: {
          cronjobs: {
            name: "colorCron",
          },
        },
      },
    );
    await cronjobsSchema.findOneAndUpdate(
      { guildID: guild.id },
      {
        $push: {
          cronjobs: {
            name: "colorCron",
            time: DateTime.now().plus({ days: 1 }).toJSDate(),
          },
        },
      },
    );
  } catch (e) {
    console.error(e);
  }
}
export { specificGuildColorUpdate };
//# sourceMappingURL=colorOfTheDay.js.map
