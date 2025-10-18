import Transport from "winston-transport";
import type { TransportStreamOptions } from "winston-transport";
import * as util from "node:util";
/* eslint-disable */

export class DiscordTransport extends Transport {
  // Webhook obtained from Discord
  private readonly webhook: string;

  //Discord webhook id
  private id: string;

  //Discord webhook token
  private token: string;

  //Initialization promise resolved when the webhook is parsed
  private initialized: Promise<void>;

  //Available colors for the embed
  private static COLORS: { [key: string]: number } = {
    error: 14362664, // #db2828
    warn: 16497928, // #fbbd08
    info: 2196944, // #2185d0
    verbose: 6559689, // #6435c9
    debug: 2196944, // #2185d0
    silly: 2210373, // #21ba45
  };

  constructor(options: DiscordTransportOptions) {
    super(options);
    this.webhook = options.webhook;
    this.initialize();
  }

  //Helper function to parse the webhook
  private getURL = () => {
    return `https://discord.com/api/webhooks/${this.id}/${this.token}`;
  };

  private initialize = () => {
    this.initialized = new Promise((resolve, reject) => {
      fetch(this.webhook, {
        method: "GET",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Invalid webhook");
          }
          return response.json();
        })
        .then((data) => {
          this.id = data.id;
          this.token = data.token;
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  /**
   * Function exposed to winston to be called when logging messages
   * @param info Log message from winston
   * @param callback Callback to winston to complete the log
   */
  log(info: any, callback: { (): void }) {
    // Check for existence of info.metadata.discord property
    // The check is `info.metadata && 'discord' in info.metadata ? info.metadata.discord : true`
    // which simplifies to checking if 'discord' is explicitly set to false in metadata.
    if (!info.metadata || info.metadata.discord !== false) {
      setImmediate(() => {
        this.initialized
          .then(() => {
            this.sendToDiscord(info).then(() => {});
          })
          .catch((err) => {
            console.log("Error sending message to discord", err);
          });
      });
    }

    callback();
  }

  /**
   * Sends log message to discord
   */
  private sendToDiscord = async (info: any) => {
    const postBody = {
      content: undefined as unknown as string,
      embeds: [
        {
          // If a stack trace exists, make the description the main message
          description: info.stack ? info.message : info.message,
          color: DiscordTransport.COLORS[info.level],
          fields: [] as any[],
          timestamp: new Date().toISOString(),
        },
      ],
    };

    // Use info.stack (captured by format.errors) for the main content
    if (info.level === "error" && info.stack) {
      // Send the stack trace in the main content for maximum visibility
      postBody.content = `**Error Stack Trace:**\n\`\`\`${info.stack}\`\`\``;
    }

    // Capture other metadata fields (excluding stack, error, and discord fields)
    const metaToDisplay = { ...info.metadata };
    delete metaToDisplay.stack;
    delete metaToDisplay.error;
    delete metaToDisplay.discord;

    // Check if there's any remaining metadata to display in fields
    if (Object.keys(metaToDisplay).length > 0) {
      Object.keys(metaToDisplay).forEach((key) => {
        let value = metaToDisplay[key];
        // Format complex objects nicely
        if (typeof value === "object" && value !== null) {
          value = util.inspect(value, { depth: 1, colors: false });
        }

        // Discord field value limit is 1024 characters
        const valueString = String(value).substring(0, 1024);

        postBody.embeds[0].fields.push({
          name: String(key).substring(0, 256), // Discord field name limit is 256
          value: `\`\`\`json\n${valueString}\n\`\`\``,
          inline: false,
        });
      });
    }

    const options = {
      url: this.getURL(),
      method: "POST",
      json: true,
      body: postBody,
    };

    try {
      await fetch(options.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options.body),
      });
    } catch (err) {
      // Note: This error means the webhook POST failed, not that the logging failed.
      console.error("Error sending to discord");
    }
  };
}

interface DiscordTransportOptions extends TransportStreamOptions {
  // Webhook obtained from Discord
  webhook: string;
}

interface DiscordTransportOptions extends TransportStreamOptions {
  // Webhook obtained from Discord
  webhook: string;
}
