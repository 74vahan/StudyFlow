# StudyFlow (монорепо)

Учебная платформа управления задачами для студентов. Экзаменационный проект курса
Vibe Coding. Репозиторий разделён на два модуля:

```
StudyFlow/
  StudyFlow_image/   — приложение (frontend + backend): Next.js, API-роуты, MySQL-слой
  StudyFlow_infra/   — инфраструктура: Dockerfile, docker-compose (MySQL), схема БД, деплой-доки
  memory/            — память проекта (правила VibeCode)
  CLAUDE.md, AGENTS.md, skills-lock.json, .claude/ — мета и правила
```

## Технологии
- **Next.js 16** (App Router, TypeScript), React 19, **Tailwind CSS v4**
- **MySQL** (`mysql2`) — данные; доступ только с сервера
- Своя серверная авторизация: **bcrypt + JWT в HTTP-only cookie** (`jose`)
- **Claude API** (`@anthropic-ai/sdk`) — AI-функция, только на сервере
- **Vercel** — деплой приложения; MySQL — облачный

## Быстрый старт (локально)
1. Поднять MySQL и схему — проще всего через Docker Compose (из `StudyFlow_infra/`):
   ```bash
   docker compose up db
   ```
2. Настроить `StudyFlow_image/.env.local` (`DATABASE_URL`, `AUTH_SECRET`) — см.
   [`StudyFlow_infra/docs/mysql-setup.md`](StudyFlow_infra/docs/mysql-setup.md).
3. Запустить приложение из корня:
   ```bash
   npm run dev
   ```
   Открыть http://localhost:3000.

Корневые команды (`dev`, `build`, `start`, `lint`) проксируются в `StudyFlow_image`.

## Документация
- Приложение: [`StudyFlow_image/README.md`](StudyFlow_image/README.md)
- Требования: [`StudyFlow_image/docs/requirements.md`](StudyFlow_image/docs/requirements.md)
- Настройка MySQL: [`StudyFlow_infra/docs/mysql-setup.md`](StudyFlow_infra/docs/mysql-setup.md)
- Деплой: [`StudyFlow_infra/docs/deploy.md`](StudyFlow_infra/docs/deploy.md)
- Архитектура и статус: [`memory/01-architecture.md`](memory/01-architecture.md), [`memory/INDEX.md`](memory/INDEX.md)
