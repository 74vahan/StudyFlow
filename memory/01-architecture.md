# 01 — Архитектура

## Стек
- **Frontend/Backend:** Next.js 16 (App Router, TypeScript), React 19.
- **Стили:** Tailwind CSS v4.
- **Данные:** MySQL (драйвер `mysql2/promise`), доступ только с сервера.
- **Auth:** своя серверная авторизация — bcrypt (`bcryptjs`) + JWT-сессия в HTTP-only cookie (`jose`).
- **AI:** Claude API (`@anthropic-ai/sdk`) через серверный роут.
- **Деплой:** Vercel (MySQL — облачный: Railway/Aiven/PlanetScale).

## Роли (модель «учитель → ученики», с 2026-10-31)
Один учитель (вход по PIN, не запись в БД, роль в JWT) и много учеников
(email+пароль). Один класс (`class_members`). Учитель назначает задачи ученикам;
ученик видит только свои и меняет только статус. Не-член класса → `/pending`.
Новые слои: `lib/class/members.ts`, `lib/teacher/api.ts`, `lib/auth/rate-limit.ts`;
новые роуты `app/api/teacher/*`; новые страницы `app/teacher/*`, `app/pending`.

## Поток данных
```
Браузер (React, client components)
   │  fetch('/api/...')  (cookie-сессия идёт автоматически)
   ▼
Next.js Route Handlers (runtime nodejs)
   │  getSessionUser() → user_id из подписанной cookie (jose)
   │  SQL с фильтром WHERE user_id = ?           ──►  Claude API (только сервер)
   ▼
MySQL (tasks, users)

Edge proxy (src/proxy.ts): проверяет JWT-сессию и редиректит на /login,
без обращения к БД.
```

## Структура (монорепо, с 2026-10-31)
Репозиторий разделён на два модуля (требование преподавателя):
```
StudyFlow/                      — корень репо (.git, CLAUDE.md, memory/, .claude/)
  package.json                  — проксирует dev/build/start/lint в StudyFlow_image
  StudyFlow_image/              — ПРИЛОЖЕНИЕ (frontend + backend)
    package.json, next.config.ts (output: standalone), tsconfig, eslint, .env.local
    docs/requirements.md
    src/
      app/
        api/auth/   — register/login/logout/me (route.ts)
        api/tasks/  — route.ts (GET/POST), [id]/route.ts (GET/PATCH/DELETE)
        (login, register, dashboard, tasks/*) — клиентские страницы
      components/   — AppShell, AuthForm, TaskForm, Badge, LanguageSwitcher
      i18n/         — провайдер + локали en/ru/hy
      lib/db/mysql.ts  — пул (DATABASE_URL)
      lib/auth/     — session.ts (jose), current-user.ts, users.ts (bcrypt), validation.ts, auth.tsx
      lib/tasks/    — store.ts (fetch-фасад), mysql-store.ts (сервер), validate.ts, types.ts, contracts.ts
      proxy.ts      — Edge-гейт сессии (бывш. middleware.ts)
  StudyFlow_infra/              — ИНФРАСТРУКТУРА
    Dockerfile                  — образ приложения (context = ../StudyFlow_image)
    docker-compose.yml          — MySQL (порт 3307) + app; схема авто-применяется
    db/schema.sql               — таблицы users + tasks
    docs/mysql-setup.md, docs/deploy.md
  memory/                       — файлы памяти проекта
```
Запуск: из корня `npm run dev` (проксируется в StudyFlow_image). Next грузит
`.env.local` из StudyFlow_image (это корень Next-проекта).

## Принципы (из правил VibeCode)
- Модульность: один файл — одна ответственность.
- Кириллица — только в ru-локали, комментариях и доках.
- UI на 3 языках через i18n, не хардкод.
