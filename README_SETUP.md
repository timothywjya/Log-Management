# Setup Guide — Log Management System

## Prerequisites
- Node.js 20+
- PostgreSQL 15+
- (Optional) Redis untuk session store

## 1. Install Dependencies
```bash
npm install
```

## 2. Configure Environment
Edit `.env`:
- `DATABASE_URL` — PostgreSQL connection string
- `APP_JWT_KEY` — generate dengan: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- `APP_ENCRYPTION_KEY` — generate dengan command yang sama
- `ESS_URL` — URL ESS Indomaret

## 3. Setup Database (PostgreSQL)
```bash
# Migrate schema
npx prisma migrate dev --name init

# Seed data awal (roles, teams, sub_teams, dll)
npx prisma db seed
```

## 4. Run Development
```bash
npm run dev
```

## 5. Setup MFA untuk Administrator
1. Login sebagai Administrator
2. Buka Settings → Security
3. Hit `POST /api/admin/mfa/setup`
4. Scan QR code dengan Google Authenticator
5. MFA aktif mulai login berikutnya

## 6. Tambah Role/Tim Baru (Dynamic)
```bash
# Via API (Admin only)
curl -X POST /api/admin/org \
  -H "x-csrf-token: {token}" \
  -d '{"action":"create_role","role_name":"DevOps","position_level":"C","position_description":"Engineer","group_level":3,"group_description":"Infrastructure"}'
```

## File Structure
```
lib/
  repositories/     # Data access layer
    base.repository.ts
    user.repository.ts
    org.repository.ts
    log.repository.ts
  controllers/      # Business logic
    auth.controller.ts
    user.controller.ts
    org.controller.ts
  security/         # Security utilities
    crypto.ts       # Argon2, AES-256-GCM, sanitize
    mfa.ts          # TOTP
    rbac.ts         # Permissions
  reporting/
    report.engine.ts  # Modular reporting
  session.ts        # JWT cookie management
  db.ts             # Prisma singleton

middleware.ts       # JWT + CSRF route protection
prisma/
  schema.prisma     # PostgreSQL schema
  seed/seed.ts      # Initial data
docs/
  ARCHITECTURE.md
  SECURITY.md
```
