# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Telegram bot for FIFA World Cup 2026 sticker album management. Users control their album via bot commands (add/remove stickers, check progress, list duplicates/missing). Built with grammy + Express + Prisma + PostgreSQL. Deployed on Render (free tier) with Neon PostgreSQL.

## Commands

```bash
npm run dev          # Start bot in polling mode with hot-reload (tsx watch)
npm run build        # prisma generate && tsc
npm start            # Run compiled bot (dist/src/index.js)
npx prisma db push   # Push schema changes to database
npm run db:seed      # Load 994 stickers from jsons/figurinhas_copa_2026.json
npx tsc --noEmit     # Type-check without emitting
```

Local database: `docker compose up -d` (PostgreSQL 16 on port 5432).

No test suite configured.

## Architecture

```
Telegram/API → Bot Commands / Express Routes → albumService → Repositories → Prisma → PostgreSQL
```

- **Bot commands** (`src/bot/commands/`) receive Telegram context, call `albumService`, format responses via `src/bot/helpers/formatter.ts`
- **albumService** (`src/services/album.service.ts`) contains all business logic. Both bot commands and API routes use it — this is the core layer.
- **Repositories** (`src/repositories/`) are thin Prisma wrappers, one per entity (user, sticker, collection)
- **Domain** (`src/domain/sticker.ts`) holds types and the `parseStickerCodes` utility

Adding a new bot command: create handler in `src/bot/commands/`, register it in `src/bot/index.ts`.

## Key Design Decisions

- **Sticker codes have no underscore**: `BRA1`, `ARG5`, not `BRA_1`. Migration script in `prisma/migrate-codes.ts`.
- **Duplicates via quantity field**: `UserSticker.quantity` tracks count. Duplicates = quantity - 1. No multiple rows per sticker.
- **Telegram user isolation**: all service methods take `telegramId` (BigInt), repositories always filter by `userId`.
- **Bot mode**: polling for local dev (`BOT_MODE=polling`), webhook for production. `RENDER_EXTERNAL_URL` is auto-detected.
- **HTML parse mode** for Telegram messages — avoids MarkdownV2 escaping issues with parentheses and special characters.
- **Database retry**: `connectWithRetry()` in `src/index.ts` handles Neon cold starts (5 attempts, 3s delay).
- **Photo OCR**: Tesseract.js with English model, extracts sticker codes from photos of sticker backs. Worker created and terminated per request.

## Database

Three models in `prisma/schema.prisma`: `User` (mapped to `users`), `Sticker` (`stickers`), `UserSticker` (`user_stickers`). Junction table has `@@unique([userId, stickerId])`.

Sticker data: 994 entries, 50 countries, groups A-L plus special stickers (FWC, CC) with null group.

## Environment Variables

Required: `BOT_TOKEN`, `DATABASE_URL`. See `.env.example` for all options. Uses Zod validation in `src/config/env.ts`.
