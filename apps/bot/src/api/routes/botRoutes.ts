import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { GuildBasedChannel, PermissionsBitField, Role } from "discord.js";
import { getOrCreateGuild, updateGuildConfig, GuildWithLogs, updateGuildLogs, Prisma } from "@repo/database";
import { logger } from "src/lib/index.js";

// Validation schemas
const guildIdParamSchema = {
  type: "object",
  properties: {
    guildId: { type: "string", pattern: "^[0-9]+$" },
  },
  required: ["guildId"],
};

const userIdHeaderSchema = {
  type: "object",
  properties: {
    "x-discord-user-id": { type: "string", pattern: "^[0-9]+$" },
  },
};

const updateSettingsBodySchema = {
  type: "object",
  additionalProperties: true,
};

// Sanitize channel to avoid circular references and large payloads
function safeChannelShape(channel: GuildBasedChannel) {
  return {
    id: channel.id,
    name: channel.name,
    type: channel.type,
    parentId: channel.parentId ?? null,
  };
}

// Sanitize role to avoid circular references and large payloads
function safeRoleShape(role: Role) {
  return {
    id: role.id,
    name: role.name,
    color: role.color,
    position: role.position,
    hoist: role.hoist,
    permissions: role.permissions.bitfield.toString(),
  };
}

