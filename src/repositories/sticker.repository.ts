import { prisma } from "../config/database";

export const stickerRepository = {
  async findByCodes(codes: string[]) {
    return prisma.sticker.findMany({
      where: { code: { in: codes } },
    });
  },

  async findByCountryCode(countryCode: string) {
    return prisma.sticker.findMany({
      where: { countryCode },
      orderBy: { number: "asc" },
    });
  },

  async findByGroup(group: string) {
    return prisma.sticker.findMany({
      where: { group },
      orderBy: [{ countryCode: "asc" }, { number: "asc" }],
    });
  },

  async findAll() {
    return prisma.sticker.findMany({
      select: { code: true },
      orderBy: { code: "asc" },
    });
  },

  async countAll() {
    return prisma.sticker.count();
  },

  async countByGroup() {
    return prisma.sticker.groupBy({
      by: ["group"],
      _count: { id: true },
      orderBy: { group: "asc" },
    });
  },
};
