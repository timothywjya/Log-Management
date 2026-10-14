-- Migration: Add is_manager, must_reset_password to users
--            Add team_type to teams
--            Drop unused roles table

-- Add team_type column to teams (default 'programmer')
ALTER TABLE "teams" ADD COLUMN IF NOT EXISTS "team_type" VARCHAR(50) NOT NULL DEFAULT 'programmer';

-- Add is_manager flag to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_manager" BOOLEAN NOT NULL DEFAULT false;

-- Add must_reset_password flag to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "must_reset_password" BOOLEAN NOT NULL DEFAULT false;

-- Drop roles table (no longer needed - admin/manager detected via group_name / flags)
DROP TABLE IF EXISTS "roles";
