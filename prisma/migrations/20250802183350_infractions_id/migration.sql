/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `infractions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "infractions_guild_id_case_id_key";

-- AlterTable
ALTER TABLE "infractions" ADD COLUMN     "id" BIGSERIAL NOT NULL,
ADD CONSTRAINT "infractions_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "infractions_id_key" ON "infractions"("id");
