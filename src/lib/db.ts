import path from "node:path";
import { PrismaClient } from "@prisma/client";

const defaultDatabasePath = path.join(process.cwd(), "prisma", "dev.db");

function resolveDatabaseUrl() {
  const configured = process.env.DATABASE_URL?.trim();
  if (!configured || configured === "file:./dev.db") {
    return `file:${defaultDatabasePath}`;
  }
  return configured;
}

process.env.DATABASE_URL = resolveDatabaseUrl();

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
