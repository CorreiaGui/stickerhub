import { AlbumProgress, GroupProgress } from "../../domain/sticker";

export function formatAddResult(
  added: { code: string; country: string | null; newQuantity: number }[],
  invalid: string[]
): string {
  const lines: string[] = ["✅ Figurinhas adicionadas:\n"];

  for (const a of added) {
    const label = a.country ?? a.code;
    if (a.newQuantity === 1) {
      lines.push(`  • ${a.code} (${label}) — 1x`);
    } else {
      lines.push(`  • ${a.code} (${label}) — agora ${a.newQuantity}x`);
    }
  }

  if (invalid.length > 0) {
    lines.push(`\n❌ Não encontradas: ${invalid.join(", ")}`);
  }

  return lines.join("\n");
}

export function formatRemoveResult(
  removed: { code: string; country: string | null; removed: boolean; remaining: number }[],
  invalid: string[]
): string {
  const lines: string[] = [];

  const success = removed.filter((r) => r.removed);
  const notOwned = removed.filter((r) => !r.removed);

  if (success.length > 0) {
    lines.push("✅ Figurinhas removidas:\n");
    for (const r of success) {
      const label = r.country ?? r.code;
      if (r.remaining === 0) {
        lines.push(`  • ${r.code} (${label}) — removida do álbum`);
      } else {
        lines.push(`  • ${r.code} (${label}) — restam ${r.remaining}x`);
      }
    }
  }

  if (notOwned.length > 0) {
    lines.push(`\n⚠️ Você não possui: ${notOwned.map((r) => r.code).join(", ")}`);
  }

  if (invalid.length > 0) {
    lines.push(`\n❌ Não encontradas: ${invalid.join(", ")}`);
  }

  return lines.join("\n");
}

export function formatDuplicates(
  duplicates: { code: string; country: string | null; countryCode: string; duplicates: number }[]
): string {
  if (duplicates.length === 0) return "Você não tem figurinhas repetidas.";

  const totalDuplicates = duplicates.reduce((sum, d) => sum + d.duplicates, 0);

  const byCountry = new Map<string, typeof duplicates>();
  for (const d of duplicates) {
    const key = d.country ?? d.countryCode;
    if (!byCountry.has(key)) byCountry.set(key, []);
    byCountry.get(key)!.push(d);
  }

  const lines: string[] = [`📋 Repetidas para compartilhar (${totalDuplicates} no total):\n`];

  for (const [country, items] of byCountry) {
    const codes = items.map((i) => i.duplicates > 1 ? `${i.code} (${i.duplicates}x)` : i.code);
    lines.push(`${country}: ${codes.join(", ")}`);
  }

  return lines.join("\n");
}

export function formatMissing(total: number, byCountry: Map<string, string[]>, filter?: string): string {
  if (total === 0) {
    return filter
      ? `✅ Você já tem todas as figurinhas${filter ? ` de ${filter}` : ""}!`
      : "🏆 Parabéns! Seu álbum está completo!";
  }

  const lines: string[] = [`📋 Figurinhas faltantes (${total}):\n`];

  for (const [country, codes] of byCountry) {
    lines.push(`\n${country} (${codes.length}):`);
    lines.push(`  ${codes.join(", ")}`);
  }

  return lines.join("\n");
}

function progressBar(percentage: number): string {
  const size = 10;
  const filled = Math.round((percentage / 100) * size);
  const empty = size - filled;
  return "▓".repeat(filled) + "░".repeat(empty);
}

export function formatProgress(overall: AlbumProgress, byGroup: GroupProgress[]): string {
  const lines: string[] = [
    "📊 Progresso do Álbum:\n",
    `${progressBar(overall.percentage)} ${overall.percentage}%`,
    `${overall.owned} de ${overall.total} figurinhas\n`,
    "Por grupo:",
  ];

  for (const g of byGroup) {
    const label = g.group === "Especiais" ? "ESP" : g.group;
    lines.push(`  ${label} ${progressBar(g.percentage)} ${g.owned}/${g.total}`);
  }

  return lines.join("\n");
}

export function formatCountry(data: {
  country: string;
  countryCode: string;
  total: number;
  owned: number;
  details: { code: string; owned: boolean; quantity: number }[];
}): string {
  const pct = data.total > 0 ? Math.round((data.owned / data.total) * 1000) / 10 : 0;
  const lines: string[] = [
    `🏳️ ${data.country} (${data.countryCode}) — ${data.owned}/${data.total} (${pct}%)\n`,
  ];

  for (const d of data.details) {
    if (d.owned) {
      const extra = d.quantity > 1 ? ` (${d.quantity}x)` : "";
      lines.push(`  ✅ ${d.code}${extra}`);
    } else {
      lines.push(`  ⬜ ${d.code}`);
    }
  }

  return lines.join("\n");
}

export function formatGroup(data: {
  group: string;
  total: number;
  owned: number;
  byCountry: Map<string, { total: number; owned: number; missing: string[] }>;
}): string {
  const pct = data.total > 0 ? Math.round((data.owned / data.total) * 1000) / 10 : 0;
  const lines: string[] = [
    `📋 Grupo ${data.group} — ${data.owned}/${data.total} (${pct}%)\n`,
  ];

  for (const [country, info] of data.byCountry) {
    const countryPct = info.total > 0 ? Math.round((info.owned / info.total) * 1000) / 10 : 0;
    lines.push(`\n${country}: ${info.owned}/${info.total} (${countryPct}%)`);
    if (info.missing.length > 0) {
      lines.push(`  Faltam: ${info.missing.join(", ")}`);
    } else {
      lines.push("  ✅ Completo!");
    }
  }

  return lines.join("\n");
}
