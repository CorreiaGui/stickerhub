import { prisma } from "../config/database";

export const userRepository = {
  async findOrCreate(telegramId: bigint, firstName: string, username?: string) {
    return prisma.user.upsert({
      where: { telegramId },
      update: { firstName, username },
      create: { telegramId, firstName, username },
    });
  },

  async findByTelegramId(telegramId: bigint) {
    return prisma.user.findUnique({ where: { telegramId } });
  },
};
