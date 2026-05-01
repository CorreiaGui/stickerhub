import { CommandContext, Context } from "grammy";
import { albumService } from "../../services/album.service";
import { stickerRepository } from "../../repositories/sticker.repository";

export async function startCommand(ctx: CommandContext<Context>) {
  const from = ctx.from;
  if (!from) return;

  await albumService.registerUser(BigInt(from.id), from.first_name, from.username);
  const total = await stickerRepository.countAll();

  await ctx.reply(
    `🏆 *Bem-vindo ao Álbum Copa 2026!*\n\n` +
      `Seu álbum foi criado. Você tem ${total} figurinhas para completar.\n\n` +
      `Use /help para ver os comandos disponíveis.`,
    { parse_mode: "Markdown" }
  );
}
