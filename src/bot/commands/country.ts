import { CommandContext, Context } from "grammy";
import { albumService } from "../../services/album.service";
import { formatCountry } from "../helpers/formatter";

export async function countryCommand(ctx: CommandContext<Context>) {
  const from = ctx.from;
  if (!from) return;

  const input = ctx.match;
  if (!input) {
    await ctx.reply("Use: /pais BRA");
    return;
  }

  try {
    const data = await albumService.getByCountry(BigInt(from.id), input.trim());
    if (!data) {
      await ctx.reply(`❌ País não encontrado: ${input.trim().toUpperCase()}`);
      return;
    }
    await ctx.reply(formatCountry(data));
  } catch (err: any) {
    await ctx.reply(`❌ ${err.message}`);
  }
}
