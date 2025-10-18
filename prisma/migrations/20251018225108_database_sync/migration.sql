CREATE OR REPLACE FUNCTION sync_log_webhook_ids()
RETURNS TRIGGER AS $$
BEGIN
  -- message <-> guild
  IF NEW.message_logs_channel_id = NEW.guild_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.guild_logs_webhook_id := NEW.message_logs_webhook_id;
END IF;
  -- message <-> mod
  IF NEW.message_logs_channel_id = NEW.mod_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.mod_logs_webhook_id := NEW.message_logs_webhook_id;
END IF;
  -- message <-> guild_member
  IF NEW.message_logs_channel_id = NEW.guild_member_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.guild_member_logs_webhook_id := NEW.message_logs_webhook_id;
END IF;
  -- message <-> voice
  IF NEW.message_logs_channel_id = NEW.voice_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.voice_logs_webhook_id := NEW.message_logs_webhook_id;
END IF;
  -- message <-> channel
  IF NEW.message_logs_channel_id = NEW.channel_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.channel_logs_webhook_id := NEW.message_logs_webhook_id;
END IF;
  -- message <-> emoji
  IF NEW.message_logs_channel_id = NEW.emoji_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.emoji_logs_webhook_id := NEW.message_logs_webhook_id;
END IF;
  -- message <-> role
  IF NEW.message_logs_channel_id = NEW.role_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.role_logs_webhook_id := NEW.message_logs_webhook_id;
END IF;
  -- message <-> sticker
  IF NEW.message_logs_channel_id = NEW.sticker_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.sticker_logs_webhook_id := NEW.message_logs_webhook_id;
END IF;
  -- message <-> event
  IF NEW.message_logs_channel_id = NEW.event_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.event_logs_webhook_id := NEW.message_logs_webhook_id;
END IF;
  -- message <-> invite
  IF NEW.message_logs_channel_id = NEW.invite_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.invite_logs_webhook_id := NEW.message_logs_webhook_id;
END IF;
  -- message <-> poll
  IF NEW.message_logs_channel_id = NEW.poll_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.poll_logs_webhook_id := NEW.message_logs_webhook_id;
END IF;
  -- message <-> stage
  IF NEW.message_logs_channel_id = NEW.stage_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.stage_logs_webhook_id := NEW.message_logs_webhook_id;
END IF;
  -- message <-> soundboard
  IF NEW.message_logs_channel_id = NEW.soundboard_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.soundboard_logs_webhook_id := NEW.message_logs_webhook_id;
END IF;
  -- message <-> thread
  IF NEW.message_logs_channel_id = NEW.thread_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.thread_logs_webhook_id := NEW.message_logs_webhook_id;
END IF;
  -- message <-> webhook
  IF NEW.message_logs_channel_id = NEW.webhook_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.webhook_logs_webhook_id := NEW.message_logs_webhook_id;
END IF;
  -- guild <-> mod
  IF NEW.guild_logs_channel_id = NEW.mod_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.mod_logs_webhook_id := NEW.guild_logs_webhook_id;
END IF;
  -- guild <-> guild_member
  IF NEW.guild_logs_channel_id = NEW.guild_member_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.guild_member_logs_webhook_id := NEW.guild_logs_webhook_id;
END IF;
  -- guild <-> voice
  IF NEW.guild_logs_channel_id = NEW.voice_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.voice_logs_webhook_id := NEW.guild_logs_webhook_id;
END IF;
  -- guild <-> channel
  IF NEW.guild_logs_channel_id = NEW.channel_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.channel_logs_webhook_id := NEW.guild_logs_webhook_id;
END IF;
  -- guild <-> emoji
  IF NEW.guild_logs_channel_id = NEW.emoji_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.emoji_logs_webhook_id := NEW.guild_logs_webhook_id;
END IF;
  -- guild <-> role
  IF NEW.guild_logs_channel_id = NEW.role_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.role_logs_webhook_id := NEW.guild_logs_webhook_id;
END IF;
  -- guild <-> sticker
  IF NEW.guild_logs_channel_id = NEW.sticker_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.sticker_logs_webhook_id := NEW.guild_logs_webhook_id;
END IF;
  -- guild <-> event
  IF NEW.guild_logs_channel_id = NEW.event_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.event_logs_webhook_id := NEW.guild_logs_webhook_id;
END IF;
  -- guild <-> invite
  IF NEW.guild_logs_channel_id = NEW.invite_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.invite_logs_webhook_id := NEW.guild_logs_webhook_id;
