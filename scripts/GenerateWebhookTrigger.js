const logTypes = [
  "message",
  "guild",
  "mod",
  "guild_member",
  "voice",
  "channel",
  "emoji",
  "role",
  "sticker",
  "event",
  "invite",
  "poll",
  "stage",
  "soundboard",
  "thread",
  "webhook",
];

// This simplified logic is the most reliable for synchronized values.
function generateSyncBlock(a, b) {
  return `  -- ${a} <-> ${b}
  IF NEW.${a}_logs_channel_id = NEW.${b}_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.${b}_logs_webhook_id := NEW.${a}_logs_webhook_id;
  END IF;\n`;
}

let body = "";

for (let i = 0; i < logTypes.length; i++) {
  for (let j = i + 1; j < logTypes.length; j++) {
    body += generateSyncBlock(logTypes[i], logTypes[j]);
  }
}

const fullFunction = `CREATE OR REPLACE FUNCTION sync_log_webhook_ids()
RETURNS TRIGGER AS $$
BEGIN
${body}  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_log_webhooks ON guilds;

CREATE TRIGGER trg_sync_log_webhooks
BEFORE INSERT OR UPDATE ON guilds
FOR EACH ROW
EXECUTE FUNCTION sync_log_webhook_ids();`;

console.log(fullFunction);
