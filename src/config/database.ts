import { PrismaClient } from "@prisma/client"
import { config } from "./env"

declare global {
  var __prisma: PrismaClient | undefined
}

// Prevent multiple instances of Prisma Client in development
const prisma =
  globalThis.__prisma ||
  new PrismaClient({
    log: config.isDevelopment ? ["query", "error", "warn"] : ["error"],
    errorFormat: "pretty",
  })

if (config.isDevelopment) {
  globalThis.__prisma = prisma
}

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect()
})

export { prisma }
export default prisma
