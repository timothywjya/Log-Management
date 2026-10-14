-- Migration: Add secret_key and iv to programs table
-- Run: npx prisma migrate dev --name add_program_secret_key_iv
-- Or apply manually:

ALTER TABLE "programs"
  ADD COLUMN IF NOT EXISTS "secret_key" VARCHAR(64),
  ADD COLUMN IF NOT EXISTS "iv"         VARCHAR(32);

-- Backfill existing programs with auto-generated values
-- (Prisma will handle new rows automatically via default in application layer)
-- For existing rows, you can run the seed/backfill script below or
-- let the application generate on first access.
