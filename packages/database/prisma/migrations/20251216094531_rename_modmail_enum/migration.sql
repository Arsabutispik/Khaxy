-- 1. Rename the Enum safely (Preserves Data)
ALTER TYPE "ModMailSentType" RENAME TO "ModMailSentToType";

-- 2. Update Modmail Blacklist ID
-- (We just fixed this in the previous step to be an Integer, 
--  so we just confirm it here to satisfy Prisma's internal tracking)
ALTER TABLE "modmail_blacklist" ALTER COLUMN "id" SET DATA TYPE INTEGER;

-- Note: We do NOT drop the 'sent_to' column. 
-- By renaming the Type in step 1, the column automatically updates to use the new name.