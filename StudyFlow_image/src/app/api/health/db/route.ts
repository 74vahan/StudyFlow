import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

// TEMPORARY diagnostic endpoint — remove after debugging the Vercel ↔ cloud DB
// connection. It never returns secret values (no password, no cert, no URL):
// only presence booleans, the host, and the raw driver error code/message so we
// can see WHY the serverless function cannot reach the database. Guarded by a
// key so it is not casually reachable.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DIAG_KEY = "sf-diag-7k2p";

function buildSsl(): mysql.ConnectionOptions["ssl"] {
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

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("key") !== DIAG_KEY) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const dbUrl = process.env.DATABASE_URL;
  const caRaw = process.env.DATABASE_CA_CERT?.trim() ?? "";
  const env = {
    DATABASE_URL: !!dbUrl,
    DATABASE_CA_CERT: !!caRaw,
    caLen: caRaw.length,
    caLooksPem: caRaw.includes("BEGIN CERTIFICATE"),
    DATABASE_SSL: process.env.DATABASE_SSL ?? null,
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    TEACHER_PIN_HASH_B64: !!process.env.TEACHER_PIN_HASH_B64,
    urlHasSslMode: dbUrl ? dbUrl.includes("ssl-mode") : null,
    host: null as string | null,
  };
  try {
    env.host = dbUrl ? new URL(dbUrl).host : null;
  } catch {
    /* ignore malformed url */
  }

  if (!dbUrl) {
    return NextResponse.json({ connected: false, reason: "DATABASE_URL missing", env });
  }

  let conn: mysql.Connection | undefined;
  try {
    const ssl = buildSsl();
    conn = await mysql.createConnection({
      uri: dbUrl,
      connectTimeout: 8000,
      ...(ssl ? { ssl } : {}),
    });
    const [rows] = await conn.query("SELECT 1 AS ok");
    return NextResponse.json({ connected: true, result: rows, env });
  } catch (e: unknown) {
    const err = e as { code?: string; errno?: number; message?: string };
    return NextResponse.json({
      connected: false,
      code: err?.code ?? null,
      errno: err?.errno ?? null,
      message: String(err?.message ?? e).slice(0, 300),
      env,
    });
  } finally {
    try {
      await conn?.end();
    } catch {
      /* ignore */
    }
  }
}
