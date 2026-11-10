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
- `DATABASE_URL` — строка подключения MySQL (mysql://user:pass@host:3306/db).
- `AUTH_SECRET` — длинный случайный секрет для подписи сессий (JWT).
- `TEACHER_PIN_HASH_B64` — base64(bcrypt-хеш PIN учителя).
- `DATABASE_CA_CERT` (опц.) — CA-сертификат провайдера (PEM или base64) → TLS с проверкой. Для Aiven обязателен.
- `DATABASE_SSL=true` (опц.) — TLS без своего CA (проверка по системному хранилищу; для провайдеров с публичным CA).
- `DATABASE_CONNECTION_LIMIT` (опц., по умолчанию 5) — размер пула на инстанс (serverless).
- `ANTHROPIC_API_KEY` — не используется (AI-фича отменена).

## Деплой на Vercel (выбрано 2026-11-10; БД — Aiven free)
- **Root Directory → `StudyFlow_image`** (иначе Vercel не видит `next` в корневом package.json → build падает «No Next.js version detected»).
- Пул MySQL теперь поддерживает TLS: `src/lib/db/mysql.ts` читает `DATABASE_CA_CERT`/`DATABASE_SSL`; `connectionLimit` уменьшен до 5 (serverless).
- **Прод-БД: Aiven free MySQL** (настоящий MySQL 8; PlanetScale отпал — платный). SSL обязателен (CA дают).
- Схему на облаке накатывать `StudyFlow_infra/db/schema.cloud.sql` (без `CREATE DATABASE`/`USE`) скриптом `npm run db:migrate` из `StudyFlow_image` (нужен cloud `DATABASE_URL`+`DATABASE_CA_CERT` в `.env.local`). Node 20.6+ (`--env-file`).
- В Vercel (Production) задать: `DATABASE_URL`, `DATABASE_CA_CERT`, `AUTH_SECRET`, `TEACHER_PIN_HASH_B64`.
- `.env.local` в DATABASE_URL для Aiven убрать хвост `?ssl-mode=REQUIRED` (mysql2 его не понимает; TLS берём из `DATABASE_CA_CERT`).
- Альтернатива — контейнер/GCP: `StudyFlow_infra/Dockerfile`. Проверить прод-ссылку в incognito (AC-10).

## Статус
✅ **Задеплоено и работает на Vercel** (2026-11-10). Прод: `https://studyflow-74vahan.vercel.app`, БД — Aiven free MySQL. Вживую проверены: лендинг, вход учителя по PIN, регистрация ученика (/pending), чтение списка у учителя, удаление. Прод-база чистая.
- Root Directory = `StudyFlow_image`, env (DATABASE_URL, DATABASE_CA_CERT[base64], AUTH_SECRET, TEACHER_PIN_HASH_B64) заданы на Production.
- **Грабли, которые ловили (на будущее):**
  1. Monorepo → без Root Directory build падал «No Next.js version detected».
  2. env применяются только к НОВОМУ деплою → после правок обязателен Redeploy; «Redeploy» на старом деплое пересобирает старый коммит.
  3. Deployment Protection (Vercel Authentication) по умолчанию закрывала сайт за логином Vercel → Settings → Deployment Protection → Disabled.
  4. **Главная причина 500 на DB-роутах:** в Vercel в `DATABASE_URL` попал замаскированный плейсхолдер `CLICK_TO:REVEAL_PASSWORD` вместо реальных `avnadmin`+пароль (Access denied 1045). Диагностировали временным `/api/health/db` (потом удалён).
- Диагностика «почему 500 только на БД»: auth/me и teacher/login (без БД) = 200, а teacher/students и auth/register (с БД) = 500 → проблема подключения, а не кода.
