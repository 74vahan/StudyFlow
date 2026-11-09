import "server-only";
import type { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db/mysql";

// The single class. Membership = a row in class_members. Node runtime only.

export interface StudentRow {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  inClass: boolean;
  joinedAt: string | null;
}

interface MemberCheckRow extends RowDataPacket {
  user_id: string;
}

interface StudentQueryRow extends RowDataPacket {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  joined_at: Date | null;
}

export async function isMember(userId: string): Promise<boolean> {
  const [rows] = await getPool().execute<MemberCheckRow[]>(
    "SELECT user_id FROM class_members WHERE user_id = ? LIMIT 1",
    [userId],
  );
  return rows.length > 0;
}

export async function addMember(userId: string): Promise<void> {
  // Idempotent; FK guarantees the user exists.
  await getPool().execute(
    "INSERT IGNORE INTO class_members (user_id) VALUES (?)",
    [userId],
  );
}

export async function removeMember(userId: string): Promise<void> {
  // Cascades to the student's tasks (see schema FK).
  await getPool().execute("DELETE FROM class_members WHERE user_id = ?", [
    userId,
  ]);
}

// All registered students with their membership status (members first).
export async function listStudents(): Promise<StudentRow[]> {
  const [rows] = await getPool().query<StudentQueryRow[]>(
    `SELECT u.id, u.first_name, u.last_name, u.phone, cm.joined_at
       FROM users u
       LEFT JOIN class_members cm ON cm.user_id = u.id
      ORDER BY (cm.user_id IS NOT NULL) DESC, u.last_name ASC, u.first_name ASC`,
  );
  return rows.map((r) => ({
    id: r.id,
    firstName: r.first_name,
    lastName: r.last_name,
    phone: r.phone,
    inClass: r.joined_at !== null,
    joinedAt: r.joined_at ? new Date(r.joined_at).toISOString() : null,
  }));
}
