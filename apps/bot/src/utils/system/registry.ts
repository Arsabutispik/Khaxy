import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { logger } from "@lib";
import { Client } from "discord.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Recursively reads all .js files from a directory
 */
function getFilesRecursively(dir: string): string[] {
  const files: string[] = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      files.push(...getFilesRecursively(fullPath));
    } else if (item.isFile() && item.name.endsWith(".js")) {
      files.push(fullPath);
    }
  }

  return files;
}

export async function RegisterSlashCommands(client: Client) {
  //Change the path to the folder where your slash commands are stored
  const foldersPath = path.join(__dirname, "../../slash-commands");
  const commandFolders = fs.readdirSync(foldersPath);

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = (await import(pathToFileURL(filePath).href)).default;
      // Set a new item in the Collection with the key as the command name and the value as the exported module
      if ("data" in command && "execute" in command) {
        client.slashCommands.set(command.data.name, command);
      } else {
        logger.warn(`The command at ${pathToFileURL(filePath)} is missing a required "data" or "execute" property.`);
      }
    }
  }
}

export async function RegisterComponentCommands(client: Client) {
  //Change the path to the folder where your component commands are stored
  const foldersPath = path.join(__dirname, "../../components");
  const commandFiles = getFilesRecursively(foldersPath);

  for (const filePath of commandFiles) {
    const command = (await import(pathToFileURL(filePath).href)).default;
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ("customId" in command && "execute" in command) {
      client.componentCommands.set(command.customId, command);
    } else {
      logger.warn(
        `The component command at ${pathToFileURL(filePath)} is missing a required "customId" or "execute" property.`,
      );
    }
  }
}
