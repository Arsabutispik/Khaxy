-- AlterTable
ALTER TABLE "public"."guilds" ADD COLUMN     "event_logs_channel_id" BIGINT,
ADD COLUMN     "event_logs_webhook_id" BIGINT;
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
  -- message <-> voice
  IF NEW.message_logs_channel_id = NEW.voice_logs_channel_id THEN
    IF NEW.message_logs_webhook_id IS NULL AND NEW.voice_logs_webhook_id IS NOT NULL THEN
      NEW.message_logs_webhook_id := NEW.voice_logs_webhook_id;
    ELSIF NEW.voice_logs_webhook_id IS NULL AND NEW.message_logs_webhook_id IS NOT NULL THEN
      NEW.voice_logs_webhook_id := NEW.message_logs_webhook_id;
END IF;
END IF;
  -- message <-> channel
  IF NEW.message_logs_channel_id = NEW.channel_logs_channel_id THEN
    IF NEW.message_logs_webhook_id IS NULL AND NEW.channel_logs_webhook_id IS NOT NULL THEN
      NEW.message_logs_webhook_id := NEW.channel_logs_webhook_id;
    ELSIF NEW.channel_logs_webhook_id IS NULL AND NEW.message_logs_webhook_id IS NOT NULL THEN
      NEW.channel_logs_webhook_id := NEW.message_logs_webhook_id;
END IF;
END IF;
  -- message <-> emoji
  IF NEW.message_logs_channel_id = NEW.emoji_logs_channel_id THEN
    IF NEW.message_logs_webhook_id IS NULL AND NEW.emoji_logs_webhook_id IS NOT NULL THEN
      NEW.message_logs_webhook_id := NEW.emoji_logs_webhook_id;
    ELSIF NEW.emoji_logs_webhook_id IS NULL AND NEW.message_logs_webhook_id IS NOT NULL THEN
      NEW.emoji_logs_webhook_id := NEW.message_logs_webhook_id;
END IF;
END IF;
  -- message <-> role
  IF NEW.message_logs_channel_id = NEW.role_logs_channel_id THEN
    IF NEW.message_logs_webhook_id IS NULL AND NEW.role_logs_webhook_id IS NOT NULL THEN
      NEW.message_logs_webhook_id := NEW.role_logs_webhook_id;
    ELSIF NEW.role_logs_webhook_id IS NULL AND NEW.message_logs_webhook_id IS NOT NULL THEN
      NEW.role_logs_webhook_id := NEW.message_logs_webhook_id;
END IF;
END IF;
  -- message <-> sticker
  IF NEW.message_logs_channel_id = NEW.sticker_logs_channel_id THEN
    IF NEW.message_logs_webhook_id IS NULL AND NEW.sticker_logs_webhook_id IS NOT NULL THEN
      NEW.message_logs_webhook_id := NEW.sticker_logs_webhook_id;
    ELSIF NEW.sticker_logs_webhook_id IS NULL AND NEW.message_logs_webhook_id IS NOT NULL THEN
      NEW.sticker_logs_webhook_id := NEW.message_logs_webhook_id;
END IF;
END IF;
  -- message <-> event
  IF NEW.message_logs_channel_id = NEW.event_logs_channel_id THEN
    IF NEW.message_logs_webhook_id IS NULL AND NEW.event_logs_webhook_id IS NOT NULL THEN
      NEW.message_logs_webhook_id := NEW.event_logs_webhook_id;
    ELSIF NEW.event_logs_webhook_id IS NULL AND NEW.message_logs_webhook_id IS NOT NULL THEN
      NEW.event_logs_webhook_id := NEW.message_logs_webhook_id;
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
  -- guild <-> voice
  IF NEW.guild_logs_channel_id = NEW.voice_logs_channel_id THEN
    IF NEW.guild_logs_webhook_id IS NULL AND NEW.voice_logs_webhook_id IS NOT NULL THEN
      NEW.guild_logs_webhook_id := NEW.voice_logs_webhook_id;
    ELSIF NEW.voice_logs_webhook_id IS NULL AND NEW.guild_logs_webhook_id IS NOT NULL THEN
      NEW.voice_logs_webhook_id := NEW.guild_logs_webhook_id;
END IF;
END IF;
  -- guild <-> channel
  IF NEW.guild_logs_channel_id = NEW.channel_logs_channel_id THEN
    IF NEW.guild_logs_webhook_id IS NULL AND NEW.channel_logs_webhook_id IS NOT NULL THEN
      NEW.guild_logs_webhook_id := NEW.channel_logs_webhook_id;
    ELSIF NEW.channel_logs_webhook_id IS NULL AND NEW.guild_logs_webhook_id IS NOT NULL THEN
      NEW.channel_logs_webhook_id := NEW.guild_logs_webhook_id;
