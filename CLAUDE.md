# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Telegram bot for FIFA World Cup 2026 sticker album management. Users control their album via bot commands (add/remove stickers, check progress, list duplicates/missing). Built with grammy + Express + Prisma + PostgreSQL. Deployed on Render (free tier) with Neon PostgreSQL.

## Commands

```bash
npm run dev          # Start bot in polling mode with hot-reload (tsx watch)
npm run build        # prisma generate && tsc
npm start            # Run compiled bot (dist/src/index.js)
npm run db:push      # Push schema changes to database (no migration history)
npm run db:migrate   # Create and apply a dev migration
npm run db:reset     # Drop, re-create, re-seed the database
npm run db:seed      # Load 994 stickers from jsons/figurinhas_copa_2026.json
npm run db:generate  # Regenerate Prisma client only
npx tsc --noEmit     # Type-check without emitting
```

Local database: `docker compose up -d` (PostgreSQL 16 on port 5432, db `fifa26`, user/pass `postgres`).

No test suite configured — type-check (`npx tsc --noEmit`) is the only static gate.

## Architecture

```
Telegram/API → Bot Commands / Express Routes → albumService → Repositories → Prisma → PostgreSQL
```

- **Bot commands** (`src/bot/commands/`) receive Telegram context, call `albumService`, format responses via `src/bot/helpers/formatter.ts`
- **albumService** (`src/services/album.service.ts`) contains all business logic. Both bot commands and API routes use it — this is the core layer.
- **Repositories** (`src/repositories/`) are thin Prisma wrappers, one per entity (user, sticker, collection)
- **Domain** (`src/domain/sticker.ts`) holds types and the `parseStickerCodes` utility (splits on whitespace/commas, uppercases, dedupes)

Adding a new bot command: create handler in `src/bot/commands/`, register it in `src/bot/index.ts`. Most commands have a Portuguese alias registered alongside the English one (`repetidas`/`duplicates`, `faltantes`/`missing`, `progresso`/`progress`, `pais`/`country`, `grupo`/`group`, `contato`) — follow that pattern. User-facing strings are pt-BR.

Free-form text that matches the sticker-code regex (e.g. `BRA1, ARG5`) is treated as an `/add` by the catch-all `message:text` handler in `src/bot/index.ts` — no command prefix needed.

## Key Design Decisions

- **Sticker codes have no underscore**: `BRA1`, `ARG5`, not `BRA_1`. Migration script in `prisma/migrate-codes.ts`.
- **Duplicates via quantity field**: `UserSticker.quantity` tracks count. Duplicates = quantity - 1. No multiple rows per sticker. `addStickers` uses `upsert` with `{ increment: 1 }`; `removeStickers` decrements and deletes the row when quantity hits 0.
- **Telegram user isolation**: all service methods take `telegramId` (BigInt), repositories always filter by `userId`.
- **Bot mode**: polling for local dev (`BOT_MODE=polling`), webhook for production. `RENDER_EXTERNAL_URL` is auto-detected. The webhook path is `/bot${BOT_TOKEN}` (token in URL acts as the shared secret).
- **HTML parse mode** for Telegram messages — avoids MarkdownV2 escaping issues with parentheses and special characters.
- **Database retry**: `connectWithRetry()` in `src/index.ts` handles Neon cold starts (5 attempts, 3s delay).
- **Photo OCR**: Tesseract.js with English model extracts codes from photos of sticker backs. The worker is created and terminated per request. The handler returns immediately and runs OCR detached so the webhook doesn't time out; duplicate Telegram retries are filtered by `update_id` in an in-memory set (5-min TTL).
- **Missing-filter parsing**: in `albumService.getMissing`, a single letter `A`–`L` is interpreted as a group filter; anything else is a country code.

## Database

Three models in `prisma/schema.prisma`: `User` (mapped to `users`), `Sticker` (`stickers`), `UserSticker` (`user_stickers`). Junction table has `@@unique([userId, stickerId])`.

Sticker data: 994 entries, 50 countries, groups A-L plus special stickers (FWC, CC) with null group.

## Environment Variables

Required: `BOT_TOKEN`, `DATABASE_URL`. Optional: `BOT_MODE` (`polling`|`webhook`, default `polling`), `WEBHOOK_URL`, `PORT` (default 3000). On Render, `RENDER_EXTERNAL_URL` is auto-injected and used as the webhook base. See `.env.example` and the Zod schema in `src/config/env.ts`.

## Deployment

`render.yaml` defines a single web service. Build runs `npm install && npm run build && npx prisma db push --skip-generate && npx tsx prisma/seed.ts`, so every deploy re-pushes the schema and re-seeds (seed uses `skipDuplicates`, so it's idempotent). Health check is `/api/health`. The `Dockerfile` mirrors the same flow for self-hosting.
