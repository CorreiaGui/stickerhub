export interface StickerBase {
  id: number;
  code: string;
  number: number;
  country: string | null;
  countryCode: string;
  group: string | null;
  player: string | null;
  type: string;
  rarity: string;
}

export interface UserStickerEntry {
  sticker: StickerBase;
  quantity: number;
}

export interface AlbumProgress {
  owned: number;
  total: number;
  percentage: number;
}

export interface GroupProgress {
  group: string;
  owned: number;
  total: number;
  percentage: number;
}

export interface CountryStickerList {
  countryCode: string;
  country: string | null;
  group: string | null;
  labels: string[];
}

export interface CountryDuplicateList {
  countryCode: string;
  country: string | null;
  group: string | null;
  items: { label: string; duplicates: number }[];
}

export function parseStickerCodes(input: string): string[] {
  const seen = new Set<string>();
  return input
    .split(/[\s,]+/)
    .map((code) => code.trim().toUpperCase())
    .filter((code) => {
      if (code.length === 0 || seen.has(code)) return false;
      seen.add(code);
      return true;
    });
}
