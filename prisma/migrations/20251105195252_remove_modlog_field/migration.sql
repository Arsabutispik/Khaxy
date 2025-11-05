/*
  Warnings:

  - You are about to drop the column `mod_log_channel_id` on the `guilds` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "guilds" DROP COLUMN "mod_log_channel_id";