END IF;
  -- guild <-> poll
  IF NEW.guild_logs_channel_id = NEW.poll_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.poll_logs_webhook_id := NEW.guild_logs_webhook_id;
END IF;
  -- guild <-> stage
  IF NEW.guild_logs_channel_id = NEW.stage_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.stage_logs_webhook_id := NEW.guild_logs_webhook_id;
END IF;
  -- guild <-> soundboard
  IF NEW.guild_logs_channel_id = NEW.soundboard_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.soundboard_logs_webhook_id := NEW.guild_logs_webhook_id;
END IF;
  -- guild <-> thread
  IF NEW.guild_logs_channel_id = NEW.thread_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.thread_logs_webhook_id := NEW.guild_logs_webhook_id;
END IF;
  -- guild <-> webhook
  IF NEW.guild_logs_channel_id = NEW.webhook_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.webhook_logs_webhook_id := NEW.guild_logs_webhook_id;
END IF;
  -- mod <-> guild_member
  IF NEW.mod_logs_channel_id = NEW.guild_member_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.guild_member_logs_webhook_id := NEW.mod_logs_webhook_id;
END IF;
  -- mod <-> voice
  IF NEW.mod_logs_channel_id = NEW.voice_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.voice_logs_webhook_id := NEW.mod_logs_webhook_id;
END IF;
  -- mod <-> channel
  IF NEW.mod_logs_channel_id = NEW.channel_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.channel_logs_webhook_id := NEW.mod_logs_webhook_id;
END IF;
  -- mod <-> emoji
  IF NEW.mod_logs_channel_id = NEW.emoji_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.emoji_logs_webhook_id := NEW.mod_logs_webhook_id;
END IF;
  -- mod <-> role
  IF NEW.mod_logs_channel_id = NEW.role_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.role_logs_webhook_id := NEW.mod_logs_webhook_id;
END IF;
  -- mod <-> sticker
  IF NEW.mod_logs_channel_id = NEW.sticker_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.sticker_logs_webhook_id := NEW.mod_logs_webhook_id;
END IF;
  -- mod <-> event
  IF NEW.mod_logs_channel_id = NEW.event_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.event_logs_webhook_id := NEW.mod_logs_webhook_id;
END IF;
  -- mod <-> invite
  IF NEW.mod_logs_channel_id = NEW.invite_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.invite_logs_webhook_id := NEW.mod_logs_webhook_id;
END IF;
  -- mod <-> poll
  IF NEW.mod_logs_channel_id = NEW.poll_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.poll_logs_webhook_id := NEW.mod_logs_webhook_id;
END IF;
  -- mod <-> stage
  IF NEW.mod_logs_channel_id = NEW.stage_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.stage_logs_webhook_id := NEW.mod_logs_webhook_id;
END IF;
  -- mod <-> soundboard
  IF NEW.mod_logs_channel_id = NEW.soundboard_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.soundboard_logs_webhook_id := NEW.mod_logs_webhook_id;
END IF;
  -- mod <-> thread
  IF NEW.mod_logs_channel_id = NEW.thread_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.thread_logs_webhook_id := NEW.mod_logs_webhook_id;
END IF;
  -- mod <-> webhook
  IF NEW.mod_logs_channel_id = NEW.webhook_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.webhook_logs_webhook_id := NEW.mod_logs_webhook_id;
END IF;
  -- guild_member <-> voice
  IF NEW.guild_member_logs_channel_id = NEW.voice_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.voice_logs_webhook_id := NEW.guild_member_logs_webhook_id;
END IF;
  -- guild_member <-> channel
  IF NEW.guild_member_logs_channel_id = NEW.channel_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.channel_logs_webhook_id := NEW.guild_member_logs_webhook_id;
END IF;
  -- guild_member <-> emoji
  IF NEW.guild_member_logs_channel_id = NEW.emoji_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.emoji_logs_webhook_id := NEW.guild_member_logs_webhook_id;
END IF;
  -- guild_member <-> role
  IF NEW.guild_member_logs_channel_id = NEW.role_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.role_logs_webhook_id := NEW.guild_member_logs_webhook_id;
END IF;
  -- guild_member <-> sticker
  IF NEW.guild_member_logs_channel_id = NEW.sticker_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.sticker_logs_webhook_id := NEW.guild_member_logs_webhook_id;
END IF;
  -- guild_member <-> event
  IF NEW.guild_member_logs_channel_id = NEW.event_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.event_logs_webhook_id := NEW.guild_member_logs_webhook_id;
END IF;
  -- guild_member <-> invite
  IF NEW.guild_member_logs_channel_id = NEW.invite_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.invite_logs_webhook_id := NEW.guild_member_logs_webhook_id;
