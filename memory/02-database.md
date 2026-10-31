# 02 — База данных

## Таблица `public.tasks` (план, создаётся в День 6–8)
| Поле | Тип | Примечание |
|---|---|---|
| id | uuid PK | default gen_random_uuid() |
| user_id | uuid FK → auth.users(id) | владелец |
| title | text NOT NULL | заголовок |
| description | text NULL | описание |
| due_date | date NULL | дедлайн |
| priority | text | 'low' \| 'medium' \| 'high' (default 'medium') |
| status | text | 'todo' \| 'in_progress' \| 'done' (default 'todo') |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() (обновлять триггером) |

## RLS (критично для AC-04)
Включить RLS на `tasks`. Политики `TO authenticated` с предикатом владельца:
- SELECT: `using ((select auth.uid()) = user_id)`
- INSERT: `with check ((select auth.uid()) = user_id)`
- UPDATE: `using (...) with check (...)` — оба обязательны.
- DELETE: `using ((select auth.uid()) = user_id)`

**Ловушки (из skill supabase):**
- Не использовать `user_metadata` в авторизации (редактируется пользователем).
- UPDATE без WITH CHECK позволяет сменить user_id — обязательно оба.
- `TO authenticated` без предиката владельца = IDOR.
- Проверять изоляцию двумя реальными аккаунтами.

## Статус
⬜ Таблица и политики ещё не созданы. Будет миграция в Supabase (День 6–8).
