// Membuat APP_SECRET_KEY (untuk menandatangani sesi login) dan menyimpannya ke .env.
//
//   npm run generate:secret            -> isi APP_SECRET_KEY di .env jika masih kosong
//   npm run generate:secret -- --force -> timpa key yang sudah ada (SEMUA user akan logout)
//   npm run generate:secret -- --print -> hanya cetak key, tidak menulis file
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";

const args = new Set(process.argv.slice(2));
const secret = randomBytes(48).toString("base64url"); // 64 karakter

if (args.has("--print")) {
  console.log(secret);
  process.exit(0);
}

if (!existsSync(".env")) {
  if (existsSync(".env.example")) copyFileSync(".env.example", ".env");
  else writeFileSync(".env", "");
  console.log("• .env dibuat");
}

let env = readFileSync(".env", "utf8");
const line = /^APP_SECRET_KEY=(.*)$/m;
const current = env.match(line)?.[1]?.replace(/^["']|["']$/g, "").trim();

if (current && current.length >= 32 && !args.has("--force")) {
  console.log("APP_SECRET_KEY sudah ada di .env, tidak diubah. Pakai --force untuk menimpa.");
  process.exit(0);
}

env = line.test(env)
  ? env.replace(line, `APP_SECRET_KEY="${secret}"`)
  : env.replace(/\n*$/, "\n") + `APP_SECRET_KEY="${secret}"\n`;

writeFileSync(".env", env);
console.log("✔ APP_SECRET_KEY baru sudah ditulis ke .env");
