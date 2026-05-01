import { prisma } from "../config/database";

export const collectionRepository = {
  async addStickers(userId: number, stickerIds: number[]) {
    const results: { stickerId: number; newQuantity: number }[] = [];

    for (const stickerId of stickerIds) {
      const entry = await prisma.userSticker.upsert({
        where: { userId_stickerId: { userId, stickerId } },
        update: { quantity: { increment: 1 } },
        create: { userId, stickerId, quantity: 1 },
      });
      results.push({ stickerId, newQuantity: entry.quantity });
    }

    return results;
  },

  async removeStickers(userId: number, stickerIds: number[]) {
    const results: { stickerId: number; removed: boolean; remaining: number }[] = [];

    for (const stickerId of stickerIds) {
      const entry = await prisma.userSticker.findUnique({
        where: { userId_stickerId: { userId, stickerId } },
      });

      if (!entry) {
        results.push({ stickerId, removed: false, remaining: 0 });
        continue;
      }

      if (entry.quantity <= 1) {
        await prisma.userSticker.delete({
          where: { userId_stickerId: { userId, stickerId } },
        });
        results.push({ stickerId, removed: true, remaining: 0 });
      } else {
        const updated = await prisma.userSticker.update({
          where: { userId_stickerId: { userId, stickerId } },
          data: { quantity: { decrement: 1 } },
        });
        results.push({ stickerId, removed: true, remaining: updated.quantity });
      }
    }

    return results;
  },

  async getDuplicates(userId: number) {
    return prisma.userSticker.findMany({
      where: { userId, quantity: { gt: 1 } },
      include: { sticker: true },
      orderBy: { sticker: { code: "asc" } },
    });
  },

  async getMissing(userId: number, filters?: { countryCode?: string; group?: string }) {
    const where: any = {};
    if (filters?.countryCode) where.countryCode = filters.countryCode;
    if (filters?.group) where.group = filters.group;

    return prisma.sticker.findMany({
      where: {
        ...where,
        users: { none: { userId } },
      },
      orderBy: [{ countryCode: "asc" }, { number: "asc" }],
    });
  },

  async getOwned(userId: number, filters?: { countryCode?: string; group?: string }) {
    const where: any = { userId };
    if (filters?.countryCode || filters?.group) {
      where.sticker = {};
      if (filters?.countryCode) where.sticker.countryCode = filters.countryCode;
      if (filters?.group) where.sticker.group = filters.group;
    }

    return prisma.userSticker.findMany({
      where,
      include: { sticker: true },
      orderBy: { sticker: { code: "asc" } },
    });
  },

  async countOwned(userId: number) {
    return prisma.userSticker.count({ where: { userId } });
  },

  async countOwnedByGroup(userId: number) {
    const results = await prisma.userSticker.findMany({
      where: { userId },
      include: { sticker: { select: { group: true } } },
    });

    const groups = new Map<string, number>();
    for (const r of results) {
      const g = r.sticker.group ?? "Especiais";
      groups.set(g, (groups.get(g) ?? 0) + 1);
    }
    return groups;
  },
};
