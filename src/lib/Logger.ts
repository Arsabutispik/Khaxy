import { createLogger, format, transports } from "winston";
import { DiscordTransport } from "./DiscordTransport.js";
import "dotenv/config.js";
import _ from "lodash";
import TransportStream from "winston-transport";
import { Config } from "./Config.js";

let transportsList: TransportStream | TransportStream[] = [
  new transports.Console({
    format: format.combine(
      format.colorize({ all: true }),
      format.printf(({ timestamp, level, message, metadata }) => {
        const copy = _.cloneDeep(metadata);
        // @ts-expect-error - Copy is known but ts doesn't
        delete copy.discord;
        return `[${timestamp}] ${level}: ${message}${copy && Object.keys(copy).length ? ` ${JSON.stringify(copy)}` : ""}`;
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
      format: format.combine(format.json()),
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
  format: format.combine(format.metadata(), format.timestamp()),
});
export { logger };
