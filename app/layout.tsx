import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { Nav } from "@/components/nav";
import { NatureBackground } from "@/components/nature-background";
import "./globals.css";

const display = Fredoka({ variable: "--font-display", subsets: ["latin"] });
const body = Nunito({ variable: "--font-body", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mindora · Feelings Buddy",
  description:
    "A private, friendly mental health monitor: track mood, stress and sleep, find your patterns, and get gentle self-care ideas.",
};

export const viewport: Viewport = { themeColor: "#fbf8ff", viewportFit: "cover" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <NatureBackground />
        <Nav />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-6 sm:px-6 sm:pb-10">
          {children}
        </main>
        <footer className="mx-auto mb-24 w-full max-w-5xl px-4 text-center text-xs text-muted sm:mb-6">
          Mindora is a wellness tool and does not replace medical advice. Your check-ins are private to your account.
        </footer>
      </body>
    </html>
  );
}
