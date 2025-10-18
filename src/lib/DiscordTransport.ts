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
    const isError = info.level === "error" && info.stack;
    let contentMessage = info.message;
    let stackTrace = info.stack;

    // 1. Prepare Content and Stack Trace
    if (isError) {
      // Discord content limit is 2000 characters. Truncate the stack if necessary.
      const maxContentLength = 2000;

      // We send the full stack trace in the 'content' field for maximum visibility.
      // If it's too long, we truncate it and add a note.
      if (stackTrace.length > maxContentLength) {
        contentMessage = `**ERROR:** ${info.message}\n\n**Stack Trace (Truncated to ${maxContentLength} chars):**\n\`\`\`${stackTrace.substring(0, maxContentLength - 100)}...\`\`\``;
      } else {
        contentMessage = `**ERROR:** ${info.message}\n\n**Stack Trace:**\n\`\`\`${stackTrace}\`\`\``;
      }
    }

    const postBody = {
      // The main message content is set here, containing the stack or just the message
      content: contentMessage,
      embeds: [
        {
          // For errors, the description can be the primary message.
          // For other levels, it's the full message.
          description: isError ? info.message : info.message,
          color: DiscordTransport.COLORS[info.level],
          fields: [] as any[],
          timestamp: new Date().toISOString(),
        },
      ],
    };

    // 2. Add Metadata Fields (same as before, but safer)
    // Ensure we don't try to add stack or error objects as fields
    const metaToDisplay = { ...info.metadata };
    delete metaToDisplay.stack;
    delete metaToDisplay.error;
    delete metaToDisplay.discord;

    if (Object.keys(metaToDisplay).length > 0) {
      Object.keys(metaToDisplay).forEach((key) => {
        let value = metaToDisplay[key];
        if (typeof value === "object" && value !== null) {
          value = util.inspect(value, { depth: 1, colors: false });
        }

        const valueString = String(value).substring(0, 1024);

        postBody.embeds[0].fields.push({
          name: String(key).substring(0, 256),
          value: `\`\`\`json\n${valueString}\n\`\`\``, // Use markdown for cleaner display
          inline: false,
        });
      });
    }

    // 3. Send Request (rest of the function is unchanged)
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
