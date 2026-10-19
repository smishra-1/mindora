"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearError, signOut, useAppState } from "@/lib/store";
import { BUDDIES } from "@/lib/data";

const LINKS = [
  { href: "/checkin", label: "Check-in", emoji: "🌤️" },
  { href: "/chat", label: "Chat", emoji: "💬" },
  { href: "/helper", label: "Helper", emoji: "🎁" },
  { href: "/garden", label: "Garden", emoji: "🌻" },
  { href: "/grown-up", label: "Grown-up", emoji: "💛" },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const state = useAppState();
  const profile = state?.profile;

  return (
    <>
      <header className="sticky top-0 z-20 border-b-2 border-soft-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span
              aria-hidden
              className="grid size-9 place-items-center rounded-full border-2 border-line text-lg"
              style={{ background: profile ? BUDDIES[profile.buddy].bg : "var(--lilac)" }}
            >
              {profile ? BUDDIES[profile.buddy].emoji : "🌱"}
            </span>
            <span className="font-display text-2xl font-semibold text-primary">Mindora</span>
          </Link>
          {profile && (
            <nav aria-label="Main" className="ml-auto hidden gap-1 sm:flex">
              {LINKS.map((l) => (
                <NavLink key={l.href} {...l} active={pathname === l.href} />
              ))}
            </nav>
          )}
          {state && (
            <button
              onClick={async () => {
                await signOut();
                router.replace("/login");
              }}
              title={`Signed in as ${state.email}`}
              className={`rounded-full px-3 py-1.5 text-sm font-bold text-muted hover:bg-primary-soft hover:text-ink ml-auto ${profile ? "sm:ml-0" : ""}`}
            >
              Log out
            </button>
          )}
        </div>
        {state?.error && (
          <div role="alert" className="flex items-center justify-center gap-3 bg-rose px-4 py-2 text-sm font-semibold">
            {state.error}
            <button onClick={clearError} className="underline">
              Dismiss
            </button>
          </div>
        )}
      </header>
      {profile && (
        <nav
          aria-label="Main"
          className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t-2 border-soft-line bg-card/95 px-1 py-1.5 backdrop-blur sm:hidden"
        >
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname === l.href ? "page" : undefined}
              className={`flex min-w-14 flex-col items-center rounded-xl px-2 py-1 text-[11px] font-semibold ${
                pathname === l.href ? "bg-primary-soft text-primary" : "text-muted"
              }`}
            >
              <span aria-hidden className="text-xl">
                {l.emoji}
              </span>
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}

function NavLink({
  href,
  label,
  emoji,
  active,
}: {
  href: string;
  label: string;
  emoji: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full px-3 py-1.5 text-sm font-bold transition-colors ${
        active ? "bg-primary-soft text-primary" : "text-muted hover:bg-primary-soft/60 hover:text-ink"
      }`}
    >
      <span aria-hidden>{emoji}</span> {label}
    </Link>
  );
}
