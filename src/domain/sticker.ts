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

export function parseStickerCodes(input: string): string[] {
  return input
    .split(/[\s,]+/)
    .map((code) => code.trim().toUpperCase())
    .filter((code) => code.length > 0);
}