END IF;
END IF;
  -- guild <-> emoji
  IF NEW.guild_logs_channel_id = NEW.emoji_logs_channel_id THEN
    IF NEW.guild_logs_webhook_id IS NULL AND NEW.emoji_logs_webhook_id IS NOT NULL THEN
      NEW.guild_logs_webhook_id := NEW.emoji_logs_webhook_id;
    ELSIF NEW.emoji_logs_webhook_id IS NULL AND NEW.guild_logs_webhook_id IS NOT NULL THEN
      NEW.emoji_logs_webhook_id := NEW.guild_logs_webhook_id;
END IF;
END IF;
  -- guild <-> role
  IF NEW.guild_logs_channel_id = NEW.role_logs_channel_id THEN
    IF NEW.guild_logs_webhook_id IS NULL AND NEW.role_logs_webhook_id IS NOT NULL THEN
      NEW.guild_logs_webhook_id := NEW.role_logs_webhook_id;
    ELSIF NEW.role_logs_webhook_id IS NULL AND NEW.guild_logs_webhook_id IS NOT NULL THEN
      NEW.role_logs_webhook_id := NEW.guild_logs_webhook_id;
END IF;
END IF;
  -- guild <-> sticker
  IF NEW.guild_logs_channel_id = NEW.sticker_logs_channel_id THEN
    IF NEW.guild_logs_webhook_id IS NULL AND NEW.sticker_logs_webhook_id IS NOT NULL THEN
      NEW.guild_logs_webhook_id := NEW.sticker_logs_webhook_id;
    ELSIF NEW.sticker_logs_webhook_id IS NULL AND NEW.guild_logs_webhook_id IS NOT NULL THEN
      NEW.sticker_logs_webhook_id := NEW.guild_logs_webhook_id;
END IF;
END IF;
  -- guild <-> event
  IF NEW.guild_logs_channel_id = NEW.event_logs_channel_id THEN
    IF NEW.guild_logs_webhook_id IS NULL AND NEW.event_logs_webhook_id IS NOT NULL THEN
      NEW.guild_logs_webhook_id := NEW.event_logs_webhook_id;
    ELSIF NEW.event_logs_webhook_id IS NULL AND NEW.guild_logs_webhook_id IS NOT NULL THEN
      NEW.event_logs_webhook_id := NEW.guild_logs_webhook_id;
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
  -- mod <-> voice
  IF NEW.mod_logs_channel_id = NEW.voice_logs_channel_id THEN
    IF NEW.mod_logs_webhook_id IS NULL AND NEW.voice_logs_webhook_id IS NOT NULL THEN
      NEW.mod_logs_webhook_id := NEW.voice_logs_webhook_id;
    ELSIF NEW.voice_logs_webhook_id IS NULL AND NEW.mod_logs_webhook_id IS NOT NULL THEN
      NEW.voice_logs_webhook_id := NEW.mod_logs_webhook_id;
END IF;
END IF;
  -- mod <-> channel
  IF NEW.mod_logs_channel_id = NEW.channel_logs_channel_id THEN
    IF NEW.mod_logs_webhook_id IS NULL AND NEW.channel_logs_webhook_id IS NOT NULL THEN
      NEW.mod_logs_webhook_id := NEW.channel_logs_webhook_id;
    ELSIF NEW.channel_logs_webhook_id IS NULL AND NEW.mod_logs_webhook_id IS NOT NULL THEN
      NEW.channel_logs_webhook_id := NEW.mod_logs_webhook_id;
END IF;
END IF;
  -- mod <-> emoji
  IF NEW.mod_logs_channel_id = NEW.emoji_logs_channel_id THEN
    IF NEW.mod_logs_webhook_id IS NULL AND NEW.emoji_logs_webhook_id IS NOT NULL THEN
      NEW.mod_logs_webhook_id := NEW.emoji_logs_webhook_id;
    ELSIF NEW.emoji_logs_webhook_id IS NULL AND NEW.mod_logs_webhook_id IS NOT NULL THEN
      NEW.emoji_logs_webhook_id := NEW.mod_logs_webhook_id;
END IF;
END IF;
  -- mod <-> role
  IF NEW.mod_logs_channel_id = NEW.role_logs_channel_id THEN
    IF NEW.mod_logs_webhook_id IS NULL AND NEW.role_logs_webhook_id IS NOT NULL THEN
      NEW.mod_logs_webhook_id := NEW.role_logs_webhook_id;
    ELSIF NEW.role_logs_webhook_id IS NULL AND NEW.mod_logs_webhook_id IS NOT NULL THEN
      NEW.role_logs_webhook_id := NEW.mod_logs_webhook_id;
