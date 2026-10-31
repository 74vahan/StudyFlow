# 03 — API

## Подход
- CRUD задач — через Supabase client (@supabase/ssr) из Server Components / Server Actions. RLS сам ограничивает доступ по пользователю.
- AI — отдельный серверный Route Handler, чтобы ключ Claude не попадал в браузер.

## Роуты (план)
| Роут | Метод | Назначение | Статус |
|---|---|---|---|
| `/api/ai/plan` | POST | `{ description }` → Claude API → план шагов | ⬜ День 9–10 |

### `/api/ai/plan` — требования
- Валидировать вход: пустое/слишком короткое описание → 400 + понятное сообщение (AC-07).
- Обработать ошибку/таймаут Claude API → 502 + безопасное сообщение, без утечки деталей.
- Ключ `ANTHROPIC_API_KEY` только на сервере (process.env).
- Проверить, что пользователь авторизован, прежде чем тратить AI-вызов.

## Слой данных (День 6–8)
- `src/lib/tasks/store.ts` — async-фасад. Переключается по `isSupabaseConfigured`:
  - `supabase-store.ts` — запросы к Supabase (RLS сам фильтрует по пользователю).
  - `local-store.ts` — fallback на localStorage.
- Auth: `src/lib/auth/auth.tsx` (Supabase Auth или mock).
- `src/middleware.ts` — обновление сессии Supabase (no-op без ключей).

## Статус
✅ CRUD через слой данных (async). ⬜ AI-роут `/api/ai/plan` — День 9–10.
