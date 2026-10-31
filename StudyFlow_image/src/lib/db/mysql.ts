import "server-only";
import mysql from "mysql2/promise";

// MySQL connection pool. Node runtime only (never import from Edge/middleware).
// Configured via a single DATABASE_URL, e.g.
//   mysql://user:password@localhost:3306/studyflow
// The pool is cached on globalThis so Next.js hot-reload doesn't open a new pool
// on every change and exhaust connections.

export const isDbConfigured = !!process.env.DATABASE_URL;

const globalForDb = globalThis as unknown as { _studyflowPool?: mysql.Pool };

export function getPool(): mysql.Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and set it (see docs/mysql-setup.md).",
    );
  }
  if (!globalForDb._studyflowPool) {
    globalForDb._studyflowPool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 10,
      // DATE columns come back as 'YYYY-MM-DD' strings; TIMESTAMP as JS Date.
      dateStrings: ["DATE"],
      // Interpret/emit TIMESTAMP values as UTC for stable ISO output.
      timezone: "Z",
    });
  }
  return globalForDb._studyflowPool;
}
