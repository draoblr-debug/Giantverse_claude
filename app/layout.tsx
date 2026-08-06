import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Tamil, Noto_Sans_Kannada, Noto_Sans_Devanagari, Noto_Sans_Telugu } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { LanguageSelector } from "@/components/i18n/LanguageSelector";
import "./globals.css";
import "./legacy-ui.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// One font family per supported script, stacked as CSS fallbacks below —
// Geist has no glyphs outside Latin, so Tamil/Kannada/Hindi/Telugu text
// would otherwise render as tofu boxes regardless of which locale's
// strings are shown.
const notoTamil = Noto_Sans_Tamil({ variable: "--font-noto-tamil", subsets: ["tamil"], weight: ["400", "600", "700"] });
const notoKannada = Noto_Sans_Kannada({ variable: "--font-noto-kannada", subsets: ["kannada"], weight: ["400", "600", "700"] });
const notoDevanagari = Noto_Sans_Devanagari({ variable: "--font-noto-devanagari", subsets: ["devanagari"], weight: ["400", "600", "700"] });
const notoTelugu = Noto_Sans_Telugu({ variable: "--font-noto-telugu", subsets: ["telugu"], weight: ["400", "600", "700"] });

export const metadata: Metadata = {
  title: "Giantverse — Discover Your Name",
  description: "A brand experience. Discover the name that was always yours.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${notoTamil.variable} ${notoKannada.variable} ${notoDevanagari.variable} ${notoTelugu.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div
            style={{
              position: "fixed",
              top: 16,
              right: 16,
              zIndex: 100,
              background: "rgba(10,10,10,0.55)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(58,47,18,0.7)",
              borderRadius: 8,
              padding: "6px 10px",
            }}
          >
            <LanguageSelector />
          </div>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
