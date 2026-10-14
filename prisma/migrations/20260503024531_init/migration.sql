/*
  Warnings:

  - The primary key for the `log_apis` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `log_apps` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `log_desktops` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `log_webs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `program_group_teams` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `program_groups` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `program_types` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `programs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `report_definitions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `sub_teams` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `teams` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "log_apis" DROP CONSTRAINT "log_apis_api_program_id_fkey";

-- DropForeignKey
ALTER TABLE "log_apps" DROP CONSTRAINT "log_apps_apps_program_id_fkey";

-- DropForeignKey
ALTER TABLE "log_desktops" DROP CONSTRAINT "log_desktops_desktop_program_id_fkey";

-- DropForeignKey
ALTER TABLE "log_webs" DROP CONSTRAINT "log_webs_web_program_id_fkey";

-- DropForeignKey
ALTER TABLE "program_group_teams" DROP CONSTRAINT "program_group_teams_program_group_id_fkey";

-- DropForeignKey
ALTER TABLE "program_group_teams" DROP CONSTRAINT "program_group_teams_team_id_fkey";

-- DropForeignKey
ALTER TABLE "programs" DROP CONSTRAINT "programs_program_group_id_fkey";

-- DropForeignKey
ALTER TABLE "programs" DROP CONSTRAINT "programs_program_type_id_fkey";

-- DropForeignKey
ALTER TABLE "programs" DROP CONSTRAINT "programs_team_id_fkey";

-- DropForeignKey
ALTER TABLE "sub_teams" DROP CONSTRAINT "sub_teams_team_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_group_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_sub_team_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_team_id_fkey";

-- AlterTable
ALTER TABLE "log_apis" DROP CONSTRAINT "log_apis_pkey",
ALTER COLUMN "api_ids" DROP DEFAULT,
ALTER COLUMN "api_ids" SET DATA TYPE TEXT,
ALTER COLUMN "api_program_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "log_apis_pkey" PRIMARY KEY ("api_ids");
DROP SEQUENCE "log_apis_api_ids_seq";

-- AlterTable
ALTER TABLE "log_apps" DROP CONSTRAINT "log_apps_pkey",
ALTER COLUMN "apps_ids" DROP DEFAULT,
ALTER COLUMN "apps_ids" SET DATA TYPE TEXT,
ALTER COLUMN "apps_program_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "log_apps_pkey" PRIMARY KEY ("apps_ids");
DROP SEQUENCE "log_apps_apps_ids_seq";

-- AlterTable
ALTER TABLE "log_desktops" DROP CONSTRAINT "log_desktops_pkey",
ALTER COLUMN "desktop_ids" DROP DEFAULT,
ALTER COLUMN "desktop_ids" SET DATA TYPE TEXT,
ALTER COLUMN "desktop_program_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "log_desktops_pkey" PRIMARY KEY ("desktop_ids");
DROP SEQUENCE "log_desktops_desktop_ids_seq";

-- AlterTable
ALTER TABLE "log_webs" DROP CONSTRAINT "log_webs_pkey",
ALTER COLUMN "web_ids" DROP DEFAULT,
ALTER COLUMN "web_ids" SET DATA TYPE TEXT,
ALTER COLUMN "web_program_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "log_webs_pkey" PRIMARY KEY ("web_ids");
DROP SEQUENCE "log_webs_web_ids_seq";

-- AlterTable
ALTER TABLE "program_group_teams" DROP CONSTRAINT "program_group_teams_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "program_group_id" SET DATA TYPE TEXT,
ALTER COLUMN "team_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "program_group_teams_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "program_group_teams_id_seq";

-- AlterTable
ALTER TABLE "program_groups" DROP CONSTRAINT "program_groups_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "program_groups_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "program_groups_id_seq";

-- AlterTable
ALTER TABLE "program_types" DROP CONSTRAINT "program_types_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "program_types_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "program_types_id_seq";

-- AlterTable
ALTER TABLE "programs" DROP CONSTRAINT "programs_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "program_type_id" SET DATA TYPE TEXT,
ALTER COLUMN "program_group_id" SET DATA TYPE TEXT,
ALTER COLUMN "team_id" SET DATA TYPE TEXT,
ALTER COLUMN "deleted_by" SET DATA TYPE TEXT,
ADD CONSTRAINT "programs_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "programs_id_seq";

-- AlterTable
ALTER TABLE "report_definitions" DROP CONSTRAINT "report_definitions_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "report_definitions_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "report_definitions_id_seq";

-- AlterTable
ALTER TABLE "sub_teams" DROP CONSTRAINT "sub_teams_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "team_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "sub_teams_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "sub_teams_id_seq";

-- AlterTable
ALTER TABLE "teams" DROP CONSTRAINT "teams_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "teams_id_seq";

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "team_id" SET DATA TYPE TEXT,
ALTER COLUMN "sub_team_id" SET DATA TYPE TEXT,
ALTER COLUMN "group_id" SET DATA TYPE TEXT,
ALTER COLUMN "updated_by" SET DATA TYPE TEXT,
ALTER COLUMN "deleted_by" SET DATA TYPE TEXT,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "users_id_seq";

-- AddForeignKey
ALTER TABLE "sub_teams" ADD CONSTRAINT "sub_teams_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_sub_team_id_fkey" FOREIGN KEY ("sub_team_id") REFERENCES "sub_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "program_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_group_teams" ADD CONSTRAINT "program_group_teams_program_group_id_fkey" FOREIGN KEY ("program_group_id") REFERENCES "program_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_group_teams" ADD CONSTRAINT "program_group_teams_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_program_type_id_fkey" FOREIGN KEY ("program_type_id") REFERENCES "program_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_program_group_id_fkey" FOREIGN KEY ("program_group_id") REFERENCES "program_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_apis" ADD CONSTRAINT "log_apis_api_program_id_fkey" FOREIGN KEY ("api_program_id") REFERENCES "programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_webs" ADD CONSTRAINT "log_webs_web_program_id_fkey" FOREIGN KEY ("web_program_id") REFERENCES "programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_desktops" ADD CONSTRAINT "log_desktops_desktop_program_id_fkey" FOREIGN KEY ("desktop_program_id") REFERENCES "programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_apps" ADD CONSTRAINT "log_apps_apps_program_id_fkey" FOREIGN KEY ("apps_program_id") REFERENCES "programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