END IF;
END IF;
  -- mod <-> sticker
  IF NEW.mod_logs_channel_id = NEW.sticker_logs_channel_id THEN
    IF NEW.mod_logs_webhook_id IS NULL AND NEW.sticker_logs_webhook_id IS NOT NULL THEN
      NEW.mod_logs_webhook_id := NEW.sticker_logs_webhook_id;
    ELSIF NEW.sticker_logs_webhook_id IS NULL AND NEW.mod_logs_webhook_id IS NOT NULL THEN
      NEW.sticker_logs_webhook_id := NEW.mod_logs_webhook_id;
END IF;
END IF;
  -- mod <-> event
  IF NEW.mod_logs_channel_id = NEW.event_logs_channel_id THEN
    IF NEW.mod_logs_webhook_id IS NULL AND NEW.event_logs_webhook_id IS NOT NULL THEN
      NEW.mod_logs_webhook_id := NEW.event_logs_webhook_id;
    ELSIF NEW.event_logs_webhook_id IS NULL AND NEW.mod_logs_webhook_id IS NOT NULL THEN
      NEW.event_logs_webhook_id := NEW.mod_logs_webhook_id;
END IF;
END IF;
  -- guild_member <-> voice
  IF NEW.guild_member_logs_channel_id = NEW.voice_logs_channel_id THEN
    IF NEW.guild_member_logs_webhook_id IS NULL AND NEW.voice_logs_webhook_id IS NOT NULL THEN
      NEW.guild_member_logs_webhook_id := NEW.voice_logs_webhook_id;
    ELSIF NEW.voice_logs_webhook_id IS NULL AND NEW.guild_member_logs_webhook_id IS NOT NULL THEN
      NEW.voice_logs_webhook_id := NEW.guild_member_logs_webhook_id;
END IF;
END IF;
  -- guild_member <-> channel
  IF NEW.guild_member_logs_channel_id = NEW.channel_logs_channel_id THEN
    IF NEW.guild_member_logs_webhook_id IS NULL AND NEW.channel_logs_webhook_id IS NOT NULL THEN
      NEW.guild_member_logs_webhook_id := NEW.channel_logs_webhook_id;
    ELSIF NEW.channel_logs_webhook_id IS NULL AND NEW.guild_member_logs_webhook_id IS NOT NULL THEN
      NEW.channel_logs_webhook_id := NEW.guild_member_logs_webhook_id;
END IF;
END IF;
  -- guild_member <-> emoji
  IF NEW.guild_member_logs_channel_id = NEW.emoji_logs_channel_id THEN
    IF NEW.guild_member_logs_webhook_id IS NULL AND NEW.emoji_logs_webhook_id IS NOT NULL THEN
      NEW.guild_member_logs_webhook_id := NEW.emoji_logs_webhook_id;
    ELSIF NEW.emoji_logs_webhook_id IS NULL AND NEW.guild_member_logs_webhook_id IS NOT NULL THEN
      NEW.emoji_logs_webhook_id := NEW.guild_member_logs_webhook_id;
END IF;
END IF;
  -- guild_member <-> role
  IF NEW.guild_member_logs_channel_id = NEW.role_logs_channel_id THEN
    IF NEW.guild_member_logs_webhook_id IS NULL AND NEW.role_logs_webhook_id IS NOT NULL THEN
      NEW.guild_member_logs_webhook_id := NEW.role_logs_webhook_id;
    ELSIF NEW.role_logs_webhook_id IS NULL AND NEW.guild_member_logs_webhook_id IS NOT NULL THEN
      NEW.role_logs_webhook_id := NEW.guild_member_logs_webhook_id;
END IF;
END IF;
  -- guild_member <-> sticker
  IF NEW.guild_member_logs_channel_id = NEW.sticker_logs_channel_id THEN
    IF NEW.guild_member_logs_webhook_id IS NULL AND NEW.sticker_logs_webhook_id IS NOT NULL THEN
      NEW.guild_member_logs_webhook_id := NEW.sticker_logs_webhook_id;
    ELSIF NEW.sticker_logs_webhook_id IS NULL AND NEW.guild_member_logs_webhook_id IS NOT NULL THEN
      NEW.sticker_logs_webhook_id := NEW.guild_member_logs_webhook_id;
