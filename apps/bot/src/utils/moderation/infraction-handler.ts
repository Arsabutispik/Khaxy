import type { infractionParameters } from "src/types/index.js";
import { createInfraction, getGuildConfig, deleteInfraction, updateInfraction } from "src/database/index.js";

export async function addInfraction({ guild, member, reason, type, moderator }: infractionParameters) {
  const guildConfig = await getGuildConfig(guild.id);
  if (!guildConfig) return;
  await createInfraction({
    guild_id: BigInt(guild.id),
    user_id: BigInt(member),
    moderator_id: BigInt(moderator),
    reason,
    case_id: guildConfig.case_id,
    type,
    created_at: new Date(),
  });
}

export async function removeInfraction({ guild, case_id }: infractionParameters & { case_id: number }) {
  await deleteInfraction(guild.id, case_id);
}

export async function editInfraction({
  guild,
  case_id,
  reason,
}: infractionParameters & { case_id: number; reason: string }) {
  await updateInfraction(guild.id, case_id, {
    reason,
  });
}
