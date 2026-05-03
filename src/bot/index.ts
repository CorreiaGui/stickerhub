import { Bot } from "grammy";
import { startCommand } from "./commands/start";
import { helpCommand } from "./commands/help";
import { addCommand } from "./commands/add";
import { removeCommand } from "./commands/remove";
import { duplicatesCommand } from "./commands/duplicates";
import { missingCommand } from "./commands/missing";
import { progressCommand } from "./commands/progress";
import { countryCommand } from "./commands/country";
import { groupCommand } from "./commands/group";
import { contactCommand } from "./commands/contact";
import { photoHandler } from "./commands/photo";
import { albumService } from "../services/album.service";
import { formatAddResult } from "./helpers/formatter";

export function createBot(token: string): Bot {
  const bot = new Bot(token);

  bot.command("start", startCommand);
  bot.command("help", helpCommand);
  bot.command("add", addCommand);
  bot.command("remove", removeCommand);
  bot.command(["repetidas", "duplicates"], duplicatesCommand);
  bot.command(["faltantes", "missing"], missingCommand);
  bot.command(["progresso", "progress"], progressCommand);
  bot.command(["pais", "country"], countryCommand);
  bot.command(["grupo", "group"], groupCommand);
  bot.command("contato", contactCommand);

  bot.on("message:photo", photoHandler);

  bot.on("message:text", async (ctx) => {
    const text = ctx.message.text;
    if (!text || !ctx.from) return;

    const looksLikeCodes = /^[A-Za-z]{2,3}\s*\d{1,2}(\s*[,\s]\s*[A-Za-z]{2,3}\s*\d{1,2})*\s*$/;
    if (!looksLikeCodes.test(text.trim())) {
      await ctx.reply("❌ Não entendi. Envie códigos de figurinhas (ex: BRA1, ARG5) ou use /help.");
      return;
    }

    try {
      const { added, invalid } = await albumService.addStickers(BigInt(ctx.from.id), text);
      if (added.length === 0 && invalid.length > 0) {
        await ctx.reply(`❌ Nenhuma figurinha encontrada: ${invalid.join(", ")}\nVerifique os códigos e tente novamente.`);
        return;
      }
      await ctx.reply(formatAddResult(added, invalid));
    } catch (err: any) {
      await ctx.reply(`❌ ${err.message}`);
    }
  });

  bot.catch((err) => {
    console.error("Bot error:", err);
  });

  return bot;
}
