import { createLogger, format, transports } from "winston";
import { DiscordTransport } from "./DiscordTransport.js";
import "dotenv/config.js";
import _ from "lodash";
import TransportStream from "winston-transport";
import { Config } from "./Config.js";
import * as util from "node:util";

let transportsList: TransportStream | TransportStream[] = [
  new transports.Console({
    // Direct 'error' level logs to stderr for PM2
    stderrLevels: ['error'], 
    format: format.combine(
      format.timestamp({ format: "HH:mm:ss" }),
      format.colorize({ all: true }),
      format.printf((info) => {
        // Use stack if it exists, otherwise use message
        const { timestamp, level, message, stack, metadata = {} } = info;

        // Clone metadata so we don't mutate original
        const metaClone = _.cloneDeep(metadata) as Record<string, unknown>;

        // Remove discord key if it exists
        if ("discord" in metaClone) {
          delete metaClone.discord;
        }

        let metaString = "";
        if (Object.keys(metaClone).length > 0) {
          metaString = "\n" + util.inspect(metaClone, { colors: true, depth: 3, compact: false });
        }

        // Print stack trace if exists, otherwise message
        const mainContent = stack || message;

        return `[${timestamp}] ${level}: ${mainContent}${metaString}`;
      }),
    ),
  }),
];

if (Config.logging.file?.enabled) {
  transportsList.push(
    new transports.File({
      dirname: "logs",
      filename: Config.logging.file.filename || "error.log",
      level: "error",
      format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(({ timestamp, level, message, stack, ...meta }) => {
          // Prepare metadata string
          const metaKeys = Object.keys(meta);
          let metaString = "";
          if (metaKeys.length > 0) {
            // Pretty-print metadata using util.inspect for better readability
            metaString = "\nMetadata: " + util.inspect(meta, { depth: null, colors: false });
          }

          // Print stack trace if exists, else message
          const mainMessage = stack || message;

          return `${timestamp} [${level.toUpperCase()}] ${mainMessage}${metaString}`;
        }),
      ),
    }),
  );
}

if (Config.logging.webhook?.enabled) {
  if (!Config.logging.webhook.url) {
    throw new Error("Discord webhook URL is not set in the configuration.");
  }
  transportsList.push(
    new DiscordTransport({
      webhook: Config.logging.webhook.url,
    }),
  );
}

const logger = createLogger({
  transports: transportsList,
  // format.errors({ stack: true }) to ensure stack traces are captured
  format: format.combine(format.metadata(), format.timestamp(), format.errors({ stack: true })),
});

export { logger };
