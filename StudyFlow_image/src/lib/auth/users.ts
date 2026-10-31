import "server-only";
import bcrypt from "bcryptjs";
import type { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db/mysql";

// User persistence + password hashing (MySQL). Node runtime only.

export interface UserRecord {
  id: string;
  email: string;
}

interface UserRow extends RowDataPacket {
  id: string;
  email: string;
  password_hash: string;
}

const BCRYPT_ROUNDS = 10;

export class EmailTakenError extends Error {
  constructor() {
    super("email_taken");
    this.name = "EmailTakenError";
  }
}

export async function createUser(
  email: string,
  password: string,
): Promise<UserRecord> {
  const id = crypto.randomUUID();
  const normalized = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  try {
    await getPool().execute(
      "INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)",
      [id, normalized, passwordHash],
    );
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      err.code === "ER_DUP_ENTRY"
    ) {
      throw new EmailTakenError();
    }
    throw err;
  }

  return { id, email: normalized };
}

// Returns the user record on a correct password, otherwise null (wrong email or
// password are indistinguishable to the caller, on purpose).
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<UserRecord | null> {
  const normalized = email.trim().toLowerCase();
  const [rows] = await getPool().execute<UserRow[]>(
    "SELECT id, email, password_hash FROM users WHERE email = ? LIMIT 1",
    [normalized],
  );
  const row = rows[0];
  if (!row) return null;

  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) return null;

  return { id: row.id, email: row.email };
}
