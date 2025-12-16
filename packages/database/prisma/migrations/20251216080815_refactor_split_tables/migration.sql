-- =====================================================================
-- STEP 1: SETUP ENUMS & NEW TABLES (Moved to Top)
-- =====================================================================

-- CreateEnums
CREATE TYPE "InfractionType" AS ENUM ('WARN', 'MUTE', 'KICK', 'BAN', 'TEMPBAN', 'UNBAN', 'UNMUTE', 'NOTE');
CREATE TYPE "ModMailStatus" AS ENUM ('OPEN', 'CLOSED');
CREATE TYPE "ModMailAuthorType" AS ENUM ('USER', 'STAFF', 'SYSTEM');
CREATE TYPE "SentToType" AS ENUM ('USER', 'THREAD');
CREATE TYPE "PunishmentAction" AS ENUM ('WARN', 'MUTE', 'KICK', 'TEMPBAN', 'BAN');

-- CreateTable: GuildLogConfigs (Created early so we can move data into it)
CREATE TABLE "guild_log_configs" (
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

-- =====================================================================
-- STEP 2: DATA RESCUE OPERATIONS (The Magic Part)
-- =====================================================================

-- 2a. Move Logs from 'guilds' to 'guild_log_configs'
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
FROM "guilds";

-- 2b. Move ModMail 'close_date' to 'scheduled_close_at' (Rename Prep)
-- If data exists in close_date, we ensure it's preserved by renaming the column later.

-- =====================================================================
-- STEP 3: SAFE SCHEMA ALTERATIONS
-- =====================================================================

-- Drop Constraints & Indexes first to avoid conflicts
ALTER TABLE "mod_mail_messages" DROP CONSTRAINT "fk_mod_mail_thread";
DROP INDEX IF EXISTS "infractions_id_key";
DROP INDEX IF EXISTS "mod_mail_threads_pk";

-- 3a. Update GUILDS Table (Now safe to drop logs)
ALTER TABLE "guilds" DROP CONSTRAINT "guilds_pkey";
ALTER TABLE "guilds"
DROP COLUMN "channel_logs_channel_id", DROP COLUMN "channel_logs_webhook_id",
    DROP COLUMN "emoji_logs_channel_id", DROP COLUMN "emoji_logs_webhook_id",
    DROP COLUMN "event_logs_channel_id", DROP COLUMN "event_logs_webhook_id",
    DROP COLUMN "guild_logs_channel_id", DROP COLUMN "guild_logs_webhook_id",
    DROP COLUMN "guild_member_logs_channel_id", DROP COLUMN "guild_member_logs_webhook_id",
    DROP COLUMN "invite_logs_channel_id", DROP COLUMN "invite_logs_webhook_id",
    DROP COLUMN "message_logs_channel_id", DROP COLUMN "message_logs_webhook_id",
    DROP COLUMN "mod_logs_channel_id", DROP COLUMN "mod_logs_webhook_id",
    DROP COLUMN "poll_logs_channel_id", DROP COLUMN "poll_logs_webhook_id",
    DROP COLUMN "role_logs_channel_id", DROP COLUMN "role_logs_webhook_id",
    DROP COLUMN "soundboard_logs_channel_id", DROP COLUMN "soundboard_logs_webhook_id",
    DROP COLUMN "stage_logs_channel_id", DROP COLUMN "stage_logs_webhook_id",
    DROP COLUMN "sticker_logs_channel_id", DROP COLUMN "sticker_logs_webhook_id",
    DROP COLUMN "thread_logs_channel_id", DROP COLUMN "thread_logs_webhook_id",
    DROP COLUMN "voice_audit_leave_logs_count", DROP COLUMN "voice_audit_leave_logs_id",
    DROP COLUMN "voice_audit_move_logs_count", DROP COLUMN "voice_audit_move_logs_id",
    DROP COLUMN "voice_logs_channel_id", DROP COLUMN "voice_logs_webhook_id",
    DROP COLUMN "webhook_logs_channel_id", DROP COLUMN "webhook_logs_webhook_id";

-- Convert IDs to Text (using explicit casting)
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
ADD CONSTRAINT "guilds_pkey" PRIMARY KEY ("id");

-- 3b. Update INFRACTIONS Table (Convert String Type to Enum Type safely)
ALTER TABLE "infractions" DROP CONSTRAINT "infractions_pkey";
ALTER TABLE "infractions" DROP COLUMN "id"; -- Safe to drop random ID, we move to composite key
ALTER TABLE "infractions" ALTER COLUMN "guild_id" SET DATA TYPE TEXT USING "guild_id"::TEXT;
ALTER TABLE "infractions" ALTER COLUMN "moderator_id" SET DATA TYPE TEXT USING "moderator_id"::TEXT;
ALTER TABLE "infractions" ALTER COLUMN "user_id" SET DATA TYPE TEXT USING "user_id"::TEXT;
ALTER TABLE "infractions" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- CASTING STRING TO ENUM (Prevents Data Loss)
ALTER TABLE "infractions" ALTER COLUMN "type" TYPE "InfractionType" USING UPPER("type")::"InfractionType";

ADD CONSTRAINT "infractions_pkey" PRIMARY KEY ("guild_id", "case_id");

-- 3c. Update PUNISHMENTS Table
ALTER TABLE "punishments" ALTER COLUMN "guild_id" SET DATA TYPE TEXT USING "guild_id"::TEXT;
ALTER TABLE "punishments" ALTER COLUMN "user_id" SET DATA TYPE TEXT USING "user_id"::TEXT;
ALTER TABLE "punishments" ALTER COLUMN "staff_id" SET DATA TYPE TEXT USING "staff_id"::TEXT;
ALTER TABLE "punishments" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "punishments" ALTER COLUMN "previous_roles" SET DATA TYPE TEXT[] USING "previous_roles"::TEXT[];
ALTER TABLE "punishments" ADD COLUMN "id" SERIAL NOT NULL; -- New ID for management

-- CASTING STRING TO ENUM
ALTER TABLE "punishments" ALTER COLUMN "type" TYPE "PunishmentAction" USING UPPER("type")::"PunishmentAction";

ADD CONSTRAINT "punishments_pkey" PRIMARY KEY ("id");

-- 3d. Update MOD_MAIL_MESSAGES
ALTER TABLE "mod_mail_messages" DROP CONSTRAINT "mod_mail_messages_pkey";
ALTER TABLE "mod_mail_messages" ALTER COLUMN "id" SET DATA TYPE SERIAL;
ALTER TABLE "mod_mail_messages" ALTER COLUMN "author_id" SET DATA TYPE TEXT USING "author_id"::TEXT;
ALTER TABLE "mod_mail_messages" ALTER COLUMN "sent_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "mod_mail_messages" ALTER COLUMN "message_id" SET DATA TYPE TEXT USING "message_id"::TEXT;
ALTER TABLE "mod_mail_messages" ALTER COLUMN "channel_id" SET DATA TYPE TEXT USING "channel_id"::TEXT;

-- CASTING STRING TO ENUM
-- Note: Assuming old data "User" maps to 'USER', etc. UPPER() helps standardize.
ALTER TABLE "mod_mail_messages" ALTER COLUMN "sent_to" TYPE "SentToType" USING UPPER("sent_to")::"SentToType";
ALTER TABLE "mod_mail_messages" ALTER COLUMN "author_type" TYPE "ModMailAuthorType" USING UPPER("author_type")::"ModMailAuthorType";

ADD CONSTRAINT "mod_mail_messages_pkey" PRIMARY KEY ("id");

-- 3e. Update MOD_MAIL_THREADS
ALTER TABLE "mod_mail_threads" ALTER COLUMN "guild_id" SET DATA TYPE TEXT USING "guild_id"::TEXT;
ALTER TABLE "mod_mail_threads" ALTER COLUMN "user_id" SET DATA TYPE TEXT USING "user_id"::TEXT;
ALTER TABLE "mod_mail_threads" ALTER COLUMN "channel_id" SET DATA TYPE TEXT USING "channel_id"::TEXT;
ALTER TABLE "mod_mail_threads" ALTER COLUMN "closer_id" SET DATA TYPE TEXT USING "closer_id"::TEXT;
ALTER TABLE "mod_mail_threads" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "mod_mail_threads" ALTER COLUMN "id" SET DATA TYPE SERIAL;

-- Rename close_date to scheduled_close_at (Preserves data)
ALTER TABLE "mod_mail_threads" RENAME COLUMN "close_date" TO "scheduled_close_at";

-- Add status column (Default OPEN)
-- If you had a status column before, use ALTER COLUMN ... TYPE ... USING ...
-- If not, just ADD COLUMN:
ALTER TABLE "mod_mail_threads" DROP COLUMN "status", ADD COLUMN "status" "ModMailStatus" NOT NULL DEFAULT 'OPEN';

ADD CONSTRAINT "mod_mail_threads_pkey" PRIMARY KEY ("id");

-- 3f. Update Other Tables (Standard ID Updates)
ALTER TABLE "bump_leaderboard" DROP CONSTRAINT "bump_leaderboard_pkey";
ALTER TABLE "bump_leaderboard" ALTER COLUMN "guild_id" SET DATA TYPE TEXT USING "guild_id"::TEXT;
ALTER TABLE "bump_leaderboard" ALTER COLUMN "user_id" SET DATA TYPE TEXT USING "user_id"::TEXT;
ADD CONSTRAINT "bump_leaderboard_pkey" PRIMARY KEY ("guild_id", "user_id");

ALTER TABLE "cronjobs" DROP CONSTRAINT "cronjobs_pkey";
ALTER TABLE "cronjobs" ALTER COLUMN "id" SET DATA TYPE TEXT USING "id"::TEXT;
ADD CONSTRAINT "cronjobs_pkey" PRIMARY KEY ("id");

ALTER TABLE "guild_punishment_config" DROP CONSTRAINT "guild_punishment_config_pkey";
ALTER TABLE "guild_punishment_config" ALTER COLUMN "guild_id" SET DATA TYPE TEXT USING "guild_id"::TEXT;
ADD CONSTRAINT "guild_punishment_config_pkey" PRIMARY KEY ("guild_id", "level");

ALTER TABLE "modmail_blacklist" DROP CONSTRAINT "modmail_blacklist_pkey";
ALTER TABLE "modmail_blacklist" ALTER COLUMN "id" SET DATA TYPE SERIAL;
ALTER TABLE "modmail_blacklist" ALTER COLUMN "guild_id" SET DATA TYPE TEXT USING "guild_id"::TEXT;
ALTER TABLE "modmail_blacklist" ALTER COLUMN "user_id" SET DATA TYPE TEXT USING "user_id"::TEXT;
ALTER TABLE "modmail_blacklist" ALTER COLUMN "moderator_id" SET DATA TYPE TEXT USING "moderator_id"::TEXT;
ALTER TABLE "modmail_blacklist" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;
ADD CONSTRAINT "modmail_blacklist_pkey" PRIMARY KEY ("id");

-- Cleanup
DROP TABLE IF EXISTS "pgmigrations";

-- =====================================================================
-- STEP 4: RESTORE FOREIGN KEYS (Linking it all back together)
-- =====================================================================

CREATE UNIQUE INDEX "unique_punishments" ON "punishments"("guild_id", "user_id", "type");
ALTER TABLE "guild_log_configs" ADD CONSTRAINT "guild_log_configs_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "infractions" ADD CONSTRAINT "infractions_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "punishments" ADD CONSTRAINT "punishments_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "guild_punishment_config" ADD CONSTRAINT "guild_punishment_config_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mod_mail_threads" ADD CONSTRAINT "mod_mail_threads_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mod_mail_messages" ADD CONSTRAINT "mod_mail_messages_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "mod_mail_threads"("channel_id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "modmail_blacklist" ADD CONSTRAINT "modmail_blacklist_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bump_leaderboard" ADD CONSTRAINT "bump_leaderboard_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;