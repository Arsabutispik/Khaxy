-- Re-use or update the function
CREATE OR REPLACE FUNCTION sync_log_webhook_ids()
    RETURNS TRIGGER AS $$
DECLARE
BEGIN
    -- Message logs to other channels
    IF NEW.message_logs_channel_id = NEW.guild_logs_channel_id THEN
        IF NEW.message_logs_webhook_id IS NULL AND NEW.guild_logs_webhook_id IS NOT NULL THEN
            NEW.message_logs_webhook_id := NEW.guild_logs_webhook_id;
        ELSIF NEW.guild_logs_webhook_id IS NULL AND NEW.message_logs_webhook_id IS NOT NULL THEN
            NEW.guild_logs_webhook_id := NEW.message_logs_webhook_id;
        END IF;
    END IF;
    -- Guild logs to other channels
    IF NEW.guild_logs_channel_id = NEW.message_logs_channel_id THEN
        IF NEW.guild_logs_webhook_id IS NULL AND NEW.message_logs_webhook_id IS NOT NULL THEN
            NEW.guild_logs_webhook_id := NEW.message_logs_webhook_id;
        ELSIF NEW.message_logs_webhook_id IS NULL AND NEW.guild_logs_webhook_id IS NOT NULL THEN
            NEW.message_logs_webhook_id := NEW.guild_logs_webhook_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- You may not need to reattach the trigger if you're using `CREATE OR REPLACE`
-- But re-creating it is safe:
DROP TRIGGER IF EXISTS trg_sync_log_webhooks ON guilds;

CREATE TRIGGER trg_sync_log_webhooks
    BEFORE INSERT OR UPDATE ON guilds
    FOR EACH ROW
EXECUTE FUNCTION sync_log_webhook_ids();
