"use client";

import { useEffect, useState } from "react";
import { ACTIVITIES, MOODS, type Activity, type ActivityId } from "@/lib/data";
import { suggestActivities } from "@/lib/insights";
import { saveGoodThings, todaysCheckIn } from "@/lib/store";
import { GhostLink, PrimaryButton, RequireProfile, type ReadyState } from "./ui";

export function FeelingHelper() {
  return <RequireProfile>{(state) => <Helper state={state} />}</RequireProfile>;
}

function Helper({ state }: { state: ReadyState }) {
  const checkin = todaysCheckIn(state);
  const picks = suggestActivities(state.checkins, checkin?.mood);
  const [current, setCurrent] = useState<ActivityId>(picks[0]);
  const activity = ACTIVITIES[current];

  return (
    <div className="pop-in grid gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">
          {state.profile.buddyName} picked one for you <span aria-hidden>🎁</span>
        </h1>
        {checkin && (
          <p className="mt-1 text-muted">
            Because you feel {MOODS[checkin.mood].label.toLowerCase()}
            {checkin.stress >= 4 ? " and stressed" : ""}
            {checkin.sleepHours < 7 ? `, and slept ${checkin.sleepHours} hours` : ""}.
          </p>
        )}
      </div>

      <ActivityCard key={activity.id} activity={activity} />

      <div>
        <p className="mb-2 font-semibold text-muted">Not feeling it? Try another:</p>
        <div className="flex flex-wrap gap-3">
          {[...new Set([...picks, "belly-breathing", "stretch", "drawing", "good-things"] as ActivityId[])]
            .filter((id) => id !== current)
            .slice(0, 5)
            .map((id) => (
              <button
                key={id}
                onClick={() => setCurrent(id)}
                className="sketch-btn bg-sun px-4 py-2.5 font-display"
              >
                <span aria-hidden>{ACTIVITIES[id].emoji}</span> {ACTIVITIES[id].title}
              </button>
            ))}
        </div>
      </div>

      <p className="text-sm text-muted">
        Still feeling heavy after trying?{" "}
        <GhostLink href="/grown-up" className="ml-1 !px-3 !py-1 text-sm">
          💛 Talk to a grown-up
        </GhostLink>
      </p>
    </div>
  );
}