END IF;
END IF;
  -- guild_member <-> event
  IF NEW.guild_member_logs_channel_id = NEW.event_logs_channel_id THEN
    IF NEW.guild_member_logs_webhook_id IS NULL AND NEW.event_logs_webhook_id IS NOT NULL THEN
      NEW.guild_member_logs_webhook_id := NEW.event_logs_webhook_id;
    ELSIF NEW.event_logs_webhook_id IS NULL AND NEW.guild_member_logs_webhook_id IS NOT NULL THEN
      NEW.event_logs_webhook_id := NEW.guild_member_logs_webhook_id;
END IF;
END IF;
  -- voice <-> channel
  IF NEW.voice_logs_channel_id = NEW.channel_logs_channel_id THEN
    IF NEW.voice_logs_webhook_id IS NULL AND NEW.channel_logs_webhook_id IS NOT NULL THEN
      NEW.voice_logs_webhook_id := NEW.channel_logs_webhook_id;
    ELSIF NEW.channel_logs_webhook_id IS NULL AND NEW.voice_logs_webhook_id IS NOT NULL THEN
      NEW.channel_logs_webhook_id := NEW.voice_logs_webhook_id;
END IF;
END IF;
  -- voice <-> emoji
  IF NEW.voice_logs_channel_id = NEW.emoji_logs_channel_id THEN
    IF NEW.voice_logs_webhook_id IS NULL AND NEW.emoji_logs_webhook_id IS NOT NULL THEN
      NEW.voice_logs_webhook_id := NEW.emoji_logs_webhook_id;
    ELSIF NEW.emoji_logs_webhook_id IS NULL AND NEW.voice_logs_webhook_id IS NOT NULL THEN
      NEW.emoji_logs_webhook_id := NEW.voice_logs_webhook_id;
END IF;
END IF;
  -- voice <-> role
  IF NEW.voice_logs_channel_id = NEW.role_logs_channel_id THEN
    IF NEW.voice_logs_webhook_id IS NULL AND NEW.role_logs_webhook_id IS NOT NULL THEN
      NEW.voice_logs_webhook_id := NEW.role_logs_webhook_id;
    ELSIF NEW.role_logs_webhook_id IS NULL AND NEW.voice_logs_webhook_id IS NOT NULL THEN
      NEW.role_logs_webhook_id := NEW.voice_logs_webhook_id;
END IF;
END IF;
  -- voice <-> sticker
  IF NEW.voice_logs_channel_id = NEW.sticker_logs_channel_id THEN
    IF NEW.voice_logs_webhook_id IS NULL AND NEW.sticker_logs_webhook_id IS NOT NULL THEN
      NEW.voice_logs_webhook_id := NEW.sticker_logs_webhook_id;
    ELSIF NEW.sticker_logs_webhook_id IS NULL AND NEW.voice_logs_webhook_id IS NOT NULL THEN
      NEW.sticker_logs_webhook_id := NEW.voice_logs_webhook_id;
END IF;
END IF;
  -- voice <-> event
  IF NEW.voice_logs_channel_id = NEW.event_logs_channel_id THEN
    IF NEW.voice_logs_webhook_id IS NULL AND NEW.event_logs_webhook_id IS NOT NULL THEN
      NEW.voice_logs_webhook_id := NEW.event_logs_webhook_id;
    ELSIF NEW.event_logs_webhook_id IS NULL AND NEW.voice_logs_webhook_id IS NOT NULL THEN
      NEW.event_logs_webhook_id := NEW.voice_logs_webhook_id;
END IF;
END IF;
  -- channel <-> emoji
  IF NEW.channel_logs_channel_id = NEW.emoji_logs_channel_id THEN
    IF NEW.channel_logs_webhook_id IS NULL AND NEW.emoji_logs_webhook_id IS NOT NULL THEN
      NEW.channel_logs_webhook_id := NEW.emoji_logs_webhook_id;
    ELSIF NEW.emoji_logs_webhook_id IS NULL AND NEW.channel_logs_webhook_id IS NOT NULL THEN
      NEW.emoji_logs_webhook_id := NEW.channel_logs_webhook_id;
END IF;
END IF;
  -- channel <-> role
  IF NEW.channel_logs_channel_id = NEW.role_logs_channel_id THEN
    IF NEW.channel_logs_webhook_id IS NULL AND NEW.role_logs_webhook_id IS NOT NULL THEN
      NEW.channel_logs_webhook_id := NEW.role_logs_webhook_id;
    ELSIF NEW.role_logs_webhook_id IS NULL AND NEW.channel_logs_webhook_id IS NOT NULL THEN
      NEW.role_logs_webhook_id := NEW.channel_logs_webhook_id;
