"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BUDDIES, MOODS, type BuddyId } from "@/lib/data";
import { findConcern } from "@/lib/insights";
import { saveProfile, today, todaysCheckIn, useAppState, type CheckIn, type Profile } from "@/lib/store";
import { BuddyAvatar, BuddyPicker, GhostLink, LoadingDots, PrimaryButton, PrimaryLink, SpeechBubble } from "./ui";

export function Home() {
  const state = useAppState();
  if (!state) return <LoadingDots />;
  if (!state.profile) return <MeetYourBuddy />;

  const profile = state.profile;
  const checkin = todaysCheckIn(state);
  const concern = findConcern(state.checkins);

  const streak = currentStreak(state.checkins);

  return (
    <div className="pop-in grid gap-6">
      <div className="flex items-center gap-4">
        <span className="sway">
          <BuddyAvatar profile={profile} size={84} />
        </span>
        <SpeechBubble className="flex-1">
          {checkin ? (
            <>
              {greeting()}, {profile.name}! Today you felt {MOODS[checkin.mood].label.toLowerCase()}{" "}
              {MOODS[checkin.mood].emoji}. Want to talk, or try something to feel good?
            </>
          ) : (
            <>
              {greeting()}, {profile.name}! How are you feeling today?
            </>
          )}
        </SpeechBubble>
      </div>

      <WeekStrip checkins={state.checkins} streak={streak} />

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

      <div className="stagger grid gap-4 sm:grid-cols-3">
        <Tile href="/garden" bg="var(--mint)" emoji="🌻" title="My Feelings Garden" text={`${state.checkins.length} flower${state.checkins.length === 1 ? "" : "s"} grown so far`} />
        <Tile href="/helper" bg="var(--lilac)" emoji="🧘" title="Feeling Helper" text="Breathing, stretches and calm-down ideas" />
        <Tile href="/grown-up" bg="var(--sun)" emoji="💛" title="Talk to a Grown-Up" text="Get help from someone you trust" />
      </div>
    </div>
  );
}

function greeting(hour = new Date().getHours()) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function dateKey(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return today(d);
}

/** Days in a row with a check-in, counting back from today (or yesterday if today isn't done yet). */
function currentStreak(checkins: CheckIn[]) {
  const days = new Set(checkins.map((c) => c.date));
  const start = days.has(dateKey(0)) ? 0 : 1;
  let n = 0;
  while (days.has(dateKey(start + n))) n++;
  return n;
}

const weekdayFmt = new Intl.DateTimeFormat(undefined, { weekday: "narrow" });

function WeekStrip({ checkins, streak }: { checkins: CheckIn[]; streak: number }) {
  const byDate = new Map(checkins.map((c) => [c.date, c]));
  const days = Array.from({ length: 7 }, (_, i) => {
    const key = dateKey(6 - i);
    return { key, label: weekdayFmt.format(new Date(key + "T12:00:00")), checkin: byDate.get(key) };
  });

  return (
    <section aria-label="Your week" className="sketch flex flex-wrap items-center gap-x-6 gap-y-3 bg-card px-4 py-3 sm:px-5">
      <div className="flex items-center gap-3">
        <span aria-hidden className="text-3xl">
          {streak >= 3 ? "🔥" : "🌱"}
        </span>
        <div>
          <p className="font-display text-xl leading-tight tabular-nums">
            {streak} day{streak === 1 ? "" : "s"} in a row
          </p>
          <p className="text-xs text-muted">
            {streak === 0 ? "Check in today to start a streak!" : "Keep it growing — one check-in a day."}
          </p>
        </div>
      </div>
      <ol className="ml-auto flex w-full justify-between gap-1 sm:w-auto sm:gap-2">
        {days.map(({ key, label, checkin }) => {
          const isToday = key === dateKey(0);
          const m = checkin ? MOODS[checkin.mood] : null;
          return (
            <li key={key} className="grid justify-items-center gap-1">
              <span
                className={`grid size-10 place-items-center rounded-full border-2 text-xl ${
                  m ? "border-line" : "border-dashed border-soft-line"
                } ${isToday ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}`}
                style={{ background: m?.bg }}
                title={m ? m.label : "No check-in"}
              >
                {m ? <span role="img" aria-label={m.label}>{m.emoji}</span> : <span className="sr-only">No check-in</span>}
              </span>
              <span className={`text-xs font-bold ${isToday ? "text-primary" : "text-muted"}`}>{isToday ? "Today" : label}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Tile({ href, bg, emoji, title, text }: { href: string; bg: string; emoji: string; title: string; text: string }) {
  return (
    <Link href={href} className="sketch-btn block p-5" style={{ background: bg }}>
      <span aria-hidden className="grid size-12 place-items-center rounded-2xl border-2 border-line bg-card/70 text-3xl">
        {emoji}
      </span>
      <p className="mt-3 font-display text-xl font-medium">{title}</p>
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

      <BuddyPicker value={buddy} onChange={setBuddy} />

      <div className="mx-auto grid w-full max-w-md gap-4">
        <label className="grid gap-1 text-center">
          <span className="font-display text-lg">Give your buddy a name</span>
          <input
            value={buddyName}
            onChange={(e) => setBuddyName(e.target.value)}
            placeholder={BUDDIES[buddy].defaultName}
            maxLength={20}
            className="field px-4 py-3 text-center font-display text-2xl"
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
            className="field px-4 py-3 text-center text-lg"
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
