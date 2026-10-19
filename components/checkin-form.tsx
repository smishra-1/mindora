"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MOOD_ORDER, MOODS, STRESS_LABELS, TAGS, type MoodId, type TagId } from "@/lib/data";
import { guessMood } from "@/lib/insights";
import { checkSafety } from "@/lib/safety";
import { saveCheckIn, todaysCheckIn } from "@/lib/store";
import { BuddyAvatar, PrimaryButton, RequireProfile, SpeechBubble, type ReadyState } from "./ui";

const STRESS_EMOJI = ["", "😌", "🙂", "😐", "😣", "😫"];

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

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!mood) return;
    saveCheckIn({ mood, stress, sleepHours: sleep, tags, note: words.trim() });
    router.push(checkSafety(words) === "crisis" ? "/grown-up?urgent=1" : "/chat");
  }

  return (
    <form onSubmit={submit} className="pop-in grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="flex items-start gap-4 lg:flex-col lg:items-center">
        <span className="lg:hidden">
          <BuddyAvatar profile={profile} size={64} />
        </span>
        <span className="hidden lg:block">
          <BuddyAvatar profile={profile} size={150} />
        </span>
        <SpeechBubble className="flex-1 lg:w-full lg:flex-none">
          Hi {profile.name}! How are you feeling today?
        </SpeechBubble>
      </aside>

      <div className="grid gap-6">
        <fieldset>
          <legend className="mb-2 font-display text-xl">Pick a feeling</legend>
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
                  className="sketch-btn flex flex-col items-center gap-1 py-4"
                  style={{
                    background: m.bg,
                    borderWidth: on ? 4 : 2,
                    transform: on ? "scale(1.03)" : undefined,
                  }}
                >
                  <span aria-hidden className="text-4xl">
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
            Or tell me in your own words
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
              className="sketch min-w-0 flex-1 bg-card px-4 py-3"
            />
            <button
              type="button"
              onClick={askBuddy}
              disabled={!words.trim() || guessing}
              className="sketch-btn bg-card px-4 font-display"
            >
              {guessing ? "…" : "Tell"}
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
          <div className="sketch grid gap-3 bg-card p-4">
            <label htmlFor="stress" className="font-display text-lg">
              How much stress? <span aria-hidden>{STRESS_EMOJI[stress]}</span>
            </label>
            <input
              id="stress"
              type="range"
              min={1}
              max={5}
              value={stress}
              onChange={(e) => setStress(Number(e.target.value))}
              aria-valuetext={STRESS_LABELS[stress]}
              className="accent-primary"
            />
            <p className="text-sm font-semibold text-muted">{STRESS_LABELS[stress]}</p>
          </div>

          <div className="sketch grid gap-3 bg-card p-4">
            <span id="sleep-label" className="font-display text-lg">
              Sleep last night <span aria-hidden>🌙</span>
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
              {sleep < 7 ? "A bit short — rest helps feelings!" : "Nice and rested"}
            </p>
          </div>
        </div>

        <fieldset>
          <legend className="mb-2 font-display text-lg">What happened today?</legend>
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

        <PrimaryButton type="submit" disabled={!mood} className="sm:justify-self-start">
          {mood ? `Tell ${profile.buddyName} →` : "Pick a feeling first"}
        </PrimaryButton>
      </div>
    </form>
  );
}
