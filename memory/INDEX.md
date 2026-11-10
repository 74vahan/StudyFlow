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

### Коммит c0dcd2f (2026-11-10, на `main`, НЕ запушен)
Редизайн Atompunk + фикс шрифта hy + фикс входа (serverError) + разнесение страниц учителя/ученика + полное удаление аккаунта. Включил и более ранние незакоммиченные правки (вход по имени/фамилии). Папка скилла `.claude/skills/design-taste-frontend/` убрана из git и в `.gitignore`.

### Коммиты (на `main`, не запушены)
`e55ff1d`, `c5b99a7`, `eb062bc` (старое) · `7027483` MySQL+монорепо+редизайн · `0509ddd` анимация лендинга · `90865c9` Змейка. Итого 6.

### Тест-сценарии ✅ (2026-11-03, прогнаны вживую)
- `StudyFlow_image/docs/test-scenarios.md`: 15 ручных сценариев (TS-01..TS-15), каждый привязан к AC. Главный — TS-07 (изоляция данных, AC-04).
- **Прогон 15/15 пройдено, 0 дефектов** (Docker MySQL 3307 + `npm run dev`). Изоляция/права проверены прямыми API-запросами по ролям. Документ дополнен лог-ом прогона. Пока не закоммичено.

### Вход по имени/фамилии/номеру ✅ (2026-11-07)
> Запрос пользователя: регистрация = имя, фамилия, номер, пароль, повтор; вход = имя+фамилия (одна строка) + пароль.
- `email` убран целиком. `phone` (номер) — уникальный ключ аккаунта; имя+фамилия НЕ уникальны.
- Однофамильцы различаются в бэкенде: `verifyCredentials` ищет по имени+фамилии и перебирает совпадения по bcrypt.
- Затронуто: `schema.sql` (users), `users.ts`, `validation.ts`, `session.ts`, роуты auth, `members.ts`, `teacher/api.ts`, `AuthForm`, `AppShell`, `TeacherStudents/Tasks`, i18n (en/ru/hy). TS чист, проверено вживую (регистрация/вход/дубль имён/список у учителя).
- Живая dev-БД мигрирована ALTER-ом; остались legacy-строки (phone = обрезок id) — мусор.
- Также: запущены Docker Desktop + контейнер `studyflow-mysql` (ранее «бесконечная загрузка» = БД была выключена).

### Редизайн Atompunk/Googie ✅ (2026-11-10)
> Запрос: «живее», ретрофутуризм, Pixelify Sans, анимированные кнопки. Стиль Atompunk/Googie (светлый), весь сайт. Детали — [04-ui-i18n.md](04-ui-i18n.md).
- Шрифт Pixelify Sans (Geist убран), палитра кремовый+tangerine/teal/mustard/coral (без фиолетового) в CSS-переменных + `@theme`.
- Переиспользуемые классы в `globals.css` (`.rf-card`, `.btn*`, `.rf-field`, `.rf-badge`, `.rf-navlink`): ретро-рамки, жёсткие тени, hover-шаг/active-вдавливание.
- `RetroDecor.tsx` (Starburst, AtomBadge). Лендинг переделан, Змейка/pending перекрашены в светлую палитру. `.claude/launch.json` добавлен.
- ✅ `npm run build` проходит, кириллицы в коде нет. Проверено вживую в браузере: лендинг, register, teacher login + панель, мобильный 375px. (Бэкенд `listStudents`/`listTasks` отдаёт 500 — проблема БД, НЕ дизайна; UI показывает пустые состояния.) Не закоммичено.

### Фикс входа: БД была выключена + понятная ошибка ✅ (2026-11-10)
> Симптом: «Invalid name or password», хотя данные верные. Причина — контейнер `studyflow-mysql` упал (Exited 255), сервер не достукивался до БД (ECONNREFUSED 127.0.0.1:3307), а форма на любой сбой показывала «invalid».
- **Диагностика любого «не входит у всех»:** `docker ps -a --filter name=studyflow-mysql`; если не Up — `docker start studyflow-mysql` (или `docker compose up -d` из `StudyFlow_infra/`). Порт 3307, БД `studyflow`, в БД 8 учеников.
- **Улучшение:** `postAuth` в `auth.tsx` теперь различает 5xx/сетевой сбой (`error:"server"`) и 401 (`error:"invalid"`); `AuthForm` показывает новый ключ `auth.serverError` (en/ru/hy) «сервис временно недоступен» вместо «неверный пароль». Проверено: API входа отвечает 401 на неверные данные, 200 на списки.

### Разнесение страниц + удаление аккаунта ✅ (2026-11-10)
> Запрос: у учителя всё было на одной странице — разнести; добавить полное удаление ученика (из БД); у ученика задачи тоже разнести по статусу.
- **Учитель:** `/teacher` (обзор: счётчики + карточки), `/teacher/students`, `/teacher/tasks`; навигация в `TeacherShell`.
- **Полное удаление аккаунта:** красная кнопка «Удалить аккаунт» (отдельно от «Убрать из класса»), `DELETE /api/teacher/students/[id]/account` → `deleteUser` → каскад FK (users→class_members→tasks). Проверено на временной записи: user/member/task = 0.
- **Ученик:** задачи разнесены по статусу — `/tasks` (To do), `/tasks/in-progress`, `/tasks/done` через общий `StudentTasksView` (вкладки-ссылки). Дашборд не менялся (по решению пользователя).
- i18n (en/ru/hy) дополнена (overview, deleteAccount, confirmDeleteAccount, studentsDesc/tasksDesc, totalStudents/inClassCount). ✅ Сборка чистая; вживую проверены все страницы учителя и вкладки ученика (временный ученик создан и удалён). Не закоммичено.

### Деплой на Vercel: подготовка БД ✅ (2026-11-10)
> Пользователь сменил решение: деплой на **Vercel** (не GCP). Сборка падала — Root Directory не выставлен на подпапку. Локальный `npm run build` проходит (exit 0) → код ок.
- **Причина падения build:** монорепо, приложение в `StudyFlow_image/`; Vercel собирал из корня → «No Next.js version detected». Фикс: Root Directory → `StudyFlow_image` (настройка дашборда, не код).
- **БД под serverless:** пул `src/lib/db/mysql.ts` научен TLS (`DATABASE_CA_CERT`/`DATABASE_SSL`), `connectionLimit` 10→5. `.env.example` дополнен.
- **Провайдер: Aiven free MySQL** (выбор пользователя; PlanetScale теперь платный). Схема `StudyFlow_infra/db/schema.cloud.sql` (без CREATE DATABASE/USE). Миграция `scripts/migrate-db.mjs` + `npm run db:migrate` (mysql2, Windows-friendly). TS чист, build/скрипт проверены. Не закоммичено. Детали — [05-infra-deploy.md](05-infra-deploy.md).

### Дальше
- ⛔ AI-фича ОТМЕНЕНА (решение пользователя 2026-11-03): AC-07 вне объёма, не предлагать.
- ⬜ Деплой — **Vercel** (решение 2026-11-10, сменили с GCP). Остаётся: Aiven завести, схему накатить, env в Vercel, Root Directory, redeploy. (GCP-вариант — запасной: `StudyFlow_infra/Dockerfile`.)
- ⬜ Пользователю для нового окружения: `StudyFlow_image/.env.local` (`DATABASE_URL`, `AUTH_SECRET`, `TEACHER_PIN_HASH_B64`); локально проще `docker compose up` из `StudyFlow_infra/`.
- ⬜ Пуш на GitHub (приватный репо) — по просьбе.
