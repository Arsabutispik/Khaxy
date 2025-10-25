import fs from "fs";
import path from "path";
import toml from "toml";
import { fileURLToPath } from "url";
import { ActivityType } from "discord.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const file = fs.readFileSync(path.join(__dirname, "../../config.toml"), "utf-8");
export const Config: AppConfig = toml.parse(file);

interface EmojiConfig {
  id: string;
  fallback: string;
}

interface ActivityMessage {
  type: ActivityType;
  message: string;
  reload?: boolean;
}
interface LoggingConfig {
  webhook: {
    enabled?: boolean;
    url?: string;
  } | null;
  file: {
    enabled?: boolean;
    filename?: string;
  } | null;
}
interface APIConfig {
  enabled: boolean;
  host: string;
  port: number;
  key: string;
}
interface AppConfig {
  emojis: Record<string, EmojiConfig>;
  activity: {
    messages: ActivityMessage[];
  };
  logging: LoggingConfig;
  api: APIConfig;
}
