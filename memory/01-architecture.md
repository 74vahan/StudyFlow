# 01 — Архитектура

## Стек
- **Frontend/Backend:** Next.js 15 (App Router, TypeScript), React 19.
- **Стили:** Tailwind CSS v4.
- **Данные + Auth:** Supabase (Postgres + Auth + RLS).
- **AI:** Claude API (`@anthropic-ai/sdk`) через серверный роут.
- **Деплой:** Vercel.

## Поток данных
```
Браузер (React, client components)
   │  fetch / Server Actions
   ▼
Next.js (Server Components, Route Handlers)  ──►  Claude API (только сервер)
   │  @supabase/ssr (cookie-сессия)
   ▼
Supabase Postgres  ──  RLS: auth.uid() = tasks.user_id
```

## Структура проекта
```
src/
  app/            — маршруты (App Router)
    layout.tsx    — root layout + I18nProvider + шрифты
    page.tsx      — лендинг
    globals.css
  components/      — переиспользуемые UI-компоненты
    LanguageSwitcher.tsx
  i18n/            — локализация
    i18n.tsx       — провайдер + useI18n + t()
    locales/       — en.json, ru.json, hy.json
  lib/
    supabase/      — client.ts (browser), server.ts (server)
docs/              — requirements.md и прочая документация
memory/            — файлы памяти проекта
```

## Принципы (из правил VibeCode)
- Модульность: один файл — одна ответственность.
- Кириллица — только в ru-локали, комментариях и доках.
- UI на 3 языках через i18n, не хардкод.
