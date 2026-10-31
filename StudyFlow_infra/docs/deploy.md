# Деплой StudyFlow

Приложение живёт в `StudyFlow_image/`, вся инфраструктура — здесь, в
`StudyFlow_infra/`.

## Переменные окружения (всё — только сервер)
- `DATABASE_URL` — строка подключения MySQL (`mysql://user:pass@host:3306/studyflow`).
- `AUTH_SECRET` — длинный случайный секрет для подписи сессий.
- `ANTHROPIC_API_KEY` — ключ Claude API (для AI-роута, День 9–10).

Сгенерировать секрет:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Вариант 1. Локально через Docker Compose (MySQL + app)
Из папки `StudyFlow_infra/`:
```bash
docker compose up --build
```
- Поднимется MySQL (порт 3307 на хосте) и приложение (http://localhost:3000).
- Схема `db/schema.sql` применяется автоматически при первом старте БД.
- Только база: `docker compose up db`.

## Вариант 2. Образ приложения вручную
Из корня репозитория:
```bash
docker build -f StudyFlow_infra/Dockerfile -t studyflow-app StudyFlow_image
docker run -p 3000:3000 \
  -e DATABASE_URL="mysql://user:pass@host:3306/studyflow" \
  -e AUTH_SECRET="<секрет>" \
  studyflow-app
```

## Вариант 3. Vercel (День 13)
Vercel собирает Next.js сам (Dockerfile не нужен).
1. Импортировать репозиторий в Vercel, **Root Directory → `StudyFlow_image`**.
2. Прод-база — облачный MySQL (Railway / Aiven / PlanetScale), не локальный.
3. В Project Settings → Environment Variables (Production) задать `DATABASE_URL`,
   `AUTH_SECRET`, `ANTHROPIC_API_KEY`.
4. Один раз выполнить `StudyFlow_infra/db/schema.sql` на облачной БД.
5. Проверить прод-ссылку в incognito, основной поток (AC-10).

## Схема БД
`db/schema.sql` — таблицы `users` и `tasks`. Подробно про локальную настройку
MySQL — в [`docs/mysql-setup.md`](mysql-setup.md).
