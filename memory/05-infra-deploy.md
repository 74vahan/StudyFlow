# 05 — Инфраструктура и деплой

## Локальный запуск
```bash
npm install
cp .env.example .env.local   # заполнить своими значениями
npm run dev                  # http://localhost:3000
```

## Переменные окружения
См. `.env.example`:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — публичные (браузер).
- `SUPABASE_SERVICE_ROLE_KEY` — секрет, только сервер (по умолчанию пусто).
- `ANTHROPIC_API_KEY` — секрет, только сервер.

## Деплой (план, День 13)
- Платформа: **Vercel** (skill `deploy-to-vercel`).
- Прод-база: Supabase (тот же проект или отдельный).
- В Vercel задать те же env-переменные (Production).
- Проверить прод-ссылку в incognito, не только localhost (AC-10).

## Статус
⬜ Деплоя пока нет. Локальный запуск настроен.
