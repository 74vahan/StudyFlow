-- StudyFlow — MySQL schema for a MANAGED / CLOUD database (Aiven, Railway, …).
--
-- Same tables as db/schema.sql, but WITHOUT `CREATE DATABASE` / `USE`: on a
-- managed provider the database already exists (e.g. Aiven's `defaultdb`, or one
-- you created in the console) and the account may lack the CREATE DATABASE
-- privilege. Tables are created in whichever database your connection points to.
--
-- Apply once with the migration script (from StudyFlow_image/):
--   node --env-file=.env.local scripts/migrate-db.mjs
-- or with the mysql client:
--   mysql --host=H --port=P --user=U --password=PASS --ssl-ca=ca.pem DB < schema.cloud.sql

-- 1. Users (students) --------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            CHAR(36)      NOT NULL PRIMARY KEY,
  first_name    VARCHAR(100)  NOT NULL,
  last_name     VARCHAR(100)  NOT NULL,
  phone         VARCHAR(30)   NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_name (last_name, first_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Class membership (the single class) -------------------------------------
CREATE TABLE IF NOT EXISTS class_members (
  user_id   CHAR(36)   NOT NULL PRIMARY KEY,
  joined_at TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_member_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tasks (assigned by the teacher to one class member) ---------------------
CREATE TABLE IF NOT EXISTS tasks (
  id          CHAR(36)     NOT NULL PRIMARY KEY,
  assignee_id CHAR(36)     NOT NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT         NULL,
  due_date    DATE         NULL,
  priority    ENUM('low','medium','high')       NOT NULL DEFAULT 'medium',
  status      ENUM('todo','in_progress','done') NOT NULL DEFAULT 'todo',
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                           ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_tasks_title CHECK (CHAR_LENGTH(title) > 0),
  CONSTRAINT fk_tasks_assignee FOREIGN KEY (assignee_id)
    REFERENCES class_members (user_id) ON DELETE CASCADE,
  INDEX idx_tasks_assignee_created (assignee_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