function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <section className="sketch grid gap-6 bg-lilac p-6 md:grid-cols-[220px_1fr] md:items-center">
      {activity.kind === "breathing" ? (
        <Breather activity={activity} />
      ) : (
        <div className="grid aspect-square w-44 place-items-center justify-self-center rounded-full border-[3px] border-primary bg-card text-7xl">
          <span aria-hidden>{activity.emoji}</span>
        </div>
      )}
      <div>
        <h2 className="font-display text-2xl font-semibold">
          <span aria-hidden>{activity.emoji}</span> {activity.title}
        </h2>
        <p className="mb-3 text-ink/70">{activity.intro}</p>
        {activity.kind === "good-things" ? (
          <GoodThings />
        ) : activity.kind === "steps" ? (
          <Steps steps={activity.steps} />
        ) : (
          <ol className="list-decimal space-y-1 pl-5">
            {activity.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

const PHASES = ["Breathe in", "Hold", "Breathe out", "Hold"];

function Breather({ activity }: { activity: Activity }) {
  const pattern = activity.pattern ?? [4, 0, 4, 0];
  const total = activity.minutes * 60;
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const done = elapsed >= total;
  const active = running && !done;

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [active]);

  // Work out which phase of the breath cycle we are in
  const cycle = pattern.reduce((a, b) => a + b, 0);
  let t = elapsed % cycle;
  let phase = 0;
  while (t >= pattern[phase] || pattern[phase] === 0) {
    t -= pattern[phase];
    phase = (phase + 1) % 4;
  }
  const count = t + 1;
  const scale = !active ? 0.8 : phase === 0 || phase === 1 ? 1 : 0.7;

  return (
    <div className="grid justify-items-center gap-4">
      <div className="relative grid size-48 place-items-center">
        <div
          aria-hidden
          className="absolute inset-0 rounded-full border-[3px] border-primary bg-card"
          style={{
            transform: `scale(${scale})`,
            transition: `transform ${active ? pattern[phase] || 1 : 0.3}s ease-in-out`,
          }}
        />
        <div className="relative text-center" aria-live="polite">
          {done ? (
            <p className="font-display text-xl">Well done! 🌟</p>
          ) : running ? (
            <>
              <p className="font-display text-xl">{PHASES[phase]}</p>
              <p className="text-sm text-muted tabular-nums">
                {Array.from({ length: pattern[phase] }, (_, i) => i + 1)
                  .slice(0, count)
                  .join(" … ")}
              </p>
            </>
          ) : (
            <p className="font-display text-xl">Ready?</p>
          )}
        </div>
      </div>
      <PrimaryButton
        onClick={() => {
          if (done) {
            setElapsed(0);
            setRunning(true);
          } else setRunning((r) => !r);
        }}
        className="!px-5 !py-2 !text-base"
      >
        {active ? "Pause" : done ? "Again" : elapsed > 0 ? "Keep going" : `Start (${activity.minutes} min)`}
      </PrimaryButton>
      {active && (
        <p className="text-xs text-muted tabular-nums">
          {Math.floor((total - elapsed) / 60)}:{String((total - elapsed) % 60).padStart(2, "0")} left
        </p>
      )}
    </div>
  );
}

function Steps({ steps }: { steps: string[] }) {
  const [i, setI] = useState(0);
  const finished = i >= steps.length;
  return (
    <div className="grid gap-3">
      <ol className="space-y-1.5">
        {steps.map((s, n) => (
          <li
            key={s}
            className={`flex gap-2 rounded-lg px-2 py-1 transition-colors ${
              n === i ? "bg-card font-semibold" : n < i ? "text-ink/50 line-through" : ""
            }`}
          >
            <span className="tabular-nums">{n + 1}.</span> {s}
          </li>
        ))}
      </ol>
      <div>
        {finished ? (
          <p className="font-display text-lg">
            You did it! 🌟{" "}
            <button onClick={() => setI(0)} className="ml-2 text-sm text-primary underline">
              Start again
            </button>
          </p>
        ) : (
          <PrimaryButton onClick={() => setI((x) => x + 1)} className="!px-5 !py-2 !text-base">
            {i === 0 ? "Start" : i === steps.length - 1 ? "Done!" : "Next step"}
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}

function GoodThings() {
  const [items, setItems] = useState(["", "", ""]);
  const [saved, setSaved] = useState(false);
  return (
    <form
      className="grid gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        const list = items.map((x) => x.trim()).filter(Boolean);
        if (!list.length) return;
        try {
          await saveGoodThings(list);
          setSaved(true);
        } catch {
          // the error banner explains what happened
        }
      }}
    >
      {items.map((v, i) => (
        <label key={i} className="flex items-center gap-2">
          <span aria-hidden>🌟</span>
          <span className="sr-only">Good thing {i + 1}</span>
          <input
            value={v}
            onChange={(e) => {
              setSaved(false);
              setItems((xs) => xs.map((x, j) => (j === i ? e.target.value : x)));
            }}
            placeholder={["I ate my favourite lunch", "A friend made me laugh", "I saw a cute dog"][i]}
            className="sketch min-w-0 flex-1 bg-card px-3 py-2"
          />
        </label>
      ))}
      <div>
        {saved ? (
          <p className="font-display text-lg">Saved to your garden 🌻</p>
        ) : (
          <PrimaryButton type="submit" className="!px-5 !py-2 !text-base">
            Save my good things
          </PrimaryButton>
        )}
      </div>
    </form>
  );
}
