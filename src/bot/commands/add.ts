import { CommandContext, Context } from "grammy";
import { albumService } from "../../services/album.service";
import { formatAddResult } from "../helpers/formatter";

export async function addCommand(ctx: CommandContext<Context>) {
  const from = ctx.from;
  if (!from) return;

  const input = ctx.match;
  if (!input) {
    await ctx.reply("Use: /add BRA_01, BRA_02, ARG_05");
    return;
  }

  try {
    const { added, invalid } = await albumService.addStickers(BigInt(from.id), input);
    if (added.length === 0 && invalid.length > 0) {
      await ctx.reply(`❌ Nenhuma figurinha encontrada: ${invalid.join(", ")}`);
      return;
    }
    await ctx.reply(formatAddResult(added, invalid));
  } catch (err: any) {
    await ctx.reply(`❌ ${err.message}`);
  }
}
