"use client";

import { useSyncExternalStore } from "react";
import { supabaseBrowser } from "./supabase/client";
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
  userId: string;
  email: string;
  profile: Profile | null;
  checkins: CheckIn[];
  /** today's chat only; kept on this device, never sent to the database */
  chat: { date: string; messages: ChatMessage[] };
  goodThings: { date: string; items: string[] }[];
  error: string | null;
};

// ---------------------------------------------------------------------------
// In-memory cache backed by Supabase. `null` means "still loading".

let cache: State | null = null;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function set(fn: (s: State) => State) {
  if (!cache) return;
  cache = fn(cache);
  emit();
}

function fail(message: string, err: unknown) {
  console.error(message, err);
  set((s) => ({ ...s, error: message }));
}

export function clearError() {
  set((s) => ({ ...s, error: null }));
}

type CheckInRow = {
  id: string;
  date: string;
  created_at: string;
  mood: MoodId;
  stress: number;
  sleep_hours: number | string;
  tags: TagId[];
  note: string;
};

const fromRow = (r: CheckInRow): CheckIn => ({
  id: r.id,
  date: r.date,
  createdAt: new Date(r.created_at).getTime(),
  mood: r.mood,
  stress: r.stress,
  sleepHours: Number(r.sleep_hours),
  tags: r.tags ?? [],
  note: r.note ?? "",
});

const chatKey = (userId: string) => `mindora:chat:${userId}`;

async function load() {
  const supabase = supabaseBrowser();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) {
    cache = null;
    emit();
    return;
  }

  const [profile, checkins, goodThings] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("checkins").select("*").order("date", { ascending: true }).limit(365),
    supabase.from("good_things").select("date, items").order("created_at", { ascending: true }).limit(200),
  ]);

  let chat: State["chat"] = { date: "", messages: [] };
  try {
    chat = JSON.parse(localStorage.getItem(chatKey(user.id)) ?? "null") ?? chat;
  } catch {
    // ignore unreadable chat cache
  }

  const err = profile.error ?? checkins.error ?? goodThings.error;
  cache = {
    userId: user.id,
    email: user.email ?? "",
    profile: profile.data
      ? {
          name: profile.data.name,
          buddy: profile.data.buddy,
          buddyName: profile.data.buddy_name,
          grownUps: profile.data.grown_ups ?? {},
        }
      : null,
    checkins: (checkins.data ?? []).map(fromRow),
    goodThings: goodThings.data ?? [],
    chat,
    error: err ? "Couldn't load everything. Check your connection and refresh." : null,
  };
  if (err) console.error(err);
  emit();
}

function ensureLoaded() {
  loading ??= load().finally(() => {
    loading = null;
  });
}

let authListening = false;
function subscribe(fn: () => void) {
  listeners.add(fn);
  if (!cache) ensureLoaded();
  if (!authListening) {
    authListening = true;
    supabaseBrowser().auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" && cache) return; // token refresh on an already-loaded session
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        cache = null;
        emit();
        if (event !== "SIGNED_OUT") ensureLoaded();
      }
    });
  }
  return () => {
    listeners.delete(fn);
  };
}

/** Returns null while the signed-in user's data is loading. */
export function useAppState(): State | null {
  return useSyncExternalStore(
    subscribe,
    () => cache,
    () => null,
  );
}

// ---------------------------------------------------------------------------
// Writes: update the cache straight away, then save to Supabase.

export async function saveProfile(profile: Profile) {
  if (!cache) return;
  const previous = cache.profile;
  set((s) => ({ ...s, profile }));
  const { error } = await supabaseBrowser().from("profiles").upsert({
    id: cache.userId,
    name: profile.name,
    buddy: profile.buddy,
    buddy_name: profile.buddyName,
    grown_ups: profile.grownUps,
  });
  if (error) {
    set((s) => ({ ...s, profile: previous }));
    fail("Couldn't save your buddy. Please try again.", error);
    throw error;
  }
}

let grownUpTimer: ReturnType<typeof setTimeout> | undefined;
export function setGrownUpName(id: GrownUpId, value: string) {
  set((s) => (s.profile ? { ...s, profile: { ...s.profile, grownUps: { ...s.profile.grownUps, [id]: value } } } : s));
  clearTimeout(grownUpTimer);
  // save once typing pauses
  grownUpTimer = setTimeout(async () => {
    if (!cache?.profile) return;
    const { error } = await supabaseBrowser()
      .from("profiles")
      .update({ grown_ups: cache.profile.grownUps })
      .eq("id", cache.userId);
    if (error) fail("Couldn't save that name.", error);
  }, 600);
}

export async function saveCheckIn(c: Omit<CheckIn, "id" | "createdAt" | "date">) {
  if (!cache) throw new Error("Not signed in");
  const { data, error } = await supabaseBrowser()
    .from("checkins")
    .upsert(
      {
        user_id: cache.userId,
        date: today(),
        mood: c.mood,
        stress: c.stress,
        sleep_hours: c.sleepHours,
        tags: c.tags,
        note: c.note,
        created_at: new Date().toISOString(),
      },
      { onConflict: "user_id,date" },
    )
    .select()
    .single();
  if (error) {
    fail("Couldn't save your check-in. Please try again.", error);
    throw error;
  }
  const entry = fromRow(data as CheckInRow);
  set((s) => ({
    ...s,
    // one check-in per day: today's newest replaces any earlier one
    checkins: [...s.checkins.filter((x) => x.date !== entry.date), entry],
    error: null,
  }));
  setChat([]);
  return entry;
}

export async function saveGoodThings(items: string[]) {
  if (!cache) return;
  const entry = { date: today(), items };
  const { error } = await supabaseBrowser().from("good_things").insert({ user_id: cache.userId, ...entry });
  if (error) {
    fail("Couldn't save your good things.", error);
    throw error;
  }
  set((s) => ({ ...s, goodThings: [...s.goodThings, entry] }));
}

export function setChat(messages: ChatMessage[]) {
  if (!cache) return;
  const chat = { date: today(), messages };
  set((s) => ({ ...s, chat }));
  try {
    localStorage.setItem(chatKey(cache.userId), JSON.stringify(chat));
  } catch {
    // storage blocked: chat just won't survive a reload
  }
}

/** Deletes every check-in, good thing and the profile. The login itself stays. */
export async function deleteAllData() {
  if (!cache) return;
  const supabase = supabaseBrowser();
  const uid = cache.userId;
  const results = await Promise.all([
    supabase.from("checkins").delete().eq("user_id", uid),
    supabase.from("good_things").delete().eq("user_id", uid),
  ]);
  const profile = await supabase.from("profiles").delete().eq("id", uid);
  const error = results.find((r) => r.error)?.error ?? profile.error;
  if (error) {
    fail("Couldn't delete everything. Please try again.", error);
    return;
  }
  localStorage.removeItem(chatKey(uid));
  set((s) => ({ ...s, profile: null, checkins: [], goodThings: [], chat: { date: "", messages: [] } }));
}

export async function signOut() {
  await supabaseBrowser().auth.signOut();
  cache = null;
  emit();
}

// ---------------------------------------------------------------------------

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
