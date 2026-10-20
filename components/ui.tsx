"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { BUDDIES, type BuddyId } from "@/lib/data";
import logoMark from "@/public/logo-mark.png";
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

export function BuddyPicker({ value, onChange }: { value: BuddyId; onChange: (id: BuddyId) => void }) {
  return (
    <fieldset>
      <legend className="sr-only">Choose a buddy</legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(Object.keys(BUDDIES) as BuddyId[]).map((id) => {
          const b = BUDDIES[id];
          const selected = value === id;
          return (
            <label
              key={id}
              className={`sketch-btn relative flex cursor-pointer flex-col items-center gap-1 py-5 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-primary ${
                selected ? "picked" : ""
              }`}
              style={{ background: b.bg }}
            >
              {selected && <CheckBadge />}
              <input
                type="radio"
                name="buddy"
                value={id}
                checked={selected}
                onChange={() => onChange(id)}
                className="sr-only"
              />
              <span aria-hidden className={`text-6xl ${selected ? "sway" : ""}`}>
                {b.emoji}
              </span>
              <span className="font-display text-xl">{b.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Small tick shown on the corner of a picked choice card. */
export function CheckBadge() {
  return (
    <span
      aria-hidden
      className="pop-in absolute -right-2 -top-2 grid size-7 place-items-center rounded-full border-2 border-line bg-primary text-sm font-black text-white"
    >
      ✓
    </span>
  );
}

export function TypingDots({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} aria-label="Typing">
      {[0, 1, 2].map((i) => (
        <span key={i} className="typing-dot size-2 rounded-full bg-current" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </span>
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
    <div className="grid min-h-[40vh] place-content-center justify-items-center gap-2" role="status">
      <Image src={logoMark} alt="" sizes="64px" className="sway h-16 w-auto" />
      <span className="text-sm font-semibold text-muted">Getting things ready…</span>
    </div>
  );
}