END IF;
  -- guild_member <-> poll
  IF NEW.guild_member_logs_channel_id = NEW.poll_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.poll_logs_webhook_id := NEW.guild_member_logs_webhook_id;
END IF;
  -- guild_member <-> stage
  IF NEW.guild_member_logs_channel_id = NEW.stage_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.stage_logs_webhook_id := NEW.guild_member_logs_webhook_id;
END IF;
  -- guild_member <-> soundboard
  IF NEW.guild_member_logs_channel_id = NEW.soundboard_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.soundboard_logs_webhook_id := NEW.guild_member_logs_webhook_id;
END IF;
  -- guild_member <-> thread
  IF NEW.guild_member_logs_channel_id = NEW.thread_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.thread_logs_webhook_id := NEW.guild_member_logs_webhook_id;
END IF;
  -- guild_member <-> webhook
  IF NEW.guild_member_logs_channel_id = NEW.webhook_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.webhook_logs_webhook_id := NEW.guild_member_logs_webhook_id;
END IF;
  -- voice <-> channel
  IF NEW.voice_logs_channel_id = NEW.channel_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.channel_logs_webhook_id := NEW.voice_logs_webhook_id;
END IF;
  -- voice <-> emoji
  IF NEW.voice_logs_channel_id = NEW.emoji_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.emoji_logs_webhook_id := NEW.voice_logs_webhook_id;
END IF;
  -- voice <-> role
  IF NEW.voice_logs_channel_id = NEW.role_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.role_logs_webhook_id := NEW.voice_logs_webhook_id;
END IF;
  -- voice <-> sticker
  IF NEW.voice_logs_channel_id = NEW.sticker_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.sticker_logs_webhook_id := NEW.voice_logs_webhook_id;
END IF;
  -- voice <-> event
  IF NEW.voice_logs_channel_id = NEW.event_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.event_logs_webhook_id := NEW.voice_logs_webhook_id;
END IF;
  -- voice <-> invite
  IF NEW.voice_logs_channel_id = NEW.invite_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.invite_logs_webhook_id := NEW.voice_logs_webhook_id;
END IF;
  -- voice <-> poll
  IF NEW.voice_logs_channel_id = NEW.poll_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.poll_logs_webhook_id := NEW.voice_logs_webhook_id;
END IF;
  -- voice <-> stage
  IF NEW.voice_logs_channel_id = NEW.stage_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.stage_logs_webhook_id := NEW.voice_logs_webhook_id;
END IF;
  -- voice <-> soundboard
  IF NEW.voice_logs_channel_id = NEW.soundboard_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.soundboard_logs_webhook_id := NEW.voice_logs_webhook_id;
END IF;
  -- voice <-> thread
  IF NEW.voice_logs_channel_id = NEW.thread_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.thread_logs_webhook_id := NEW.voice_logs_webhook_id;
END IF;
  -- voice <-> webhook
  IF NEW.voice_logs_channel_id = NEW.webhook_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.webhook_logs_webhook_id := NEW.voice_logs_webhook_id;
END IF;
  -- channel <-> emoji
  IF NEW.channel_logs_channel_id = NEW.emoji_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.emoji_logs_webhook_id := NEW.channel_logs_webhook_id;
END IF;
  -- channel <-> role
  IF NEW.channel_logs_channel_id = NEW.role_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.role_logs_webhook_id := NEW.channel_logs_webhook_id;
END IF;
  -- channel <-> sticker
  IF NEW.channel_logs_channel_id = NEW.sticker_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.sticker_logs_webhook_id := NEW.channel_logs_webhook_id;
END IF;
  -- channel <-> event
  IF NEW.channel_logs_channel_id = NEW.event_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.event_logs_webhook_id := NEW.channel_logs_webhook_id;
END IF;
  -- channel <-> invite
  IF NEW.channel_logs_channel_id = NEW.invite_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.invite_logs_webhook_id := NEW.channel_logs_webhook_id;
END IF;
  -- channel <-> poll
  IF NEW.channel_logs_channel_id = NEW.poll_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.poll_logs_webhook_id := NEW.channel_logs_webhook_id;
END IF;
  -- channel <-> stage
  IF NEW.channel_logs_channel_id = NEW.stage_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.stage_logs_webhook_id := NEW.channel_logs_webhook_id;
END IF;
  -- channel <-> soundboard
  IF NEW.channel_logs_channel_id = NEW.soundboard_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.soundboard_logs_webhook_id := NEW.channel_logs_webhook_id;
