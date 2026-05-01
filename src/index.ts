import express from "express";
import { env } from "./config/env";
import { prisma } from "./config/database";
import { createBot } from "./bot";
import { apiRouter } from "./api/routes";
import { webhookCallback } from "grammy";

async function main() {
  await prisma.$connect();
  console.log("Database connected.");

  const bot = createBot(env.BOT_TOKEN);
  const app = express();

  app.use(express.json());
  app.use("/api", apiRouter);

  if (env.BOT_MODE === "webhook") {
    const webhookBase = env.webhookUrl;
    if (!webhookBase) {
      throw new Error("WEBHOOK_URL or RENDER_EXTERNAL_URL is required in webhook mode.");
    }

    const path = `/bot${env.BOT_TOKEN}`;
    app.use(path, webhookCallback(bot, "express"));

    app.listen(env.PORT, async () => {
      const url = `${webhookBase}${path}`;
      await bot.api.setWebhook(url);
      console.log(`Webhook set.`);
      console.log(`Server running on port ${env.PORT}`);
    });
  } else {
    app.listen(env.PORT, () => {
      console.log(`API server running on port ${env.PORT}`);
    });

    await bot.api.deleteWebhook();
    bot.start({
      onStart: () => console.log("Bot started in polling mode."),
    });
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
