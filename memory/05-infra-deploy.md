# 05 — Инфраструктура и деплой

> Монорепо: приложение в `StudyFlow_image/`, инфраструктура в `StudyFlow_infra/`.
> Deploy-доки: `StudyFlow_infra/docs/deploy.md` и `mysql-setup.md`.

## Локальный запуск
1. MySQL + схема (из `StudyFlow_infra/`): `docker compose up db` (порт 3307, схема применяется сама).
2. `StudyFlow_image/.env.local`: `DATABASE_URL`, `AUTH_SECRET`.
3. Из корня: `npm run dev` (проксируется в StudyFlow_image) → http://localhost:3000.

Полный стек в контейнерах: `docker compose up --build` (MySQL + app).

## Переменные окружения
См. `.env.example` (все — только сервер, не `NEXT_PUBLIC_`):
- `DATABASE_URL` — строка подключения MySQL (mysql://user:pass@host:3306/studyflow).
- `AUTH_SECRET` — длинный случайный секрет для подписи сессий (JWT).
- `ANTHROPIC_API_KEY` — ключ Claude API.

## Деплой (план, День 13)
- Платформа: **Vercel** (skill `deploy-to-vercel`). **Root Directory → `StudyFlow_image`**.
- Прод-база: облачный MySQL (Railway/Aiven/PlanetScale) — Vercel serverless, локальный MySQL не подойдёт.
- В Vercel задать `DATABASE_URL`, `AUTH_SECRET`, `ANTHROPIC_API_KEY` (Production). Схему (`StudyFlow_infra/db/schema.sql`) выполнить один раз на облачной БД.
- Альтернатива — контейнер: `StudyFlow_infra/Dockerfile` (+ compose). Детали в `StudyFlow_infra/docs/deploy.md`.
- Проверить прод-ссылку в incognito, не только localhost (AC-10).

## Статус
⬜ Деплоя пока нет. Локальный запуск настроен.
