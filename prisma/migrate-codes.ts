import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$executeRawUnsafe(
    `UPDATE stickers SET code = REPLACE(code, '_', '') WHERE code LIKE '%_%'`
  );
  console.log(`Updated ${result} sticker codes (removed underscores).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
