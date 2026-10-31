import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session";

// Edge proxy (formerly "middleware"): route by role from the session cookie.
// It only verifies the JWT (jose is Edge-safe) — no DB here. Class membership
// (student in class vs /pending) is checked client-side via /api/auth/me, since
// that needs the DB. API routes do their own auth and answer 401/403.

const STUDENT_PREFIXES = ["/dashboard", "/tasks", "/pending"];
const AUTH_PAGES = ["/login", "/register"];

function isUnder(path: string, prefixes: string[]): boolean {
  return prefixes.some((p) => path === p || path.startsWith(`${p}/`));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  const isTeacher = session?.role === "teacher";

  // Teacher login page
  if (pathname === "/teacher/login") {
    if (isTeacher) return NextResponse.redirect(new URL("/teacher", request.url));
    return NextResponse.next();
  }

  // Teacher area (everything else under /teacher)
  if (pathname === "/teacher" || pathname.startsWith("/teacher/")) {
    if (!isTeacher) {
      return NextResponse.redirect(new URL("/teacher/login", request.url));
    }
    return NextResponse.next();
  }

  // Student area
  if (isUnder(pathname, STUDENT_PREFIXES)) {
    if (!session) return NextResponse.redirect(new URL("/login", request.url));
    if (isTeacher) return NextResponse.redirect(new URL("/teacher", request.url));
    return NextResponse.next();
  }

  // Student auth pages — bounce signed-in users to their home
  if (AUTH_PAGES.includes(pathname) && session) {
    const dest = isTeacher ? "/teacher" : "/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
