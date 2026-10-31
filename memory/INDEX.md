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

## Статус (День 1–2)
- ✅ Скелет Next.js (App Router, TS) + Tailwind v4.
- ✅ i18n en/ru/hy (кастомный провайдер + localStorage).
- ✅ Supabase client stubs (browser/server, @supabase/ssr).
- ✅ .env.example, документ требований (docs/requirements.md).
- ⬜ Страницы login/register/tasks/dashboard — День 3–5.
- ⬜ Supabase проект, таблица tasks, RLS — День 6–8.
- ⬜ AI-роут (Claude API) — День 9–10.
