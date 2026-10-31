# Memory — StudyFlow

Оглавление файлов памяти проекта. Читать перед работой, обновлять после изменений.

| Файл | О чём |
|---|---|
| [01-architecture.md](01-architecture.md) | Стек, структура проекта, поток данных |
| [02-database.md](02-database.md) | Модель данных, таблица tasks, RLS |
| [03-api.md](03-api.md) | API-роуты, AI-эндпоинт |
| [04-ui-i18n.md](04-ui-i18n.md) | UI, страницы, локализация en/ru/hy |
| [05-infra-deploy.md](05-infra-deploy.md) | Окружение, деплой на Vercel |
| [06-security.md](06-security.md) | Секреты, авторизация, изоляция данных |

## Статус
### День 1–2 ✅
- Скелет Next.js (App Router, TS) + Tailwind v4; i18n en/ru/hy; Supabase stubs; .env.example; требования; memory.

### День 3–5 ✅
- Страницы: `/` лендинг, `/login`, `/register`, `/dashboard`, `/tasks`, `/tasks/new`, `/tasks/[id]`.
- CRUD задач, поиск + фильтры (статус/приоритет), dashboard-счётчики.
- Состояния loading / empty / no-results / error, валидация форм.
- **Mock-слой (временный):** auth `src/lib/auth/mock-auth.tsx` и хранилище `src/lib/tasks/store.ts` на localStorage. Интерфейсы совпадают с будущим Supabase — заменить в День 6–8.
- Next.js оказался v16: отключены `cacheComponents`/`partialPrefetching` в next.config.ts (приложение полностью клиентское).

### День 6–8 ✅ (код готов; реальная БД — после установки MySQL)
> Стек БД сменён на **MySQL** (требование преподавателя) — Supabase убран целиком.
- Схема `db/schema.sql`: таблицы `users` + `tasks` (FK, индекс, ENUM, updated_at).
- Драйвер `mysql2`, пул `src/lib/db/mysql.ts` (одна переменная `DATABASE_URL`).
- **Своя серверная авторизация:** bcrypt (`bcryptjs`) + JWT-сессия в HTTP-only cookie (`jose`). Роуты `/api/auth/{register,login,logout,me}`.
- Доступ к данным переехал на сервер: роуты `/api/tasks` + `/api/tasks/[id]`, изоляция `WHERE user_id = ?` по сессии (AC-04 без RLS).
- Клиент: `store.ts` (fetch-фасад), `auth.tsx` (через /api/auth/*). Гейт — `src/proxy.ts` (бывш. middleware).
- localStorage-fallback убран.
- ✅ **Проверено вживую** (Docker MySQL): регистрация/вход/выход, CRUD, сохранение и изоляция AC-04 (alice видит свою задачу, bob — нет). TypeScript чист, `npm run build` проходит.

### Реструктуризация в монорепо ✅ (2026-10-31)
> Требование преподавателя: разделить на две папки.
- `StudyFlow_image/` — всё приложение (frontend + backend), `StudyFlow_infra/` — инфраструктура.
- `StudyFlow_infra/`: Dockerfile (standalone-образ), docker-compose (MySQL+app, порт 3307, авто-схема), `db/schema.sql`, `docs/mysql-setup.md`, `docs/deploy.md`.
- Корневой `package.json` проксирует команды в приложение; `next.config.ts` → `output: 'standalone'`.
- ✅ Проверено после переноса: `npm run build` и вход/задачи работают из нового расположения.

### Редизайн «учитель → ученики» ✅ (2026-10-31)
> Смена сути: из личного таск-менеджера в классную систему (паттерны из Miasin).
- Один учитель (вход по 6-значному PIN: bcrypt-хеш в `TEACHER_PIN_HASH_B64` (base64), rate-limit+lockout). Dev-PIN 123456.
- Ученики (email+пароль, роль student). Один класс (`class_members`). Не-член → экран `/pending` («404/не в классе»).
- Учитель (`/teacher`): список учеников, добавить/убрать из класса, выдать задачу конкретному ученику.
- Ученик: видит только свои задачи (`assignee_id` из сессии), меняет только статус.
- Схема переделана (`users`+`class_members`+`tasks.assignee_id`+FK). Роль в JWT, роутинг в `proxy.ts`, членство в AppShell через `/api/auth/me`.
- i18n (en/ru/hy) дополнена. ✅ Проверено вживую (Docker MySQL): весь флоу.

### UI-доработки ✅
- Лендинг `/`: анимация «Welcome» рукописным шрифтом (пишется один раз, чёрный фон).
- `/pending`: играбельная Змейка на фоне (`SnakeGame`), панель с 404 поверх.

### Коммиты (на `main`, не запушены)
`e55ff1d`, `c5b99a7`, `eb062bc` (старое) · `7027483` MySQL+монорепо+редизайн · `0509ddd` анимация лендинга · `90865c9` Змейка. Итого 6.

### Дальше
- ⬜ Пользователю для нового окружения: `StudyFlow_image/.env.local` (`DATABASE_URL`, `AUTH_SECRET`, `TEACHER_PIN_HASH_B64`); локально проще `docker compose up` из `StudyFlow_infra/`.
- ⬜ AI-роут (Claude API) — День 9–10. ⬜ Пуш на GitHub (приватный репо) — по просьбе.
