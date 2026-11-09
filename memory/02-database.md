# 02 — База данных (MySQL)

Модель: **один учитель (вход по PIN, не запись в БД) и много учеников**. Схема:
[`StudyFlow_infra/db/schema.sql`](../../StudyFlow_infra/db/schema.sql). Инструкция —
`StudyFlow_infra/docs/mysql-setup.md`.

## Таблица `users` (ученики)
> С 2026-11-07: вход по **имени+фамилии+паролю**, `email` убран. `phone` (номер) —
> уникальный ключ аккаунта. Имя+фамилия НЕ уникальны: двое могут иметь одинаковое имя,
> но различаются по `phone`; при входе их разводит проверка пароля на сервере.

| Поле | Тип | Примечание |
|---|---|---|
| id | CHAR(36) PK | UUID (`crypto.randomUUID()`) |
| first_name | VARCHAR(100) NOT NULL | имя |
| last_name | VARCHAR(100) NOT NULL | фамилия |
| phone | VARCHAR(30) NOT NULL UNIQUE | номер — уникальный ключ аккаунта |
| password_hash | VARCHAR(255) | bcrypt (раунды 10) |
| created_at | TIMESTAMP | default CURRENT_TIMESTAMP |

Индекс: `idx_users_name (last_name, first_name)` — поиск при входе.
Миграция живой dev-БД: `ALTER TABLE` (add first_name/last_name/phone, backfill, drop email).
В БД есть legacy-строки с прошлого стека (phone = обрезок id) — мусор, можно игнорировать.

## Таблица `class_members` (единственный класс)
| Поле | Тип | Примечание |
|---|---|---|
| user_id | CHAR(36) PK → users(id) ON DELETE CASCADE | членство = наличие строки |
| joined_at | TIMESTAMP | когда добавлен |

Ученик без строки здесь → экран `/pending`. Паттерн из Miasin.

## Таблица `tasks`
| Поле | Тип | Примечание |
|---|---|---|
| id | CHAR(36) PK | UUID |
| assignee_id | CHAR(36) → class_members(user_id) ON DELETE CASCADE | кому выдана (FK: только члену класса) |
| title | VARCHAR(255) NOT NULL | CHECK длина > 0 |
| description | TEXT NULL | |
| due_date | DATE NULL | |
| priority | ENUM('low','medium','high') | default 'medium' |
| status | ENUM('todo','in_progress','done') | default 'todo' |
| created_at / updated_at | TIMESTAMP | updated_at ON UPDATE |

Индекс: `idx_tasks_assignee_created (assignee_id, created_at)`.

## Изоляция (AC-04)
У MySQL нет RLS. На сервере (`StudyFlow_image/src/lib/tasks/mysql-store.ts`):
ученик — всегда `WHERE assignee_id = ?` (id из сессии, не от клиента), меняет только
status; учитель видит всё, может фильтровать по `assignee`. FK гарантирует, что
задача выдана реальному члену класса. Учитель — не запись в БД (вход по PIN).

## Статус
✅ Схема применена, проверено вживую (Docker MySQL): PIN-вход учителя, добавление
ученика в класс, выдача задачи, ученик видит только свою + смена статуса; не-член → /pending.
