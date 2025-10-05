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

-- --- !START SHADOW_IGNORE
-- Functions and triggers below are ignored in the shadow database
CREATE OR REPLACE FUNCTION public.sync_log_webhook_ids()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
log_types TEXT[] := ARRAY[
    'message', 'guild', 'mod', 'guild_member',
    'voice', 'channel', 'emoji', 'role', 'sticker', 'poll', 'soundboard', 'stage', 'thread', 'webhook'
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
$function$;

CREATE TRIGGER trg_sync_log_webhooks
    BEFORE INSERT OR UPDATE ON public.guilds
                         FOR EACH ROW
                         EXECUTE FUNCTION sync_log_webhook_ids();
-- --- !END SHADOW_IGNORE