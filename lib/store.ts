"use client";

import { useSyncExternalStore } from "react";
import type { BuddyId, GrownUpId, MoodId, TagId } from "./data";

export type Profile = {
  name: string;
  buddy: BuddyId;
  buddyName: string;
  grownUps: Partial<Record<GrownUpId, string>>;
};

export type CheckIn = {
  id: string;
  /** local date, YYYY-MM-DD */
  date: string;
  createdAt: number;
  mood: MoodId;
  stress: number; // 1–5
  sleepHours: number;
  tags: TagId[];
  note: string;
};

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type State = {
  profile: Profile | null;
  checkins: CheckIn[];
  chat: { date: string; messages: ChatMessage[] };
  goodThings: { date: string; items: string[] }[];
};

const KEY = "mindora:v1";
const EMPTY: State = {
  profile: null,
  checkins: [],
  chat: { date: "", messages: [] },
  goodThings: [],
};

let cache: State | null = null;
const listeners = new Set<() => void>();

function read(): State {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<State>) } : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      fn();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

export function update(fn: (s: State) => State) {
  cache = fn(read());
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // storage full or blocked: keep the in-memory copy
  }
  listeners.forEach((l) => l());
}

/** Returns null during server render and the first hydration pass. */
export function useAppState(): State | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

export function today(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function latestCheckIn(s: State): CheckIn | undefined {
  return s.checkins[s.checkins.length - 1];
}

export function todaysCheckIn(s: State): CheckIn | undefined {
  const t = today();
  return [...s.checkins].reverse().find((c) => c.date === t);
}

export function saveCheckIn(c: Omit<CheckIn, "id" | "createdAt" | "date">) {
  const entry: CheckIn = {
    ...c,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    date: today(),
  };
  update((s) => ({
    ...s,
    // one check-in per day: today's newest replaces any earlier one
    checkins: [...s.checkins.filter((x) => x.date !== entry.date), entry],
    chat: { date: today(), messages: [] },
  }));
  return entry;
}

export function resetAll() {
  update(() => EMPTY);
}

/** Two weeks of believable entries so the garden and patterns can be explored. */
export function seedSampleWeeks() {
  const plan: [MoodId, number, number, TagId[], string][] = [
    ["calm", 2, 8, ["school", "family"], ""],
    ["happy", 1, 8.5, ["outside", "friends"], "Played cricket after school"],
    ["tired", 3, 6, ["school", "screens"], "Stayed up late on my phone"],
    ["worried", 4, 6.5, ["exams", "school"], "Maths test on Friday"],
    ["worried", 4, 5.5, ["exams"], "Couldn't sleep, thinking about the test"],
    ["happy", 2, 8, ["outside", "sports"], "Test is over!"],
    ["calm", 1, 9, ["family"], ""],
    ["tired", 3, 6, ["school", "screens"], "Monday again"],
    ["happy", 2, 8, ["friends", "outside"], ""],
    ["sad", 3, 7, ["alone", "school"], "Nobody sat with me at lunch"],
    ["calm", 2, 8, ["family", "outside"], ""],
    ["worried", 4, 6, ["exams"], "Science exam tomorrow"],
    ["sad", 4, 5.5, ["exams", "alone"], "I think I did badly"],
    ["happy", 2, 8.5, ["sports", "friends"], "Won our football match"],
  ];
  const now = new Date();
  const checkins: CheckIn[] = plan.map(([mood, stress, sleepHours, tags, note], i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (plan.length - i));
    return {
      id: crypto.randomUUID(),
      date: today(d),
      createdAt: d.getTime(),
      mood,
      stress,
      sleepHours,
      tags,
      note,
    };
  });
  update((s) => ({
    ...s,
    checkins: [...checkins, ...s.checkins.filter((c) => !checkins.some((x) => x.date === c.date))].sort(
      (a, b) => a.createdAt - b.createdAt,
    ),
  }));
}
