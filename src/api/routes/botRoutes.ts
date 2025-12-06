import { FastifyInstance } from "fastify";
import { PermissionsBitField } from "discord.js";
import { getGuildConfig, updateGuildConfig } from "src/database/index.js";
import { guilds } from "@prisma/client";
import { logger } from "src/lib/index.js";
export async function botRoutes(fastify: FastifyInstance) {
  // 1. Endpoint for general bot info
  fastify.get("/api/bot/status", async () => {
    // Access the Discord client via the decorator
    const client = fastify.discord;

    return {
      status: "online",
      username: client.user?.username,
      guildCount: client.guilds.cache.size,
      uptime: client.uptime,
    };
  });
  fastify.get("/api/guilds/:guildId/admin", async (request, reply) => {
    const client = fastify.discord;
    const { guildId } = request.params as { guildId: string };
    const userId = request.headers["x-discord-user-id"];
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      reply.code(404).send({ error: "Guild not found" });
      return;
    }
    if (!userId || Array.isArray(userId)) {
      reply.code(401).send({ error: "Missing userId query parameter" });
      return;
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
      reply.code(404).send({ error: "Member not found in guild" });
      return;
    }
    const isAdmin =
      member.permissions.has(PermissionsBitField.Flags.Administrator) ||
      member.permissions.has(PermissionsBitField.Flags.ManageGuild);

    return { name: guild.name, guildId, isAdmin };
  });
  fastify.get("/api/guilds/:guildId/settings", async (request, reply) => {
    const { guildId } = request.params as { guildId: string };
    const guildConfig = await getGuildConfig(guildId);
    if (!guildConfig) {
      reply.code(404).send({ error: "Guild configuration not found" });
      return;
    }
    return { guildId, settings: guildConfig };
  });
  fastify.get("/api/guilds/:guildId/channels", async (request, reply) => {
    const client = fastify.discord;
    const { guildId } = request.params as { guildId: string };
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      reply.code(404).send({ error: "Guild not found" });
      return;
    }
    const channels = guild.channels.cache.map((channel) => channel);
    return { guildId, channels };
  });
  fastify.post("/api/guilds/:guildId/settings", async (request, reply) => {
    const { guildId } = request.params as { guildId: string };
    const updateData = request.body as Partial<guilds>;
    const guildConfig = await getGuildConfig(guildId);
    if (!guildConfig) {
      reply.code(404).send({ error: "Guild configuration not found" });
      return;
    }
    try {
      await updateGuildConfig(guildId, updateData);
      return await getGuildConfig(guildId);
    } catch (error) {
      console.error("Error updating guild configuration:", error);
      reply.code(500).send({ error: "Failed to update guild configuration" });
    }
  });
  fastify.get("/api/bot/guild/:guildId", async (request, reply) => {
    const client = fastify.discord;
    const { guildId } = request.params as { guildId: string };
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      reply.code(404).send({ error: "Guild not found" });
      return;
    }
    return {
      id: guild.id,
      name: guild.name,
      memberCount: guild.memberCount,
    };
  });
}
