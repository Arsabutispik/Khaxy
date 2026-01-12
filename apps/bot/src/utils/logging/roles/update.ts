import { AuditLogEvent, ChannelType, EmbedBuilder, Role, User } from "discord.js";
import { GuildWithLogs } from "@repo/database";
import { returnWebhook, WebhookType } from "@utils";
import { logger } from "@lib";
import * as Embeds from "./roleEmbeds.js";

export async function logRoleUpdate(oldRole: Role, newRole: Role, guildConfig: GuildWithLogs) {
  // 1. Validation
  // Discord logic: If position changes, it fires update. We ignore pure position changes here.
  if (oldRole.rawPosition !== newRole.rawPosition) return;

  if (!guildConfig.logConfig?.roleLogsChannelId) return;

  const logChannel = await newRole.guild.channels.fetch(guildConfig.logConfig.roleLogsChannelId).catch(() => null);

  if (logChannel?.type !== ChannelType.GuildText) return;

  // 2. Fetch Executor (Audit Log)
  let executor: User | null = null;
  const auditLogs = await newRole.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.RoleUpdate }).catch(() => null);

  const logEntry = auditLogs?.entries.first();
  if (logEntry && logEntry.target?.id === newRole.id) {
    executor = logEntry.executor as User;
  }

  // 3. Prepare Webhook & Translation
  const webhook = await returnWebhook(newRole.client, logChannel, newRole.guild.id, guildConfig, {
    id: guildConfig.logConfig.roleLogsWebhookId,
    type: WebhookType.ROLE_LOGS,
  });

  if (!webhook) return;

  const t = newRole.client.i18next.getFixedT(guildConfig.language, "events", "roleUpdate");
  const embeds: EmbedBuilder[] = [];

  // 4. Check for changes and build embeds
  // Name
  if (oldRole.name !== newRole.name) {
    embeds.push(Embeds.buildRoleNameEmbed(oldRole, newRole, executor, t));
  }

  // Color
  if (oldRole.color !== newRole.color) {
    embeds.push(Embeds.buildRoleColorEmbed(oldRole, newRole, executor, t));
  }

  // Hoist (Display separately)
  if (oldRole.hoist !== newRole.hoist) {
    embeds.push(Embeds.buildRoleHoistEmbed(oldRole, newRole, executor, t));
  }

  // Mentionable
  if (oldRole.mentionable !== newRole.mentionable) {
    embeds.push(Embeds.buildRoleMentionableEmbed(oldRole, newRole, executor, t));
  }

  // Permissions (Heavy comparison)
  // We compare the raw bitfields first for performance
  if (!oldRole.permissions.equals(newRole.permissions)) {
    const permEmbed = Embeds.buildRolePermissionsEmbed(oldRole, newRole, executor, guildConfig.language, t);
    if (permEmbed) embeds.push(permEmbed);
  }

  // Icon
  if (oldRole.icon !== newRole.icon) {
    embeds.push(Embeds.buildRoleIconEmbed(oldRole, newRole, executor, t));
  }

  // 5. Send
  if (embeds.length > 0) {
    // Discord allows up to 10 embeds per message. This logic typically produces 1-3.
    await webhook.send({ embeds }).catch((error) => {
      logger.log({
        level: "error",
        error,
        message: `Failed to send roleUpdate embed(s) in ${newRole.guild.name}`,
        channelId: logChannel.id,
      });
    });
  }
}