END IF;
  -- channel <-> thread
  IF NEW.channel_logs_channel_id = NEW.thread_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.thread_logs_webhook_id := NEW.channel_logs_webhook_id;
END IF;
  -- channel <-> webhook
  IF NEW.channel_logs_channel_id = NEW.webhook_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.webhook_logs_webhook_id := NEW.channel_logs_webhook_id;
END IF;
  -- emoji <-> role
  IF NEW.emoji_logs_channel_id = NEW.role_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.role_logs_webhook_id := NEW.emoji_logs_webhook_id;
END IF;
  -- emoji <-> sticker
  IF NEW.emoji_logs_channel_id = NEW.sticker_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.sticker_logs_webhook_id := NEW.emoji_logs_webhook_id;
END IF;
  -- emoji <-> event
  IF NEW.emoji_logs_channel_id = NEW.event_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.event_logs_webhook_id := NEW.emoji_logs_webhook_id;
END IF;
  -- emoji <-> invite
  IF NEW.emoji_logs_channel_id = NEW.invite_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.invite_logs_webhook_id := NEW.emoji_logs_webhook_id;
END IF;
  -- emoji <-> poll
  IF NEW.emoji_logs_channel_id = NEW.poll_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.poll_logs_webhook_id := NEW.emoji_logs_webhook_id;
END IF;
  -- emoji <-> stage
  IF NEW.emoji_logs_channel_id = NEW.stage_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.stage_logs_webhook_id := NEW.emoji_logs_webhook_id;
END IF;
  -- emoji <-> soundboard
  IF NEW.emoji_logs_channel_id = NEW.soundboard_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.soundboard_logs_webhook_id := NEW.emoji_logs_webhook_id;
END IF;
  -- emoji <-> thread
  IF NEW.emoji_logs_channel_id = NEW.thread_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.thread_logs_webhook_id := NEW.emoji_logs_webhook_id;
END IF;
  -- emoji <-> webhook
  IF NEW.emoji_logs_channel_id = NEW.webhook_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.webhook_logs_webhook_id := NEW.emoji_logs_webhook_id;
END IF;
  -- role <-> sticker
  IF NEW.role_logs_channel_id = NEW.sticker_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.sticker_logs_webhook_id := NEW.role_logs_webhook_id;
END IF;
  -- role <-> event
  IF NEW.role_logs_channel_id = NEW.event_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.event_logs_webhook_id := NEW.role_logs_webhook_id;
END IF;
  -- role <-> invite
  IF NEW.role_logs_channel_id = NEW.invite_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.invite_logs_webhook_id := NEW.role_logs_webhook_id;
END IF;
  -- role <-> poll
  IF NEW.role_logs_channel_id = NEW.poll_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.poll_logs_webhook_id := NEW.role_logs_webhook_id;
END IF;
  -- role <-> stage
  IF NEW.role_logs_channel_id = NEW.stage_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.stage_logs_webhook_id := NEW.role_logs_webhook_id;
END IF;
  -- role <-> soundboard
  IF NEW.role_logs_channel_id = NEW.soundboard_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.soundboard_logs_webhook_id := NEW.role_logs_webhook_id;
END IF;
  -- role <-> thread
  IF NEW.role_logs_channel_id = NEW.thread_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.thread_logs_webhook_id := NEW.role_logs_webhook_id;
END IF;
  -- role <-> webhook
  IF NEW.role_logs_channel_id = NEW.webhook_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.webhook_logs_webhook_id := NEW.role_logs_webhook_id;
END IF;
  -- sticker <-> event
  IF NEW.sticker_logs_channel_id = NEW.event_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.event_logs_webhook_id := NEW.sticker_logs_webhook_id;
END IF;
  -- sticker <-> invite
  IF NEW.sticker_logs_channel_id = NEW.invite_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.invite_logs_webhook_id := NEW.sticker_logs_webhook_id;
END IF;
  -- sticker <-> poll
  IF NEW.sticker_logs_channel_id = NEW.poll_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.poll_logs_webhook_id := NEW.sticker_logs_webhook_id;
END IF;
  -- sticker <-> stage
  IF NEW.sticker_logs_channel_id = NEW.stage_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.stage_logs_webhook_id := NEW.sticker_logs_webhook_id;
END IF;
  -- sticker <-> soundboard
  IF NEW.sticker_logs_channel_id = NEW.soundboard_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.soundboard_logs_webhook_id := NEW.sticker_logs_webhook_id;
