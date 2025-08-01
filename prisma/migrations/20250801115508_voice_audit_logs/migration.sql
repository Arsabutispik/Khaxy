/*
  Warnings:

  - You are about to drop the column `voice_audit_logs_count` on the `guilds` table. All the data in the column will be lost.
  - You are about to drop the column `voice_audit_logs_id` on the `guilds` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "guilds"
ADD COLUMN     "voice_audit_leave_logs_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "voice_audit_leave_logs_id" BIGINT,
ADD COLUMN     "voice_audit_move_logs_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "voice_audit_move_logs_id" BIGINT;
