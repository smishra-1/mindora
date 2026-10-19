"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { BUDDIES } from "@/lib/data";
import { useAppState, type Profile, type State } from "@/lib/store";

export function BuddyAvatar({ profile, size = 56 }: { profile: Profile; size?: number }) {
  const b = BUDDIES[profile.buddy];
  return (
    <span
      role="img"
      aria-label={`${profile.buddyName} the ${b.label.toLowerCase()}`}
      className="grid shrink-0 place-items-center rounded-full border-2 border-line"
      style={{ width: size, height: size, background: b.bg, fontSize: size * 0.55 }}
    >
      {b.emoji}
    </span>
  );
}

export function SpeechBubble({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`sketch bg-lilac px-4 py-3 font-display text-lg leading-snug ${className}`}>
      {children}
    </div>
  );
}

export function PrimaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`sketch-btn bg-primary px-6 py-3 font-display text-lg font-medium text-white ${className}`}
    >
      {children}
    </button>
  );
}

export function PrimaryLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`sketch-btn inline-flex items-center justify-center gap-2 bg-primary px-6 py-3 font-display text-lg font-medium text-white ${className}`}
    >
      {children}
    </Link>
  );
}

export function GhostLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`sketch-btn inline-flex items-center justify-center gap-2 bg-card px-4 py-2.5 font-display font-medium ${className}`}
    >
      {children}
    </Link>
  );
}

export function PageTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">{children}</h1>
      {sub && <p className="mt-1 text-muted">{sub}</p>}
    </div>
  );
}

export type ReadyState = State & { profile: Profile };

/** Renders children only once local data has loaded and a buddy has been picked. */
export function RequireProfile({
  children,
}: {
  children: (state: ReadyState) => ReactNode;
}) {
  const state = useAppState();
  const router = useRouter();
  const missing = state !== null && !state.profile;
  useEffect(() => {
    if (missing) router.replace("/");
  }, [missing, router]);
  if (!state || !state.profile) return <LoadingDots />;
  return <>{children(state as ReadyState)}</>;
}

export function LoadingDots() {
  return (
    <div className="grid min-h-[40vh] place-items-center text-3xl" aria-label="Loading">
      <span className="sway">🌱</span>
    </div>
  );
}