END IF;
  -- sticker <-> thread
  IF NEW.sticker_logs_channel_id = NEW.thread_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.thread_logs_webhook_id := NEW.sticker_logs_webhook_id;
END IF;
  -- sticker <-> webhook
  IF NEW.sticker_logs_channel_id = NEW.webhook_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.webhook_logs_webhook_id := NEW.sticker_logs_webhook_id;
END IF;
  -- event <-> invite
  IF NEW.event_logs_channel_id = NEW.invite_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.invite_logs_webhook_id := NEW.event_logs_webhook_id;
END IF;
  -- event <-> poll
  IF NEW.event_logs_channel_id = NEW.poll_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.poll_logs_webhook_id := NEW.event_logs_webhook_id;
END IF;
  -- event <-> stage
  IF NEW.event_logs_channel_id = NEW.stage_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.stage_logs_webhook_id := NEW.event_logs_webhook_id;
END IF;
  -- event <-> soundboard
  IF NEW.event_logs_channel_id = NEW.soundboard_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.soundboard_logs_webhook_id := NEW.event_logs_webhook_id;
END IF;
  -- event <-> thread
  IF NEW.event_logs_channel_id = NEW.thread_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.thread_logs_webhook_id := NEW.event_logs_webhook_id;
END IF;
  -- event <-> webhook
  IF NEW.event_logs_channel_id = NEW.webhook_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.webhook_logs_webhook_id := NEW.event_logs_webhook_id;
END IF;
  -- invite <-> poll
  IF NEW.invite_logs_channel_id = NEW.poll_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.poll_logs_webhook_id := NEW.invite_logs_webhook_id;
END IF;
  -- invite <-> stage
  IF NEW.invite_logs_channel_id = NEW.stage_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.stage_logs_webhook_id := NEW.invite_logs_webhook_id;
END IF;
  -- invite <-> soundboard
  IF NEW.invite_logs_channel_id = NEW.soundboard_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.soundboard_logs_webhook_id := NEW.invite_logs_webhook_id;
END IF;
  -- invite <-> thread
  IF NEW.invite_logs_channel_id = NEW.thread_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.thread_logs_webhook_id := NEW.invite_logs_webhook_id;
END IF;
  -- invite <-> webhook
  IF NEW.invite_logs_channel_id = NEW.webhook_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.webhook_logs_webhook_id := NEW.invite_logs_webhook_id;
END IF;
  -- poll <-> stage
  IF NEW.poll_logs_channel_id = NEW.stage_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.stage_logs_webhook_id := NEW.poll_logs_webhook_id;
END IF;
  -- poll <-> soundboard
  IF NEW.poll_logs_channel_id = NEW.soundboard_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.soundboard_logs_webhook_id := NEW.poll_logs_webhook_id;
END IF;
  -- poll <-> thread
  IF NEW.poll_logs_channel_id = NEW.thread_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.thread_logs_webhook_id := NEW.poll_logs_webhook_id;
END IF;
  -- poll <-> webhook
  IF NEW.poll_logs_channel_id = NEW.webhook_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.webhook_logs_webhook_id := NEW.poll_logs_webhook_id;
END IF;
  -- stage <-> soundboard
  IF NEW.stage_logs_channel_id = NEW.soundboard_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.soundboard_logs_webhook_id := NEW.stage_logs_webhook_id;
END IF;
  -- stage <-> thread
  IF NEW.stage_logs_channel_id = NEW.thread_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.thread_logs_webhook_id := NEW.stage_logs_webhook_id;
END IF;
  -- stage <-> webhook
  IF NEW.stage_logs_channel_id = NEW.webhook_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.webhook_logs_webhook_id := NEW.stage_logs_webhook_id;
END IF;
  -- soundboard <-> thread
  IF NEW.soundboard_logs_channel_id = NEW.thread_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.thread_logs_webhook_id := NEW.soundboard_logs_webhook_id;
END IF;
  -- soundboard <-> webhook
  IF NEW.soundboard_logs_channel_id = NEW.webhook_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.webhook_logs_webhook_id := NEW.soundboard_logs_webhook_id;
END IF;
  -- thread <-> webhook
  IF NEW.thread_logs_channel_id = NEW.webhook_logs_channel_id THEN
    -- If A has a value (ID or NULL), B takes that value. A is the authority.
    NEW.webhook_logs_webhook_id := NEW.thread_logs_webhook_id;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_log_webhooks ON guilds;

CREATE TRIGGER trg_sync_log_webhooks
    BEFORE INSERT OR UPDATE ON guilds
                         FOR EACH ROW
                         EXECUTE FUNCTION sync_log_webhook_ids();
