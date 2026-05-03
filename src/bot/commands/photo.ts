import { Context } from "grammy";
import { createWorker } from "tesseract.js";
import { albumService } from "../../services/album.service";
import { stickerRepository } from "../../repositories/sticker.repository";
import { formatAddResult } from "../helpers/formatter";

let validCodes: Set<string> | null = null;

async function loadValidCodes() {
  if (validCodes) return validCodes;
  const stickers = await stickerRepository.findAll();
  validCodes = new Set(stickers.map((s) => s.code));
  return validCodes;
}

function extractCodes(text: string, valid: Set<string>): string[] {
  const normalized = text.toUpperCase().replace(/[^A-Z0-9\n ]/g, " ");

  const pattern = /[A-Z]{2,3}\s*\d{1,2}/g;
  const matches = normalized.match(pattern) || [];

  const codes: string[] = [];
  for (const match of matches) {
    const clean = match.replace(/\s+/g, "");
    if (valid.has(clean) && !codes.includes(clean)) {
      codes.push(clean);
    }
  }

  return codes;
}

export async function photoHandler(ctx: Context) {
  const from = ctx.from;
  if (!from) return;

  const photo = ctx.message?.photo;
  if (!photo || photo.length === 0) return;

  await ctx.reply("🔍 Analisando a foto...");

  try {
    const fileId = photo[photo.length - 1].file_id;
    const file = await ctx.api.getFile(fileId);
    const url = `https://api.telegram.org/file/bot${ctx.api.token}/${file.file_path}`;

    const worker = await createWorker("eng");
    const { data } = await worker.recognize(url);
    await worker.terminate();

    const valid = await loadValidCodes();
    const codes = extractCodes(data.text, valid);

    if (codes.length === 0) {
      await ctx.reply(
        "❌ Não consegui identificar figurinhas nessa foto.\n\n" +
          "Dicas:\n" +
          "• Tire a foto com boa iluminação\n" +
          "• Foque no código da figurinha (ex: BRA1)\n" +
          "• Você também pode digitar: /add BRA1, BRA2"
      );
      return;
    }

    const { added, invalid } = await albumService.addStickers(
      BigInt(from.id),
      codes.join(",")
    );

    let msg = formatAddResult(added, invalid);
    msg += `\n\n📷 ${codes.length} código(s) detectado(s) na foto.`;
    await ctx.reply(msg);
  } catch (err: any) {
    console.error("Photo OCR error:", err);
    await ctx.reply("❌ Erro ao processar a foto. Tente novamente ou use /add.");
  }
}
