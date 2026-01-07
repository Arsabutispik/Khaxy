/*
  Warnings:

  - You are about to drop the column `bump_leaderboard_channel_id` on the `guilds` table. All the data in the column will be lost.
  - You are about to drop the column `last_bump_winner` on the `guilds` table. All the data in the column will be lost.
  - You are about to drop the column `last_bump_winner_count` on the `guilds` table. All the data in the column will be lost.
  - You are about to drop the column `last_bump_winner_total_count` on the `guilds` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "guilds" DROP COLUMN "bump_leaderboard_channel_id",
DROP COLUMN "last_bump_winner",
DROP COLUMN "last_bump_winner_count",
DROP COLUMN "last_bump_winner_total_count";
