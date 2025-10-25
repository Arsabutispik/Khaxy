import fastify from "fastify";
import cors from "@fastify/cors";
import { botRoutes } from "./routes/botRoutes.js";
import { Client } from "discord.js";
import { logger } from "@lib"; // Use .js extension for ESM
function bigIntReplacer(_key: string, value: unknown) {
  if (typeof value === "bigint") {
    // Convert BigInt to string before serialization
    return value.toString();
  }
  return value;
}

// Function that performs the custom JSON stringification
function customJsonSerializer(payload: unknown): string {
  // We explicitly call JSON.stringify with the replacer function
  return JSON.stringify(payload, bigIntReplacer);
}
// Function now accepts the full API configuration object
export async function startAPIServer(client: Client) {
  const app = fastify({ logger: false });

  // --- Use settings from config.toml ---
  const API_PORT = client.config.api.port || 3001;
  const API_KEY = client.config.api.key; // The required secret key

  // 1. Register CORS (ensure it only allows your dashboard domain in production)
  await app.register(cors, {
    origin: client.config.api.host, // Example
    methods: ["GET", "POST", "PUT", "DELETE"],
  });
  app.setReplySerializer(customJsonSerializer);
  // 2. Security Hook (Uses the configured API key)
  app.addHook("onRequest", async (request, reply) => {
    const apiKey = request.headers["x-internal-api-key"];

    if (apiKey !== API_KEY) {
      reply.code(401).send({ error: "Unauthorized: Invalid Internal API Key" });
    }
  });

  // 3. Decorate and Register Routes
  app.decorate("discord", client);
  app.register(botRoutes);
  const LISTEN_HOST = "0.0.0.0"; // Safe choice when behind a reverse proxy on the same machine
  // 4. Start the server
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
}
