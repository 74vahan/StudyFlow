-- StudyFlow — MySQL schema (teacher → students model)
-- Run once:  mysql -u root -p studyflow < db/schema.sql
-- (docker-compose applies it automatically on first DB start.)
--
-- Model: one teacher (logs in with a PIN, NOT a DB user) and many students.
-- A student registers (users), but sees nothing until the teacher adds them to
-- THE class (class_members). The teacher assigns each task to one class member.
--
-- Data isolation (AC-04) is enforced on the server: a student's queries are
-- always scoped to assignee_id = their own id (from the session), never from
-- client input. The composite FK below guarantees a task is always assigned to
-- an actual class member.

CREATE DATABASE IF NOT EXISTS studyflow
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE studyflow;

-- 1. Users (students) --------------------------------------------------------
-- A student is identified for display by first + last name. The phone number is
-- the unique account key: two people may share a name, but never a phone. Login
-- is by name + password; when names collide the password (and the unique phone
-- behind each row) tells the accounts apart on the server.
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
-- Membership = existence of a row here. No "approved" flag needed.
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
  -- A task can only be assigned to a real class member; removing a member
  -- cascades to their tasks.
  CONSTRAINT fk_tasks_assignee FOREIGN KEY (assignee_id)
    REFERENCES class_members (user_id) ON DELETE CASCADE,
  INDEX idx_tasks_assignee_created (assignee_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
