"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useI18n } from "@/i18n/i18n";
import { useAuth } from "@/lib/auth/auth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

// Layout + auth guard for protected pages. Redirects to /login when there is
// no signed-in user. The session itself is enforced server-side (middleware +
// API routes); this guard just keeps the UI from flashing protected content.
export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { user, inClass, ready, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
    else if (user.role === "teacher") router.replace("/teacher");
    else if (!inClass) router.replace("/pending");
  }, [ready, user, inClass, router]);

  if (!ready || !user || user.role !== "student" || !inClass) {
    return (
      <main className="flex flex-1 items-center justify-center p-6 text-foreground/60">
        {t("common.loading")}
      </main>
    );
  }

  const links = [
    { href: "/dashboard", label: t("nav.dashboard") },
    { href: "/tasks", label: t("nav.tasks") },
  ];

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b-[4px] border-ink bg-surface/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 sm:px-6">
          <Link
            href="/dashboard"
            className="text-xl font-bold tracking-tight text-tangerine"
          >
            {t("app.name")}
          </Link>
          <nav className="flex items-center gap-2">
            {links.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rf-navlink text-sm ${
                    active ? "rf-navlink-active" : ""
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <LanguageSwitcher />
            <span className="hidden text-sm text-ink/70 sm:inline">
              {[user.firstName, user.lastName].filter(Boolean).join(" ")}
            </span>
            <button
              type="button"
              onClick={async () => {
                await logout();
                router.replace("/login");
              }}
              className="btn btn-secondary btn-sm"
            >
              {t("nav.logout")}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}
