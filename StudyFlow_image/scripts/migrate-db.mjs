// One-off schema migration for a managed/cloud MySQL (Aiven, Railway, …).
//
// Usage (run from StudyFlow_image/, with the cloud DATABASE_URL in .env.local):
//   node --env-file=.env.local scripts/migrate-db.mjs
//
// Reads the same env vars the app uses:
//   DATABASE_URL     required — the cloud connection string
//   DATABASE_CA_CERT optional — provider CA (PEM or base64); verifies TLS
//   DATABASE_SSL     optional — "true" to require TLS against the system CA store
//
// Applies ../StudyFlow_infra/db/schema.cloud.sql (tables only). Idempotent:
// every statement is CREATE TABLE IF NOT EXISTS, so re-running is safe.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import mysql from "mysql2/promise";

const here = dirname(fileURLToPath(import.meta.url));
const schemaPath = resolve(here, "../../StudyFlow_infra/db/schema.cloud.sql");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error(
    "DATABASE_URL is not set. Put your cloud URL in .env.local, then run:\n" +
      "  node --env-file=.env.local scripts/migrate-db.mjs",
  );
  process.exit(1);
}

// Mirror the app's TLS logic (src/lib/db/mysql.ts) so local and migration match.
function buildSsl() {
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

const sql = readFileSync(schemaPath, "utf8");
const ssl = buildSsl();

const conn = await mysql.createConnection({
  uri: url,
  multipleStatements: true,
  ...(ssl ? { ssl } : {}),
});

try {
  await conn.query(sql);
  const host = new URL(url).host;
  console.log(`✓ Schema applied to ${host}`);
} finally {
  await conn.end();
}
