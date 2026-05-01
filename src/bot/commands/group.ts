import { CommandContext, Context } from "grammy";
import { albumService } from "../../services/album.service";
import { formatGroup } from "../helpers/formatter";

export async function groupCommand(ctx: CommandContext<Context>) {
  const from = ctx.from;
  if (!from) return;

  const input = ctx.match;
  if (!input) {
    await ctx.reply("Use: /grupo A");
    return;
  }

  try {
    const data = await albumService.getByGroup(BigInt(from.id), input.trim());
    if (!data) {
      await ctx.reply(`❌ Grupo não encontrado: ${input.trim().toUpperCase()}`);
      return;
    }
    await ctx.reply(formatGroup(data));
  } catch (err: any) {
    await ctx.reply(`❌ ${err.message}`);
  }
}
