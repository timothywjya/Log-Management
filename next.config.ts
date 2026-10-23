import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Kunci root Turbopack ke folder project ini. Tanpa ini, Next bisa salah memilih folder
  // induk (mis. /u01/web) jika di sana ada package-lock.json lain.
  turbopack: {
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;