import { CommandContext, Context } from "grammy";
import { albumService } from "../../services/album.service";
import { formatDuplicates } from "../helpers/formatter";

export async function duplicatesCommand(ctx: CommandContext<Context>) {
  const from = ctx.from;
  if (!from) return;

  try {
    const duplicates = await albumService.getDuplicates(BigInt(from.id));
    await ctx.reply(formatDuplicates(duplicates));
  } catch (err: any) {
    await ctx.reply(`❌ ${err.message}`);
  }
}
