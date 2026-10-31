# StudyFlow — приложение

Next.js-приложение StudyFlow (frontend + backend). Инфраструктура (БД, Docker,
деплой) — в соседней папке [`../StudyFlow_infra`](../StudyFlow_infra).

## Возможности (MVP)
- Регистрация и вход; каждый пользователь видит только свои задачи.
- Задачи: создание, просмотр, редактирование, удаление (CRUD).
- Поля: заголовок, описание, дедлайн, приоритет, статус.
- Поиск по заголовку и фильтры по статусу/приоритету.
- Dashboard со счётчиками (всего / выполнено / в процессе).
- AI-помощник: из описания задачи — план из мелких шагов (Claude API) — День 9–10.
- Интерфейс на 3 языках: English, Русский, Հայերեն. Адаптив под телефон и ПК.

## Технологии
- **Next.js 16** (App Router, TypeScript), React 19, Tailwind CSS v4
- **MySQL** через `mysql2` — доступ только с сервера (API-роуты)
- Авторизация: `bcryptjs` (хеш паролей) + `jose` (JWT-сессия в HTTP-only cookie)
- **Claude API** (`@anthropic-ai/sdk`) — AI, только на сервере

## Запуск
Нужна запущенная MySQL и заполненный `.env.local` — см.
[`../StudyFlow_infra/docs/mysql-setup.md`](../StudyFlow_infra/docs/mysql-setup.md).

```bash
npm install
cp .env.example .env.local   # заполнить DATABASE_URL и AUTH_SECRET
npm run dev                  # http://localhost:3000
```

## Переменные окружения
Описаны в [`.env.example`](.env.example). Реальные значения — только в `.env.local`
(в git не попадает). Все переменные — серверные (не `NEXT_PUBLIC_`).

| Переменная | Назначение |
|---|---|
| `DATABASE_URL` | строка подключения MySQL |
| `AUTH_SECRET` | секрет для подписи сессий (JWT) |
| `ANTHROPIC_API_KEY` | ключ Claude API (AI-роут) |

## Изоляция данных (AC-04)
У MySQL нет RLS — изоляция на сервере: каждый запрос задач с `WHERE user_id = ?`,
где `user_id` берётся из сессии (`src/lib/tasks/mysql-store.ts`,
`src/app/api/tasks/*`). Клиент `user_id` не передаёт.

## Структура
См. [`../memory/01-architecture.md`](../memory/01-architecture.md).
