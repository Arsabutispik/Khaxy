-- AlterTable
ALTER TABLE "guilds" ADD COLUMN     "channel_logs_channel_id" BIGINT,
ADD COLUMN     "channel_logs_webhook_id" BIGINT;
