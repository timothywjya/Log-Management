/*
  Warnings:

  - You are about to drop the column `role_id` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the column `role_id` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "teams" DROP CONSTRAINT "teams_role_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_role_id_fkey";

-- AlterTable
ALTER TABLE "teams" DROP COLUMN "role_id";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role_id",
ADD COLUMN     "is_admin" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "program_group_teams" (
    "id" SERIAL NOT NULL,
    "program_group_id" INTEGER NOT NULL,
    "team_id" INTEGER NOT NULL,
    "team_type" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "program_group_teams_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "program_group_teams_program_group_id_team_type_key" ON "program_group_teams"("program_group_id", "team_type");

-- AddForeignKey
ALTER TABLE "program_group_teams" ADD CONSTRAINT "program_group_teams_program_group_id_fkey" FOREIGN KEY ("program_group_id") REFERENCES "program_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_group_teams" ADD CONSTRAINT "program_group_teams_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
