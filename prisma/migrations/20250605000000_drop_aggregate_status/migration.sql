-- Drop aggregate status and scheduledAt columns
BEGIN;

ALTER TABLE "Post" DROP COLUMN IF EXISTS "status";
ALTER TABLE "Post" DROP COLUMN IF EXISTS "scheduledAt";

COMMIT;