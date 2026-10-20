"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MOOD_ORDER, MOODS, STRESS_LABELS, TAGS, type MoodId, type TagId } from "@/lib/data";
import { guessMood } from "@/lib/insights";
import { checkSafety } from "@/lib/safety";
import { saveCheckIn, todaysCheckIn } from "@/lib/store";
import { BuddyAvatar, CheckBadge, PrimaryButton, RequireProfile, SpeechBubble, type ReadyState } from "./ui";

const STRESS_EMOJI = ["", "😌", "🙂", "😐", "😣", "😫"];

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2 font-display text-xl">
      <span
        aria-hidden
        className="grid size-7 shrink-0 place-items-center rounded-full border-2 border-line bg-primary-soft text-sm font-semibold text-primary"
      >
        {n}
      </span>
      {children}
    </span>
  );
}

export function CheckInForm() {
  return (
    <RequireProfile>
      {(state) => <Form state={state} />}
    </RequireProfile>
  );
}

function Form({ state }: { state: ReadyState }) {
  const router = useRouter();
  const profile = state.profile;
  const existing = todaysCheckIn(state);
  const previous = state.checkins[state.checkins.length - 1];

  const [mood, setMood] = useState<MoodId | null>(existing?.mood ?? null);
  const [words, setWords] = useState(existing?.note ?? "");
  const [guess, setGuess] = useState<MoodId | null>(null);
  const [guessing, setGuessing] = useState(false);
  const [stress, setStress] = useState(existing?.stress ?? 2);
  const [sleep, setSleep] = useState(existing?.sleepHours ?? previous?.sleepHours ?? 8);
  const [tags, setTags] = useState<TagId[]>(existing?.tags ?? []);

  async function askBuddy() {
    if (!words.trim()) return;
    if (checkSafety(words) === "crisis") {
      router.push("/grown-up?urgent=1");
      return;
    }
    setGuessing(true);
    let result: MoodId | null = null;
    try {
      const res = await fetch("/api/guess", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: words }),
      });
      if (res.ok) result = (await res.json()).mood ?? null;
    } catch {
      // offline: fall back to the keyword guess
    }
    setGuess(result ?? guessMood(words) ?? "calm");
    setGuessing(false);
  }

  function toggleTag(t: TagId) {
    setTags((ts) => (ts.includes(t) ? ts.filter((x) => x !== t) : [...ts, t]));
  }

  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!mood) return;
    setSaving(true);
    try {
      await saveCheckIn({ mood, stress, sleepHours: sleep, tags, note: words.trim() });
      router.push(checkSafety(words) === "crisis" ? "/grown-up?urgent=1" : "/chat");
    } catch {
      setSaving(false); // the error banner explains what happened
    }
  }

  return (
    <form onSubmit={submit} className="pop-in grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="flex items-start gap-4 lg:sticky lg:top-24 lg:flex-col lg:items-center lg:self-start">
        <span className="lg:hidden">
          <BuddyAvatar profile={profile} size={64} />
        </span>
        <span className="hidden lg:block">
          <BuddyAvatar profile={profile} size={150} />
        </span>
        <SpeechBubble className="flex-1 lg:w-full lg:flex-none">
          {mood
            ? `${MOODS[mood].emoji} ${MOODS[mood].label} — thanks for telling me, ${profile.name}!`
            : `Hi ${profile.name}! How are you feeling today?`}
        </SpeechBubble>
      </aside>

      <div className="grid gap-6">
        <fieldset>
          <legend className="mb-3">
            <Step n={1}>Pick a feeling</Step>
          </legend>
          <div className="grid grid-cols-3 gap-3">
            {MOOD_ORDER.map((id) => {
              const m = MOODS[id];
              const on = mood === id;
              return (
                <button
                  type="button"
                  key={id}
                  aria-pressed={on}
                  onClick={() => {
                    setMood(id);
                    setGuess(null);
                  }}
                  className={`sketch-btn relative flex flex-col items-center gap-1 py-4 ${on ? "picked" : ""}`}
                  style={{ background: m.bg }}
                >
                  {on && <CheckBadge />}
                  <span aria-hidden className={`text-4xl transition-transform duration-200 ${on ? "scale-115" : ""}`}>
                    {m.emoji}
                  </span>
                  <span className="font-display text-lg">{m.label}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="grid gap-2">
          <label htmlFor="words" className="font-display text-lg">
            Not sure? Tell {profile.buddyName} in your own words <span className="text-sm font-normal text-muted">(optional)</span>
          </label>
          <div className="flex gap-2">
            <input
              id="words"
              value={words}
              onChange={(e) => setWords(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  askBuddy();
                }
              }}
              placeholder="I got left out at lunch…"
              maxLength={300}
              className="field min-w-0 flex-1 px-4 py-3"
            />
            <button
              type="button"
              onClick={askBuddy}
              disabled={!words.trim() || guessing}
              className="sketch-btn shrink-0 bg-sun px-4 font-display"
            >
              {guessing ? "Thinking…" : "Guess ✨"}
            </button>
          </div>
          {guess && mood !== guess && (
            <div className="pop-in sketch flex flex-wrap items-center gap-3 bg-sun px-4 py-3">
              <span className="flex-1 font-display text-lg">
                I think you feel {MOODS[guess].emoji} {MOODS[guess].label.toLowerCase()}. Is that right?
              </span>
              <button
                type="button"
                onClick={() => {
                  setMood(guess);
                  setGuess(null);
                }}
                className="sketch-btn bg-mint px-4 py-1.5 font-display"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setGuess(null)}
                className="sketch-btn bg-card px-4 py-1.5 font-display"
              >
                Not quite
              </button>
            </div>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <fieldset className="sketch grid gap-3 bg-card p-4">
            <legend className="sr-only">How much stress?</legend>
            <span aria-hidden>
              <Step n={2}>How much stress?</Step>
            </span>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <label
                  key={n}
                  title={STRESS_LABELS[n]}
                  className={`grid cursor-pointer place-items-center rounded-xl border-2 py-2 text-2xl transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary ${
                    stress === n ? "border-primary bg-primary-soft" : "border-soft-line hover:border-line"
                  }`}
                >
                  <input
                    type="radio"
                    name="stress"
                    value={n}
                    checked={stress === n}
                    onChange={() => setStress(n)}
                    className="sr-only"
                  />
                  <span aria-hidden className={`transition-transform duration-200 ${stress === n ? "scale-115" : ""}`}>
                    {STRESS_EMOJI[n]}
                  </span>
                  <span className="sr-only">{STRESS_LABELS[n]}</span>
                </label>
              ))}
            </div>
            <p className="text-sm font-semibold text-muted" aria-live="polite">
              {STRESS_LABELS[stress]}
            </p>
          </fieldset>

          <div className="sketch grid gap-3 bg-card p-4">
            <span id="sleep-label">
              <Step n={3}>
                Sleep last night <span aria-hidden>🌙</span>
              </Step>
            </span>
            <div className="flex items-center gap-3" role="group" aria-labelledby="sleep-label">
              <button
                type="button"
                aria-label="Less sleep"
                onClick={() => setSleep((s) => Math.max(2, s - 0.5))}
                className="sketch-btn size-10 bg-sky font-display text-xl"
              >
                −
              </button>
              <output aria-live="polite" className="flex-1 text-center font-display text-2xl tabular-nums">
                {sleep} hrs
              </output>
              <button
                type="button"
                aria-label="More sleep"
                onClick={() => setSleep((s) => Math.min(14, s + 0.5))}
                className="sketch-btn size-10 bg-sky font-display text-xl"
              >
                +
              </button>
            </div>
            <p className="text-sm font-semibold text-muted">
              {sleep < 7 ? "A bit short — rest helps feelings!" : sleep > 11 ? "That's a big sleep!" : "Nice and rested"}
            </p>
          </div>
        </div>

        <fieldset>
          <legend className="mb-3">
            <Step n={4}>
              What happened today? <span className="font-sans text-sm font-normal text-muted">(pick any)</span>
            </Step>
          </legend>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(TAGS) as TagId[]).map((t) => (
              <button
                type="button"
                key={t}
                aria-pressed={tags.includes(t)}
                onClick={() => toggleTag(t)}
                className={`rounded-full border-2 px-3 py-1.5 text-sm font-bold transition-colors ${
                  tags.includes(t)
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-soft-line bg-card text-muted hover:border-line"
                }`}
              >
                <span aria-hidden>{TAGS[t].emoji}</span> {TAGS[t].label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="sticky bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-10 -mx-1 rounded-2xl bg-bg/85 p-1 backdrop-blur sm:static sm:mx-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          <PrimaryButton type="submit" disabled={!mood || saving} className="w-full sm:w-auto">
            {saving ? "Saving…" : mood ? `Tell ${profile.buddyName} →` : "Pick a feeling first"}
          </PrimaryButton>
        </div>
      </div>
    </form>
  );
}
