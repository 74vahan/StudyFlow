import "server-only";
import mysql from "mysql2/promise";

// MySQL connection pool. Node runtime only (never import from Edge/middleware).
// Configured via a single DATABASE_URL, e.g.
//   mysql://user:password@localhost:3306/studyflow
// The pool is cached on globalThis so Next.js hot-reload doesn't open a new pool
// on every change and exhaust connections.

export const isDbConfigured = !!process.env.DATABASE_URL;

const globalForDb = globalThis as unknown as { _studyflowPool?: mysql.Pool };

// TLS options for managed/cloud MySQL (Aiven, Railway, PlanetScale, …). Local
// MySQL over plain TCP needs none, so this returns undefined unless configured.
//   DATABASE_CA_CERT  the provider's CA certificate (PEM, or base64 of it). When
//                     set, the server certificate is verified against this CA.
//   DATABASE_SSL=true enable TLS and verify against the system CA store (use when
//                     the provider's cert chains to a public CA, e.g. PlanetScale).
function buildSslOption(): mysql.PoolOptions["ssl"] {
  const ca = process.env.DATABASE_CA_CERT?.trim();
  if (ca) {
    const pem = ca.includes("BEGIN CERTIFICATE")
      ? ca
      : Buffer.from(ca, "base64").toString("utf8");
    return { ca: pem, rejectUnauthorized: true };
  }
  if (/^(1|true|require|required)$/i.test(process.env.DATABASE_SSL ?? "")) {
    return { rejectUnauthorized: true };
  }
  return undefined;
}

export function getPool(): mysql.Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and set it (see docs/mysql-setup.md).",
    );
  }
  if (!globalForDb._studyflowPool) {
    const ssl = buildSslOption();
    globalForDb._studyflowPool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      // Vercel runs many short-lived serverless instances, each with its own
      // pool; keep the per-instance limit modest so a free-tier connection cap
      // isn't exhausted. Override with DATABASE_CONNECTION_LIMIT if needed.
      connectionLimit: Number(process.env.DATABASE_CONNECTION_LIMIT) || 5,
      // DATE columns come back as 'YYYY-MM-DD' strings; TIMESTAMP as JS Date.
      dateStrings: ["DATE"],
      // Interpret/emit TIMESTAMP values as UTC for stable ISO output.
      timezone: "Z",
      ...(ssl ? { ssl } : {}),
    });
  }
  return globalForDb._studyflowPool;
}