END IF;
END IF;
  -- channel <-> sticker
  IF NEW.channel_logs_channel_id = NEW.sticker_logs_channel_id THEN
    IF NEW.channel_logs_webhook_id IS NULL AND NEW.sticker_logs_webhook_id IS NOT NULL THEN
      NEW.channel_logs_webhook_id := NEW.sticker_logs_webhook_id;
    ELSIF NEW.sticker_logs_webhook_id IS NULL AND NEW.channel_logs_webhook_id IS NOT NULL THEN
      NEW.sticker_logs_webhook_id := NEW.channel_logs_webhook_id;
END IF;
END IF;
  -- channel <-> event
  IF NEW.channel_logs_channel_id = NEW.event_logs_channel_id THEN
    IF NEW.channel_logs_webhook_id IS NULL AND NEW.event_logs_webhook_id IS NOT NULL THEN
      NEW.channel_logs_webhook_id := NEW.event_logs_webhook_id;
    ELSIF NEW.event_logs_webhook_id IS NULL AND NEW.channel_logs_webhook_id IS NOT NULL THEN
      NEW.event_logs_webhook_id := NEW.channel_logs_webhook_id;
END IF;
END IF;
  -- emoji <-> role
  IF NEW.emoji_logs_channel_id = NEW.role_logs_channel_id THEN
    IF NEW.emoji_logs_webhook_id IS NULL AND NEW.role_logs_webhook_id IS NOT NULL THEN
      NEW.emoji_logs_webhook_id := NEW.role_logs_webhook_id;
    ELSIF NEW.role_logs_webhook_id IS NULL AND NEW.emoji_logs_webhook_id IS NOT NULL THEN
      NEW.role_logs_webhook_id := NEW.emoji_logs_webhook_id;
END IF;
END IF;
  -- emoji <-> sticker
  IF NEW.emoji_logs_channel_id = NEW.sticker_logs_channel_id THEN
    IF NEW.emoji_logs_webhook_id IS NULL AND NEW.sticker_logs_webhook_id IS NOT NULL THEN
      NEW.emoji_logs_webhook_id := NEW.sticker_logs_webhook_id;
    ELSIF NEW.sticker_logs_webhook_id IS NULL AND NEW.emoji_logs_webhook_id IS NOT NULL THEN
      NEW.sticker_logs_webhook_id := NEW.emoji_logs_webhook_id;
END IF;
END IF;
  -- emoji <-> event
  IF NEW.emoji_logs_channel_id = NEW.event_logs_channel_id THEN
    IF NEW.emoji_logs_webhook_id IS NULL AND NEW.event_logs_webhook_id IS NOT NULL THEN
      NEW.emoji_logs_webhook_id := NEW.event_logs_webhook_id;
    ELSIF NEW.event_logs_webhook_id IS NULL AND NEW.emoji_logs_webhook_id IS NOT NULL THEN
      NEW.event_logs_webhook_id := NEW.emoji_logs_webhook_id;
END IF;
END IF;
  -- role <-> sticker
  IF NEW.role_logs_channel_id = NEW.sticker_logs_channel_id THEN
    IF NEW.role_logs_webhook_id IS NULL AND NEW.sticker_logs_webhook_id IS NOT NULL THEN
      NEW.role_logs_webhook_id := NEW.sticker_logs_webhook_id;
    ELSIF NEW.sticker_logs_webhook_id IS NULL AND NEW.role_logs_webhook_id IS NOT NULL THEN
      NEW.sticker_logs_webhook_id := NEW.role_logs_webhook_id;
END IF;
END IF;
  -- role <-> event
  IF NEW.role_logs_channel_id = NEW.event_logs_channel_id THEN
    IF NEW.role_logs_webhook_id IS NULL AND NEW.event_logs_webhook_id IS NOT NULL THEN
      NEW.role_logs_webhook_id := NEW.event_logs_webhook_id;
    ELSIF NEW.event_logs_webhook_id IS NULL AND NEW.role_logs_webhook_id IS NOT NULL THEN
      NEW.event_logs_webhook_id := NEW.role_logs_webhook_id;
END IF;
END IF;
  -- sticker <-> event
  IF NEW.sticker_logs_channel_id = NEW.event_logs_channel_id THEN
    IF NEW.sticker_logs_webhook_id IS NULL AND NEW.event_logs_webhook_id IS NOT NULL THEN
      NEW.sticker_logs_webhook_id := NEW.event_logs_webhook_id;
    ELSIF NEW.event_logs_webhook_id IS NULL AND NEW.sticker_logs_webhook_id IS NOT NULL THEN
      NEW.event_logs_webhook_id := NEW.sticker_logs_webhook_id;
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
