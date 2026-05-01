import { CommandContext, Context } from "grammy";
import { albumService } from "../../services/album.service";
import { formatMissing } from "../helpers/formatter";

export async function missingCommand(ctx: CommandContext<Context>) {
  const from = ctx.from;
  if (!from) return;

  try {
    const filter = ctx.match || undefined;
    const { total, byCountry } = await albumService.getMissing(BigInt(from.id), filter);
    const msg = formatMissing(total, byCountry, filter);

    if (msg.length > 4096) {
      const chunks = splitMessage(msg, 4096);
      for (const chunk of chunks) {
        await ctx.reply(chunk);
      }
    } else {
      await ctx.reply(msg);
    }
  } catch (err: any) {
    await ctx.reply(`❌ ${err.message}`);
  }
}

function splitMessage(text: string, maxLength: number): string[] {
  const chunks: string[] = [];
  let current = "";
  for (const line of text.split("\n")) {
    if (current.length + line.length + 1 > maxLength) {
      chunks.push(current);
      current = line;
    } else {
      current += (current ? "\n" : "") + line;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}
