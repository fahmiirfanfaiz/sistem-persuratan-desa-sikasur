// This file is the single source of truth for Prisma v7 configuration.
// - datasource.url  → used by `prisma migrate` (needs DIRECT_URL, not the pooler)
// - The PrismaClient adapter (PrismaPg) in src/libs/prisma.js uses DATABASE_URL
import "dotenv/config";
import { defineConfig } from "prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // DIRECT_URL = session-mode pooler (port 5432) — required for migrations
    url: process.env["DIRECT_URL"] ?? "",
  },
});
