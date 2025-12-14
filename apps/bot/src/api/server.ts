import fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { botRoutes } from "./routes/botRoutes.js";
import { Client } from "discord.js";
import { logger } from "src/lib/index.js";
import { createHash, timingSafeEqual } from "crypto";

function bigIntReplacer(_key: string, value: unknown) {
  if (typeof value === "bigint") return value.toString();
  return value;
}

function customJsonSerializer(payload: unknown): string {
  return JSON.stringify(payload, bigIntReplacer);
}

function hashString(input: string) {
  return createHash("sha256").update(input).digest();
}

function secureCompare(a: string, b: string) {
  try {
    return timingSafeEqual(hashString(a), hashString(b));
  } catch {
    return false;
  }
}

export async function startAPIServer(client: Client) {
  const app = fastify({ logger: false });

  const API_PORT = client.config.api.port || 3001;
  const API_KEY = client.config.api.key;

  if (!API_KEY) {
    logger.log({
      level: "error",
      message: "Required API key missing in configuration (client.config.api.key).",
      discord: false,
    });
    throw new Error("Missing API key for internal API");
  }

  await app.register(helmet);
  // Enable a modest rate limit to protect internal endpoints (tune as needed)
  try {
    await app.register(rateLimit, {
      max: 200, // requests
      timeWindow: "1 minute",
    });
  } catch {
    // plugin may not be desired in all environments; fail-safe
  }

  // CORS: allow dashboard host(s). Permit localhost in non-production for dev.
  const origin = client.config.api.host;
  await app.register(cors, {
    origin: (originHeader, cb) => {
      const allowed = [origin];
      // allow localhost when running in dev mode
      if (process.env.NODE_ENV !== "production") {
        allowed.push("http://localhost:3000", "http://127.0.0.1:3000");
      }
      if (!originHeader || allowed.includes(originHeader as string)) {
        cb(null, true);
      } else {
        cb(new Error("Not allowed by CORS"), false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  });

  app.setReplySerializer(customJsonSerializer);

  // Health check endpoint (excluded from auth for monitoring)
  app.get("/health", async () => ({ status: "ok", timestamp: Date.now() }));

  // Security hook: validate internal API key using timing-safe compare
  app.addHook("onRequest", async (request, reply) => {
    // Skip auth for health check endpoint
    if (request.url === "/health") return;

    const apiKeyHeader = (request.headers["x-internal-api-key"] as string) || "";
    if (!apiKeyHeader || !secureCompare(apiKeyHeader, API_KEY)) {
      reply.code(401).send({ error: "Unauthorized: Invalid Internal API Key" });
      return;
    }
  });

  app.decorate("discord", client);
  // Register bot routes under a clear namespace
  app.register(botRoutes);

  const LISTEN_HOST = "0.0.0.0";
  try {
    await app.listen({ host: LISTEN_HOST, port: API_PORT });
    logger.log({
      level: "info",
      message: `🌐 Fastify Bot API listening on http://localhost:${API_PORT}`,
      discord: false,
    });
  } catch (err) {
    logger.log({
      level: "error",
      message: `Fastify API failed to start on port ${API_PORT}`,
      error: err,
      discord: false,
    });
    process.exit(1);
  }

  // Graceful shutdown
  const shutdown = async () => {
    try {
      await app.close();
      logger.log({ level: "info", message: "API server shut down", discord: false });
    } catch (err) {
      logger.log({ level: "error", message: "Error during shutdown", error: err, discord: false });
    }
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  return app;
}
