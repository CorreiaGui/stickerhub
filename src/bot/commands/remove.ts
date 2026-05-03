import { CommandContext, Context } from "grammy";
import { albumService } from "../../services/album.service";
import { formatRemoveResult } from "../helpers/formatter";

export async function removeCommand(ctx: CommandContext<Context>) {
  const from = ctx.from;
  if (!from) return;

  const input = ctx.match;
  if (!input) {
    await ctx.reply("Use: /remove BRA1, BRA2");
    return;
  }

  try {
    const { removed, invalid } = await albumService.removeStickers(BigInt(from.id), input);
    if (removed.length === 0 && invalid.length > 0) {
      await ctx.reply(`❌ Nenhuma figurinha encontrada: ${invalid.join(", ")}`);
      return;
    }
    await ctx.reply(formatRemoveResult(removed, invalid));
  } catch (err: any) {
    await ctx.reply(`❌ ${err.message}`);
  }
}
