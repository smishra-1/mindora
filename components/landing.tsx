import Link from "next/link";
import { BUDDIES, MOOD_ORDER, MOODS, type BuddyId } from "@/lib/data";
import { GhostLink, PrimaryLink } from "./ui";

/** Public marketing page shown at "/" to signed-out visitors. Server component, no client JS. */
export function Landing() {
  return (
    <div className="grid gap-20 sm:gap-28">
      <Hero />
      <HowItWorks />
      <Features />
      <GrownUps />
      <FinalCta />
    </div>
  );
}

function Hero() {
  return (
    <section className="grid items-center gap-10 pt-4 sm:pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
      <div className="pop-in">
        <p className="sketch-btn mb-5 inline-flex items-center gap-2 bg-sun px-3.5 py-1.5 text-sm font-extrabold shadow-none">
          <span aria-hidden>🌱</span> A gentle place for big feelings
        </p>
        <h1 className="font-display text-5xl font-semibold leading-[1.05] sm:text-6xl">
          Every feeling has a <span className="whitespace-nowrap text-primary">friend</span> in{" "}
          <span className="relative whitespace-nowrap">
            Mindora
            <svg aria-hidden viewBox="0 0 200 12" preserveAspectRatio="none" className="absolute -bottom-1 left-0 h-2.5 w-full text-grass">
              <path d="M2 8C40 2 80 12 120 6S180 4 198 7" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
            </svg>
          </span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
          Check in with a cuddly buddy once a day, notice how your moods and sleep change, and find kind little ideas
          for feeling better. No pressure, no scores, just you and your garden.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <PrimaryLink href="/signup" className="px-7 py-3.5 text-xl">
            Meet your buddy <span aria-hidden>🐻</span>
          </PrimaryLink>
          <GhostLink href="/login" className="px-5 py-3.5 text-lg">
            I have an account
          </GhostLink>
        </div>
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-sm font-bold text-muted">
          <li>✓ Free to start</li>
          <li>✓ Private to your account</li>
          <li>✓ Made for kids and teens</li>
        </ul>
      </div>
      <HeroCard />
    </section>
  );
}

