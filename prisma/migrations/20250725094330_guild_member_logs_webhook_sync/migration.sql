CREATE OR REPLACE FUNCTION sync_log_webhook_ids()
    RETURNS TRIGGER AS $$
BEGIN
    -- message <-> guild
    IF NEW.message_logs_channel_id = NEW.guild_logs_channel_id THEN
        IF NEW.message_logs_webhook_id IS NULL AND NEW.guild_logs_webhook_id IS NOT NULL THEN
            NEW.message_logs_webhook_id := NEW.guild_logs_webhook_id;
        ELSIF NEW.guild_logs_webhook_id IS NULL AND NEW.message_logs_webhook_id IS NOT NULL THEN
            NEW.guild_logs_webhook_id := NEW.message_logs_webhook_id;
        END IF;
    END IF;
    -- message <-> mod
    IF NEW.message_logs_channel_id = NEW.mod_logs_channel_id THEN
        IF NEW.message_logs_webhook_id IS NULL AND NEW.mod_logs_webhook_id IS NOT NULL THEN
            NEW.message_logs_webhook_id := NEW.mod_logs_webhook_id;
        ELSIF NEW.mod_logs_webhook_id IS NULL AND NEW.message_logs_webhook_id IS NOT NULL THEN
            NEW.mod_logs_webhook_id := NEW.message_logs_webhook_id;
        END IF;
    END IF;
    -- message <-> guild_member
    IF NEW.message_logs_channel_id = NEW.guild_member_logs_channel_id THEN
        IF NEW.message_logs_webhook_id IS NULL AND NEW.guild_member_logs_webhook_id IS NOT NULL THEN
            NEW.message_logs_webhook_id := NEW.guild_member_logs_webhook_id;
        ELSIF NEW.guild_member_logs_webhook_id IS NULL AND NEW.message_logs_webhook_id IS NOT NULL THEN
            NEW.guild_member_logs_webhook_id := NEW.message_logs_webhook_id;
        END IF;
    END IF;
    -- guild <-> mod
    IF NEW.guild_logs_channel_id = NEW.mod_logs_channel_id THEN
        IF NEW.guild_logs_webhook_id IS NULL AND NEW.mod_logs_webhook_id IS NOT NULL THEN
            NEW.guild_logs_webhook_id := NEW.mod_logs_webhook_id;
        ELSIF NEW.mod_logs_webhook_id IS NULL AND NEW.guild_logs_webhook_id IS NOT NULL THEN
            NEW.mod_logs_webhook_id := NEW.guild_logs_webhook_id;
        END IF;
    END IF;
    -- guild <-> guild_member
    IF NEW.guild_logs_channel_id = NEW.guild_member_logs_channel_id THEN
        IF NEW.guild_logs_webhook_id IS NULL AND NEW.guild_member_logs_webhook_id IS NOT NULL THEN
            NEW.guild_logs_webhook_id := NEW.guild_member_logs_webhook_id;
        ELSIF NEW.guild_member_logs_webhook_id IS NULL AND NEW.guild_logs_webhook_id IS NOT NULL THEN
            NEW.guild_member_logs_webhook_id := NEW.guild_logs_webhook_id;
        END IF;
    END IF;
    -- mod <-> guild_member
    IF NEW.mod_logs_channel_id = NEW.guild_member_logs_channel_id THEN
        IF NEW.mod_logs_webhook_id IS NULL AND NEW.guild_member_logs_webhook_id IS NOT NULL THEN
            NEW.mod_logs_webhook_id := NEW.guild_member_logs_webhook_id;
        ELSIF NEW.guild_member_logs_webhook_id IS NULL AND NEW.mod_logs_webhook_id IS NOT NULL THEN
            NEW.guild_member_logs_webhook_id := NEW.mod_logs_webhook_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_log_webhooks ON guilds;

CREATE TRIGGER trg_sync_log_webhooks
    BEFORE INSERT OR UPDATE ON guilds
    FOR EACH ROW
EXECUTE FUNCTION sync_log_webhook_ids();
