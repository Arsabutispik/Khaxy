-- CreateTable
CREATE TABLE "public"."bump_leaderboard" (
    "guild_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "bump_count" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "bump_leaderboard_pkey" PRIMARY KEY ("guild_id","user_id")
);

-- CreateTable
CREATE TABLE "public"."cronjobs" (
    "id" BIGINT NOT NULL,
    "color_time" TIMESTAMP(6),
    "unregistered_people_time" TIMESTAMP(6),

    CONSTRAINT "cronjobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."guilds" (
    "id" BIGINT NOT NULL,
    "mod_mail_channel_id" BIGINT,
    "dj_role_id" BIGINT,
    "days_to_kick" INTEGER NOT NULL DEFAULT 0,
    "default_expiry" INTEGER NOT NULL DEFAULT 0,
    "mod_mail_parent_channel_id" BIGINT,
    "register_channel_id" BIGINT,
    "member_role_id" BIGINT,
    "mute_role_id" BIGINT,
    "mute_get_all_roles" BOOLEAN,
    "join_channel_id" BIGINT,
    "register_join_channel_id" BIGINT,
    "mod_log_channel_id" BIGINT,
    "colour_id_of_the_day" BIGINT,
    "leave_channel_id" BIGINT,
    "case_id" INTEGER NOT NULL DEFAULT 1,
    "staff_role_id" BIGINT,
    "male_role_id" BIGINT,
    "female_role_id" BIGINT,
    "register_channel_clear" BOOLEAN,
    "register_join_message" TEXT,
    "colour_name_of_the_day" TEXT,
    "join_message" TEXT,
    "language" VARCHAR(5) NOT NULL DEFAULT 'en-GB',
    "leave_message" TEXT,
    "mod_mail_message" TEXT NOT NULL DEFAULT 'Thank you for your message! Our mod team will reply to you here as soon as possible.',
    "bump_leaderboard_channel_id" BIGINT,
    "last_bump_winner" TEXT,
    "last_bump_winner_count" INTEGER,
    "last_bump_winner_total_count" INTEGER,
    "unverified_role_id" BIGINT,
    "message_logs_channel_id" BIGINT,
    "message_logs_webhook_id" BIGINT,
    "guild_logs_channel_id" BIGINT,
    "guild_logs_webhook_id" BIGINT,
    "mod_logs_channel_id" BIGINT,
    "mod_logs_webhook_id" BIGINT,
    "guild_member_logs_channel_id" BIGINT,
    "guild_member_logs_webhook_id" BIGINT,
    "channel_logs_channel_id" BIGINT,
    "channel_logs_webhook_id" BIGINT,
    "voice_logs_channel_id" BIGINT,
    "voice_logs_webhook_id" BIGINT,
    "voice_audit_leave_logs_id" BIGINT,
    "voice_audit_leave_logs_count" INTEGER NOT NULL DEFAULT 0,
    "voice_audit_move_logs_id" BIGINT,
    "voice_audit_move_logs_count" INTEGER NOT NULL DEFAULT 0,
    "emoji_logs_channel_id" BIGINT,
    "emoji_logs_webhook_id" BIGINT,
    "role_logs_channel_id" BIGINT,
    "role_logs_webhook_id" BIGINT,
    "sticker_logs_channel_id" BIGINT,
    "sticker_logs_webhook_id" BIGINT,
    "event_logs_channel_id" BIGINT,
    "event_logs_webhook_id" BIGINT,
    "invite_logs_channel_id" BIGINT,
    "invite_logs_webhook_id" BIGINT,
    "poll_logs_channel_id" BIGINT,
    "poll_logs_webhook_id" BIGINT,
    "stage_logs_channel_id" BIGINT,
    "stage_logs_webhook_id" BIGINT,
    "soundboard_logs_channel_id" BIGINT,
    "soundboard_logs_webhook_id" BIGINT,
    "thread_logs_channel_id" BIGINT,
    "thread_logs_webhook_id" BIGINT,
    "webhook_logs_channel_id" BIGINT,
    "webhook_logs_webhook_id" BIGINT,

    CONSTRAINT "guilds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."infractions" (
    "id" BIGSERIAL NOT NULL,
    "guild_id" BIGINT NOT NULL,
    "moderator_id" BIGINT NOT NULL,
    "case_id" INTEGER NOT NULL,
    "user_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "expires_at" TIMESTAMP(6),
    "reason" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "infractions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mod_mail_messages" (
    "id" BIGSERIAL NOT NULL,
    "author_id" BIGINT NOT NULL,
    "sent_at" TIMESTAMP(6) NOT NULL,
    "message_id" BIGINT NOT NULL,
    "channel_id" BIGINT NOT NULL,
    "sent_to" TEXT NOT NULL,
    "author_type" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "mod_mail_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mod_mail_threads" (
    "guild_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "channel_id" BIGINT NOT NULL,
    "close_date" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL,
    "closed_at" TIMESTAMP(6),
    "status" TEXT NOT NULL,
    "closer_id" BIGINT,
    "id" BIGSERIAL NOT NULL
);

-- CreateTable
CREATE TABLE "public"."pgmigrations" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "run_on" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "pgmigrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."punishments" (
    "guild_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "user_id" BIGINT NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "previous_roles" BIGINT[],
    "staff_id" BIGINT NOT NULL,
    "type" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "public"."modmail_blacklist" (
    "id" BIGSERIAL NOT NULL,
    "guild_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "expires_at" TIMESTAMP(6),
    "reason" TEXT NOT NULL,
    "moderator_id" BIGINT NOT NULL,

    CONSTRAINT "modmail_blacklist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "infractions_id_key" ON "public"."infractions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_channel_id" ON "public"."mod_mail_threads"("channel_id");

-- CreateIndex
CREATE UNIQUE INDEX "mod_mail_threads_pk" ON "public"."mod_mail_threads"("id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_punishments" ON "public"."punishments"("guild_id", "user_id", "type");

-- AddForeignKey
ALTER TABLE "public"."mod_mail_messages" ADD CONSTRAINT "fk_mod_mail_thread" FOREIGN KEY ("channel_id") REFERENCES "public"."mod_mail_threads"("channel_id") ON DELETE CASCADE ON UPDATE NO ACTION;

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
  -- message <-> invite
  IF NEW.message_logs_channel_id = NEW.invite_logs_channel_id THEN
    IF NEW.message_logs_webhook_id IS NULL AND NEW.invite_logs_webhook_id IS NOT NULL THEN
      NEW.message_logs_webhook_id := NEW.invite_logs_webhook_id;
    ELSIF NEW.invite_logs_webhook_id IS NULL AND NEW.message_logs_webhook_id IS NOT NULL THEN
      NEW.invite_logs_webhook_id := NEW.message_logs_webhook_id;
END IF;
END IF;
  -- message <-> poll
  IF NEW.message_logs_channel_id = NEW.poll_logs_channel_id THEN
    IF NEW.message_logs_webhook_id IS NULL AND NEW.poll_logs_webhook_id IS NOT NULL THEN
      NEW.message_logs_webhook_id := NEW.poll_logs_webhook_id;
    ELSIF NEW.poll_logs_webhook_id IS NULL AND NEW.message_logs_webhook_id IS NOT NULL THEN
      NEW.poll_logs_webhook_id := NEW.message_logs_webhook_id;
END IF;
END IF;
  -- message <-> thread
  IF NEW.message_logs_channel_id = NEW.thread_logs_channel_id THEN
    IF NEW.message_logs_webhook_id IS NULL AND NEW.thread_logs_webhook_id IS NOT NULL THEN
      NEW.message_logs_webhook_id := NEW.thread_logs_webhook_id;
    ELSIF NEW.thread_logs_webhook_id IS NULL AND NEW.message_logs_webhook_id IS NOT NULL THEN
      NEW.thread_logs_webhook_id := NEW.message_logs_webhook_id;
END IF;
END IF;
  -- message <-> stage
  IF NEW.message_logs_channel_id = NEW.stage_logs_channel_id THEN
    IF NEW.message_logs_webhook_id IS NULL AND NEW.stage_logs_webhook_id IS NOT NULL THEN
      NEW.message_logs_webhook_id := NEW.stage_logs_webhook_id;
    ELSIF NEW.stage_logs_webhook_id IS NULL AND NEW.message_logs_webhook_id IS NOT NULL THEN
      NEW.stage_logs_webhook_id := NEW.message_logs_webhook_id;
END IF;
END IF;
  -- message <-> soundboard
  IF NEW.message_logs_channel_id = NEW.soundboard_logs_channel_id THEN
    IF NEW.message_logs_webhook_id IS NULL AND NEW.soundboard_logs_webhook_id IS NOT NULL THEN
      NEW.message_logs_webhook_id := NEW.soundboard_logs_webhook_id;
    ELSIF NEW.soundboard_logs_webhook_id IS NULL AND NEW.message_logs_webhook_id IS NOT NULL THEN
      NEW.soundboard_logs_webhook_id := NEW.message_logs_webhook_id;
END IF;
END IF;
  -- message <-> thread
  IF NEW.message_logs_channel_id = NEW.thread_logs_channel_id THEN
    IF NEW.message_logs_webhook_id IS NULL AND NEW.thread_logs_webhook_id IS NOT NULL THEN
      NEW.message_logs_webhook_id := NEW.thread_logs_webhook_id;
    ELSIF NEW.thread_logs_webhook_id IS NULL AND NEW.message_logs_webhook_id IS NOT NULL THEN
      NEW.thread_logs_webhook_id := NEW.message_logs_webhook_id;
END IF;
END IF;
  -- message <-> webhook
  IF NEW.message_logs_channel_id = NEW.webhook_logs_channel_id THEN
    IF NEW.message_logs_webhook_id IS NULL AND NEW.webhook_logs_webhook_id IS NOT NULL THEN
      NEW.message_logs_webhook_id := NEW.webhook_logs_webhook_id;
    ELSIF NEW.webhook_logs_webhook_id IS NULL AND NEW.message_logs_webhook_id IS NOT NULL THEN
      NEW.webhook_logs_webhook_id := NEW.message_logs_webhook_id;
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
  -- guild <-> invite
  IF NEW.guild_logs_channel_id = NEW.invite_logs_channel_id THEN
    IF NEW.guild_logs_webhook_id IS NULL AND NEW.invite_logs_webhook_id IS NOT NULL THEN
      NEW.guild_logs_webhook_id := NEW.invite_logs_webhook_id;
    ELSIF NEW.invite_logs_webhook_id IS NULL AND NEW.guild_logs_webhook_id IS NOT NULL THEN
      NEW.invite_logs_webhook_id := NEW.guild_logs_webhook_id;
END IF;
END IF;
  -- guild <-> poll
  IF NEW.guild_logs_channel_id = NEW.poll_logs_channel_id THEN
    IF NEW.guild_logs_webhook_id IS NULL AND NEW.poll_logs_webhook_id IS NOT NULL THEN
      NEW.guild_logs_webhook_id := NEW.poll_logs_webhook_id;
    ELSIF NEW.poll_logs_webhook_id IS NULL AND NEW.guild_logs_webhook_id IS NOT NULL THEN
      NEW.poll_logs_webhook_id := NEW.guild_logs_webhook_id;
END IF;
END IF;
  -- guild <-> thread
  IF NEW.guild_logs_channel_id = NEW.thread_logs_channel_id THEN
    IF NEW.guild_logs_webhook_id IS NULL AND NEW.thread_logs_webhook_id IS NOT NULL THEN
      NEW.guild_logs_webhook_id := NEW.thread_logs_webhook_id;
    ELSIF NEW.thread_logs_webhook_id IS NULL AND NEW.guild_logs_webhook_id IS NOT NULL THEN
      NEW.thread_logs_webhook_id := NEW.guild_logs_webhook_id;
END IF;
END IF;
  -- guild <-> stage
  IF NEW.guild_logs_channel_id = NEW.stage_logs_channel_id THEN
    IF NEW.guild_logs_webhook_id IS NULL AND NEW.stage_logs_webhook_id IS NOT NULL THEN
      NEW.guild_logs_webhook_id := NEW.stage_logs_webhook_id;
    ELSIF NEW.stage_logs_webhook_id IS NULL AND NEW.guild_logs_webhook_id IS NOT NULL THEN
      NEW.stage_logs_webhook_id := NEW.guild_logs_webhook_id;
END IF;
END IF;
  -- guild <-> soundboard
  IF NEW.guild_logs_channel_id = NEW.soundboard_logs_channel_id THEN
    IF NEW.guild_logs_webhook_id IS NULL AND NEW.soundboard_logs_webhook_id IS NOT NULL THEN
      NEW.guild_logs_webhook_id := NEW.soundboard_logs_webhook_id;
    ELSIF NEW.soundboard_logs_webhook_id IS NULL AND NEW.guild_logs_webhook_id IS NOT NULL THEN
      NEW.soundboard_logs_webhook_id := NEW.guild_logs_webhook_id;
END IF;
END IF;
  -- guild <-> thread
  IF NEW.guild_logs_channel_id = NEW.thread_logs_channel_id THEN
    IF NEW.guild_logs_webhook_id IS NULL AND NEW.thread_logs_webhook_id IS NOT NULL THEN
      NEW.guild_logs_webhook_id := NEW.thread_logs_webhook_id;
    ELSIF NEW.thread_logs_webhook_id IS NULL AND NEW.guild_logs_webhook_id IS NOT NULL THEN
      NEW.thread_logs_webhook_id := NEW.guild_logs_webhook_id;
END IF;
END IF;
  -- guild <-> webhook
  IF NEW.guild_logs_channel_id = NEW.webhook_logs_channel_id THEN
    IF NEW.guild_logs_webhook_id IS NULL AND NEW.webhook_logs_webhook_id IS NOT NULL THEN
      NEW.guild_logs_webhook_id := NEW.webhook_logs_webhook_id;
    ELSIF NEW.webhook_logs_webhook_id IS NULL AND NEW.guild_logs_webhook_id IS NOT NULL THEN
      NEW.webhook_logs_webhook_id := NEW.guild_logs_webhook_id;
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
  -- mod <-> invite
  IF NEW.mod_logs_channel_id = NEW.invite_logs_channel_id THEN
    IF NEW.mod_logs_webhook_id IS NULL AND NEW.invite_logs_webhook_id IS NOT NULL THEN
      NEW.mod_logs_webhook_id := NEW.invite_logs_webhook_id;
    ELSIF NEW.invite_logs_webhook_id IS NULL AND NEW.mod_logs_webhook_id IS NOT NULL THEN
      NEW.invite_logs_webhook_id := NEW.mod_logs_webhook_id;
END IF;
END IF;
  -- mod <-> poll
  IF NEW.mod_logs_channel_id = NEW.poll_logs_channel_id THEN
    IF NEW.mod_logs_webhook_id IS NULL AND NEW.poll_logs_webhook_id IS NOT NULL THEN
      NEW.mod_logs_webhook_id := NEW.poll_logs_webhook_id;
    ELSIF NEW.poll_logs_webhook_id IS NULL AND NEW.mod_logs_webhook_id IS NOT NULL THEN
      NEW.poll_logs_webhook_id := NEW.mod_logs_webhook_id;
END IF;
END IF;
  -- mod <-> thread
  IF NEW.mod_logs_channel_id = NEW.thread_logs_channel_id THEN
    IF NEW.mod_logs_webhook_id IS NULL AND NEW.thread_logs_webhook_id IS NOT NULL THEN
      NEW.mod_logs_webhook_id := NEW.thread_logs_webhook_id;
    ELSIF NEW.thread_logs_webhook_id IS NULL AND NEW.mod_logs_webhook_id IS NOT NULL THEN
      NEW.thread_logs_webhook_id := NEW.mod_logs_webhook_id;
END IF;
END IF;
  -- mod <-> stage
  IF NEW.mod_logs_channel_id = NEW.stage_logs_channel_id THEN
    IF NEW.mod_logs_webhook_id IS NULL AND NEW.stage_logs_webhook_id IS NOT NULL THEN
      NEW.mod_logs_webhook_id := NEW.stage_logs_webhook_id;
    ELSIF NEW.stage_logs_webhook_id IS NULL AND NEW.mod_logs_webhook_id IS NOT NULL THEN
      NEW.stage_logs_webhook_id := NEW.mod_logs_webhook_id;
END IF;
END IF;
  -- mod <-> soundboard
  IF NEW.mod_logs_channel_id = NEW.soundboard_logs_channel_id THEN
    IF NEW.mod_logs_webhook_id IS NULL AND NEW.soundboard_logs_webhook_id IS NOT NULL THEN
      NEW.mod_logs_webhook_id := NEW.soundboard_logs_webhook_id;
    ELSIF NEW.soundboard_logs_webhook_id IS NULL AND NEW.mod_logs_webhook_id IS NOT NULL THEN
      NEW.soundboard_logs_webhook_id := NEW.mod_logs_webhook_id;
END IF;
END IF;
  -- mod <-> thread
  IF NEW.mod_logs_channel_id = NEW.thread_logs_channel_id THEN
    IF NEW.mod_logs_webhook_id IS NULL AND NEW.thread_logs_webhook_id IS NOT NULL THEN
      NEW.mod_logs_webhook_id := NEW.thread_logs_webhook_id;
    ELSIF NEW.thread_logs_webhook_id IS NULL AND NEW.mod_logs_webhook_id IS NOT NULL THEN
      NEW.thread_logs_webhook_id := NEW.mod_logs_webhook_id;
END IF;
END IF;
  -- mod <-> webhook
  IF NEW.mod_logs_channel_id = NEW.webhook_logs_channel_id THEN
    IF NEW.mod_logs_webhook_id IS NULL AND NEW.webhook_logs_webhook_id IS NOT NULL THEN
      NEW.mod_logs_webhook_id := NEW.webhook_logs_webhook_id;
    ELSIF NEW.webhook_logs_webhook_id IS NULL AND NEW.mod_logs_webhook_id IS NOT NULL THEN
      NEW.webhook_logs_webhook_id := NEW.mod_logs_webhook_id;
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
  -- guild_member <-> invite
  IF NEW.guild_member_logs_channel_id = NEW.invite_logs_channel_id THEN
    IF NEW.guild_member_logs_webhook_id IS NULL AND NEW.invite_logs_webhook_id IS NOT NULL THEN
      NEW.guild_member_logs_webhook_id := NEW.invite_logs_webhook_id;
    ELSIF NEW.invite_logs_webhook_id IS NULL AND NEW.guild_member_logs_webhook_id IS NOT NULL THEN
      NEW.invite_logs_webhook_id := NEW.guild_member_logs_webhook_id;
END IF;
END IF;
  -- guild_member <-> poll
  IF NEW.guild_member_logs_channel_id = NEW.poll_logs_channel_id THEN
    IF NEW.guild_member_logs_webhook_id IS NULL AND NEW.poll_logs_webhook_id IS NOT NULL THEN
      NEW.guild_member_logs_webhook_id := NEW.poll_logs_webhook_id;
    ELSIF NEW.poll_logs_webhook_id IS NULL AND NEW.guild_member_logs_webhook_id IS NOT NULL THEN
      NEW.poll_logs_webhook_id := NEW.guild_member_logs_webhook_id;
END IF;
END IF;
  -- guild_member <-> thread
  IF NEW.guild_member_logs_channel_id = NEW.thread_logs_channel_id THEN
    IF NEW.guild_member_logs_webhook_id IS NULL AND NEW.thread_logs_webhook_id IS NOT NULL THEN
      NEW.guild_member_logs_webhook_id := NEW.thread_logs_webhook_id;
    ELSIF NEW.thread_logs_webhook_id IS NULL AND NEW.guild_member_logs_webhook_id IS NOT NULL THEN
      NEW.thread_logs_webhook_id := NEW.guild_member_logs_webhook_id;
END IF;
END IF;
  -- guild_member <-> stage
  IF NEW.guild_member_logs_channel_id = NEW.stage_logs_channel_id THEN
    IF NEW.guild_member_logs_webhook_id IS NULL AND NEW.stage_logs_webhook_id IS NOT NULL THEN
      NEW.guild_member_logs_webhook_id := NEW.stage_logs_webhook_id;
    ELSIF NEW.stage_logs_webhook_id IS NULL AND NEW.guild_member_logs_webhook_id IS NOT NULL THEN
      NEW.stage_logs_webhook_id := NEW.guild_member_logs_webhook_id;
END IF;
END IF;
  -- guild_member <-> soundboard
  IF NEW.guild_member_logs_channel_id = NEW.soundboard_logs_channel_id THEN
    IF NEW.guild_member_logs_webhook_id IS NULL AND NEW.soundboard_logs_webhook_id IS NOT NULL THEN
      NEW.guild_member_logs_webhook_id := NEW.soundboard_logs_webhook_id;
    ELSIF NEW.soundboard_logs_webhook_id IS NULL AND NEW.guild_member_logs_webhook_id IS NOT NULL THEN
      NEW.soundboard_logs_webhook_id := NEW.guild_member_logs_webhook_id;
END IF;
END IF;
  -- guild_member <-> thread
  IF NEW.guild_member_logs_channel_id = NEW.thread_logs_channel_id THEN
    IF NEW.guild_member_logs_webhook_id IS NULL AND NEW.thread_logs_webhook_id IS NOT NULL THEN
      NEW.guild_member_logs_webhook_id := NEW.thread_logs_webhook_id;
    ELSIF NEW.thread_logs_webhook_id IS NULL AND NEW.guild_member_logs_webhook_id IS NOT NULL THEN
      NEW.thread_logs_webhook_id := NEW.guild_member_logs_webhook_id;
END IF;
END IF;
  -- guild_member <-> webhook
  IF NEW.guild_member_logs_channel_id = NEW.webhook_logs_channel_id THEN
    IF NEW.guild_member_logs_webhook_id IS NULL AND NEW.webhook_logs_webhook_id IS NOT NULL THEN
      NEW.guild_member_logs_webhook_id := NEW.webhook_logs_webhook_id;
    ELSIF NEW.webhook_logs_webhook_id IS NULL AND NEW.guild_member_logs_webhook_id IS NOT NULL THEN
      NEW.webhook_logs_webhook_id := NEW.guild_member_logs_webhook_id;
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
  -- voice <-> invite
  IF NEW.voice_logs_channel_id = NEW.invite_logs_channel_id THEN
    IF NEW.voice_logs_webhook_id IS NULL AND NEW.invite_logs_webhook_id IS NOT NULL THEN
      NEW.voice_logs_webhook_id := NEW.invite_logs_webhook_id;
    ELSIF NEW.invite_logs_webhook_id IS NULL AND NEW.voice_logs_webhook_id IS NOT NULL THEN
      NEW.invite_logs_webhook_id := NEW.voice_logs_webhook_id;
END IF;
END IF;
  -- voice <-> poll
  IF NEW.voice_logs_channel_id = NEW.poll_logs_channel_id THEN
    IF NEW.voice_logs_webhook_id IS NULL AND NEW.poll_logs_webhook_id IS NOT NULL THEN
      NEW.voice_logs_webhook_id := NEW.poll_logs_webhook_id;
    ELSIF NEW.poll_logs_webhook_id IS NULL AND NEW.voice_logs_webhook_id IS NOT NULL THEN
      NEW.poll_logs_webhook_id := NEW.voice_logs_webhook_id;
END IF;
END IF;
  -- voice <-> thread
  IF NEW.voice_logs_channel_id = NEW.thread_logs_channel_id THEN
    IF NEW.voice_logs_webhook_id IS NULL AND NEW.thread_logs_webhook_id IS NOT NULL THEN
      NEW.voice_logs_webhook_id := NEW.thread_logs_webhook_id;
    ELSIF NEW.thread_logs_webhook_id IS NULL AND NEW.voice_logs_webhook_id IS NOT NULL THEN
      NEW.thread_logs_webhook_id := NEW.voice_logs_webhook_id;
END IF;
END IF;
  -- voice <-> stage
  IF NEW.voice_logs_channel_id = NEW.stage_logs_channel_id THEN
    IF NEW.voice_logs_webhook_id IS NULL AND NEW.stage_logs_webhook_id IS NOT NULL THEN
      NEW.voice_logs_webhook_id := NEW.stage_logs_webhook_id;
    ELSIF NEW.stage_logs_webhook_id IS NULL AND NEW.voice_logs_webhook_id IS NOT NULL THEN
      NEW.stage_logs_webhook_id := NEW.voice_logs_webhook_id;
END IF;
END IF;
  -- voice <-> soundboard
  IF NEW.voice_logs_channel_id = NEW.soundboard_logs_channel_id THEN
    IF NEW.voice_logs_webhook_id IS NULL AND NEW.soundboard_logs_webhook_id IS NOT NULL THEN
      NEW.voice_logs_webhook_id := NEW.soundboard_logs_webhook_id;
    ELSIF NEW.soundboard_logs_webhook_id IS NULL AND NEW.voice_logs_webhook_id IS NOT NULL THEN
      NEW.soundboard_logs_webhook_id := NEW.voice_logs_webhook_id;
END IF;
END IF;
  -- voice <-> thread
  IF NEW.voice_logs_channel_id = NEW.thread_logs_channel_id THEN
    IF NEW.voice_logs_webhook_id IS NULL AND NEW.thread_logs_webhook_id IS NOT NULL THEN
      NEW.voice_logs_webhook_id := NEW.thread_logs_webhook_id;
    ELSIF NEW.thread_logs_webhook_id IS NULL AND NEW.voice_logs_webhook_id IS NOT NULL THEN
      NEW.thread_logs_webhook_id := NEW.voice_logs_webhook_id;
END IF;
END IF;
  -- voice <-> webhook
  IF NEW.voice_logs_channel_id = NEW.webhook_logs_channel_id THEN
    IF NEW.voice_logs_webhook_id IS NULL AND NEW.webhook_logs_webhook_id IS NOT NULL THEN
      NEW.voice_logs_webhook_id := NEW.webhook_logs_webhook_id;
    ELSIF NEW.webhook_logs_webhook_id IS NULL AND NEW.voice_logs_webhook_id IS NOT NULL THEN
      NEW.webhook_logs_webhook_id := NEW.voice_logs_webhook_id;
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
  -- channel <-> invite
  IF NEW.channel_logs_channel_id = NEW.invite_logs_channel_id THEN
    IF NEW.channel_logs_webhook_id IS NULL AND NEW.invite_logs_webhook_id IS NOT NULL THEN
      NEW.channel_logs_webhook_id := NEW.invite_logs_webhook_id;
    ELSIF NEW.invite_logs_webhook_id IS NULL AND NEW.channel_logs_webhook_id IS NOT NULL THEN
      NEW.invite_logs_webhook_id := NEW.channel_logs_webhook_id;
END IF;
END IF;
  -- channel <-> poll
  IF NEW.channel_logs_channel_id = NEW.poll_logs_channel_id THEN
    IF NEW.channel_logs_webhook_id IS NULL AND NEW.poll_logs_webhook_id IS NOT NULL THEN
      NEW.channel_logs_webhook_id := NEW.poll_logs_webhook_id;
    ELSIF NEW.poll_logs_webhook_id IS NULL AND NEW.channel_logs_webhook_id IS NOT NULL THEN
      NEW.poll_logs_webhook_id := NEW.channel_logs_webhook_id;
END IF;
END IF;
  -- channel <-> thread
  IF NEW.channel_logs_channel_id = NEW.thread_logs_channel_id THEN
    IF NEW.channel_logs_webhook_id IS NULL AND NEW.thread_logs_webhook_id IS NOT NULL THEN
      NEW.channel_logs_webhook_id := NEW.thread_logs_webhook_id;
    ELSIF NEW.thread_logs_webhook_id IS NULL AND NEW.channel_logs_webhook_id IS NOT NULL THEN
      NEW.thread_logs_webhook_id := NEW.channel_logs_webhook_id;
END IF;
END IF;
  -- channel <-> stage
  IF NEW.channel_logs_channel_id = NEW.stage_logs_channel_id THEN
    IF NEW.channel_logs_webhook_id IS NULL AND NEW.stage_logs_webhook_id IS NOT NULL THEN
      NEW.channel_logs_webhook_id := NEW.stage_logs_webhook_id;
    ELSIF NEW.stage_logs_webhook_id IS NULL AND NEW.channel_logs_webhook_id IS NOT NULL THEN
      NEW.stage_logs_webhook_id := NEW.channel_logs_webhook_id;
END IF;
END IF;
  -- channel <-> soundboard
  IF NEW.channel_logs_channel_id = NEW.soundboard_logs_channel_id THEN
    IF NEW.channel_logs_webhook_id IS NULL AND NEW.soundboard_logs_webhook_id IS NOT NULL THEN
      NEW.channel_logs_webhook_id := NEW.soundboard_logs_webhook_id;
    ELSIF NEW.soundboard_logs_webhook_id IS NULL AND NEW.channel_logs_webhook_id IS NOT NULL THEN
      NEW.soundboard_logs_webhook_id := NEW.channel_logs_webhook_id;
END IF;
END IF;
  -- channel <-> thread
  IF NEW.channel_logs_channel_id = NEW.thread_logs_channel_id THEN
    IF NEW.channel_logs_webhook_id IS NULL AND NEW.thread_logs_webhook_id IS NOT NULL THEN
      NEW.channel_logs_webhook_id := NEW.thread_logs_webhook_id;
    ELSIF NEW.thread_logs_webhook_id IS NULL AND NEW.channel_logs_webhook_id IS NOT NULL THEN
      NEW.thread_logs_webhook_id := NEW.channel_logs_webhook_id;
END IF;
END IF;
  -- channel <-> webhook
  IF NEW.channel_logs_channel_id = NEW.webhook_logs_channel_id THEN
    IF NEW.channel_logs_webhook_id IS NULL AND NEW.webhook_logs_webhook_id IS NOT NULL THEN
      NEW.channel_logs_webhook_id := NEW.webhook_logs_webhook_id;
    ELSIF NEW.webhook_logs_webhook_id IS NULL AND NEW.channel_logs_webhook_id IS NOT NULL THEN
      NEW.webhook_logs_webhook_id := NEW.channel_logs_webhook_id;
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
  -- emoji <-> invite
  IF NEW.emoji_logs_channel_id = NEW.invite_logs_channel_id THEN
    IF NEW.emoji_logs_webhook_id IS NULL AND NEW.invite_logs_webhook_id IS NOT NULL THEN
      NEW.emoji_logs_webhook_id := NEW.invite_logs_webhook_id;
    ELSIF NEW.invite_logs_webhook_id IS NULL AND NEW.emoji_logs_webhook_id IS NOT NULL THEN
      NEW.invite_logs_webhook_id := NEW.emoji_logs_webhook_id;
END IF;
END IF;
  -- emoji <-> poll
  IF NEW.emoji_logs_channel_id = NEW.poll_logs_channel_id THEN
    IF NEW.emoji_logs_webhook_id IS NULL AND NEW.poll_logs_webhook_id IS NOT NULL THEN
      NEW.emoji_logs_webhook_id := NEW.poll_logs_webhook_id;
    ELSIF NEW.poll_logs_webhook_id IS NULL AND NEW.emoji_logs_webhook_id IS NOT NULL THEN
      NEW.poll_logs_webhook_id := NEW.emoji_logs_webhook_id;
END IF;
END IF;
  -- emoji <-> thread
  IF NEW.emoji_logs_channel_id = NEW.thread_logs_channel_id THEN
    IF NEW.emoji_logs_webhook_id IS NULL AND NEW.thread_logs_webhook_id IS NOT NULL THEN
      NEW.emoji_logs_webhook_id := NEW.thread_logs_webhook_id;
    ELSIF NEW.thread_logs_webhook_id IS NULL AND NEW.emoji_logs_webhook_id IS NOT NULL THEN
      NEW.thread_logs_webhook_id := NEW.emoji_logs_webhook_id;
END IF;
END IF;
  -- emoji <-> stage
  IF NEW.emoji_logs_channel_id = NEW.stage_logs_channel_id THEN
    IF NEW.emoji_logs_webhook_id IS NULL AND NEW.stage_logs_webhook_id IS NOT NULL THEN
      NEW.emoji_logs_webhook_id := NEW.stage_logs_webhook_id;
    ELSIF NEW.stage_logs_webhook_id IS NULL AND NEW.emoji_logs_webhook_id IS NOT NULL THEN
      NEW.stage_logs_webhook_id := NEW.emoji_logs_webhook_id;
END IF;
END IF;
  -- emoji <-> soundboard
  IF NEW.emoji_logs_channel_id = NEW.soundboard_logs_channel_id THEN
    IF NEW.emoji_logs_webhook_id IS NULL AND NEW.soundboard_logs_webhook_id IS NOT NULL THEN
      NEW.emoji_logs_webhook_id := NEW.soundboard_logs_webhook_id;
    ELSIF NEW.soundboard_logs_webhook_id IS NULL AND NEW.emoji_logs_webhook_id IS NOT NULL THEN
      NEW.soundboard_logs_webhook_id := NEW.emoji_logs_webhook_id;
END IF;
END IF;
  -- emoji <-> thread
  IF NEW.emoji_logs_channel_id = NEW.thread_logs_channel_id THEN
    IF NEW.emoji_logs_webhook_id IS NULL AND NEW.thread_logs_webhook_id IS NOT NULL THEN
      NEW.emoji_logs_webhook_id := NEW.thread_logs_webhook_id;
    ELSIF NEW.thread_logs_webhook_id IS NULL AND NEW.emoji_logs_webhook_id IS NOT NULL THEN
      NEW.thread_logs_webhook_id := NEW.emoji_logs_webhook_id;
END IF;
END IF;
  -- emoji <-> webhook
  IF NEW.emoji_logs_channel_id = NEW.webhook_logs_channel_id THEN
    IF NEW.emoji_logs_webhook_id IS NULL AND NEW.webhook_logs_webhook_id IS NOT NULL THEN
      NEW.emoji_logs_webhook_id := NEW.webhook_logs_webhook_id;
    ELSIF NEW.webhook_logs_webhook_id IS NULL AND NEW.emoji_logs_webhook_id IS NOT NULL THEN
      NEW.webhook_logs_webhook_id := NEW.emoji_logs_webhook_id;
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
  -- role <-> invite
  IF NEW.role_logs_channel_id = NEW.invite_logs_channel_id THEN
    IF NEW.role_logs_webhook_id IS NULL AND NEW.invite_logs_webhook_id IS NOT NULL THEN
      NEW.role_logs_webhook_id := NEW.invite_logs_webhook_id;
    ELSIF NEW.invite_logs_webhook_id IS NULL AND NEW.role_logs_webhook_id IS NOT NULL THEN
      NEW.invite_logs_webhook_id := NEW.role_logs_webhook_id;
END IF;
END IF;
  -- role <-> poll
  IF NEW.role_logs_channel_id = NEW.poll_logs_channel_id THEN
    IF NEW.role_logs_webhook_id IS NULL AND NEW.poll_logs_webhook_id IS NOT NULL THEN
      NEW.role_logs_webhook_id := NEW.poll_logs_webhook_id;
    ELSIF NEW.poll_logs_webhook_id IS NULL AND NEW.role_logs_webhook_id IS NOT NULL THEN
      NEW.poll_logs_webhook_id := NEW.role_logs_webhook_id;
END IF;
END IF;
  -- role <-> thread
  IF NEW.role_logs_channel_id = NEW.thread_logs_channel_id THEN
    IF NEW.role_logs_webhook_id IS NULL AND NEW.thread_logs_webhook_id IS NOT NULL THEN
      NEW.role_logs_webhook_id := NEW.thread_logs_webhook_id;
    ELSIF NEW.thread_logs_webhook_id IS NULL AND NEW.role_logs_webhook_id IS NOT NULL THEN
      NEW.thread_logs_webhook_id := NEW.role_logs_webhook_id;
END IF;
END IF;
  -- role <-> stage
  IF NEW.role_logs_channel_id = NEW.stage_logs_channel_id THEN
    IF NEW.role_logs_webhook_id IS NULL AND NEW.stage_logs_webhook_id IS NOT NULL THEN
      NEW.role_logs_webhook_id := NEW.stage_logs_webhook_id;
    ELSIF NEW.stage_logs_webhook_id IS NULL AND NEW.role_logs_webhook_id IS NOT NULL THEN
      NEW.stage_logs_webhook_id := NEW.role_logs_webhook_id;
END IF;
END IF;
  -- role <-> soundboard
  IF NEW.role_logs_channel_id = NEW.soundboard_logs_channel_id THEN
    IF NEW.role_logs_webhook_id IS NULL AND NEW.soundboard_logs_webhook_id IS NOT NULL THEN
      NEW.role_logs_webhook_id := NEW.soundboard_logs_webhook_id;
    ELSIF NEW.soundboard_logs_webhook_id IS NULL AND NEW.role_logs_webhook_id IS NOT NULL THEN
      NEW.soundboard_logs_webhook_id := NEW.role_logs_webhook_id;
END IF;
END IF;
  -- role <-> thread
  IF NEW.role_logs_channel_id = NEW.thread_logs_channel_id THEN
    IF NEW.role_logs_webhook_id IS NULL AND NEW.thread_logs_webhook_id IS NOT NULL THEN
      NEW.role_logs_webhook_id := NEW.thread_logs_webhook_id;
    ELSIF NEW.thread_logs_webhook_id IS NULL AND NEW.role_logs_webhook_id IS NOT NULL THEN
      NEW.thread_logs_webhook_id := NEW.role_logs_webhook_id;
END IF;
END IF;
  -- role <-> webhook
  IF NEW.role_logs_channel_id = NEW.webhook_logs_channel_id THEN
    IF NEW.role_logs_webhook_id IS NULL AND NEW.webhook_logs_webhook_id IS NOT NULL THEN
      NEW.role_logs_webhook_id := NEW.webhook_logs_webhook_id;
    ELSIF NEW.webhook_logs_webhook_id IS NULL AND NEW.role_logs_webhook_id IS NOT NULL THEN
      NEW.webhook_logs_webhook_id := NEW.role_logs_webhook_id;
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
  -- sticker <-> invite
  IF NEW.sticker_logs_channel_id = NEW.invite_logs_channel_id THEN
    IF NEW.sticker_logs_webhook_id IS NULL AND NEW.invite_logs_webhook_id IS NOT NULL THEN
      NEW.sticker_logs_webhook_id := NEW.invite_logs_webhook_id;
    ELSIF NEW.invite_logs_webhook_id IS NULL AND NEW.sticker_logs_webhook_id IS NOT NULL THEN
      NEW.invite_logs_webhook_id := NEW.sticker_logs_webhook_id;
END IF;
END IF;
  -- sticker <-> poll
  IF NEW.sticker_logs_channel_id = NEW.poll_logs_channel_id THEN
    IF NEW.sticker_logs_webhook_id IS NULL AND NEW.poll_logs_webhook_id IS NOT NULL THEN
      NEW.sticker_logs_webhook_id := NEW.poll_logs_webhook_id;
    ELSIF NEW.poll_logs_webhook_id IS NULL AND NEW.sticker_logs_webhook_id IS NOT NULL THEN
      NEW.poll_logs_webhook_id := NEW.sticker_logs_webhook_id;
END IF;
END IF;
  -- sticker <-> thread
  IF NEW.sticker_logs_channel_id = NEW.thread_logs_channel_id THEN
    IF NEW.sticker_logs_webhook_id IS NULL AND NEW.thread_logs_webhook_id IS NOT NULL THEN
      NEW.sticker_logs_webhook_id := NEW.thread_logs_webhook_id;
    ELSIF NEW.thread_logs_webhook_id IS NULL AND NEW.sticker_logs_webhook_id IS NOT NULL THEN
      NEW.thread_logs_webhook_id := NEW.sticker_logs_webhook_id;
END IF;
END IF;
  -- sticker <-> stage
  IF NEW.sticker_logs_channel_id = NEW.stage_logs_channel_id THEN
    IF NEW.sticker_logs_webhook_id IS NULL AND NEW.stage_logs_webhook_id IS NOT NULL THEN
      NEW.sticker_logs_webhook_id := NEW.stage_logs_webhook_id;
    ELSIF NEW.stage_logs_webhook_id IS NULL AND NEW.sticker_logs_webhook_id IS NOT NULL THEN
      NEW.stage_logs_webhook_id := NEW.sticker_logs_webhook_id;
END IF;
END IF;
  -- sticker <-> soundboard
  IF NEW.sticker_logs_channel_id = NEW.soundboard_logs_channel_id THEN
    IF NEW.sticker_logs_webhook_id IS NULL AND NEW.soundboard_logs_webhook_id IS NOT NULL THEN
      NEW.sticker_logs_webhook_id := NEW.soundboard_logs_webhook_id;
    ELSIF NEW.soundboard_logs_webhook_id IS NULL AND NEW.sticker_logs_webhook_id IS NOT NULL THEN
      NEW.soundboard_logs_webhook_id := NEW.sticker_logs_webhook_id;
END IF;
END IF;
  -- sticker <-> thread
  IF NEW.sticker_logs_channel_id = NEW.thread_logs_channel_id THEN
    IF NEW.sticker_logs_webhook_id IS NULL AND NEW.thread_logs_webhook_id IS NOT NULL THEN
      NEW.sticker_logs_webhook_id := NEW.thread_logs_webhook_id;
    ELSIF NEW.thread_logs_webhook_id IS NULL AND NEW.sticker_logs_webhook_id IS NOT NULL THEN
      NEW.thread_logs_webhook_id := NEW.sticker_logs_webhook_id;
END IF;
END IF;
  -- sticker <-> webhook
  IF NEW.sticker_logs_channel_id = NEW.webhook_logs_channel_id THEN
    IF NEW.sticker_logs_webhook_id IS NULL AND NEW.webhook_logs_webhook_id IS NOT NULL THEN
      NEW.sticker_logs_webhook_id := NEW.webhook_logs_webhook_id;
    ELSIF NEW.webhook_logs_webhook_id IS NULL AND NEW.sticker_logs_webhook_id IS NOT NULL THEN
      NEW.webhook_logs_webhook_id := NEW.sticker_logs_webhook_id;
END IF;
END IF;
  -- event <-> invite
  IF NEW.event_logs_channel_id = NEW.invite_logs_channel_id THEN
    IF NEW.event_logs_webhook_id IS NULL AND NEW.invite_logs_webhook_id IS NOT NULL THEN
      NEW.event_logs_webhook_id := NEW.invite_logs_webhook_id;
    ELSIF NEW.invite_logs_webhook_id IS NULL AND NEW.event_logs_webhook_id IS NOT NULL THEN
      NEW.invite_logs_webhook_id := NEW.event_logs_webhook_id;
END IF;
END IF;
  -- event <-> poll
  IF NEW.event_logs_channel_id = NEW.poll_logs_channel_id THEN
    IF NEW.event_logs_webhook_id IS NULL AND NEW.poll_logs_webhook_id IS NOT NULL THEN
      NEW.event_logs_webhook_id := NEW.poll_logs_webhook_id;
    ELSIF NEW.poll_logs_webhook_id IS NULL AND NEW.event_logs_webhook_id IS NOT NULL THEN
      NEW.poll_logs_webhook_id := NEW.event_logs_webhook_id;
END IF;
END IF;
  -- event <-> thread
  IF NEW.event_logs_channel_id = NEW.thread_logs_channel_id THEN
    IF NEW.event_logs_webhook_id IS NULL AND NEW.thread_logs_webhook_id IS NOT NULL THEN
      NEW.event_logs_webhook_id := NEW.thread_logs_webhook_id;
    ELSIF NEW.thread_logs_webhook_id IS NULL AND NEW.event_logs_webhook_id IS NOT NULL THEN
      NEW.thread_logs_webhook_id := NEW.event_logs_webhook_id;
END IF;
END IF;
  -- event <-> stage
  IF NEW.event_logs_channel_id = NEW.stage_logs_channel_id THEN
    IF NEW.event_logs_webhook_id IS NULL AND NEW.stage_logs_webhook_id IS NOT NULL THEN
      NEW.event_logs_webhook_id := NEW.stage_logs_webhook_id;
    ELSIF NEW.stage_logs_webhook_id IS NULL AND NEW.event_logs_webhook_id IS NOT NULL THEN
      NEW.stage_logs_webhook_id := NEW.event_logs_webhook_id;
END IF;
END IF;
  -- event <-> soundboard
  IF NEW.event_logs_channel_id = NEW.soundboard_logs_channel_id THEN
    IF NEW.event_logs_webhook_id IS NULL AND NEW.soundboard_logs_webhook_id IS NOT NULL THEN
      NEW.event_logs_webhook_id := NEW.soundboard_logs_webhook_id;
    ELSIF NEW.soundboard_logs_webhook_id IS NULL AND NEW.event_logs_webhook_id IS NOT NULL THEN
      NEW.soundboard_logs_webhook_id := NEW.event_logs_webhook_id;
END IF;
END IF;
  -- event <-> thread
  IF NEW.event_logs_channel_id = NEW.thread_logs_channel_id THEN
    IF NEW.event_logs_webhook_id IS NULL AND NEW.thread_logs_webhook_id IS NOT NULL THEN
      NEW.event_logs_webhook_id := NEW.thread_logs_webhook_id;
    ELSIF NEW.thread_logs_webhook_id IS NULL AND NEW.event_logs_webhook_id IS NOT NULL THEN
      NEW.thread_logs_webhook_id := NEW.event_logs_webhook_id;
END IF;
END IF;
  -- event <-> webhook
  IF NEW.event_logs_channel_id = NEW.webhook_logs_channel_id THEN
    IF NEW.event_logs_webhook_id IS NULL AND NEW.webhook_logs_webhook_id IS NOT NULL THEN
      NEW.event_logs_webhook_id := NEW.webhook_logs_webhook_id;
    ELSIF NEW.webhook_logs_webhook_id IS NULL AND NEW.event_logs_webhook_id IS NOT NULL THEN
      NEW.webhook_logs_webhook_id := NEW.event_logs_webhook_id;
END IF;
END IF;
  -- invite <-> poll
  IF NEW.invite_logs_channel_id = NEW.poll_logs_channel_id THEN
    IF NEW.invite_logs_webhook_id IS NULL AND NEW.poll_logs_webhook_id IS NOT NULL THEN
      NEW.invite_logs_webhook_id := NEW.poll_logs_webhook_id;
    ELSIF NEW.poll_logs_webhook_id IS NULL AND NEW.invite_logs_webhook_id IS NOT NULL THEN
      NEW.poll_logs_webhook_id := NEW.invite_logs_webhook_id;
END IF;
END IF;
  -- invite <-> thread
  IF NEW.invite_logs_channel_id = NEW.thread_logs_channel_id THEN
    IF NEW.invite_logs_webhook_id IS NULL AND NEW.thread_logs_webhook_id IS NOT NULL THEN
      NEW.invite_logs_webhook_id := NEW.thread_logs_webhook_id;
    ELSIF NEW.thread_logs_webhook_id IS NULL AND NEW.invite_logs_webhook_id IS NOT NULL THEN
      NEW.thread_logs_webhook_id := NEW.invite_logs_webhook_id;
END IF;
END IF;
  -- invite <-> stage
  IF NEW.invite_logs_channel_id = NEW.stage_logs_channel_id THEN
    IF NEW.invite_logs_webhook_id IS NULL AND NEW.stage_logs_webhook_id IS NOT NULL THEN
      NEW.invite_logs_webhook_id := NEW.stage_logs_webhook_id;
    ELSIF NEW.stage_logs_webhook_id IS NULL AND NEW.invite_logs_webhook_id IS NOT NULL THEN
      NEW.stage_logs_webhook_id := NEW.invite_logs_webhook_id;
END IF;
END IF;
  -- invite <-> soundboard
  IF NEW.invite_logs_channel_id = NEW.soundboard_logs_channel_id THEN
    IF NEW.invite_logs_webhook_id IS NULL AND NEW.soundboard_logs_webhook_id IS NOT NULL THEN
      NEW.invite_logs_webhook_id := NEW.soundboard_logs_webhook_id;
    ELSIF NEW.soundboard_logs_webhook_id IS NULL AND NEW.invite_logs_webhook_id IS NOT NULL THEN
      NEW.soundboard_logs_webhook_id := NEW.invite_logs_webhook_id;
END IF;
END IF;
  -- invite <-> thread
  IF NEW.invite_logs_channel_id = NEW.thread_logs_channel_id THEN
    IF NEW.invite_logs_webhook_id IS NULL AND NEW.thread_logs_webhook_id IS NOT NULL THEN
      NEW.invite_logs_webhook_id := NEW.thread_logs_webhook_id;
    ELSIF NEW.thread_logs_webhook_id IS NULL AND NEW.invite_logs_webhook_id IS NOT NULL THEN
      NEW.thread_logs_webhook_id := NEW.invite_logs_webhook_id;
END IF;
END IF;
  -- invite <-> webhook
  IF NEW.invite_logs_channel_id = NEW.webhook_logs_channel_id THEN
    IF NEW.invite_logs_webhook_id IS NULL AND NEW.webhook_logs_webhook_id IS NOT NULL THEN
      NEW.invite_logs_webhook_id := NEW.webhook_logs_webhook_id;
    ELSIF NEW.webhook_logs_webhook_id IS NULL AND NEW.invite_logs_webhook_id IS NOT NULL THEN
      NEW.webhook_logs_webhook_id := NEW.invite_logs_webhook_id;
END IF;
END IF;
  -- poll <-> thread
  IF NEW.poll_logs_channel_id = NEW.thread_logs_channel_id THEN
    IF NEW.poll_logs_webhook_id IS NULL AND NEW.thread_logs_webhook_id IS NOT NULL THEN
      NEW.poll_logs_webhook_id := NEW.thread_logs_webhook_id;
    ELSIF NEW.thread_logs_webhook_id IS NULL AND NEW.poll_logs_webhook_id IS NOT NULL THEN
      NEW.thread_logs_webhook_id := NEW.poll_logs_webhook_id;
END IF;
END IF;
  -- poll <-> stage
  IF NEW.poll_logs_channel_id = NEW.stage_logs_channel_id THEN
    IF NEW.poll_logs_webhook_id IS NULL AND NEW.stage_logs_webhook_id IS NOT NULL THEN
      NEW.poll_logs_webhook_id := NEW.stage_logs_webhook_id;
    ELSIF NEW.stage_logs_webhook_id IS NULL AND NEW.poll_logs_webhook_id IS NOT NULL THEN
      NEW.stage_logs_webhook_id := NEW.poll_logs_webhook_id;
END IF;
END IF;
  -- poll <-> soundboard
  IF NEW.poll_logs_channel_id = NEW.soundboard_logs_channel_id THEN
    IF NEW.poll_logs_webhook_id IS NULL AND NEW.soundboard_logs_webhook_id IS NOT NULL THEN
      NEW.poll_logs_webhook_id := NEW.soundboard_logs_webhook_id;
    ELSIF NEW.soundboard_logs_webhook_id IS NULL AND NEW.poll_logs_webhook_id IS NOT NULL THEN
      NEW.soundboard_logs_webhook_id := NEW.poll_logs_webhook_id;
END IF;
END IF;
  -- poll <-> thread
  IF NEW.poll_logs_channel_id = NEW.thread_logs_channel_id THEN
    IF NEW.poll_logs_webhook_id IS NULL AND NEW.thread_logs_webhook_id IS NOT NULL THEN
      NEW.poll_logs_webhook_id := NEW.thread_logs_webhook_id;
    ELSIF NEW.thread_logs_webhook_id IS NULL AND NEW.poll_logs_webhook_id IS NOT NULL THEN
      NEW.thread_logs_webhook_id := NEW.poll_logs_webhook_id;
END IF;
END IF;
  -- poll <-> webhook
  IF NEW.poll_logs_channel_id = NEW.webhook_logs_channel_id THEN
    IF NEW.poll_logs_webhook_id IS NULL AND NEW.webhook_logs_webhook_id IS NOT NULL THEN
      NEW.poll_logs_webhook_id := NEW.webhook_logs_webhook_id;
    ELSIF NEW.webhook_logs_webhook_id IS NULL AND NEW.poll_logs_webhook_id IS NOT NULL THEN
      NEW.webhook_logs_webhook_id := NEW.poll_logs_webhook_id;
END IF;
END IF;
  -- thread <-> stage
  IF NEW.thread_logs_channel_id = NEW.stage_logs_channel_id THEN
    IF NEW.thread_logs_webhook_id IS NULL AND NEW.stage_logs_webhook_id IS NOT NULL THEN
      NEW.thread_logs_webhook_id := NEW.stage_logs_webhook_id;
    ELSIF NEW.stage_logs_webhook_id IS NULL AND NEW.thread_logs_webhook_id IS NOT NULL THEN
      NEW.stage_logs_webhook_id := NEW.thread_logs_webhook_id;
END IF;
END IF;
  -- thread <-> soundboard
  IF NEW.thread_logs_channel_id = NEW.soundboard_logs_channel_id THEN
    IF NEW.thread_logs_webhook_id IS NULL AND NEW.soundboard_logs_webhook_id IS NOT NULL THEN
      NEW.thread_logs_webhook_id := NEW.soundboard_logs_webhook_id;
    ELSIF NEW.soundboard_logs_webhook_id IS NULL AND NEW.thread_logs_webhook_id IS NOT NULL THEN
      NEW.soundboard_logs_webhook_id := NEW.thread_logs_webhook_id;
END IF;
END IF;
  -- thread <-> thread
  IF NEW.thread_logs_channel_id = NEW.thread_logs_channel_id THEN
    IF NEW.thread_logs_webhook_id IS NULL AND NEW.thread_logs_webhook_id IS NOT NULL THEN
      NEW.thread_logs_webhook_id := NEW.thread_logs_webhook_id;
    ELSIF NEW.thread_logs_webhook_id IS NULL AND NEW.thread_logs_webhook_id IS NOT NULL THEN
      NEW.thread_logs_webhook_id := NEW.thread_logs_webhook_id;
END IF;
END IF;
  -- thread <-> webhook
  IF NEW.thread_logs_channel_id = NEW.webhook_logs_channel_id THEN
    IF NEW.thread_logs_webhook_id IS NULL AND NEW.webhook_logs_webhook_id IS NOT NULL THEN
      NEW.thread_logs_webhook_id := NEW.webhook_logs_webhook_id;
    ELSIF NEW.webhook_logs_webhook_id IS NULL AND NEW.thread_logs_webhook_id IS NOT NULL THEN
      NEW.webhook_logs_webhook_id := NEW.thread_logs_webhook_id;
END IF;
END IF;
  -- stage <-> soundboard
  IF NEW.stage_logs_channel_id = NEW.soundboard_logs_channel_id THEN
    IF NEW.stage_logs_webhook_id IS NULL AND NEW.soundboard_logs_webhook_id IS NOT NULL THEN
      NEW.stage_logs_webhook_id := NEW.soundboard_logs_webhook_id;
    ELSIF NEW.soundboard_logs_webhook_id IS NULL AND NEW.stage_logs_webhook_id IS NOT NULL THEN
      NEW.soundboard_logs_webhook_id := NEW.stage_logs_webhook_id;
END IF;
END IF;
  -- stage <-> thread
  IF NEW.stage_logs_channel_id = NEW.thread_logs_channel_id THEN
    IF NEW.stage_logs_webhook_id IS NULL AND NEW.thread_logs_webhook_id IS NOT NULL THEN
      NEW.stage_logs_webhook_id := NEW.thread_logs_webhook_id;
    ELSIF NEW.thread_logs_webhook_id IS NULL AND NEW.stage_logs_webhook_id IS NOT NULL THEN
      NEW.thread_logs_webhook_id := NEW.stage_logs_webhook_id;
END IF;
END IF;
  -- stage <-> webhook
  IF NEW.stage_logs_channel_id = NEW.webhook_logs_channel_id THEN
    IF NEW.stage_logs_webhook_id IS NULL AND NEW.webhook_logs_webhook_id IS NOT NULL THEN
      NEW.stage_logs_webhook_id := NEW.webhook_logs_webhook_id;
    ELSIF NEW.webhook_logs_webhook_id IS NULL AND NEW.stage_logs_webhook_id IS NOT NULL THEN
      NEW.webhook_logs_webhook_id := NEW.stage_logs_webhook_id;
END IF;
END IF;
  -- soundboard <-> thread
  IF NEW.soundboard_logs_channel_id = NEW.thread_logs_channel_id THEN
    IF NEW.soundboard_logs_webhook_id IS NULL AND NEW.thread_logs_webhook_id IS NOT NULL THEN
      NEW.soundboard_logs_webhook_id := NEW.thread_logs_webhook_id;
    ELSIF NEW.thread_logs_webhook_id IS NULL AND NEW.soundboard_logs_webhook_id IS NOT NULL THEN
      NEW.thread_logs_webhook_id := NEW.soundboard_logs_webhook_id;
END IF;
END IF;
  -- soundboard <-> webhook
  IF NEW.soundboard_logs_channel_id = NEW.webhook_logs_channel_id THEN
    IF NEW.soundboard_logs_webhook_id IS NULL AND NEW.webhook_logs_webhook_id IS NOT NULL THEN
      NEW.soundboard_logs_webhook_id := NEW.webhook_logs_webhook_id;
    ELSIF NEW.webhook_logs_webhook_id IS NULL AND NEW.soundboard_logs_webhook_id IS NOT NULL THEN
      NEW.webhook_logs_webhook_id := NEW.soundboard_logs_webhook_id;
END IF;
END IF;
  -- thread <-> webhook
  IF NEW.thread_logs_channel_id = NEW.webhook_logs_channel_id THEN
    IF NEW.thread_logs_webhook_id IS NULL AND NEW.webhook_logs_webhook_id IS NOT NULL THEN
      NEW.thread_logs_webhook_id := NEW.webhook_logs_webhook_id;
    ELSIF NEW.webhook_logs_webhook_id IS NULL AND NEW.thread_logs_webhook_id IS NOT NULL THEN
      NEW.webhook_logs_webhook_id := NEW.thread_logs_webhook_id;
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
