"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useI18n } from "@/i18n/i18n";
import { useAuth } from "@/lib/auth/mock-auth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

// Layout + auth guard for protected pages. Redirects to /login when there is
// no signed-in user. (Day 6-8: the same guard will read the Supabase session.)
export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) {
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
      <header className="sticky top-0 z-10 border-b border-foreground/10 bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <Link href="/dashboard" className="text-lg font-semibold">
            {t("app.name")}
          </Link>
          <nav className="flex items-center gap-1">
            {links.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-foreground/10 text-foreground"
                      : "text-foreground/70 hover:bg-foreground/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <LanguageSwitcher />
            <span className="hidden text-sm text-foreground/60 sm:inline">
              {user.email}
            </span>
            <button
              type="button"
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              className="rounded-md border border-foreground/15 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-foreground/5"
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
