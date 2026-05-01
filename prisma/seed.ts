import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface RawSticker {
  codigo: string;
  numero: number;
  pais: string | null;
  sigla: string;
  grupo: string | null;
  jogador: string | null;
  tipo: string;
  raridade: string;
}

async function main() {
  const jsonPath = path.resolve(__dirname, "../jsons/figurinhas_copa_2026.json");
  const raw: RawSticker[] = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  console.log(`Seeding ${raw.length} stickers...`);

  await prisma.sticker.createMany({
    data: raw.map((s) => ({
      code: s.codigo,
      number: s.numero,
      country: s.pais,
      countryCode: s.sigla,
      group: s.grupo,
      player: s.jogador,
      type: s.tipo,
      rarity: s.raridade,
    })),
    skipDuplicates: true,
  });

  const count = await prisma.sticker.count();
  console.log(`Done. ${count} stickers in database.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
