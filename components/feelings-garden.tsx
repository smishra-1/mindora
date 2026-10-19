"use client";

import { useEffect, useState } from "react";
import { MOOD_ORDER, MOODS } from "@/lib/data";
import { findPatterns } from "@/lib/insights";
import { resetAll, seedSampleWeeks, type CheckIn } from "@/lib/store";
import { MoodChart } from "./mood-chart";
import { BuddyAvatar, GhostLink, PrimaryLink, RequireProfile, type ReadyState } from "./ui";

export function FeelingsGarden() {
  return <RequireProfile>{(state) => <Garden state={state} />}</RequireProfile>;
}

const TONE_BG = { good: "var(--sun)", watch: "var(--sky)", info: "var(--mint)" } as const;

function Garden({ state }: { state: ReadyState }) {
  const { checkins, profile } = state;
  const recent = checkins.slice(-14);
  const patterns = findPatterns(checkins);
  const avgSleep = avg(recent.map((c) => c.sleepHours));
  const avgStress = avg(recent.map((c) => c.stress));

  return (
    <div className="pop-in grid gap-6">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">
        My Feelings Garden <span aria-hidden>🌷</span>
      </h1>

      {checkins.length === 0 ? (
        <section className="sketch grid justify-items-center gap-4 bg-card p-8 text-center">
          <span aria-hidden className="text-6xl">
            🌱
          </span>
          <p className="max-w-sm font-display text-xl">Each check-in grows a new flower. Your garden is ready for its first seed!</p>
          <div className="flex flex-wrap justify-center gap-3">
            <PrimaryLink href="/checkin">Plant today&apos;s flower</PrimaryLink>
            <button onClick={seedSampleWeeks} className="sketch-btn bg-card px-4 py-2.5 font-display">
              Try with a sample fortnight
            </button>
          </div>
        </section>
      ) : (
        <>
          <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
            <GardenScene checkins={recent} />
            <aside className="grid content-start gap-3">
              <h2 className="font-display text-xl">
                Garden patterns <span aria-hidden>✨</span>
              </h2>
              {patterns.length === 0 ? (
                <div className="sketch grid gap-3 bg-card p-4 text-sm text-muted">
                  <p>
                    Keep checking in! After a few more days, {profile.buddyName} will spot patterns in your mood,
                    stress and sleep.
                  </p>
                  <button onClick={seedSampleWeeks} className="sketch-btn justify-self-start bg-mint px-3 py-1.5 font-bold text-ink">
                    Add a sample fortnight (demo)
                  </button>
                </div>
              ) : (
                patterns.slice(0, 4).map((p) => (
                  <p key={p.id} className="sketch p-4 font-semibold" style={{ background: TONE_BG[p.tone] }}>
                    <span aria-hidden>{p.emoji}</span> {p.text}
                  </p>
                ))
              )}
              <Legend />
            </aside>
          </div>

          <BuddyNotes state={state} />

          <section className="sketch grid gap-4 bg-card p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-display text-xl">Mood, stress & sleep</h2>
              <dl className="flex gap-5 text-sm">
                <Stat label="Check-ins" value={String(checkins.length)} />
                <Stat label="Avg sleep" value={`${avgSleep.toFixed(1)} h`} />
                <Stat label="Avg stress" value={`${avgStress.toFixed(1)} / 5`} />
              </dl>
            </div>
            <MoodChart checkins={recent} />
          </section>

          <details className="text-sm text-muted">
            <summary className="cursor-pointer font-semibold">Privacy & data</summary>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span>Your check-ins are saved only in this browser.</span>
              <button
                className="sketch-btn bg-rose px-3 py-1.5 text-ink"
                onClick={() => {
                  if (confirm("Delete all check-ins and your buddy from this device?")) resetAll();
                }}
              >
                Delete all my data
              </button>
            </div>
          </details>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="font-display text-lg tabular-nums">{value}</dd>
    </div>
  );
}

function Legend() {
  return (
    <div className="sketch bg-card p-4">
      <p className="mb-2 text-sm font-semibold text-muted">Flower colours</p>
      <ul className="grid grid-cols-2 gap-1.5 text-sm">
        {MOOD_ORDER.map((m) => (
          <li key={m} className="flex items-center gap-2">
            <span className="size-4 rounded-full border-2 border-line" style={{ background: MOODS[m].bg }} />
            {MOODS[m].label}
          </li>
        ))}
      </ul>
    </div>
  );
}

const dayFmt = new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric" });

function GardenScene({ checkins }: { checkins: CheckIn[] }) {
  const W = 700;
  const H = 360;
  const ground = 270;
  const n = checkins.length;
  const gap = W / (n + 1);

  return (
    <figure className="sketch self-start overflow-hidden bg-[#dff1ff]">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={`${n} flowers, one for each recent check-in`}>
        <circle cx={W - 56} cy={52} r={28} fill="var(--sun)" stroke="#e0b400" strokeWidth={3} />
        <path d={`M-5 ${ground + 12} Q ${W / 2} ${ground - 28} ${W + 5} ${ground + 12} L ${W + 5} ${H + 5} L -5 ${H + 5} Z`} fill="var(--grass)" stroke="#5bb36a" strokeWidth={3} />
        {checkins.map((c, i) => {
          const m = MOODS[c.mood];
          const x = gap * (i + 1);
          // happier days and better sleep grow taller flowers
          const height = 50 + m.score * 18 + Math.min(c.sleepHours, 10) * 3;
          const y = ground - height + (i % 2) * 10;
          const isNew = i === n - 1;
          return (
            <g key={c.id} className="sway" style={{ transformOrigin: `${x}px ${ground + 30}px`, animationDelay: `${i * -0.4}s` }}>
              <title>{`${dayFmt.format(new Date(c.date + "T12:00:00"))}: ${m.label}, stress ${c.stress}/5, slept ${c.sleepHours}h${c.note ? ` — ${c.note}` : ""}`}</title>
              <path d={`M${x} ${ground + 30} Q ${x + 6} ${(y + ground) / 2} ${x} ${y}`} stroke="#3c9a4c" strokeWidth={4} fill="none" />
              <ellipse cx={x - 9} cy={(y + ground) / 2 + 20} rx={9} ry={4} fill="#5bb36a" transform={`rotate(-30 ${x - 9} ${(y + ground) / 2 + 20})`} />
              <circle cx={x} cy={y} r={20} fill={m.bg} stroke="#2b2140" strokeWidth={2.5} />
              <text x={x} y={y + 7} textAnchor="middle" fontSize={20}>
                {m.emoji}
              </text>
              {isNew && (
                <g>
                  <rect x={x + 16} y={y - 34} width={46} height={20} rx={6} fill="var(--sun)" stroke="#2b2140" strokeWidth={1.5} />
                  <text x={x + 39} y={y - 20} textAnchor="middle" fontSize={11} fontWeight={700} fill="#2b2140">
                    new!
                  </text>
                </g>
              )}
            </g>
          );
        })}
        <text x={20} y={H - 16} fontSize={14} fill="#2f6b3a" fontWeight={600}>
          Each check-in grows a new flower.
        </text>
      </svg>
    </figure>
  );
}

type Notes = { summary: string; tips: string[]; source: "ai" | "rules" };

function BuddyNotes({ state }: { state: ReadyState }) {
  const { checkins, profile } = state;
  const key = checkins.length;
  // notes are tagged with the check-in count they were made for
  const [result, setResult] = useState<{ key: number; notes: Notes | null } | null>(null);
  const notes = result?.notes ?? null;
  const loading = result?.key !== key;

  useEffect(() => {
    if (key < 3) return;
    let cancelled = false;
    fetch("/api/insights", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ checkins: state.checkins.slice(-30), name: profile.name, buddyName: profile.buddyName }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((d: Notes | null) => {
        if (!cancelled) setResult({ key, notes: d });
      });
    return () => {
      cancelled = true;
    };
    // re-run only when a new check-in is added
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (key < 3) return null;

  return (
    <section className="sketch flex flex-col gap-4 bg-primary-soft p-5 sm:flex-row sm:items-start">
      <BuddyAvatar profile={profile} size={56} />
      <div className="flex-1">
        <h2 className="font-display text-xl">{profile.buddyName}&apos;s notes for you</h2>
        {loading && !notes ? (
          <p className="animate-pulse text-muted">Looking at your garden…</p>
        ) : notes ? (
          <>
            <p className="mt-1">{notes.summary}</p>
            {notes.tips.length > 0 && (
              <ul className="mt-3 grid gap-1.5">
                {notes.tips.map((t) => (
                  <li key={t} className="flex gap-2">
                    <span aria-hidden>🌱</span>
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="text-muted">Notes aren&apos;t available right now.</p>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          <PrimaryLink href="/helper" className="!py-2 !text-base">
            Try a feel-good activity
          </PrimaryLink>
          <GhostLink href="/grown-up" className="text-sm">
            💛 Need a grown-up?
          </GhostLink>
        </div>
      </div>
    </section>
  );
}

function avg(xs: number[]) {
  return xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
}
