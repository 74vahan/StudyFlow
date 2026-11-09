# 03 — API

## Подход
- Весь доступ к данным и авторизация — на сервере (Route Handlers, `runtime="nodejs"`).
- Роль — в сессионном JWT (`role: 'student'|'teacher'`). Учитель — `userId:'teacher'`, без записи в БД.
- Клиент ходит через `fetch`; `assignee_id` для ученика берётся из сессии, не из запроса.

## Авторизация ученика
> С 2026-11-07: identity — имя+фамилия+пароль (не email); `phone` — уникальный ключ.
> Сессия (JWT) хранит `firstName`/`lastName` (не email). Валидация — `lib/auth/validation.ts`
> (`isValidRegistration` / `isValidLogin`). `verifyCredentials` ищет по имени+фамилии и
> перебирает совпадения по bcrypt (разводит однофамильцев).

| Роут | Метод | Назначение |
|---|---|---|
| `/api/auth/register` | POST | `{firstName,lastName,phone,password,confirmPassword}` → ученик (bcrypt) + сессия. 409 если `phone` занят (`PhoneTakenError`) |
| `/api/auth/login` | POST | `{firstName,lastName,password}` → verifyCredentials → сессия; ответ `{user, inClass}` |
| `/api/auth/logout` | POST | удалить cookie (общий для обеих ролей) |
| `/api/auth/me` | GET | `{user:{id,firstName,lastName,role}, inClass}` — гейт на клиенте |

## Авторизация учителя (PIN)
| Роут | Метод | Назначение |
|---|---|---|
| `/api/teacher/login` | POST | `{pin}` (6 цифр) → bcrypt.compare с `TEACHER_PIN_HASH_B64` (base64→hash); rate-limit+lockout (`lib/auth/rate-limit.ts`); 429 locked / 401 invalid |
| `/api/teacher/logout` | POST | удалить cookie |

## Управление учениками (только учитель)
| Роут | Метод | Назначение |
|---|---|---|
| `/api/teacher/students` | GET | все ученики + флаг `inClass` |
| `/api/teacher/students/[id]` | POST / DELETE | добавить в класс / убрать из класса (аккаунт остаётся) |
| `/api/teacher/students/[id]/account` | DELETE | **полное удаление аккаунта** (`deleteUser` → `DELETE FROM users`): каскад FK убирает и членство, и задачи. Проверено. (2026-11-10) |

## Задачи (роль-зависимо)
| Роут | Метод | Учитель | Ученик |
|---|---|---|---|
| `/api/tasks` | GET | все (+`?assignee`) | только свои |
| `/api/tasks` | POST | создать `{assigneeId,...}` (403 иначе; 400 assignee_not_member) | — |
| `/api/tasks/[id]` | GET | любая | своя (404 иначе) |
| `/api/tasks/[id]` | PATCH | полное редактирование | только `{status}` своей |
| `/api/tasks/[id]` | DELETE | да | 403 |

## AI-роут (план, День 9–10)
`/api/ai/plan` POST `{description}` → Claude API. Валидация пустого ввода (AC-07),
`ANTHROPIC_API_KEY` только на сервере, проверка сессии.

## Слои
- Сессия: `lib/auth/session.ts` (jose, роль, edge-safe), `current-user.ts` (cookie).
- Класс: `lib/class/members.ts`. Задачи: `lib/tasks/mysql-store.ts` (сервер), `store.ts` (клиент), `lib/teacher/api.ts` (клиент, ученики).
- Гейт: `src/proxy.ts` (роутинг по роли) + AppShell (членство → /pending).

## Статус
✅ Все роуты готовы и проверены вживую. ⬜ `/api/ai/plan` — День 9–10.
