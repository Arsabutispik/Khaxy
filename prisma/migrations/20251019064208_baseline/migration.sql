-- CreateEnum
CREATE TYPE "PunishmentAction" AS ENUM ('WARN', 'MUTE', 'KICK', 'TEMPBAN', 'BAN');

-- CreateTable
CREATE TABLE "bump_leaderboard" (
    "guild_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "bump_count" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "bump_leaderboard_pkey" PRIMARY KEY ("guild_id","user_id")
);

-- CreateTable
CREATE TABLE "cronjobs" (
    "id" BIGINT NOT NULL,
    "color_time" TIMESTAMP(6),
    "unregistered_people_time" TIMESTAMP(6),

    CONSTRAINT "cronjobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guilds" (
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
CREATE TABLE "infractions" (
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
CREATE TABLE "guild_punishment_config" (
    "guild_id" BIGINT NOT NULL,
    "level" INTEGER NOT NULL,
    "action" "PunishmentAction" NOT NULL,
    "duration" INTEGER,

    CONSTRAINT "guild_punishment_config_pkey" PRIMARY KEY ("guild_id","level")
);

-- CreateTable
CREATE TABLE "mod_mail_messages" (
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
CREATE TABLE "mod_mail_threads" (
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
CREATE TABLE "pgmigrations" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "run_on" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "pgmigrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "punishments" (
    "guild_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "user_id" BIGINT NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "previous_roles" BIGINT[],
    "staff_id" BIGINT NOT NULL,
    "type" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "modmail_blacklist" (
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
CREATE UNIQUE INDEX "infractions_id_key" ON "infractions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_channel_id" ON "mod_mail_threads"("channel_id");

-- CreateIndex
CREATE UNIQUE INDEX "mod_mail_threads_pk" ON "mod_mail_threads"("id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_punishments" ON "punishments"("guild_id", "user_id", "type");

-- AddForeignKey
ALTER TABLE "mod_mail_messages" ADD CONSTRAINT "fk_mod_mail_thread" FOREIGN KEY ("channel_id") REFERENCES "mod_mail_threads"("channel_id") ON DELETE CASCADE ON UPDATE NO ACTION;
