import { z } from "zod";

const envSchema = z.object({
  BOT_TOKEN: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  BOT_MODE: z.enum(["webhook", "polling"]).default("polling"),
  WEBHOOK_URL: z.string().optional(),
  RENDER_EXTERNAL_URL: z.string().optional(),
  PORT: z.coerce.number().default(3000),
});

const parsed = envSchema.parse(process.env);

export const env = {
  ...parsed,
  get webhookUrl(): string | undefined {
    return parsed.WEBHOOK_URL || parsed.RENDER_EXTERNAL_URL;
  },
};
