import { PrismaClient } from "@prisma/client";

/* Lazily create a single PrismaClient. Returns null when DATABASE_URL is unset,
   so persistence degrades gracefully (the app keeps working without a DB).
   Cached on globalThis to survive dev hot-reloads. */

const g = globalThis as unknown as { _prisma?: PrismaClient };

export const dbEnabled = !!process.env.DATABASE_URL;

export function getPrisma(): PrismaClient | null {
  if (!process.env.DATABASE_URL) return null;
  if (!g._prisma) {
    g._prisma = new PrismaClient();
  }
  return g._prisma;
}
