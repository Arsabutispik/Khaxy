import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "@lib";
import { Client } from "discord.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Recursively gets all files from a directory and its subdirectories.
 */
function getFilesRecursively(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getFilesRecursively(filePath, fileList);
    } else {
      // Only load .js or .ts files (ignore maps or config files)
      if (file.endsWith(".js") || file.endsWith(".ts")) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

export async function loadEvents(client: Client) {
  // Adjust this path relative to where this handler file is located
  const eventsPath = path.join(__dirname, "../../events");

  // 1. Get all files from subfolders
  const eventFiles = getFilesRecursively(eventsPath);

  logger.info(`Loading ${eventFiles.length} events...`);

  for (const filePath of eventFiles) {
    try {
      // 2. Import the event file
      // In NodeNext, dynamic imports are often cleaner than require()
      const eventModule = await import(filePath);

      // Handle "export default" or named exports
      const event = eventModule.default || eventModule;

      if (event.name && event.execute) {
        if (event.once) {
          client.once(event.name, (...args: unknown[]) => event.execute(...args));
        } else {
          client.on(event.name, (...args: unknown[]) => event.execute(...args));
        }
      } else {
        logger.warn(`[Event Handler] The event at ${filePath} is missing "name" or "execute".`);
      }
    } catch (error) {
      logger.error(`[Event Handler] Error loading event ${filePath}:`, error);
    }
  }
}
