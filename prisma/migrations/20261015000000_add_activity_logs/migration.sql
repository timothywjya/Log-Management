-- Aman dijalankan berulang (IF NOT EXISTS) dan TIDAK menyentuh tabel/data lain.
-- Bisa ditempel langsung di pgAdmin (Query Tool) atau lewat `prisma migrate deploy`.

CREATE TABLE IF NOT EXISTS "activity_logs" (
    "id"          BIGSERIAL    NOT NULL,
    "program_id"  INTEGER      NOT NULL,
    "category"    VARCHAR(10)  NOT NULL,
    "level"       VARCHAR(10)  NOT NULL DEFAULT 'info',
    "action"      VARCHAR(100) NOT NULL,
    "message"     TEXT,
    "actor"       VARCHAR(100),
    "ip_address"  VARCHAR(45),
    "device"      VARCHAR(150),
    "app_version" VARCHAR(50),
    "metadata"    JSONB,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "activity_logs_category_check" CHECK ("category" IN ('web', 'job', 'desktop', 'mobile')),
    CONSTRAINT "activity_logs_level_check"    CHECK ("level" IN ('debug', 'info', 'warn', 'error')),
    CONSTRAINT "activity_logs_program_id_fkey" FOREIGN KEY ("program_id")
        REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "activity_logs_category_occurred_at_idx"
    ON "activity_logs"("category", "occurred_at" DESC);

CREATE INDEX IF NOT EXISTS "activity_logs_program_id_occurred_at_idx"
    ON "activity_logs"("program_id", "occurred_at" DESC);
