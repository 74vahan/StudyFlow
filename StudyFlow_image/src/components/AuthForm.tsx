"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/i18n";
import { useAuth } from "@/lib/auth/auth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Starburst } from "@/components/RetroDecor";

const field = "rf-field text-sm";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { t } = useI18n();
  const { user, ready, login, register } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already signed in → go to the app.
  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Client-side check that matches the server, with a clear message.
    if (mode === "register" && password !== confirmPassword) {
      setError(t("auth.passwordsMismatch"));
      return;
    }

    setSubmitting(true);
    const result =
      mode === "login"
        ? await login({ firstName, lastName, password })
        : await register({
            firstName,
            lastName,
            phone,
            password,
            confirmPassword,
          });
    setSubmitting(false);

    if (result.ok) {
      router.replace("/dashboard");
    } else {
      setError(
        result.error === "server" ? t("auth.serverError") : t("auth.invalid"),
      );
    }
  }

  const title = mode === "login" ? t("auth.loginTitle") : t("auth.registerTitle");
  const cta = mode === "login" ? t("auth.loginCta") : t("auth.registerCta");

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-tangerine">
          {t("app.name")}
        </Link>
        <LanguageSwitcher />
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <form
          onSubmit={handleSubmit}
          className="rf-card rf-enter relative w-full max-w-sm space-y-4 p-6"
          noValidate
        >
          <Starburst
            className="rf-float pointer-events-none absolute -right-5 -top-6"
            size={52}
          />
          <h1 className="text-2xl font-bold">{title}</h1>

          {/* First + last name on one row (both modes). */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="mb-1 block text-sm font-medium">
                {t("auth.firstName")}
              </label>
              <input
                id="firstName"
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={field}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="mb-1 block text-sm font-medium">
                {t("auth.lastName")}
              </label>
              <input
                id="lastName"
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={field}
              />
            </div>
          </div>

          {/* Phone — registration only. */}
          {mode === "register" && (
            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium">
                {t("auth.phone")}
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={field}
              />
            </div>
          )}

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

          {/* Confirm password — registration only. */}
          {mode === "register" && (
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-sm font-medium"
              >
                {t("auth.confirmPassword")}
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={field}
              />
            </div>
          )}

          {error && <p className="text-sm font-semibold text-coral">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full"
          >
            {submitting ? t("common.saving") : cta}
          </button>

          <p className="text-center text-sm text-ink/70">
            {mode === "login" ? (
              <>
                {t("auth.noAccount")}{" "}
                <Link href="/register" className="font-semibold text-teal underline underline-offset-4">
                  {t("nav.register")}
                </Link>
              </>
            ) : (
              <>
                {t("auth.haveAccount")}{" "}
                <Link href="/login" className="font-semibold text-teal underline underline-offset-4">
                  {t("nav.login")}
                </Link>
              </>
            )}
          </p>

          <p className="text-center text-sm text-ink/60">
            <Link href="/teacher/login" className="font-semibold text-teal underline underline-offset-4">
              {t("auth.teacherLink")}
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
