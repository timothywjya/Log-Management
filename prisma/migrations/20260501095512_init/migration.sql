-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "position_level" VARCHAR(2),
    "position_description" VARCHAR(255) NOT NULL,
    "group_level" INTEGER,
    "group_description" VARCHAR(255) NOT NULL,
    "role_name" VARCHAR(255) NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "requires_mfa" BOOLEAN NOT NULL DEFAULT false,
    "created_by" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" SERIAL NOT NULL,
    "team_name" VARCHAR(255) NOT NULL,
    "role_id" INTEGER NOT NULL,
    "created_by" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_teams" (
    "id" SERIAL NOT NULL,
    "sub_team_name" VARCHAR(255) NOT NULL,
    "team_id" INTEGER NOT NULL,
    "created_by" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER,
    "team_id" INTEGER,
    "sub_team_id" INTEGER,
    "group_id" INTEGER,
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "nik" VARCHAR(10) NOT NULL,
    "username" VARCHAR(100),
    "user_email" VARCHAR(150),
    "password_hash" VARCHAR(255),
    "mfa_secret" VARCHAR(255),
    "mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "is_guest" BOOLEAN NOT NULL DEFAULT true,
    "login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_groups" (
    "id" SERIAL NOT NULL,
    "group_name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL DEFAULT 1,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,

    CONSTRAINT "program_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_types" (
    "id" SERIAL NOT NULL,
    "program_type" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL DEFAULT 1,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,

    CONSTRAINT "program_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programs" (
    "id" SERIAL NOT NULL,
    "program_name" VARCHAR(255) NOT NULL,
    "program_type_id" INTEGER NOT NULL,
    "program_group_id" INTEGER NOT NULL,
    "team_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL DEFAULT 1,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_apis" (
    "api_ids" SERIAL NOT NULL,
    "api_program_id" INTEGER,
    "api_program_uid" TEXT,
    "api_endpoint" VARCHAR(255),
    "api_params" TEXT,
    "api_json_request" JSONB,
    "api_message" TEXT,
    "api_errormessage" TEXT,
    "api_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "api_created_by" VARCHAR(100),
    "api_updated_at" TIMESTAMP(3) NOT NULL,
    "api_updated_by" VARCHAR(100),

    CONSTRAINT "log_apis_pkey" PRIMARY KEY ("api_ids")
);

-- CreateTable
CREATE TABLE "log_webs" (
    "web_ids" SERIAL NOT NULL,
    "web_program_id" INTEGER,
    "web_program_uid" TEXT,
    "web_endpoint" VARCHAR(255),
    "web_params" TEXT,
    "web_json_request" JSONB,
    "web_message" TEXT,
    "web_errormessage" TEXT,
    "web_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "web_created_by" VARCHAR(100),
    "web_updated_at" TIMESTAMP(3) NOT NULL,
    "web_updated_by" VARCHAR(100),

    CONSTRAINT "log_webs_pkey" PRIMARY KEY ("web_ids")
);

-- CreateTable
CREATE TABLE "log_desktops" (
    "desktop_ids" SERIAL NOT NULL,
    "desktop_program_id" INTEGER,
    "desktop_program_uid" TEXT,
    "desktop_branch_code" VARCHAR(50),
    "desktop_store_code" VARCHAR(50),
    "desktop_station" VARCHAR(100) DEFAULT '1',
    "desktop_functions" VARCHAR(255),
    "desktop_message" TEXT,
    "desktop_errormessage" TEXT,
    "desktop_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "desktop_created_by" VARCHAR(100),
    "desktop_updated_at" TIMESTAMP(3) NOT NULL,
    "desktop_updated_by" VARCHAR(100),

    CONSTRAINT "log_desktops_pkey" PRIMARY KEY ("desktop_ids")
);

-- CreateTable
CREATE TABLE "log_apps" (
    "apps_ids" SERIAL NOT NULL,
    "apps_program_id" INTEGER,
    "apps_program_uid" TEXT,
    "apps_endpoint" VARCHAR(255),
    "apps_params" TEXT,
    "apps_json_request" TEXT,
    "apps_message" TEXT,
    "apps_errormessage" TEXT,
    "apps_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "apps_created_by" VARCHAR(100),
    "apps_updated_at" TIMESTAMP(3) NOT NULL,
    "apps_updated_by" VARCHAR(100),

    CONSTRAINT "log_apps_pkey" PRIMARY KEY ("apps_ids")
);

-- CreateTable
CREATE TABLE "report_definitions" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "query_config" JSONB NOT NULL,
    "role_access" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "report_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_nik_key" ON "users"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_user_email_key" ON "users"("user_email");

-- CreateIndex
CREATE UNIQUE INDEX "report_definitions_name_key" ON "report_definitions"("name");

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_teams" ADD CONSTRAINT "sub_teams_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_sub_team_id_fkey" FOREIGN KEY ("sub_team_id") REFERENCES "sub_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "program_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
