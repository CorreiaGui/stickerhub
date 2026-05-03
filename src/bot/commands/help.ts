import { CommandContext, Context } from "grammy";

const HELP_TEXT = `📖 <b>Comandos disponíveis</b>

<b>Gerenciar figurinhas:</b>
/add <code>códigos</code> — Adicionar figurinhas
   Ex: <code>/add BRA1, BRA2, ARG5</code>

/remove <code>códigos</code> — Remover figurinhas
   Ex: <code>/remove BRA1, ARG5</code>

<b>Consultar álbum:</b>
/faltantes — Listar todas as faltantes
   Ex: <code>/faltantes</code> ou <code>/faltantes BRA</code>

/repetidas — Listar repetidas com lista para compartilhar

/progresso — Ver progresso geral do álbum

<b>Filtrar:</b>
/pais <code>sigla</code> — Detalhes de um país
   Ex: <code>/pais BRA</code>

/grupo <code>letra</code> — Detalhes de um grupo
   Ex: <code>/grupo A</code>

<b>Outros:</b>
/start — Registrar e iniciar seu álbum
/help — Este menu

━━━━━━━━━━━━━━━

💡 <b>Dicas:</b>
• Separe códigos por vírgula ou espaço
• Adicionar a mesma figurinha 2x incrementa a quantidade
• Use /repetidas para gerar lista pronta para compartilhar`;

export async function helpCommand(ctx: CommandContext<Context>) {
  await ctx.reply(HELP_TEXT, { parse_mode: "HTML" });
}
