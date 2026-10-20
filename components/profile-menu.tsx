"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { signOut, type State } from "@/lib/store";
import { BuddyAvatar } from "./ui";

export function ProfileMenu({ state }: { state: State }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedOn, setOpenedOn] = useState(pathname);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const profile = state.profile;

  // close when navigating away
  if (open && openedOn !== pathname) {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function onPointer(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function logOut() {
    setOpen(false);
    await signOut();
    router.replace("/login");
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        onClick={() => {
          setOpenedOn(pathname);
          setOpen((o) => !o);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="Your profile"
        className={`flex items-center gap-2 rounded-full p-0.5 pr-0.5 transition-colors hover:bg-primary-soft sm:pr-2.5 ${
          open || pathname === "/settings" ? "bg-primary-soft" : ""
        }`}
      >
        {profile ? (
          <BuddyAvatar profile={profile} size={36} />
        ) : (
          <span className="grid size-9 place-items-center rounded-full border-2 border-line bg-lilac font-display font-semibold">
            {state.email.charAt(0).toUpperCase() || "?"}
          </span>
        )}
        <span className="hidden max-w-28 truncate text-sm font-bold sm:block">{profile?.name ?? "Account"}</span>
        <svg aria-hidden viewBox="0 0 20 20" className={`hidden size-4 text-muted transition-transform sm:block ${open ? "rotate-180" : ""}`} fill="currentColor">
          <path d="M5.2 7.7a.75.75 0 0 1 1.06.04L10 11.7l3.74-3.96a.75.75 0 1 1 1.1 1.02l-4.3 4.55a.75.75 0 0 1-1.1 0L5.16 8.76a.75.75 0 0 1 .04-1.06Z" />
        </svg>
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Profile"
          className="pop-in sketch absolute right-0 top-[calc(100%+0.5rem)] z-30 w-64 origin-top-right bg-card p-2"
        >
          <div className="flex items-center gap-3 border-b-2 border-soft-line px-2 pb-3 pt-1">
            {profile && <BuddyAvatar profile={profile} size={44} />}
            <div className="min-w-0">
              <p className="truncate font-display text-lg leading-tight">{profile?.name ?? "Your account"}</p>
              <p className="truncate text-xs text-muted">{state.email}</p>
              {profile && (
                <p className="truncate text-xs text-muted">
                  Buddy: <span className="font-semibold text-ink">{profile.buddyName}</span>
                </p>
              )}
            </div>
          </div>
          <div className="grid pt-2">
            {profile && (
              <MenuLink href="/settings" icon="⚙️" onSelect={() => setOpen(false)}>
                Settings
              </MenuLink>
            )}
            {profile && (
              <MenuLink href="/settings#buddy" icon="✏️" onSelect={() => setOpen(false)}>
                Change my buddy
              </MenuLink>
            )}
            <button
              role="menuitem"
              onClick={logOut}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left font-bold text-muted hover:bg-rose/50 hover:text-ink focus-visible:bg-rose/50"
            >
              <span aria-hidden>👋</span> Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon,
  onSelect,
  children,
}: {
  href: string;
  icon: string;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      role="menuitem"
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-bold hover:bg-primary-soft focus-visible:bg-primary-soft"
    >
      <span aria-hidden>{icon}</span> {children}
    </Link>
  );
}
