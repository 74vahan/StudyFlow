"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/i18n";
import { useAuth } from "@/lib/auth/mock-auth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const field =
  "w-full rounded-md border border-foreground/15 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/40";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { t } = useI18n();
  const { user, ready, login, register } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Already signed in → go to the app.
  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const action = mode === "login" ? login : register;
    const result = action(email, password);
    if (result.ok) {
      router.replace("/dashboard");
    } else {
      setError(t("auth.invalid"));
    }
  }

  const title = mode === "login" ? t("auth.loginTitle") : t("auth.registerTitle");
  const cta = mode === "login" ? t("auth.loginCta") : t("auth.registerCta");

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold">
          {t("app.name")}
        </Link>
        <LanguageSwitcher />
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm space-y-4 rounded-xl border border-foreground/10 p-6"
          noValidate
        >
          <h1 className="text-xl font-semibold">{title}</h1>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              {t("auth.email")}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              {t("auth.password")}
            </label>
            <input
              id="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={field}
            />
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            {cta}
          </button>

          <p className="text-center text-sm text-foreground/60">
            {mode === "login" ? (
              <>
                {t("auth.noAccount")}{" "}
                <Link href="/register" className="underline">
                  {t("nav.register")}
                </Link>
              </>
            ) : (
              <>
                {t("auth.haveAccount")}{" "}
                <Link href="/login" className="underline">
                  {t("nav.login")}
                </Link>
              </>
            )}
          </p>
        </form>
      </div>
    </main>
  );
}
