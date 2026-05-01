import { CommandContext, Context } from "grammy";

const HELP_TEXT = `📖 *Comandos disponíveis:*

/start — Registrar e iniciar seu álbum
/add \\<códigos\\> — Adicionar figurinhas
  Ex: \`/add BRA_01, BRA_02, ARG_05\`
/remove \\<códigos\\> — Remover figurinhas
  Ex: \`/remove BRA_01, ARG_05\`
/faltantes \\[filtro\\] — Listar faltantes
  Ex: \`/faltantes\` ou \`/faltantes BRA\`
/repetidas — Listar repetidas (com lista para compartilhar)
/progresso — Ver progresso do álbum
/pais \\<sigla\\> — Ver detalhes de um país
  Ex: \`/pais BRA\`
/grupo \\<letra\\> — Ver detalhes de um grupo
  Ex: \`/grupo A\`
/help — Este menu

*Dicas:*
• Adicione várias de uma vez separando por vírgula ou espaço
• Adicionar a mesma figurinha 2x incrementa a quantidade
• Use /repetidas para gerar lista pronta para compartilhar`;

export async function helpCommand(ctx: CommandContext<Context>) {
  await ctx.reply(HELP_TEXT, { parse_mode: "MarkdownV2" });
}
