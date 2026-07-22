import "dotenv/config";
import { PrismaClient } from "./src/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

/**
 * Dummy accounts for testing:
 *
 * ADMIN:
 *   email   : admin@sikasur.desa.id
 *   password: Admin@123
 *   role    : ADMIN
 *
 * USER 1:
 *   email   : budi@gmail.com
 *   password: User@123
 *   role    : USER
 *
 * USER 2:
 *   email   : siti@gmail.com
 *   password: User@123
 *   role    : USER
 */
const ACCOUNTS = [
  {
    name: "Admin Desa Sikasur",
    nik: "3327010000000001",
    familyCardNumber: "3327010000000001",
    email: "admin@sikasur.desa.id",
    phoneNumber: "081200000001",
    address: "Kantor Desa Sikasur, Kecamatan Belik, Kabupaten Pemalang",
    password: "Admin@123",
    role: "ADMIN",
  },
  {
    name: "Budi Santoso",
    nik: "3327010000000002",
    familyCardNumber: "3327010000000002",
    email: "budi@gmail.com",
    phoneNumber: "081200000002",
    address: "Desa Sikasur RT 01 RW 01, Kecamatan Belik",
    password: "User@123",
    role: "USER",
  },
  {
    name: "Siti Rahayu",
    nik: "3327010000000003",
    familyCardNumber: "3327010000000003",
    email: "siti@gmail.com",
    phoneNumber: "081200000003",
    address: "Desa Sikasur RT 02 RW 01, Kecamatan Belik",
    password: "User@123",
    role: "USER",
  },
];

async function main() {
  console.log("🌱 Seeding dummy accounts...\n");

  for (const account of ACCOUNTS) {
    const existing = await prisma.user.findUnique({
      where: { email: account.email },
    });

    if (existing) {
      console.log(`  ✓ Account already exists: ${account.email} (${existing.role})`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(account.password, 12);

    await prisma.user.create({
      data: {
        name: account.name,
        nik: account.nik,
        familyCardNumber: account.familyCardNumber,
        email: account.email,
        phoneNumber: account.phoneNumber,
        address: account.address,
        password: hashedPassword,
        role: account.role,
        isActive: true,
      },
    });

    console.log(`  ✅ Created [${account.role}]: ${account.email} / ${account.password}`);
  }

  console.log("\n=======================================================");
  console.log("📋 DUMMY ACCOUNTS:");
  console.log("=======================================================");
  console.log("");
  console.log("  👑 ADMIN");
  console.log("     Email    : admin@sikasur.desa.id");
  console.log("     Password : Admin@123");
  console.log("");
  console.log("  👤 USER 1");
  console.log("     Email    : budi@gmail.com");
  console.log("     Password : User@123");
  console.log("");
  console.log("  👤 USER 2");
  console.log("     Email    : siti@gmail.com");
  console.log("     Password : User@123");
  console.log("=======================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
