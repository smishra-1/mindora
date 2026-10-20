"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clearError, useAppState } from "@/lib/store";
import { ProfileMenu } from "./profile-menu";
import logo from "@/public/logo.png";

const LINKS = [
  { href: "/", label: "Home", emoji: "🏠" },
  { href: "/checkin", label: "Check-in", emoji: "🌤️" },
  { href: "/chat", label: "Chat", emoji: "💬" },
  { href: "/helper", label: "Helper", emoji: "🎁" },
  { href: "/garden", label: "Garden", emoji: "🌻" },
  { href: "/grown-up", label: "Grown-up", emoji: "💛" },
];

export function Nav() {
  const pathname = usePathname();
  const state = useAppState();
  const profile = state?.profile;

  return (
    <>
      <header className="sticky top-0 z-20 border-b-2 border-soft-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3 sm:px-6">
          <Link href="/" aria-label="Mindora home" className="flex shrink-0 items-center rounded-lg">
            <Image
              src={logo}
              alt="Mindora"
              loading="eager"
              fetchPriority="high"
              sizes="152px"
              className="h-9 w-auto"
            />
          </Link>
          {profile && (
            <nav aria-label="Main" className="ml-auto hidden gap-1 sm:flex">
              {LINKS.slice(1).map((l) => (
                <NavLink key={l.href} {...l} active={pathname === l.href} />
              ))}
            </nav>
          )}
          {state && (
            <div className={`ml-auto ${profile ? "sm:ml-2" : ""}`}>
              <ProfileMenu state={state} />
            </div>
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
          className="fixed inset-x-0 bottom-0 z-20 flex border-t-2 border-soft-line bg-card/95 px-1 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] backdrop-blur sm:hidden"
        >
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname === l.href ? "page" : undefined}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1 text-[11px] font-bold transition-colors ${
                pathname === l.href ? "bg-primary-soft text-primary" : "text-muted active:bg-primary-soft/60"
              }`}
            >
              <span
                aria-hidden
                className={`text-xl transition-transform duration-200 ${pathname === l.href ? "scale-115" : ""}`}
              >
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
