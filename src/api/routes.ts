import { Router } from "express";
import { albumService } from "../services/album.service";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

apiRouter.get("/stickers/progress/:telegramId", async (req, res) => {
  try {
    const telegramId = BigInt(req.params.telegramId);
    const progress = await albumService.getProgress(telegramId);
    res.json(progress);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get("/stickers/missing/:telegramId", async (req, res) => {
  try {
    const telegramId = BigInt(req.params.telegramId);
    const filter = req.query.filter as string | undefined;
    const missing = await albumService.getMissing(telegramId, filter);
    res.json(missing);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get("/stickers/duplicates/:telegramId", async (req, res) => {
  try {
    const telegramId = BigInt(req.params.telegramId);
    const duplicates = await albumService.getDuplicates(telegramId);
    res.json(duplicates);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
