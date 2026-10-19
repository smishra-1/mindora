"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { GROWN_UPS, HELPLINES, MOODS, type GrownUpId } from "@/lib/data";
import { findConcern } from "@/lib/insights";
import { latestCheckIn, setGrownUpName } from "@/lib/store";
import { BuddyAvatar, GhostLink, PrimaryButton, RequireProfile, type ReadyState } from "./ui";

export function TalkToGrownUp() {
  return <RequireProfile>{(state) => <GrownUp state={state} />}</RequireProfile>;
}

function GrownUp({ state }: { state: ReadyState }) {
  const urgent = useSearchParams().get("urgent") === "1";
  const { profile } = state;
  const concern = findConcern(state.checkins);
  const last = latestCheckIn(state);

  const [who, setWho] = useState<GrownUpId>("teacher");
  const names = profile.grownUps;
  const whoName = names[who]?.trim() || GROWN_UPS[who].placeholder;

  const feeling = last ? MOODS[last.mood].label.toLowerCase() : "not okay";
  const because = last?.note ? ` because ${lowerFirst(last.note.replace(/[.!]+$/, ""))}` : "";
  const defaultMsg = `Hi ${whoName}, I felt ${feeling} today${because}. Can we talk?`;
  const [edited, setEdited] = useState<string | null>(null);
  const message = edited ?? defaultMsg;
  const [copied, setCopied] = useState(false);

  async function shareOrCopy() {
    if (navigator.share) {
      try {
        await navigator.share({ text: message });
        return;
      } catch {
        // user cancelled share sheet: fall through to copy
      }
    }
    await navigator.clipboard.writeText(message);
    setCopied(true);
  }

  const intro = urgent
    ? "What you shared sounds really important. Please talk to someone right now — you deserve help, and you're not in trouble."
    : concern.level === "watch"
      ? `${concern.reason} 💛 A grown-up can help, and you're not in trouble.`
      : "Talking to someone you trust can make big feelings smaller. You're never in trouble for sharing.";

  return (
    <div className="pop-in grid gap-6">
      <div className="flex items-start gap-4">
        <BuddyAvatar profile={profile} size={72} />
        <p className="sketch flex-1 bg-lilac px-4 py-3 font-display text-lg">{intro}</p>
      </div>

      {urgent && <Helplines urgent />}

      <fieldset>
        <legend className="mb-2 font-display text-xl">Who would you like to tell?</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {(Object.keys(GROWN_UPS) as GrownUpId[]).map((id) => {
            const g = GROWN_UPS[id];
            const on = who === id;
            return (
              <div
                key={id}
                className="sketch grid justify-items-center gap-2 p-4 text-center transition-colors"
                style={{ background: on ? "var(--sun)" : "var(--card)", borderWidth: on ? 4 : 2, borderColor: on ? "var(--primary)" : undefined }}
              >
                <span aria-hidden className="text-4xl">
                  {g.emoji}
                </span>
                <p className="font-display text-xl">{g.label}</p>
                <label className="w-full">
                  <span className="sr-only">{g.label}&apos;s name</span>
                  <input
                    value={names[id] ?? ""}
                    onChange={(e) => {
                      setGrownUpName(id, e.target.value.slice(0, 40));
                      setEdited(null);
                    }}
                    placeholder={g.placeholder}
                    className="w-full rounded-lg border-2 border-soft-line bg-card px-2 py-1 text-center text-sm"
                  />
                </label>
                <button
                  onClick={() => {
                    setWho(id);
                    setEdited(null);
                    setCopied(false);
                  }}
                  aria-pressed={on}
                  className={`sketch-btn w-full px-3 py-2 font-display ${on ? "bg-primary text-white" : "bg-card"}`}
                >
                  Tell {id === "parent" ? "my parent" : id === "teacher" ? "my teacher" : "counsellor"}
                </button>
              </div>
            );
          })}
        </div>
      </fieldset>

      <section className="sketch grid gap-3 bg-card p-4">
        <label htmlFor="msg" className="text-sm font-semibold text-muted">
          What I&apos;ll say (you can change it)
        </label>
        <textarea
          id="msg"
          rows={3}
          value={message}
          onChange={(e) => {
            setEdited(e.target.value);
            setCopied(false);
          }}
          className="w-full resize-y rounded-xl border-2 border-soft-line bg-bg px-3 py-2 text-lg"
        />
        <div className="flex flex-wrap items-center gap-3">
          <PrimaryButton onClick={shareOrCopy} className="!py-2 !text-base">
            {copied ? "Copied! ✅" : "Share or copy message"}
          </PrimaryButton>
          <span className="text-sm text-muted">
            You can also just show this screen to {whoName}. Mindora never sends anything by itself.
          </span>
        </div>
      </section>

      {!urgent && <Helplines />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <GhostLink href="/">Not right now</GhostLink>
        <p className="text-sm text-muted">Only the grown-up you pick will see this.</p>
      </div>
    </div>
  );
}

function Helplines({ urgent = false }: { urgent?: boolean }) {
  return (
    <section className="sketch grid gap-3 p-4" style={{ background: urgent ? "var(--rose)" : "var(--mint)" }}>
      <h2 className="font-display text-xl">{urgent ? "Talk to someone now 📞" : "Free helplines, any time 📞"}</h2>
      <ul className="grid gap-2 sm:grid-cols-3">
        {HELPLINES.map((h) => (
          <li key={h.phone}>
            <a href={`tel:${h.phone}`} className="sketch-btn block bg-card px-4 py-3">
              <span className="font-display text-lg">
                {h.name} · <span className="tabular-nums">{h.phone}</span>
              </span>
              <span className="block text-sm text-muted">{h.detail}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="text-xs text-ink/70">Outside India? Please call your local emergency number or a trusted adult.</p>
    </section>
  );
}

function lowerFirst(s: string) {
  return /^I\b/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1);
}
