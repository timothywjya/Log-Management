import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg"; 
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in .env");
}
const adapter = new PrismaPg({ connectionString: String(process.env.DATABASE_URL) });
const prisma = new PrismaClient({ adapter });

const DEFAULT_PASSWORD = "Indomaret@2025";
const BCRYPT_ROUNDS    = 12;

async function main() {
  console.log("🌱 Seeding database dengan UUID...\n");

  console.log("🔐 Hashing password dengan bcrypt (rounds=12)...");
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, BCRYPT_ROUNDS);
  console.log(`   Hash: ${passwordHash.substring(0, 29)}...`);
  console.log(`   Default password: ${DEFAULT_PASSWORD}\n`);

  // 1. Seeding Program Groups
  console.log("📋 Seeding program_groups...");
  const groupNames: Record<number, string> = {
    1: "Front Office",
    2: "Back Office",
    3: "Issuing dan Planogram",
    4: "OMI",
    5: "IT Data and Infrastructure",
    6: "Administrator",
  };

  const groupMap: Record<number, string> = {};

  for (let i = 1; i <= 6; i++) {
    const groupId = uuidv4();
    groupMap[i] = groupId;
    await prisma.programGroup.upsert({
      where: { id: groupId },
      update: { group_name: groupNames[i] },
      create: { id: groupId, group_name: groupNames[i] },
    });
  }
  console.log("   ✅ 6 program_groups seeded\n");

  // 2. Seeding Program Types
  console.log("📋 Seeding program_types...");
  const typeNames: Record<number, string> = {
    1: "Desktop",
    2: "Web",
    3: "API",
    4: "Mobile Android",
  };

  const typeMap: Record<number, string> = {};

  for (let i = 1; i <= 4; i++) {
    const typeId = uuidv4();
    typeMap[i] = typeId;
    await prisma.programType.upsert({
      where: { id: typeId },
      update: { program_type: typeNames[i] },
      create: { id: typeId, program_type: typeNames[i] },
    });
  }
  console.log("   ✅ 4 program_types seeded\n");

  // 3. Seeding Programs
  console.log("📋 Seeding programs...");
  const programsData = [
    { id: uuidv4(), program_name: "CMS RKM",                     type_num: 2, group_num: 4, created_by: "system", deleted_at: null, deleted_by: null },
    { id: uuidv4(), program_name: "Fixtable OMI",                  type_num: 2, group_num: 4, created_by: "system", deleted_at: null, deleted_by: null },
    { id: uuidv4(), program_name: "OMI System",                    type_num: 1, group_num: 4, created_by: "system", deleted_at: null, deleted_by: null },
    { id: uuidv4(), program_name: "POS Indogrosir",                type_num: 1, group_num: 1, created_by: "system", deleted_at: null, deleted_by: null },
    { id: uuidv4(), program_name: "IKIOSK",                        type_num: 1, group_num: 1, created_by: "system", deleted_at: null, deleted_by: null },
    { id: uuidv4(), program_name: "POS",                           type_num: 1, group_num: 1, created_by: "system", deleted_at: null, deleted_by: null },
    { id: uuidv4(), program_name: "MyPoinCS",                      type_num: 2, group_num: 1, created_by: "system", deleted_at: null, deleted_by: null },
    { id: uuidv4(), program_name: "Web Pendaftaran KUM (UI)",        type_num: 2, group_num: 1, created_by: "system", deleted_at: null, deleted_by: null },
    { id: uuidv4(), program_name: "Loyalty Gift Counter (UI Web)",  type_num: 2, group_num: 1, created_by: "system", deleted_at: null, deleted_by: null },
    { id: uuidv4(), program_name: "FE Growsir",                    type_num: 2, group_num: 1, created_by: "system", deleted_at: null, deleted_by: null },
    { id: uuidv4(), program_name: "FE CMS Fingerprint",            type_num: 2, group_num: 1, created_by: "system", deleted_at: null, deleted_by: null },
    { id: uuidv4(), program_name: "Monitoring Barang Promosi",      type_num: 2, group_num: 2, created_by: "system", deleted_at: null, deleted_by: null },
    { id: uuidv4(), program_name: "Promosi HO",                    type_num: 2, group_num: 2, created_by: "system", deleted_at: null, deleted_by: null },
    { id: uuidv4(), program_name: "Cetak Kartu Member",            type_num: 2, group_num: 2, created_by: "system", deleted_at: null, deleted_by: null },
    { id: uuidv4(), program_name: "monitoring-poin-igr",           type_num: 2, group_num: 2, created_by: "system", deleted_at: null, deleted_by: null },
    { id: uuidv4(), program_name: "CMS Sticker Discount",          type_num: 2, group_num: 2, created_by: "system", deleted_at: null, deleted_by: null },
    { id: uuidv4(), program_name: "monitoring-version",            type_num: 2, group_num: 2, created_by: "system", deleted_at: null, deleted_by: null },
    { id: uuidv4(), program_name: "BE Growsir",                    type_num: 2, group_num: 2, created_by: "system", deleted_at: null, deleted_by: null },
    { id: uuidv4(), program_name: "BE CMS Fingerprint",            type_num: 2, group_num: 2, created_by: "system", deleted_at: null, deleted_by: null },
    { id: uuidv4(), program_name: "CMS Ikiosk",                    type_num: 2, group_num: 2, created_by: "system", deleted_at: null, deleted_by: null },
    { id: uuidv4(), program_name: "ServiceTray",                   type_num: 3, group_num: 5, created_by: "system", deleted_at: null, deleted_by: null },
    { id: uuidv4(), program_name: "IsakuServiceTray",              type_num: 3, group_num: 5, created_by: "system", deleted_at: null, deleted_by: null },
    { id: uuidv4(), program_name: "API POS",                       type_num: 3, group_num: 5, created_by: "system", deleted_at: null, deleted_by: null },
    { id: uuidv4(), program_name: "API Loyalty",                   type_num: 3, group_num: 5, created_by: "system", deleted_at: null, deleted_by: null },
    { id: uuidv4(), program_name: "API Ikiosk Microservices",      type_num: 3, group_num: 5, created_by: "system", deleted_at: new Date("2025-12-29T23:31:58Z"), deleted_by: "17" },
    { id: uuidv4(), program_name: "POS GKFI",                      type_num: 1, group_num: 3, created_by: "system", deleted_at: null, deleted_by: null },
    { id: uuidv4(), program_name: "Price Tag Printer",             type_num: 1, group_num: 3, created_by: "system", deleted_at: null, deleted_by: null },
    { id: uuidv4(), program_name: "Label Printer",                 type_num: 1, group_num: 3, created_by: "system", deleted_at: null, deleted_by: null },
  ];

  for (const p of programsData) {
    await prisma.program.create({
      data: {
        id:               p.id,
        program_name:     p.program_name,
        program_type_id:  typeMap[p.type_num],
        program_group_id: groupMap[p.group_num],
        created_by:       p.created_by,
        deleted_at:       p.deleted_at,
        deleted_by:       p.deleted_by,
      },
    });
  }
  console.log(`   ✅ ${programsData.length} programs seeded\n`);

  // 4. Seeding Teams (dengan team_type)
  console.log("📋 Seeding teams...");

  const programmerTeamNames = [
    "Front Office",
    "Back Office",
    "Issuing dan Planogram",
    "Data Center",
    "OMI",
  ];
  const programmerTeamMap: Record<string, string> = {};

  for (const name of programmerTeamNames) {
    const teamId = uuidv4();
    programmerTeamMap[name] = teamId;
    await prisma.team.create({
      data: { id: teamId, team_name: name, team_type: "programmer" },
    });
  }

  const supportTeamNames = [
    "Support Front Office",
    "Support Back Office",
    "Support Issuing dan Planogram",
    "Support Data Center",
    "Support OMI",
  ];
  const supportTeamMap: Record<string, string> = {};

  for (const name of supportTeamNames) {
    const teamId = uuidv4();
    supportTeamMap[name] = teamId;
    await prisma.team.create({
      data: { id: teamId, team_name: name, team_type: "support" },
    });
  }
  console.log("   ✅ 10 teams seeded (5 programmer + 5 support)\n");

  // 5. Seeding SubTeams (hanya untuk Programmer teams)
  console.log("📋 Seeding sub_teams...");
  const subTeamMap: Record<string, string[]> = {
    "Front Office":           ["POS", "Virtual", "Self Service"],
    "Back Office":            ["IAS", "Daily Job", "Tax and Legal"],
    "Issuing dan Planogram":  ["Virtual", "Offline"],
    "Data Center":            ["Daily Job", "Research and Development"],
    "OMI":                    ["OMI Toko", "OMIHO"],
  };

  let subTeamCount = 0;
  for (const [teamName, subs] of Object.entries(subTeamMap)) {
    const teamId = programmerTeamMap[teamName];
    if (teamId) {
      for (const subName of subs) {
        await prisma.subTeam.create({
          data: { id: uuidv4(), sub_team_name: subName, team_id: teamId },
        });
        subTeamCount++;
      }
    }
  }
  console.log(`   ✅ ${subTeamCount} sub_teams seeded (Support teams: sub_team = null)\n`);

  // 5b. Assign Tim Programmer & Tim Support ke ProgramGroup (via FK langsung)
  console.log("📋 Assign teams ke program_groups...");
  const groupTeamMapping: Array<{ groupNum: number; programmerKey: string; supportKey: string }> = [
    { groupNum: 1, programmerKey: "Front Office",          supportKey: "Support Front Office" },
    { groupNum: 2, programmerKey: "Back Office",           supportKey: "Support Back Office" },
    { groupNum: 3, programmerKey: "Issuing dan Planogram", supportKey: "Support Issuing dan Planogram" },
    { groupNum: 4, programmerKey: "OMI",                   supportKey: "Support OMI" },
    { groupNum: 5, programmerKey: "Data Center",           supportKey: "Support Data Center" },
  ];

  for (const mapping of groupTeamMapping) {
    await prisma.programGroup.update({
      where: { id: groupMap[mapping.groupNum] },
      data: {
        programmer_team_id: programmerTeamMap[mapping.programmerKey] ?? null,
        support_team_id:    supportTeamMap[mapping.supportKey]        ?? null,
      },
    });
  }
  console.log("   ✅ Teams di-assign ke program_groups\n");

  // 6. Seeding Users
  console.log("📋 Seeding users...");
  const usersData = [
    { id: uuidv4(), group_id: groupMap[3], first_name: "Evan",       last_name: "Setiawan",                nik: "2015363739", username: "evan.setiawan",    user_email: "evan.setiawan@indomaret.co.id",  is_guest: false, login_at: new Date("2025-12-29T17:56:47Z"), created_at: new Date("2025-12-26T06:28:37Z") },
    { id: uuidv4(), group_id: groupMap[3], first_name: "Yusuf",      last_name: "Ferlian",                 nik: "2015497532", username: "yusuf.ferlian",    user_email: "yusuf.ferlian@indomaret.co.id",  is_guest: false, login_at: null, created_at: new Date("2025-12-26T06:28:37Z") },
    { id: uuidv4(), group_id: null,        first_name: "Arderia",    last_name: "Driana",                  nik: "2015595398", username: null,              user_email: null,                             is_guest: true,  login_at: new Date("2025-12-30T08:18:31Z"), created_at: new Date("2025-12-30T08:18:31Z") },
    { id: uuidv4(), group_id: null,        first_name: "Roshan",     last_name: "Ram Metta",               nik: "2015595400", username: null,              user_email: null,                             is_guest: true,  login_at: new Date("2025-12-30T08:18:31Z"), created_at: new Date("2025-12-30T08:18:31Z") },
    { id: uuidv4(), group_id: null,        first_name: "Nico",       last_name: "Iskandar",                nik: "2015595401", username: null,              user_email: null,                             is_guest: true,  login_at: new Date("2025-12-30T08:18:31Z"), created_at: new Date("2025-12-30T08:18:31Z") },
    { id: uuidv4(), group_id: null,        first_name: "Tjia Terry", last_name: "Ferdinand Cahyono",       nik: "2015571193", username: null,              user_email: null,                             is_guest: true,  login_at: new Date("2025-12-30T08:18:31Z"), created_at: new Date("2025-12-30T08:18:31Z") },
    { id: uuidv4(), group_id: null,        first_name: "Yohanes",    last_name: "Vianneydani Tjokroaminjaya",nik: "2015571197", username: null,              user_email: null,                             is_guest: true,  login_at: new Date("2025-12-30T08:18:31Z"), created_at: new Date("2025-12-30T08:18:31Z") },
    { id: uuidv4(), group_id: null,        first_name: "Yudha",      last_name: "Adhi Pangestu",           nik: "2015555018", username: null,              user_email: null,                             is_guest: true,  login_at: new Date("2025-12-30T08:18:31Z"), created_at: new Date("2025-12-30T08:18:31Z") },
    { id: uuidv4(), group_id: groupMap[4], first_name: "Rachmat",    last_name: "Achyana",                 nik: "2004003192", username: "rachmat.achyana",  user_email: "achyana@indomaret.co.id",        is_guest: false, login_at: new Date("2025-12-30T08:30:59Z"), created_at: new Date("2025-12-30T08:30:59Z") },
    { id: uuidv4(), group_id: groupMap[4], first_name: "Hirdidjajatmiko", last_name: "Hirdidjajatmiko",     nik: "2000004442", username: "hirdidjajatmiko",  user_email: "hirdi@indomaret.co.id",          is_guest: false, login_at: new Date("2025-12-30T08:30:59Z"), created_at: new Date("2025-12-30T08:30:59Z") },
    { id: uuidv4(), group_id: null,        first_name: "Taufan",     last_name: "Riza",                    nik: "2007004497", username: null,              user_email: null,                             is_guest: true,  login_at: new Date("2025-12-30T08:30:59Z"), created_at: new Date("2025-12-30T08:30:59Z") },
    { id: uuidv4(), group_id: groupMap[4], first_name: "Albertus",   last_name: "Adrian",                  nik: "2015553512", username: "albertus.adrian", user_email: "albertsasdrian7@gmail.com",  is_guest: false, login_at: new Date("2025-12-30T02:42:53Z"), created_at: new Date("2025-12-30T02:41:53Z") },
    { id: uuidv4(), group_id: groupMap[1], first_name: "Kingsley",   last_name: "Anand",                   nik: "2015433418", username: "kingsley.anand",  user_email: "kingsleyanand@indomaret.co.id",is_guest: false, login_at: new Date("2025-12-30T02:47:27Z"), created_at: new Date("2025-12-30T02:45:46Z") },
    { id: uuidv4(), group_id: groupMap[1], first_name: "Timothy",    last_name: "Wijaya",                  nik: "2015497525", username: "timothy.wijaya",  user_email: "timothy.wijaya@indomaret.co.id",is_guest: false, login_at: new Date("2026-01-22T17:16:17Z"), created_at: new Date("2026-01-22T17:16:17Z") },
    { id: uuidv4(), group_id: groupMap[6], first_name: "Admin",      last_name: "System",                  nik: "0000000001", username: "admin",           user_email: "admin@indomaret.co.id",          is_guest: false, login_at: null, created_at: new Date("2025-12-01T00:00:00Z"), is_admin: true },
  ];

  let seededCount = 0;
  let skippedCount = 0;

  for (const u of usersData) {
    const hash = u.is_guest ? null : passwordHash;
    try {
      await prisma.user.create({
        data: {
          id:            u.id,
          group_id:      u.group_id,
          first_name:    u.first_name,
          last_name:     u.last_name,
          nik:           u.nik,
          username:      u.username ?? undefined,
          user_email:    u.user_email ?? undefined,
          password_hash: hash,
          is_guest:      u.is_guest,
          is_admin:      (u as any).is_admin ?? false,
          login_at:      u.login_at,
          created_at:    u.created_at,
        },
      });
      seededCount++;
    } catch (err: any) {
      console.warn(`   ⚠ Skip user NIK ${u.nik}: ${err.message}`);
      skippedCount++;
    }
  }
  console.log(`   ✅ ${seededCount} users seeded (${skippedCount} skipped)\n`);

  // 7. Seeding Report Definitions
  console.log("📋 Seeding report_definitions...");
  const reportDefs = [
    { name: "monthly", type: "monthly", description: "Laporan Bulanan",        query_config: {}, role_access: [1, 3, 4, 5, 7, 8, 9] },
    { name: "period",  type: "period",  description: "Laporan Periode Custom",  query_config: {}, role_access: [1, 4, 5, 8, 9] },
    { name: "team",    type: "team",    description: "Laporan Per Tim / Group", query_config: {}, role_access: [1, 4, 5, 8, 9] },
  ];

  for (const rd of reportDefs) {
    await prisma.reportDefinition.upsert({
      where:  { name: rd.name },
      update: {},
      create: {
        id:           uuidv4(),
        name:         rd.name,
        type:         rd.type,
        description:  rd.description,
        query_config: rd.query_config as any,
        role_access:  rd.role_access as any,
      },
    });
  }
  console.log("   ✅ report_definitions seeded\n");

  console.log("═══════════════════════════════════════════════════");
  console.log("🎉 SEED SELESAI");
  console.log("   Default password : " + DEFAULT_PASSWORD);
  console.log("   Admin login      : username=admin / nik=0000000001");
  console.log("   Catatan          : roles table dihapus — admin via group_name='Administrator' atau is_admin=true");
  console.log("═══════════════════════════════════════════════════");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Seed gagal:", e);
  process.exit(1);
});