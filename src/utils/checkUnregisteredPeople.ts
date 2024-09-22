import { KhaxyClient } from "../../@types/types";
import guildSchema from "../schemas/guildSchema.js";
import { handleErrors } from "./utils.js";
import modlog from "./modlog.js";
import cronjobsSchema from "../schemas/cronjobsSchema.js";
import { DateTime } from "luxon";
export default async (client: KhaxyClient) => {
  const guilds = await guildSchema.find();
  for (const guildConfig of guilds) {
    const guild = client.guilds.cache.get(guildConfig.guildID);
    if (!guild) continue;
    if (!guild.members.me!.permissions.has("ManageRoles")) continue;
    if (!guildConfig.config) continue;
    if (!guildConfig.config.registerChannel) continue;
    if (!guild.channels.cache.get(guildConfig.config.registerChannel)) continue;
    if (!guildConfig.config.memberRole) continue;
    if (!guild.roles.cache.get(guildConfig.config.memberRole)) continue;
    try {
      const members = await guild.members.fetch();
      members.filter(async (member) => {
        if (member.user.bot) return;
        if (member.roles.cache.has(guildConfig.config?.memberRole || "0")) return;
        if (member.joinedTimestamp! < Date.now() - 1000 * 60 * 60 * 24 * (guildConfig.config?.daysToKick || 7)) {
          if (!member.kickable) return;
          member
            .send(
              client
                .handleLanguages("MEMBER_FAILED_TO_REGISTER_DM", client, guild.id)
                .replace("{days}", guildConfig.config?.daysToKick.toString() || "7"),
            )
            .catch(() => {});
          member
            .kick(
              client
                .handleLanguages("MEMBER_FAILED_TO_REGISTER", client, guild.id)
                .replace("{days}", guildConfig.config?.daysToKick.toString() || "7"),
            )
            .catch(() => {});
          await modlog(
            {
              guild,
              action: "KICK",
              user: member.user,
              actionmaker: client.user!,
              reason: client
                .handleLanguages("MEMBER_FAILED_TO_REGISTER", client, guild.id)
                .replace("{days}", guildConfig.config?.daysToKick.toString() || "7"),
            },
            client,
          );
        }
      });
      await cronjobsSchema.findOneAndUpdate(
        { guildID: guild.id },
        {
          $pull: {
            cronjobs: {
              name: "unregisteredPeople",
            },
          },
        },
      );
      await cronjobsSchema.findOneAndUpdate(
        { guildID: guild.id },
        {
          $push: {
            cronjobs: {
              name: "unregisteredPeople",
              time: DateTime.now().plus({ days: 1 }).toJSDate(),
            },
          },
        },
      );
    } catch (e) {
      await handleErrors(client, e, "checkUnregisteredPeople");
    }
  }
};
