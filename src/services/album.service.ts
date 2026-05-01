import { userRepository } from "../repositories/user.repository";
import { stickerRepository } from "../repositories/sticker.repository";
import { collectionRepository } from "../repositories/collection.repository";
import { parseStickerCodes, AlbumProgress, GroupProgress } from "../domain/sticker";

export const albumService = {
  async registerUser(telegramId: bigint, firstName: string, username?: string) {
    return userRepository.findOrCreate(telegramId, firstName, username);
  },

  async addStickers(telegramId: bigint, rawInput: string) {
    const user = await userRepository.findByTelegramId(telegramId);
    if (!user) throw new Error("Usuário não encontrado. Use /start primeiro.");

    const codes = parseStickerCodes(rawInput);
    if (codes.length === 0) throw new Error("Nenhum código informado.");

    const stickers = await stickerRepository.findByCodes(codes);
    const found = new Map(stickers.map((s) => [s.code, s]));

    const invalid = codes.filter((c) => !found.has(c));
    const validCodes = codes.filter((c) => found.has(c));

    const stickerIds = validCodes.map((c) => found.get(c)!.id);
    const results = await collectionRepository.addStickers(user.id, stickerIds);

    const added = results.map((r) => {
      const code = validCodes[results.indexOf(r)];
      const sticker = found.get(code)!;
      return {
        code: sticker.code,
        country: sticker.country,
        newQuantity: r.newQuantity,
      };
    });

    return { added, invalid };
  },

  async removeStickers(telegramId: bigint, rawInput: string) {
    const user = await userRepository.findByTelegramId(telegramId);
    if (!user) throw new Error("Usuário não encontrado. Use /start primeiro.");

    const codes = parseStickerCodes(rawInput);
    if (codes.length === 0) throw new Error("Nenhum código informado.");

    const stickers = await stickerRepository.findByCodes(codes);
    const found = new Map(stickers.map((s) => [s.code, s]));

    const invalid = codes.filter((c) => !found.has(c));
    const validCodes = codes.filter((c) => found.has(c));

    const stickerIds = validCodes.map((c) => found.get(c)!.id);
    const results = await collectionRepository.removeStickers(user.id, stickerIds);

    const removed = results.map((r, i) => {
      const sticker = found.get(validCodes[i])!;
      return {
        code: sticker.code,
        country: sticker.country,
        removed: r.removed,
        remaining: r.remaining,
      };
    });

    return { removed, invalid };
  },

  async getDuplicates(telegramId: bigint) {
    const user = await userRepository.findByTelegramId(telegramId);
    if (!user) throw new Error("Usuário não encontrado. Use /start primeiro.");

    const entries = await collectionRepository.getDuplicates(user.id);
    return entries.map((e) => ({
      code: e.sticker.code,
      country: e.sticker.country,
      countryCode: e.sticker.countryCode,
      duplicates: e.quantity - 1,
    }));
  },

  async getMissing(telegramId: bigint, filter?: string) {
    const user = await userRepository.findByTelegramId(telegramId);
    if (!user) throw new Error("Usuário não encontrado. Use /start primeiro.");

    const filters = parseFilter(filter);
    const missing = await collectionRepository.getMissing(user.id, filters);

    const grouped = new Map<string, string[]>();
    for (const s of missing) {
      const key = s.country ?? s.countryCode;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(s.code);
    }

    return { total: missing.length, byCountry: grouped };
  },

  async getProgress(telegramId: bigint): Promise<{ overall: AlbumProgress; byGroup: GroupProgress[] }> {
    const user = await userRepository.findByTelegramId(telegramId);
    if (!user) throw new Error("Usuário não encontrado. Use /start primeiro.");

    const [owned, total, groupCounts, ownedByGroup] = await Promise.all([
      collectionRepository.countOwned(user.id),
      stickerRepository.countAll(),
      stickerRepository.countByGroup(),
      collectionRepository.countOwnedByGroup(user.id),
    ]);

    const overall: AlbumProgress = {
      owned,
      total,
      percentage: total > 0 ? Math.round((owned / total) * 1000) / 10 : 0,
    };

    const byGroup: GroupProgress[] = groupCounts.map((gc) => {
      const groupName = gc.group ?? "Especiais";
      const groupOwned = ownedByGroup.get(groupName) ?? 0;
      const groupTotal = gc._count.id;
      return {
        group: groupName,
        owned: groupOwned,
        total: groupTotal,
        percentage: groupTotal > 0 ? Math.round((groupOwned / groupTotal) * 1000) / 10 : 0,
      };
    });

    return { overall, byGroup };
  },

  async getByCountry(telegramId: bigint, countryCode: string) {
    const user = await userRepository.findByTelegramId(telegramId);
    if (!user) throw new Error("Usuário não encontrado. Use /start primeiro.");

    const code = countryCode.toUpperCase();
    const allStickers = await stickerRepository.findByCountryCode(code);
    if (allStickers.length === 0) return null;

    const owned = await collectionRepository.getOwned(user.id, { countryCode: code });
    const ownedMap = new Map(owned.map((o) => [o.stickerId, o.quantity]));

    const details = allStickers.map((s) => ({
      code: s.code,
      owned: ownedMap.has(s.id),
      quantity: ownedMap.get(s.id) ?? 0,
    }));

    const country = allStickers[0].country ?? code;
    const ownedCount = details.filter((d) => d.owned).length;

    return { country, countryCode: code, total: allStickers.length, owned: ownedCount, details };
  },

  async getByGroup(telegramId: bigint, group: string) {
    const user = await userRepository.findByTelegramId(telegramId);
    if (!user) throw new Error("Usuário não encontrado. Use /start primeiro.");

    const g = group.toUpperCase();
    const allStickers = await stickerRepository.findByGroup(g);
    if (allStickers.length === 0) return null;

    const owned = await collectionRepository.getOwned(user.id, { group: g });
    const ownedMap = new Map(owned.map((o) => [o.stickerId, o.quantity]));

    const byCountry = new Map<string, { total: number; owned: number; missing: string[] }>();

    for (const s of allStickers) {
      const key = s.country ?? s.countryCode;
      if (!byCountry.has(key)) byCountry.set(key, { total: 0, owned: 0, missing: [] });
      const entry = byCountry.get(key)!;
      entry.total++;
      if (ownedMap.has(s.id)) {
        entry.owned++;
      } else {
        entry.missing.push(s.code);
      }
    }

    const totalOwned = [...byCountry.values()].reduce((sum, c) => sum + c.owned, 0);
    return { group: g, total: allStickers.length, owned: totalOwned, byCountry };
  },
};

function parseFilter(filter?: string): { countryCode?: string; group?: string } | undefined {
  if (!filter) return undefined;
  const f = filter.trim().toUpperCase();
  if (f.length === 1 && f >= "A" && f <= "L") return { group: f };
  return { countryCode: f };
}
