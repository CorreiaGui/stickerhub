import { CommandContext, Context } from "grammy";
import { albumService } from "../../services/album.service";
import { formatProgress } from "../helpers/formatter";

export async function progressCommand(ctx: CommandContext<Context>) {
  const from = ctx.from;
  if (!from) return;

  try {
    const { overall, byGroup } = await albumService.getProgress(BigInt(from.id));
    await ctx.reply(formatProgress(overall, byGroup));
  } catch (err: any) {
    await ctx.reply(`❌ ${err.message}`);
  }
}
