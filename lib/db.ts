import { PrismaClient } from '@prisma/client';

// const prismaClientSingleton = () => {
//   return new PrismaClient()
// }

console.log(process.env.DATABASE_URL);

const prismaClientSingleton = () => {
  console.log("DB URL Check:", process.env.DATABASE_URL) // Pastikan muncul di terminal
  return new PrismaClient()
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma