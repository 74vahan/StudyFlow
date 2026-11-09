import "server-only";
import bcrypt from "bcryptjs";
import type { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db/mysql";

// User persistence + password hashing (MySQL). Node runtime only.
//
// Identity model: a student logs in with first name + last name + password. The
// phone number is the unique account key — two people may share a name, but not
// a phone. When names collide, the password tells the accounts apart here on the
// server (each row stays distinct thanks to its unique phone).

export interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface UserRow extends RowDataPacket {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  password_hash: string;
}

const BCRYPT_ROUNDS = 10;

export class PhoneTakenError extends Error {
  constructor() {
    super("phone_taken");
    this.name = "PhoneTakenError";
  }
}

export async function createUser(
  firstName: string,
  lastName: string,
  phone: string,
  password: string,
): Promise<UserRecord> {
  const id = crypto.randomUUID();
  const first = firstName.trim();
  const last = lastName.trim();
  const normalizedPhone = phone.trim();
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  try {
    await getPool().execute(
      "INSERT INTO users (id, first_name, last_name, phone, password_hash) VALUES (?, ?, ?, ?, ?)",
      [id, first, last, normalizedPhone, passwordHash],
    );
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      err.code === "ER_DUP_ENTRY"
    ) {
      throw new PhoneTakenError();
    }
    throw err;
  }

  return { id, firstName: first, lastName: last, phone: normalizedPhone };
}

// Permanently deletes a student account. The FK chain cascades the deletion:
// users → class_members → tasks (all ON DELETE CASCADE in the schema), so this
// single statement wipes the account, its class membership and all its tasks.
export async function deleteUser(userId: string): Promise<void> {
  await getPool().execute("DELETE FROM users WHERE id = ?", [userId]);
}

// Returns the user record when the name matches a row whose password is correct,
// otherwise null. Name matching is case-insensitive (DB collation). If several
// rows share the name, the password selects the right account; each row is
// distinct via its unique phone.
export async function verifyCredentials(
  firstName: string,
  lastName: string,
  password: string,
): Promise<UserRecord | null> {
  const first = firstName.trim();
  const last = lastName.trim();
  const [rows] = await getPool().execute<UserRow[]>(
    "SELECT id, first_name, last_name, phone, password_hash FROM users WHERE first_name = ? AND last_name = ?",
    [first, last],
  );

  for (const row of rows) {
    if (await bcrypt.compare(password, row.password_hash)) {
      return {
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        phone: row.phone,
      };
    }
  }
  return null;
}
