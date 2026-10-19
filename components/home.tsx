"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BUDDIES, MOODS, type BuddyId } from "@/lib/data";
import { findConcern } from "@/lib/insights";
import { saveProfile, todaysCheckIn, useAppState, type Profile } from "@/lib/store";
import { BuddyAvatar, GhostLink, LoadingDots, PrimaryButton, PrimaryLink, SpeechBubble } from "./ui";

export function Home() {
  const state = useAppState();
  if (!state) return <LoadingDots />;
  if (!state.profile) return <MeetYourBuddy />;

  const profile = state.profile;
  const checkin = todaysCheckIn(state);
  const concern = findConcern(state.checkins);

  return (
    <div className="pop-in grid gap-6">
      <div className="flex items-center gap-4">
        <BuddyAvatar profile={profile} size={84} />
        <SpeechBubble className="flex-1">
          {checkin ? (
            <>
              Hi {profile.name}! Today you felt {MOODS[checkin.mood].label.toLowerCase()}{" "}
              {MOODS[checkin.mood].emoji}. Want to talk, or try something to feel good?
            </>
          ) : (
            <>Hi {profile.name}! How are you feeling today?</>
          )}
        </SpeechBubble>
      </div>

      {!checkin ? (
        <PrimaryLink href="/checkin" className="w-full sm:w-auto sm:self-start">
          Start today&apos;s check-in 🌤️
        </PrimaryLink>
      ) : (
        <div className="flex flex-wrap gap-3">
          <PrimaryLink href="/chat">Chat with {profile.buddyName} 💬</PrimaryLink>
          <GhostLink href="/helper">Help me feel better 🎁</GhostLink>
          <GhostLink href="/checkin">Redo check-in</GhostLink>
        </div>
      )}

      {concern.level === "watch" && (
        <Link href="/grown-up" className="sketch block bg-sun p-4 hover:brightness-[1.02]">
          <p className="font-display text-lg">💛 {concern.reason}</p>
          <p className="text-sm text-muted">Talking to a grown-up can help. Tap here when you&apos;re ready.</p>
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Tile href="/garden" bg="var(--mint)" emoji="🌻" title="My Feelings Garden" text={`${state.checkins.length} flower${state.checkins.length === 1 ? "" : "s"} grown so far`} />
        <Tile href="/helper" bg="var(--lilac)" emoji="🧘" title="Feeling Helper" text="Breathing, stretches and calm-down ideas" />
        <Tile href="/grown-up" bg="var(--sun)" emoji="💛" title="Talk to a Grown-Up" text="Get help from someone you trust" />
      </div>
    </div>
  );
}

function Tile({ href, bg, emoji, title, text }: { href: string; bg: string; emoji: string; title: string; text: string }) {
  return (
    <Link href={href} className="sketch-btn block p-5" style={{ background: bg }}>
      <span aria-hidden className="text-3xl">
        {emoji}
      </span>
      <p className="mt-2 font-display text-xl font-medium">{title}</p>
      <p className="text-sm text-ink/70">{text}</p>
    </Link>
  );
}

function MeetYourBuddy() {
  const router = useRouter();
  const [buddy, setBuddy] = useState<BuddyId>("bunny");
  const [buddyName, setBuddyName] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function start(e: React.FormEvent) {
    e.preventDefault();
    const profile: Profile = {
      name: name.trim() || "friend",
      buddy,
      buddyName: buddyName.trim() || BUDDIES[buddy].defaultName,
      grownUps: {},
    };
    setSaving(true);
    try {
      await saveProfile(profile);
      router.push("/checkin");
    } catch {
      setSaving(false); // the error banner explains what happened
    }
  }

  return (
    <form onSubmit={start} className="pop-in sketch mx-auto grid max-w-3xl gap-6 bg-card p-6 sm:p-8">
      <div className="text-center">
        <h1 className="font-display text-4xl font-semibold">Pick your buddy!</h1>
        <p className="mt-1 text-muted">
          Your buddy helps you notice your feelings and look after them, every day.
        </p>
      </div>

      <fieldset>
        <legend className="sr-only">Choose a buddy</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(Object.keys(BUDDIES) as BuddyId[]).map((id) => {
            const b = BUDDIES[id];
            const selected = buddy === id;
            return (
              <label
                key={id}
                className={`sketch-btn flex cursor-pointer flex-col items-center gap-1 py-5 ${
                  selected ? "outline-4 outline-offset-2 outline-primary" : ""
                }`}
                style={{ background: b.bg, borderWidth: selected ? 3 : 2 }}
              >
                <input
                  type="radio"
                  name="buddy"
                  value={id}
                  checked={selected}
                  onChange={() => setBuddy(id)}
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

      <div className="mx-auto grid w-full max-w-md gap-4">
        <label className="grid gap-1 text-center">
          <span className="font-display text-lg">Give your buddy a name</span>
          <input
            value={buddyName}
            onChange={(e) => setBuddyName(e.target.value)}
            placeholder={BUDDIES[buddy].defaultName}
            maxLength={20}
            className="sketch bg-card px-4 py-3 text-center font-display text-2xl placeholder:text-ink/30"
          />
        </label>
        <label className="grid gap-1 text-center">
          <span className="font-display text-lg">What should {buddyName.trim() || BUDDIES[buddy].defaultName} call you?</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your first name"
            maxLength={24}
            autoComplete="given-name"
            className="sketch bg-card px-4 py-3 text-center text-lg placeholder:text-ink/30"
          />
        </label>
        <PrimaryButton type="submit" disabled={saving}>{saving ? "Saying hi…" : "Say hi! 👋"}</PrimaryButton>
        <p className="text-center text-xs text-muted">
          🔒 Everything you share is private. Only you can see it.
        </p>
      </div>
    </form>
  );
}
