"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MOODS } from "@/lib/data";
import { checkSafety } from "@/lib/safety";
import { setChat, today, todaysCheckIn, type ChatMessage, type CheckIn } from "@/lib/store";
import { BuddyAvatar, GhostLink, PrimaryLink, RequireProfile, SpeechBubble, type ReadyState } from "./ui";

const REASSURE: Record<string, string> = {
  happy: "Yay! Happy days are worth remembering.",
  calm: "Calm is a lovely feeling. Enjoy it.",
  sad: "It's okay to feel sad. I'm right here with you.",
  angry: "Angry feelings are allowed. Let's cool down together.",
  worried: "Worries feel big, but you're not alone with them.",
  tired: "Rest is important. Be gentle with yourself today.",
};

export function BuddyChat() {
  return <RequireProfile>{(state) => <Chat state={state} />}</RequireProfile>;
}

function openingLine(c: CheckIn) {
  const m = MOODS[c.mood].label.toLowerCase();
  if (c.mood === "happy" || c.mood === "calm")
    return `Thanks for telling me. You feel ${m}! ${MOODS[c.mood].emoji} What made today good?`;
  return `Thanks for telling me. You feel ${m}. 💙 What happened today?`;
}

function Chat({ state }: { state: ReadyState }) {
  const router = useRouter();
  const { profile } = state;
  const checkin = todaysCheckIn(state);
  const stored = state.chat.date === today() ? state.chat.messages : [];
  const messages: ChatMessage[] =
    stored.length > 0 || !checkin ? stored : [{ role: "assistant", content: openingLine(checkin) }];

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [quick, setQuick] = useState<string[]>(() =>
    checkin?.note ? [checkin.note] : ["Yes, I'll tell you", "I don't know", "Not right now"],
  );
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages.length, busy]);

  function save(msgs: ChatMessage[]) {
    setChat(msgs);
  }

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    const next: ChatMessage[] = [...messages, { role: "user", content }];
    save(next);
    setInput("");
    setQuick([]);

    if (content.toLowerCase() === "not right now") {
      save([
        ...next,
        { role: "assistant", content: "That's okay. I'm here whenever you want to talk. 💜" },
      ]);
      setQuick(["Help me feel better"]);
      return;
    }
    if (content.toLowerCase() === "help me feel better") {
      router.push("/helper");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: next.slice(-12),
          profile: { name: profile.name, buddyName: profile.buddyName, buddy: profile.buddy },
          checkin,
        }),
      });
      const data = (await res.json()) as { reply: string; quickReplies?: string[]; crisis?: boolean };
      save([...next, { role: "assistant", content: data.reply }]);
      setQuick(data.crisis ? [] : (data.quickReplies ?? []).slice(0, 3));
      if (data.crisis) router.push("/grown-up?urgent=1");
    } catch {
      const crisis = checkSafety(content) === "crisis";
      save([
        ...next,
        {
          role: "assistant",
          content: crisis
            ? "Please talk to a grown-up you trust right now. You are not in trouble."
            : "I'm listening. Can you tell me a little more?",
        },
      ]);
      if (crisis) router.push("/grown-up?urgent=1");
    } finally {
      setBusy(false);
    }
  }

  if (!checkin) {
    return (
      <div className="pop-in mx-auto grid max-w-lg justify-items-center gap-4 text-center">
        <BuddyAvatar profile={profile} size={110} />
        <SpeechBubble>Let&apos;s do today&apos;s check-in first, then we can chat!</SpeechBubble>
        <PrimaryLink href="/checkin">Check in 🌤️</PrimaryLink>
      </div>
    );
  }

  const mood = MOODS[checkin.mood];

  return (
    <div className="pop-in grid gap-5 lg:grid-cols-[1fr_260px]">
      <section aria-label={`Chat with ${profile.buddyName}`} className="sketch flex min-h-[60vh] flex-col bg-card">
        <header className="flex items-center gap-3 border-b-2 border-soft-line px-4 py-3">
          <BuddyAvatar profile={profile} size={44} />
          <div>
            <p className="font-display text-lg leading-tight">{profile.buddyName}</p>
            <p className="text-xs text-muted">{busy ? "is thinking…" : "is listening…"}</p>
          </div>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
          {messages.map((m, i) =>
            m.role === "assistant" ? (
              <div key={i} className="pop-in flex items-start gap-2">
                <BuddyAvatar profile={profile} size={34} />
                <p className="max-w-[80%] rounded-2xl rounded-tl-sm border-2 border-line bg-bg px-4 py-2.5">
                  {m.content}
                </p>
              </div>
            ) : (
              <div key={i} className="pop-in flex justify-end">
                <p className="max-w-[80%] rounded-2xl rounded-tr-sm border-2 border-line bg-lilac px-4 py-2.5">
                  {m.content}
                </p>
              </div>
            ),
          )}
          {busy && (
            <div className="flex items-center gap-2 text-muted">
              <BuddyAvatar profile={profile} size={34} />
              <span className="animate-pulse text-2xl tracking-widest">···</span>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {quick.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pb-3">
            {quick.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="sketch-btn max-w-full truncate bg-sun px-3 py-1.5 text-sm font-bold"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-2 border-t-2 border-soft-line p-3"
        >
          <label htmlFor="chat-input" className="sr-only">
            Message {profile.buddyName}
          </label>
          <input
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Type to ${profile.buddyName}…`}
            maxLength={500}
            autoComplete="off"
            className="sketch min-w-0 flex-1 bg-card px-4 py-2.5"
          />
          <button type="submit" disabled={!input.trim() || busy} className="sketch-btn bg-primary px-4 font-display text-white">
            Send
          </button>
        </form>
      </section>

      <aside className="grid content-start gap-4">
        <div className="sketch grid justify-items-center gap-1 py-5" style={{ background: mood.bg }}>
          <p className="text-sm font-semibold text-ink/60">Today you feel</p>
          <span aria-hidden className="text-5xl">
            {mood.emoji}
          </span>
          <p className="font-display text-2xl">{mood.label}</p>
        </div>
        <p className="sketch bg-sun px-4 py-3 text-sm font-semibold">💛 {REASSURE[checkin.mood]}</p>
        <PrimaryLink href="/helper">Help me feel better ›</PrimaryLink>
        <GhostLink href="/grown-up">💛 Tell a grown-up</GhostLink>
      </aside>
    </div>
  );
}
