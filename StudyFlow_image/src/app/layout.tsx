import type { Metadata } from "next";
import { Pixelify_Sans, Noto_Sans_Armenian } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/i18n/i18n";
import { AuthProvider } from "@/lib/auth/auth";

// Pixelify Sans — the project's display + UI face (retro-futurist pixel look).
// Variable font covers latin / latin-ext / cyrillic (en + ru).
const pixelify = Pixelify_Sans({
  variable: "--font-pixel",
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

// Armenian glyphs for the hy locale (Pixelify Sans has no Armenian coverage).
const notoArmenian = Noto_Sans_Armenian({
  variable: "--font-armenian",
  subsets: ["armenian"],
});

export const metadata: Metadata = {
  title: "StudyFlow",
  description: "Organize your studies, track tasks, hit your deadlines.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${pixelify.variable} ${notoArmenian.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <I18nProvider>
          <AuthProvider>{children}</AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