/** A static, decorative preview of the daily check-in. */
function HeroCard() {
  return (
    <div aria-hidden className="pop-in relative mx-auto w-full max-w-md" style={{ animationDelay: "120ms" }}>
      <span className="float absolute -left-3 -top-6 z-10 text-5xl sm:-left-8">🦊</span>
      <span className="float absolute -right-2 top-1/3 z-10 text-4xl [animation-delay:-2s] sm:-right-7">🐰</span>
      <span className="float absolute -bottom-6 left-6 z-10 text-4xl [animation-delay:-4s]">🌻</span>

      <div className="sketch rotate-1 bg-card p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span
            className="sway grid size-16 shrink-0 place-items-center rounded-full border-2 border-line text-4xl"
            style={{ background: BUDDIES.bear.bg }}
          >
            {BUDDIES.bear.emoji}
          </span>
          <div className="sketch flex-1 bg-lilac px-4 py-3 font-display text-lg leading-snug">
            Hi Maya! How are you feeling today?
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2.5">
          {MOOD_ORDER.map((id) => {
            const m = MOODS[id];
            const picked = id === "calm";
            return (
              <div
                key={id}
                className={`sketch-btn relative flex flex-col items-center gap-0.5 py-3 ${picked ? "picked" : ""}`}
                style={{ background: m.bg }}
              >
                <span className="text-3xl">{m.emoji}</span>
                <span className="font-display text-sm">{m.label}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-2xl border-2 border-soft-line bg-bg px-4 py-3">
          <span className="font-display text-base">This week</span>
          <span className="flex items-end gap-1.5">
            {[3, 4, 2, 4, 5, 4, 5].map((h, i) => (
              <span
                key={i}
                className="w-3.5 rounded-t-md border-2 border-line"
                style={{ height: h * 7, background: i === 6 ? "var(--primary)" : "var(--mint)" }}
              />
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}

const STEPS = [
  {
    emoji: "🐾",
    bg: "var(--peach)",
    title: "Pick your buddy",
    body: "Choose a bear, fox, bunny or dragon, and give them a name. They'll be with you every step.",
  },
  {
    emoji: "🌤️",
    bg: "var(--sun)",
    title: "Check in each day",
    body: "Tap how you feel, how stressed you are and how you slept. It takes less than a minute.",
  },
  {
    emoji: "🌻",
    bg: "var(--mint)",
    title: "Watch your garden grow",
    body: "Every check-in plants something new, and your buddy spots patterns you might have missed.",
  },
];

function HowItWorks() {
  return (
    <section aria-labelledby="how-title">
      <SectionHead id="how-title" eyebrow="How it works" title="Three tiny steps, one happy habit" />
      <ol className="stagger grid gap-5 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="sketch relative bg-card p-6 pt-8">
            <span
              aria-hidden
              className="absolute -top-4 left-5 grid size-9 place-items-center rounded-full border-2 border-line bg-primary font-display text-lg text-white"
            >
              {i + 1}
            </span>
            <span
              aria-hidden
              className="grid size-16 place-items-center rounded-2xl border-2 border-line text-4xl"
              style={{ background: s.bg }}
            >
              {s.emoji}
            </span>
            <h3 className="mt-4 font-display text-2xl">{s.title}</h3>
            <p className="mt-1.5 leading-relaxed text-muted">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

const FEATURES = [
  {
    emoji: "💬",
    title: "Chat with your buddy",
    body: "Say what's on your mind and get a warm, careful reply. Your buddy listens first, and never judges.",
    bg: "var(--lilac)",
    span: "sm:col-span-2",
  },
  {
    emoji: "🎁",
    title: "Feeling helper",
    body: "Breathing games, tiny stretches and kind ideas picked for the way you feel right now.",
    bg: "var(--sun)",
    span: "",
  },
  {
    emoji: "🌻",
    title: "Feelings garden",
    body: "Look back on your days as flowers, and see which moods, sleep and activities go together.",
    bg: "var(--mint)",
    span: "",
  },
  {
    emoji: "💛",
    title: "Talk to a grown-up",
    body: "When something feels heavy, Mindora helps you find the words to tell a parent, teacher or counsellor.",
    bg: "var(--rose)",
    span: "sm:col-span-2",
  },
];

function Features() {
  return (
    <section aria-labelledby="features-title">
      <SectionHead
        id="features-title"
        eyebrow="Inside Mindora"
        title="Everything you need to feel a little lighter"
      />
      <div className="stagger grid gap-5 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <article key={f.title} className={`sketch flex items-start gap-4 p-6 ${f.span}`} style={{ background: f.bg }}>
            <span aria-hidden className="text-5xl">
              {f.emoji}
            </span>
            <div>
              <h3 className="font-display text-2xl">{f.title}</h3>
              <p className="mt-1.5 leading-relaxed text-ink/75">{f.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function GrownUps() {
  const points = [
    { emoji: "🔒", title: "Private by design", body: "Check-ins belong to the child's account. Nothing is shared unless they choose to." },
    { emoji: "🛟", title: "Safety built in", body: "If a message sounds worrying, Mindora gently points to a trusted adult and free helplines." },
    { emoji: "🧭", title: "Support, not diagnosis", body: "Mindora spots patterns and offers ideas. It never labels anyone, and it isn't a replacement for professional care." },
  ];
  return (
    <section aria-labelledby="grownups-title" className="sketch bg-card p-6 sm:p-10">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
        <div>
          <p className="font-display text-lg text-primary">For parents and teachers</p>
          <h2 id="grownups-title" className="mt-1 font-display text-3xl font-semibold leading-tight sm:text-4xl">
            A kind, careful space for young minds
          </h2>
          <p className="mt-3 leading-relaxed text-muted">
            Building the habit of naming feelings early makes the hard conversations easier later.
          </p>
        </div>
        <ul className="grid gap-4">
          {points.map((p) => (
            <li key={p.title} className="flex gap-4 rounded-2xl border-2 border-soft-line bg-bg p-4">
              <span aria-hidden className="text-3xl">
                {p.emoji}
              </span>
              <div>
                <h3 className="font-display text-xl">{p.title}</h3>
                <p className="mt-0.5 leading-relaxed text-muted">{p.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FinalCta() {
  const buddies = Object.keys(BUDDIES) as BuddyId[];
  return (
    <section aria-labelledby="cta-title" className="sketch bg-lilac px-6 py-12 text-center sm:py-16">
      <div aria-hidden className="mb-5 flex justify-center -space-x-2">
        {buddies.map((id) => (
          <span
            key={id}
            className="grid size-16 place-items-center rounded-full border-2 border-line text-3xl first:-rotate-6 last:rotate-6"
            style={{ background: BUDDIES[id].bg }}
          >
            {BUDDIES[id].emoji}
          </span>
        ))}
      </div>
      <h2 id="cta-title" className="font-display text-4xl font-semibold sm:text-5xl">
        Ready to meet your buddy?
      </h2>
      <p className="mx-auto mt-3 max-w-md text-lg text-ink/75">It&apos;s free, it&apos;s quick, and it&apos;s all yours.</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <PrimaryLink href="/signup" className="px-7 py-3.5 text-xl">
          Get started 🌱
        </PrimaryLink>
        <Link
          href="/login"
          className="sketch-btn inline-flex items-center justify-center bg-card px-5 py-3.5 font-display text-lg font-medium"
        >
          Log in
        </Link>
      </div>
    </section>
  );
}

function SectionHead({ id, eyebrow, title }: { id: string; eyebrow: string; title: string }) {
  return (
    <div className="mb-9 text-center">
      <p className="font-display text-lg text-primary">{eyebrow}</p>
      <h2 id={id} className="mx-auto mt-1 max-w-2xl font-display text-3xl font-semibold leading-tight sm:text-4xl">
        {title}
      </h2>
    </div>
  );
}
