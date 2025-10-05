-- AlterTable
ALTER TABLE "public"."guilds" ADD COLUMN     "poll_logs_channel_id" BIGINT,
ADD COLUMN     "poll_logs_webhook_id" BIGINT,
ADD COLUMN     "sounboard_logs_webhook_id" BIGINT,
ADD COLUMN     "soundboard_logs_channel_id" BIGINT,
ADD COLUMN     "stage_logs_channel_id" BIGINT,
ADD COLUMN     "stage_logs_webhook_id" BIGINT,
ADD COLUMN     "thread_logs_channel_id" BIGINT,
ADD COLUMN     "thread_logs_webhook_id" BIGINT,
ADD COLUMN     "webhook_logs_channel_id" BIGINT,
ADD COLUMN     "webhook_logs_webhook_id" BIGINT;

CREATE OR REPLACE FUNCTION sync_log_webhook_ids()
RETURNS TRIGGER AS $$
DECLARE
log_types TEXT[] := ARRAY[
    'message', 'guild', 'mod', 'guild_member',
    'voice', 'channel', 'emoji', 'role', 'sticker', 'poll', 'sounboard', 'stage', 'thread', 'webhook'
  ];
  i INT;
  j INT;
  a TEXT;
  b TEXT;
  a_channel_id BIGINT;
  b_channel_id BIGINT;
  a_webhook_id TEXT;
  b_webhook_id TEXT;
BEGIN
FOR i IN 1 .. array_length(log_types, 1) LOOP
    FOR j IN i + 1 .. array_length(log_types, 1) LOOP
      a := log_types[i];
      b := log_types[j];

EXECUTE format(
        'SELECT ($1).%I_logs_channel_id, ($1).%I_logs_channel_id',
        a, b
        )
    INTO a_channel_id, b_channel_id
    USING NEW;

IF a_channel_id = b_channel_id AND a_channel_id IS NOT NULL THEN
        EXECUTE format(
          'SELECT ($1).%I_logs_webhook_id, ($1).%I_logs_webhook_id',
          a, b
        )
        INTO a_webhook_id, b_webhook_id
        USING NEW;

        IF a_webhook_id IS NULL AND b_webhook_id IS NOT NULL THEN
          EXECUTE format('SELECT $1.%I_logs_webhook_id := %L', a, b_webhook_id)
          USING NEW;
        ELSIF b_webhook_id IS NULL AND a_webhook_id IS NOT NULL THEN
          EXECUTE format('SELECT $1.%I_logs_webhook_id := %L', b, a_webhook_id)
          USING NEW;
END IF;
END IF;
END LOOP;
END LOOP;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_log_webhooks ON guilds;

CREATE TRIGGER trg_sync_log_webhooks
    BEFORE INSERT OR UPDATE ON guilds
                         FOR EACH ROW
                         EXECUTE FUNCTION sync_log_webhook_ids();
