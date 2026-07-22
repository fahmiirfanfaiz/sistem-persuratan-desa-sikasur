import "dotenv/config";
import { PrismaClient } from "./src/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

/**
 * Seed data: 1 kategori "Surat Pelayanan Umum" dengan 6 jenis surat.
 * templatePath mengacu ke nama file di bucket "letter-template".
 */
const SEED_DATA = [
  {
    name: "Surat Pelayanan Umum",
    letterTypes: [
      {
        name: "Blangko KK",
        description: "Blanko Kartu Keluarga",
        templatePath: "Blangko KK.docx",
      },
      {
        name: "Blangko KTP",
        description: "Blanko Kartu Tanda Penduduk",
        templatePath: "Blangko KTP.docx",
      },
      {
        name: "Surat Ijin Hajatan",
        description: "Surat Izin Penyelenggaraan Hajatan",
        templatePath: "Surat Ijin Hajatan.docx",
      },
      {
        name: "Surat Keterangan Tidak Mampu Sekolah",
        description: "Surat Keterangan Tidak Mampu untuk Keperluan Sekolah",
        templatePath: "Surat Keterangan Tidak Mampu Sekolah.docx",
      },
      {
        name: "Surat Keterangan Usaha",
        description: "Surat Keterangan Kepemilikan atau Kegiatan Usaha",
        templatePath: "Surat Keterangan Usaha.docx",
      },
      {
        name: "Surat Pengantar Umum dan Domisili",
        description: "Surat Pengantar Umum dan Keterangan Domisili",
        templatePath: "Surat Pengantar Umum dan Domisili.docx",
      },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding letter categories and types...");

  for (const category of SEED_DATA) {
    let cat = await prisma.letterCategory.findUnique({
      where: { name: category.name },
    });

    if (cat) {
      console.log(`  ✓ Category already exists: ${category.name}`);
    } else {
      cat = await prisma.letterCategory.create({
        data: { name: category.name },
      });
      console.log(`  + Created category: ${category.name}`);
    }

    for (const letterType of category.letterTypes) {
      const existingType = await prisma.letterType.findFirst({
        where: {
          letterCategoryId: cat.id,
          name: letterType.name,
        },
      });

      if (!existingType) {
        await prisma.letterType.create({
          data: {
            letterCategoryId: cat.id,
            name: letterType.name,
            description: letterType.description,
            templatePath: letterType.templatePath,
          },
        });
        console.log(`    + Created letter type: ${letterType.name}`);
      } else {
        // Update templatePath if not set
        if (!existingType.templatePath) {
          await prisma.letterType.update({
            where: { id: existingType.id },
            data: { templatePath: letterType.templatePath, description: letterType.description },
          });
          console.log(`    ↺ Updated template path for: ${letterType.name}`);
        } else {
          console.log(`    ✓ Letter type already exists: ${letterType.name}`);
        }
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
