import { CommandContext, Context } from "grammy";

export async function contactCommand(ctx: CommandContext<Context>) {
  await ctx.reply(
    `📬 <b>Contato</b>\n\n` +
      `Tem uma sugestão ou encontrou um bug?\n` +
      `Mande uma mensagem direto para o criador:\n\n` +
      `👤 @gcorreiaM\n\n` +
      `Seu feedback ajuda a melhorar o bot!`,
    { parse_mode: "HTML" }
  );
}
