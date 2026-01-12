-- =====================================================================
-- STEP 1: SETUP ENUMS (Wrapped in Safe Blocks)
-- =====================================================================

DO $$ BEGIN
CREATE TYPE "InfractionType" AS ENUM ('WARN', 'MUTE', 'KICK', 'BAN', 'TEMPBAN', 'UNBAN', 'UNMUTE', 'NOTE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
CREATE TYPE "ModMailStatus" AS ENUM ('OPEN', 'CLOSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
CREATE TYPE "ModMailAuthorType" AS ENUM ('USER', 'STAFF', 'SYSTEM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    -- Note: We rename the type if it exists as the old name, then add the value
    -- This handles the specific ModMail enum migration logic safely
CREATE TYPE "ModMailSentType" AS ENUM ('USER', 'THREAD', 'COMMAND');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Handle legacy name if it exists (SentToType -> ModMailSentType)
DO $$ BEGIN
ALTER TYPE "SentToType" RENAME TO "ModMailSentType";
EXCEPTION
    WHEN undefined_object THEN null; -- If SentToType doesn't exist, ignore
WHEN duplicate_object THEN null; -- If ModMailSentType already exists, ignore
END $$;

DO $$ BEGIN
CREATE TYPE "PunishmentAction" AS ENUM ('WARN', 'MUTE', 'KICK', 'BAN', 'UNBAN', 'UNMUTE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- =====================================================================
-- STEP 2: CREATE NEW TABLES & RESCUE DATA
-- =====================================================================

-- CreateTable: GuildLogConfigs
CREATE TABLE IF NOT EXISTS "guild_log_configs" (
                                                   "guild_id" TEXT NOT NULL,
                                                   "message_logs_channel_id" TEXT,
                                                   "message_logs_webhook_id" TEXT,
                                                   "guild_logs_channel_id" TEXT,
                                                   "guild_logs_webhook_id" TEXT,
                                                   "mod_logs_channel_id" TEXT,
                                                   "mod_logs_webhook_id" TEXT,
                                                   "guild_member_logs_channel_id" TEXT,
                                                   "guild_member_logs_webhook_id" TEXT,
                                                   "channel_logs_channel_id" TEXT,
                                                   "channel_logs_webhook_id" TEXT,
                                                   "voice_logs_channel_id" TEXT,
                                                   "voice_logs_webhook_id" TEXT,
                                                   "voice_audit_leave_logs_id" TEXT,
                                                   "voice_audit_leave_logs_count" INTEGER NOT NULL DEFAULT 0,
                                                   "voice_audit_move_logs_id" TEXT,
                                                   "voice_audit_move_logs_count" INTEGER NOT NULL DEFAULT 0,
                                                   "emoji_logs_channel_id" TEXT,
                                                   "emoji_logs_webhook_id" TEXT,
                                                   "role_logs_channel_id" TEXT,
                                                   "role_logs_webhook_id" TEXT,
                                                   "sticker_logs_channel_id" TEXT,
                                                   "sticker_logs_webhook_id" TEXT,
                                                   "event_logs_channel_id" TEXT,
                                                   "event_logs_webhook_id" TEXT,
                                                   "invite_logs_channel_id" TEXT,
                                                   "invite_logs_webhook_id" TEXT,
                                                   "poll_logs_channel_id" TEXT,
                                                   "poll_logs_webhook_id" TEXT,
                                                   "stage_logs_channel_id" TEXT,
                                                   "stage_logs_webhook_id" TEXT,
                                                   "soundboard_logs_channel_id" TEXT,
                                                   "soundboard_logs_webhook_id" TEXT,
                                                   "thread_logs_channel_id" TEXT,
                                                   "thread_logs_webhook_id" TEXT,
                                                   "webhook_logs_channel_id" TEXT,
                                                   "webhook_logs_webhook_id" TEXT,
                                                   CONSTRAINT "guild_log_configs_pkey" PRIMARY KEY ("guild_id")
    );

-- Move Logs from 'guilds' to 'guild_log_configs'
-- We use INSERT ON CONFLICT DO NOTHING to allow re-running this script safely
INSERT INTO "guild_log_configs" (
    "guild_id", "message_logs_channel_id", "message_logs_webhook_id", "guild_logs_channel_id", "guild_logs_webhook_id",
    "mod_logs_channel_id", "mod_logs_webhook_id", "guild_member_logs_channel_id", "guild_member_logs_webhook_id",
    "channel_logs_channel_id", "channel_logs_webhook_id", "voice_logs_channel_id", "voice_logs_webhook_id",
    "voice_audit_leave_logs_id", "voice_audit_leave_logs_count", "voice_audit_move_logs_id", "voice_audit_move_logs_count",
    "emoji_logs_channel_id", "emoji_logs_webhook_id", "role_logs_channel_id", "role_logs_webhook_id",
    "sticker_logs_channel_id", "sticker_logs_webhook_id", "event_logs_channel_id", "event_logs_webhook_id",
    "invite_logs_channel_id", "invite_logs_webhook_id", "poll_logs_channel_id", "poll_logs_webhook_id",
    "stage_logs_channel_id", "stage_logs_webhook_id", "soundboard_logs_channel_id", "soundboard_logs_webhook_id",
    "thread_logs_channel_id", "thread_logs_webhook_id", "webhook_logs_channel_id", "webhook_logs_webhook_id"
)
SELECT
    "id"::text, "message_logs_channel_id"::text, "message_logs_webhook_id"::text, "guild_logs_channel_id"::text, "guild_logs_webhook_id"::text,
    "mod_logs_channel_id"::text, "mod_logs_webhook_id"::text, "guild_member_logs_channel_id"::text, "guild_member_logs_webhook_id"::text,
    "channel_logs_channel_id"::text, "channel_logs_webhook_id"::text, "voice_logs_channel_id"::text, "voice_logs_webhook_id"::text,
    "voice_audit_leave_logs_id"::text, COALESCE("voice_audit_leave_logs_count", 0), "voice_audit_move_logs_id"::text, COALESCE("voice_audit_move_logs_count", 0),
    "emoji_logs_channel_id"::text, "emoji_logs_webhook_id"::text, "role_logs_channel_id"::text, "role_logs_webhook_id"::text,
    "sticker_logs_channel_id"::text, "sticker_logs_webhook_id"::text, "event_logs_channel_id"::text, "event_logs_webhook_id"::text,
    "invite_logs_channel_id"::text, "invite_logs_webhook_id"::text, "poll_logs_channel_id"::text, "poll_logs_webhook_id"::text,
    "stage_logs_channel_id"::text, "stage_logs_webhook_id"::text, "soundboard_logs_channel_id"::text, "soundboard_logs_webhook_id"::text,
    "thread_logs_channel_id"::text, "thread_logs_webhook_id"::text, "webhook_logs_channel_id"::text, "webhook_logs_webhook_id"::text
FROM "guilds"
    ON CONFLICT ("guild_id") DO NOTHING;


-- =====================================================================
-- STEP 3: SCHEMA ALTERATIONS
-- =====================================================================

-- Drop Constraints & Indexes
ALTER TABLE "mod_mail_messages" DROP CONSTRAINT IF EXISTS "fk_mod_mail_thread";
DROP INDEX IF EXISTS "infractions_id_key";
DROP INDEX IF EXISTS "mod_mail_threads_pk";

-- 3a. Update GUILDS Table
ALTER TABLE "guilds" DROP CONSTRAINT IF EXISTS "guilds_pkey";
ALTER TABLE "guilds"
DROP COLUMN IF EXISTS "channel_logs_channel_id", DROP COLUMN IF EXISTS "channel_logs_webhook_id",
    DROP COLUMN IF EXISTS "emoji_logs_channel_id", DROP COLUMN IF EXISTS "emoji_logs_webhook_id",
    DROP COLUMN IF EXISTS "event_logs_channel_id", DROP COLUMN IF EXISTS "event_logs_webhook_id",
    DROP COLUMN IF EXISTS "guild_logs_channel_id", DROP COLUMN IF EXISTS "guild_logs_webhook_id",
    DROP COLUMN IF EXISTS "guild_member_logs_channel_id", DROP COLUMN IF EXISTS "guild_member_logs_webhook_id",
    DROP COLUMN IF EXISTS "invite_logs_channel_id", DROP COLUMN IF EXISTS "invite_logs_webhook_id",
    DROP COLUMN IF EXISTS "message_logs_channel_id", DROP COLUMN IF EXISTS "message_logs_webhook_id",
    DROP COLUMN IF EXISTS "mod_logs_channel_id", DROP COLUMN IF EXISTS "mod_logs_webhook_id",
    DROP COLUMN IF EXISTS "poll_logs_channel_id", DROP COLUMN IF EXISTS "poll_logs_webhook_id",
    DROP COLUMN IF EXISTS "role_logs_channel_id", DROP COLUMN IF EXISTS "role_logs_webhook_id",
    DROP COLUMN IF EXISTS "soundboard_logs_channel_id", DROP COLUMN IF EXISTS "soundboard_logs_webhook_id",
    DROP COLUMN IF EXISTS "stage_logs_channel_id", DROP COLUMN IF EXISTS "stage_logs_webhook_id",
    DROP COLUMN IF EXISTS "sticker_logs_channel_id", DROP COLUMN IF EXISTS "sticker_logs_webhook_id",
    DROP COLUMN IF EXISTS "thread_logs_channel_id", DROP COLUMN IF EXISTS "thread_logs_webhook_id",
    DROP COLUMN IF EXISTS "voice_audit_leave_logs_count", DROP COLUMN IF EXISTS "voice_audit_leave_logs_id",
    DROP COLUMN IF EXISTS "voice_audit_move_logs_count", DROP COLUMN IF EXISTS "voice_audit_move_logs_id",
    DROP COLUMN IF EXISTS "voice_logs_channel_id", DROP COLUMN IF EXISTS "voice_logs_webhook_id",
    DROP COLUMN IF EXISTS "webhook_logs_channel_id", DROP COLUMN IF EXISTS "webhook_logs_webhook_id";

ALTER TABLE "guilds" ALTER COLUMN "id" SET DATA TYPE TEXT USING "id"::TEXT;
ALTER TABLE "guilds" ALTER COLUMN "mod_mail_channel_id" SET DATA TYPE TEXT USING "mod_mail_channel_id"::TEXT;
ALTER TABLE "guilds" ALTER COLUMN "dj_role_id" SET DATA TYPE TEXT USING "dj_role_id"::TEXT;
ALTER TABLE "guilds" ALTER COLUMN "mod_mail_parent_channel_id" SET DATA TYPE TEXT USING "mod_mail_parent_channel_id"::TEXT;
ALTER TABLE "guilds" ALTER COLUMN "register_channel_id" SET DATA TYPE TEXT USING "register_channel_id"::TEXT;
ALTER TABLE "guilds" ALTER COLUMN "member_role_id" SET DATA TYPE TEXT USING "member_role_id"::TEXT;
ALTER TABLE "guilds" ALTER COLUMN "mute_role_id" SET DATA TYPE TEXT USING "mute_role_id"::TEXT;
ALTER TABLE "guilds" ALTER COLUMN "join_channel_id" SET DATA TYPE TEXT USING "join_channel_id"::TEXT;
ALTER TABLE "guilds" ALTER COLUMN "register_join_channel_id" SET DATA TYPE TEXT USING "register_join_channel_id"::TEXT;
ALTER TABLE "guilds" ALTER COLUMN "colour_id_of_the_day" SET DATA TYPE TEXT USING "colour_id_of_the_day"::TEXT;
ALTER TABLE "guilds" ALTER COLUMN "leave_channel_id" SET DATA TYPE TEXT USING "leave_channel_id"::TEXT;
ALTER TABLE "guilds" ALTER COLUMN "staff_role_id" SET DATA TYPE TEXT USING "staff_role_id"::TEXT;
ALTER TABLE "guilds" ALTER COLUMN "male_role_id" SET DATA TYPE TEXT USING "male_role_id"::TEXT;
ALTER TABLE "guilds" ALTER COLUMN "female_role_id" SET DATA TYPE TEXT USING "female_role_id"::TEXT;
ALTER TABLE "guilds" ALTER COLUMN "bump_leaderboard_channel_id" SET DATA TYPE TEXT USING "bump_leaderboard_channel_id"::TEXT;
ALTER TABLE "guilds" ALTER COLUMN "unverified_role_id" SET DATA TYPE TEXT USING "unverified_role_id"::TEXT;

ALTER TABLE "guilds" ADD CONSTRAINT "guilds_pkey" PRIMARY KEY ("id");

-- 3b. Update INFRACTIONS Table
ALTER TABLE "infractions" DROP CONSTRAINT IF EXISTS "infractions_pkey";
ALTER TABLE "infractions" DROP COLUMN IF EXISTS "id";
ALTER TABLE "infractions" ALTER COLUMN "guild_id" SET DATA TYPE TEXT USING "guild_id"::TEXT;
ALTER TABLE "infractions" ALTER COLUMN "moderator_id" SET DATA TYPE TEXT USING "moderator_id"::TEXT;
ALTER TABLE "infractions" ALTER COLUMN "user_id" SET DATA TYPE TEXT USING "user_id"::TEXT;
ALTER TABLE "infractions" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "infractions" ALTER COLUMN "type" TYPE "InfractionType" USING UPPER("type")::"InfractionType";
ALTER TABLE "infractions" ADD CONSTRAINT "infractions_pkey" PRIMARY KEY ("guild_id", "case_id");

-- 3c. Update PUNISHMENTS Table
ALTER TABLE "punishments" DROP CONSTRAINT IF EXISTS "punishments_pkey";
ALTER TABLE "punishments" ALTER COLUMN "guild_id" SET DATA TYPE TEXT USING "guild_id"::TEXT;
ALTER TABLE "punishments" ALTER COLUMN "user_id" SET DATA TYPE TEXT USING "user_id"::TEXT;
ALTER TABLE "punishments" ALTER COLUMN "staff_id" SET DATA TYPE TEXT USING "staff_id"::TEXT;
ALTER TABLE "punishments" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "punishments" ALTER COLUMN "previous_roles" SET DATA TYPE TEXT[] USING "previous_roles"::TEXT[];

-- FIX: We are ADDING the ID column here, so we must use ADD COLUMN, not ALTER
ALTER TABLE "punishments" ADD COLUMN "id" INTEGER GENERATED BY DEFAULT AS IDENTITY;

ALTER TABLE "punishments" ALTER COLUMN "type" TYPE "PunishmentAction" USING UPPER("type")::"PunishmentAction";
ALTER TABLE "punishments" ADD CONSTRAINT "punishments_pkey" PRIMARY KEY ("id");

-- 3d. Update MOD_MAIL_MESSAGES
ALTER TABLE "mod_mail_messages" DROP CONSTRAINT IF EXISTS "mod_mail_messages_pkey";

-- FIX: Messages usually have an ID, so we ALTER it to ensure it's an Integer
ALTER TABLE "mod_mail_messages" ALTER COLUMN "id" SET DATA TYPE INTEGER USING "id"::integer;
-- Ensure it is auto-incrementing (Safe block in case it already is)

ALTER TABLE "mod_mail_messages" ALTER COLUMN "author_id" SET DATA TYPE TEXT USING "author_id"::TEXT;
ALTER TABLE "mod_mail_messages" ALTER COLUMN "sent_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "mod_mail_messages" ALTER COLUMN "message_id" SET DATA TYPE TEXT USING "message_id"::TEXT;
ALTER TABLE "mod_mail_messages" ALTER COLUMN "channel_id" SET DATA TYPE TEXT USING "channel_id"::TEXT;

ALTER TABLE "mod_mail_messages" ALTER COLUMN "sent_to" TYPE "ModMailSentType" USING UPPER("sent_to")::"ModMailSentType";
ALTER TABLE "mod_mail_messages" ALTER COLUMN "author_type" TYPE "ModMailAuthorType" USING UPPER("author_type")::"ModMailAuthorType";
ALTER TABLE "mod_mail_messages" ADD CONSTRAINT "mod_mail_messages_pkey" PRIMARY KEY ("id");

-- 3e. Update MOD_MAIL_THREADS
ALTER TABLE "mod_mail_threads" DROP CONSTRAINT IF EXISTS "mod_mail_threads_pkey";
ALTER TABLE "mod_mail_threads" ALTER COLUMN "guild_id" SET DATA TYPE TEXT USING "guild_id"::TEXT;
ALTER TABLE "mod_mail_threads" ALTER COLUMN "user_id" SET DATA TYPE TEXT USING "user_id"::TEXT;
ALTER TABLE "mod_mail_threads" ALTER COLUMN "channel_id" SET DATA TYPE TEXT USING "channel_id"::TEXT;
ALTER TABLE "mod_mail_threads" ALTER COLUMN "closer_id" SET DATA TYPE TEXT USING "closer_id"::TEXT;
ALTER TABLE "mod_mail_threads" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- FIX: Threads usually have an ID, so we ALTER
ALTER TABLE "mod_mail_threads" ALTER COLUMN "id" SET DATA TYPE INTEGER USING "id"::integer;

DO $$ BEGIN
ALTER TABLE "mod_mail_threads" RENAME COLUMN "close_date" TO "scheduled_close_at";
EXCEPTION
    WHEN undefined_column THEN null;
END $$;

ALTER TABLE "mod_mail_threads" DROP COLUMN IF EXISTS "status";
ALTER TABLE "mod_mail_threads" ADD COLUMN "status" "ModMailStatus" NOT NULL DEFAULT 'OPEN';
ALTER TABLE "mod_mail_threads" ADD CONSTRAINT "mod_mail_threads_pkey" PRIMARY KEY ("id");

-- 3f. Update Other Tables
ALTER TABLE "bump_leaderboard" DROP CONSTRAINT IF EXISTS "bump_leaderboard_pkey";
ALTER TABLE "bump_leaderboard" ALTER COLUMN "guild_id" SET DATA TYPE TEXT USING "guild_id"::TEXT;
ALTER TABLE "bump_leaderboard" ALTER COLUMN "user_id" SET DATA TYPE TEXT USING "user_id"::TEXT;
ALTER TABLE "bump_leaderboard" ADD CONSTRAINT "bump_leaderboard_pkey" PRIMARY KEY ("guild_id", "user_id");

ALTER TABLE "cronjobs" DROP CONSTRAINT IF EXISTS "cronjobs_pkey";
ALTER TABLE "cronjobs" ALTER COLUMN "id" SET DATA TYPE TEXT USING "id"::TEXT;
ALTER TABLE "cronjobs" ADD CONSTRAINT "cronjobs_pkey" PRIMARY KEY ("id");

ALTER TABLE "guild_punishment_config" DROP CONSTRAINT IF EXISTS "guild_punishment_config_pkey";
ALTER TABLE "guild_punishment_config" ALTER COLUMN "guild_id" SET DATA TYPE TEXT USING "guild_id"::TEXT;
ALTER TABLE "guild_punishment_config" ADD CONSTRAINT "guild_punishment_config_pkey" PRIMARY KEY ("guild_id", "level");

ALTER TABLE "modmail_blacklist" DROP CONSTRAINT IF EXISTS "modmail_blacklist_pkey";

-- FIX: Blacklist is getting a NEW ID (previously composite), so use ADD COLUMN

ALTER TABLE "modmail_blacklist" ALTER COLUMN "guild_id" SET DATA TYPE TEXT USING "guild_id"::TEXT;
ALTER TABLE "modmail_blacklist" ALTER COLUMN "user_id" SET DATA TYPE TEXT USING "user_id"::TEXT;
ALTER TABLE "modmail_blacklist" ALTER COLUMN "moderator_id" SET DATA TYPE TEXT USING "moderator_id"::TEXT;
ALTER TABLE "modmail_blacklist" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "modmail_blacklist" ADD CONSTRAINT "modmail_blacklist_pkey" PRIMARY KEY ("id");

-- Cleanup
DROP TABLE IF EXISTS "pgmigrations";

-- =====================================================================
-- STEP 4: RESTORE FOREIGN KEYS
-- =====================================================================

CREATE UNIQUE INDEX IF NOT EXISTS "unique_punishments" ON "punishments"("guild_id", "user_id", "type");

ALTER TABLE "guild_log_configs" ADD CONSTRAINT "guild_log_configs_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "infractions" ADD CONSTRAINT "infractions_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "punishments" ADD CONSTRAINT "punishments_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "guild_punishment_config" ADD CONSTRAINT "guild_punishment_config_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mod_mail_threads" ADD CONSTRAINT "mod_mail_threads_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mod_mail_messages" ADD CONSTRAINT "mod_mail_messages_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "mod_mail_threads"("channel_id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "modmail_blacklist" ADD CONSTRAINT "modmail_blacklist_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bump_leaderboard" ADD CONSTRAINT "bump_leaderboard_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;