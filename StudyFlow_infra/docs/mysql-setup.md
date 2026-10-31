# Подключение MySQL (День 6–8)

Приложение (`StudyFlow_image/`) хранит данные в **MySQL**, а авторизация и доступ
к данным работают **на сервере** (Next.js API-роуты). Изоляция данных (AC-04)
обеспечивается не базой (у MySQL нет RLS), а сервером: каждый запрос задач
фильтруется по `user_id` из подписанной cookie-сессии.

## Шаг 1. Поднять MySQL

**Рекомендуется — Docker Compose** (из папки `StudyFlow_infra/`):
```bash
docker compose up db
```
Поднимет MySQL на хост-порту **3307** и автоматически применит `db/schema.sql`
при первом старте. Это самый простой путь локально.

**Вручную через Docker:**
```bash
docker run --name studyflow-mysql -e MYSQL_ROOT_PASSWORD=studyflow \
  -e MYSQL_DATABASE=studyflow -p 3307:3306 -d mysql:8
```

**Облако** (для деплоя на Vercel, День 13): Railway / Aiven / PlanetScale —
создают MySQL и дают готовую строку подключения.

## Шаг 2. Создать таблицы (если не через Compose)

SQL-схема — [`db/schema.sql`](../db/schema.sql) (БД `studyflow`, таблицы `users`
и `tasks`, внешний ключ, индекс). Compose применяет её сам; вручную:
```bash
docker exec -i studyflow-mysql mysql -uroot -pstudyflow < db/schema.sql
```
Или вставь содержимое в GUI (Workbench, DBeaver, phpMyAdmin) и выполни.

## Шаг 3. Создать `StudyFlow_image/.env.local`

Скопируй `StudyFlow_image/.env.example` → `StudyFlow_image/.env.local`:
```
DATABASE_URL=mysql://root:studyflow@localhost:3307/studyflow
AUTH_SECRET=<длинная случайная строка>
```
Сгенерировать `AUTH_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
`.env.local` в git не попадает.

## Шаг 4. Запустить приложение

Из корня репозитория:
```bash
npm run dev
```
(или `cd StudyFlow_image && npm run dev`). Открой http://localhost:3000.

## Как проверить изоляцию данных (AC-04)

1. Зарегистрируйся как пользователь A, создай пару задач.
2. Выйди, зарегистрируйся как пользователь B — список пустой.
3. Задачи A и B не видят друг друга — серверная проверка `WHERE user_id = ?`
   по сессии (`StudyFlow_image/src/lib/tasks/mysql-store.ts`,
   `StudyFlow_image/src/app/api/tasks/*`), а не только UI.

Подробно про деплой — в [`deploy.md`](deploy.md).
