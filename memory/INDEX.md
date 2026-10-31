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

### Дальше
- ⬜ Supabase проект, таблица tasks, RLS, реальный Auth — День 6–8 (заменить mock-слой).
- ⬜ AI-роут (Claude API) — День 9–10.
