import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@/infrastructure/config/env";
import { PrismaClient } from "./generated/client";

const createClient = () => new PrismaClient({ adapter: new PrismaPg({ connectionString: env.databaseUrl }) });

declare global {
  var prismaGlobal: ReturnType<typeof createClient> | undefined;
}

export const prisma = globalThis.prismaGlobal ?? createClient();

// Di development, simpan di globalThis supaya hot reload tidak membuka koneksi baru terus-menerus.
if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
