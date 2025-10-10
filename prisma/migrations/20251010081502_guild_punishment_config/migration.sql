-- CreateEnum
CREATE TYPE "PunishmentAction" AS ENUM ('WARN', 'MUTE', 'KICK', 'TEMPBAN', 'BAN');

-- CreateTable
CREATE TABLE "guild_punishment_config" (
    "guild_id" BIGINT NOT NULL,
    "level" INTEGER NOT NULL,
    "action" "PunishmentAction" NOT NULL,
    "duration" INTEGER,

    CONSTRAINT "guild_punishment_config_pkey" PRIMARY KEY ("guild_id","level")
);