export async function botRoutes(fastify: FastifyInstance) {
  // 1. Endpoint for general bot info
  fastify.get("/api/bot/status", async (_request, reply) => {
    try {
      const client = fastify.discord;
      return {
        status: "online",
        username: client.user?.username ?? null,
        guildCount: client.guilds.cache.size,
        uptime: client.uptime,
      };
    } catch (err) {
      logger.log({ level: "error", message: "Error in bot status", error: err, discord: false });
      return reply.code(500).send({ error: "Internal server error" });
    }
  });

  // 2. Check if a user is admin in a guild
  fastify.get(
    "/api/guilds/:guildId/admin",
    {
      schema: {
        params: guildIdParamSchema,
        headers: userIdHeaderSchema,
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const client = fastify.discord;
        const { guildId } = request.params as { guildId: string };
        const userId = request.headers["x-discord-user-id"];

        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
          return reply.code(404).send({ error: "Guild not found" });
        }

        if (!userId || Array.isArray(userId)) {
          return reply.code(401).send({ error: "Missing x-discord-user-id header" });
        }

        const member = await guild.members.fetch(userId).catch(() => {
          logger.log({
            level: "warn",
            message: `Failed to fetch member with ID ${userId} in guild ${guildId}`,
            discord: false,
          });
          return null;
        });

        if (!member) {
          return reply.code(404).send({ error: "Member not found in guild" });
        }

        const isAdmin =
          member.permissions.has(PermissionsBitField.Flags.Administrator) ||
          member.permissions.has(PermissionsBitField.Flags.ManageGuild);

        return { name: guild.name, guildId, isAdmin };
      } catch (err) {
        logger.log({ level: "error", message: "Error in admin check", error: err, discord: false });
        return reply.code(500).send({ error: "Internal server error" });
      }
    },
  );

  // 3. Get guild settings from DB
  fastify.get(
    "/api/guilds/:guildId/settings",
    { schema: { params: guildIdParamSchema } },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { guildId } = request.params as { guildId: string };
        const guildConfig = await getOrCreateGuild(guildId);

        if (!guildConfig) {
          return reply.code(404).send({ error: "Guild configuration not found" });
        }

        return { guildId, settings: guildConfig };
      } catch (err) {
        logger.log({ level: "error", message: "Error fetching guild settings", error: err, discord: false });
        return reply.code(500).send({ error: "Internal server error" });
      }
    },
  );

  // 4. List channels (sanitized)
  fastify.get(
    "/api/guilds/:guildId/channels",
    { schema: { params: guildIdParamSchema } },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const client = fastify.discord;
        const { guildId } = request.params as { guildId: string };
        const guild = client.guilds.cache.get(guildId);

        if (!guild) {
          return reply.code(404).send({ error: "Guild not found" });
        }

        const channels = guild.channels.cache.map((channel) => safeChannelShape(channel));
        return { guildId, channels };
      } catch (err) {
        logger.log({ level: "error", message: "Error listing channels", error: err, discord: false });
        return reply.code(500).send({ error: "Internal server error" });
      }
    },
  );

  // 5. List roles (sanitized)
  fastify.get(
    "/api/guilds/:guildId/roles",
    { schema: { params: guildIdParamSchema } },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const client = fastify.discord;
        const { guildId } = request.params as { guildId: string };
        const guild = client.guilds.cache.get(guildId);

        if (!guild) {
          return reply.code(404).send({ error: "Guild not found" });
        }

        const roles = guild.roles.cache.map((role) => safeRoleShape(role));
        return { guildId, roles };
      } catch (err) {
        logger.log({ level: "error", message: "Error listing roles", error: err, discord: false });
        return reply.code(500).send({ error: "Internal server error" });
      }
    },
  );

  // 6. Update guild settings
  fastify.post(
    "/api/guilds/:guildId/settings",
    {
      schema: {
        params: guildIdParamSchema,
        body: updateSettingsBodySchema,
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { guildId } = request.params as { guildId: string };
        const body = request.body as Partial<GuildWithLogs>;
        const coreData = { ...body };
        const logConfig = coreData.logConfig;
        delete coreData.logConfig;
        delete (coreData as any).punishmentConfigs;
        if (Object.keys(coreData).length > 0) {
          await updateGuildConfig(guildId, coreData as Prisma.GuildUpdateInput);
        }
        if (logConfig) {
          const cleanLogData = { ...logConfig };

          if ("guildId" in cleanLogData) {
            delete (cleanLogData as { guildId?: string }).guildId;
          }

          await updateGuildLogs(guildId, cleanLogData);
        }

        return await getOrCreateGuild(guildId);
      } catch (err) {
        logger.log({ level: "error", message: "Error updating guild configuration", error: err, discord: false });
        return reply.code(500).send({ error: "Failed to update guild configuration" });
      }
    },
  );

  // 7. Basic guild info
  fastify.get(
    "/api/bot/guild/:guildId",
    { schema: { params: guildIdParamSchema } },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const client = fastify.discord;
        const { guildId } = request.params as { guildId: string };
        const guild = client.guilds.cache.get(guildId);

        if (!guild) {
          return reply.code(404).send({ error: "Guild not found" });
        }

        // Get bot's member in the guild for current nickname/avatar
        const botMember = guild.members.me;

        return {
          id: guild.id,
          name: guild.name,
          memberCount: guild.memberCount,
          botNickname: botMember?.nickname ?? null,
          botAvatar: botMember?.avatar ? botMember.avatarURL({ size: 256 }) : null,
          botUsername: client.user?.username ?? null,
          botGlobalAvatar: client.user?.avatarURL({ size: 256 }) ?? null,
        };
      } catch (err) {
        logger.log({ level: "error", message: "Error fetching guild info", error: err, discord: false });
        return reply.code(500).send({ error: "Internal server error" });
      }
    },
  );

  // 8. Update bot's guild profile (nickname and avatar)
  // Uses guild.members.editMe() which supports per-server avatar customization
  fastify.post(
    "/api/bot/guild/:guildId/profile",
    {
      schema: {
        params: guildIdParamSchema,
        body: {
          type: "object",
          properties: {
            nickname: { type: ["string", "null"], maxLength: 32 },
            avatar: { type: ["string", "null"] }, // base64 data URI or null to reset
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const client = fastify.discord;
        const { guildId } = request.params as { guildId: string };
        const { nickname, avatar } = request.body as { nickname?: string | null; avatar?: string | null };

        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
          return reply.code(404).send({ error: "Guild not found" });
        }

        const botMember = guild.members.me;
        if (!botMember) {
          return reply.code(404).send({ error: "Bot member not found in guild" });
        }

        // Check if bot has permission to change nickname
        if (nickname !== undefined && !botMember.permissions.has(PermissionsBitField.Flags.ChangeNickname)) {
          return reply.code(403).send({ error: "Bot lacks CHANGE_NICKNAME permission" });
        }

        // Build edit options
        const editOptions: { nick?: string | null; avatar?: string | null } = {};

        if (nickname !== undefined) {
          editOptions.nick = nickname;
        }

        if (avatar !== undefined) {
          editOptions.avatar = avatar;
        }

        // Use editMe() to update both nickname and avatar
        if (Object.keys(editOptions).length > 0) {
          await guild.members.editMe(editOptions);
        }

        // Return updated profile
        const updatedMember = await guild.members.fetch(client.user!.id);
        return {
          success: true,
          nickname: updatedMember.nickname,
          avatar: updatedMember.avatar ? updatedMember.avatarURL({ size: 256 }) : null,
        };
      } catch (err) {
        logger.log({ level: "error", message: "Error updating bot profile", error: err, discord: false });
        return reply.code(500).send({ error: "Failed to update bot profile" });
      }
    },
  );
}
