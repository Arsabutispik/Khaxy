/*
  Warnings:

  - You are about to drop the column `unregistered_people_time` on the `cronjobs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cronjobs" DROP COLUMN "unregistered_people_time";
