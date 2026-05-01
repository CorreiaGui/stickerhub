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

  bot.on("message:text", async (ctx) => {
    await ctx.reply("Comando não reconhecido. Use /help para ver os comandos disponíveis.");
  });

  bot.catch((err) => {
    console.error("Bot error:", err);
  });

  return bot;
}
