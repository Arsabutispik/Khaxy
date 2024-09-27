export async function addInfraction(p) {
  const { guild, member, moderator, reason, type, client } = p;
  const guildConfig = client.guildsConfig.get(guild.id);
  if (!guildConfig) return;
  const caseNumber = guildConfig.case - 1;
  const infraction = {
    case: caseNumber,
    moderator: moderator,
    reason,
    type,
    memberId: member,
    date: new Date(),
  };
  await client.updateGuildConfig({
    guildId: guild.id,
    config: {
      $push: {
        "config.infractions": infraction,
      },
    },
  });
}
export async function editInfraction(p) {
  const { guild, member, moderator, reason, type, client, caseNumber } = p;
  const guildConfig = client.guildsConfig.get(guild.id);
  if (!guildConfig) return;
  const infraction = {
    case: caseNumber,
    moderator: moderator,
    reason,
    oldInfractions: guildConfig.config.infractions.find((x) => x.case === caseNumber),
    type,
    memberId: member,
    date: new Date(),
  };
  await client.updateGuildConfig({
    guildId: guild.id,
    config: {
      $pull: {
        "config.infractions": {
          case: caseNumber,
        },
      },
    },
  });
  await client.updateGuildConfig({
    guildId: guild.id,
    config: {
      $push: {
        "config.infractions": infraction,
      },
    },
  });
}
//# sourceMappingURL=infractionsHandler.js.map
