const logTypes = ["message", "guild", "mod", "guild_member", "voice", "channel"];

function generateSyncBlock(a, b) {
  return `  -- ${a} <-> ${b}
  IF NEW.${a}_logs_channel_id = NEW.${b}_logs_channel_id THEN
    IF NEW.${a}_logs_webhook_id IS NULL AND NEW.${b}_logs_webhook_id IS NOT NULL THEN
      NEW.${a}_logs_webhook_id := NEW.${b}_logs_webhook_id;
    ELSIF NEW.${b}_logs_webhook_id IS NULL AND NEW.${a}_logs_webhook_id IS NOT NULL THEN
      NEW.${b}_logs_webhook_id := NEW.${a}_logs_webhook_id;
    END IF;
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
