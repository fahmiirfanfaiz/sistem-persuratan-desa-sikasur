import "dotenv/config";
import { PrismaClient } from "./src/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const SEED_DATA = [
  {
    name: "Surat Keterangan",
    letterTypes: [
      "Surat Keterangan Domisili",
      "Surat Keterangan Usaha",
      "Surat Keterangan Tidak Mampu",
      "Surat Keterangan Kelahiran",
      "Surat Keterangan Kematian",
    ],
  },
  {
    name: "Surat Pengantar",
    letterTypes: [
      "Surat Pengantar SKCK",
      "Surat Pengantar KTP",
      "Surat Pengantar KK",
    ],
  },
  {
    name: "Lainnya",
    letterTypes: ["Lainnya"],
  },
];

async function main() {
  console.log("🌱 Seeding letter categories and types...");

  for (const category of SEED_DATA) {
    const existing = await prisma.letterCategory.findUnique({
      where: { name: category.name },
    });

    let cat;
    if (existing) {
      cat = existing;
      console.log(`  ✓ Category already exists: ${category.name}`);
    } else {
      cat = await prisma.letterCategory.create({
        data: { name: category.name },
      });
      console.log(`  + Created category: ${category.name}`);
    }

    for (const typeName of category.letterTypes) {
      const existingType = await prisma.letterType.findFirst({
        where: {
          letterCategoryId: cat.id,
          name: typeName,
        },
      });

      if (!existingType) {
        await prisma.letterType.create({
          data: {
            letterCategoryId: cat.id,
            name: typeName,
          },
        });
        console.log(`    + Created letter type: ${typeName}`);
      } else {
        console.log(`    ✓ Letter type already exists: ${typeName}`);
      }
    }
  }

  console.log("\n✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
