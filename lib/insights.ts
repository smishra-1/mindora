import {
  ACTIVITIES_FOR_MOOD,
  LOW_MOODS,
  MOODS,
  TAGS,
  type ActivityId,
  type MoodId,
  type TagId,
} from "./data";
import type { CheckIn } from "./store";

export type Pattern = {
  id: string;
  emoji: string;
  text: string;
  tone: "good" | "watch" | "info";
};

export type Concern = {
  level: "none" | "watch";
  reason: string;
};

const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
const score = (c: CheckIn) => MOODS[c.mood].score;
const WEEKDAYS = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"];

/** Plain-language patterns found in the user's own check-ins. */
export function findPatterns(checkins: CheckIn[]): Pattern[] {
  const out: Pattern[] = [];
  if (checkins.length < 4) return out;

  // Sleep vs mood and stress
  const short = checkins.filter((c) => c.sleepHours < 7);
  const good = checkins.filter((c) => c.sleepHours >= 7);
  if (short.length >= 2 && good.length >= 2) {
    const moodGap = avg(good.map(score)) - avg(short.map(score));
    const stressGap = avg(short.map((c) => c.stress)) - avg(good.map((c) => c.stress));
    if (moodGap >= 0.7 || stressGap >= 0.7) {
      out.push({
        id: "sleep",
        emoji: "😴",
        tone: "watch",
        text:
          stressGap >= moodGap
            ? "When you sleep less than 7 hours, your stress goes up the next day. Sleep helps!"
            : "You feel better on days after 7+ hours of sleep. Sleep helps!",
      });
    }
  }

  // Activities linked to higher mood or higher stress
  const tagIds = Object.keys(TAGS) as TagId[];
  let bestMood: { tag: TagId; gap: number } | null = null;
  let worstStress: { tag: TagId; gap: number } | null = null;
  for (const tag of tagIds) {
    const withTag = checkins.filter((c) => c.tags.includes(tag));
    const without = checkins.filter((c) => !c.tags.includes(tag));
    if (withTag.length < 2 || without.length < 2) continue;
    const moodGap = avg(withTag.map(score)) - avg(without.map(score));
    const stressGap = avg(withTag.map((c) => c.stress)) - avg(without.map((c) => c.stress));
    if (moodGap >= 0.8 && (!bestMood || moodGap > bestMood.gap)) bestMood = { tag, gap: moodGap };
    if (stressGap >= 0.8 && (!worstStress || stressGap > worstStress.gap))
      worstStress = { tag, gap: stressGap };
  }
  if (bestMood) {
    out.push({
      id: "best-tag",
      emoji: TAGS[bestMood.tag].emoji,
      tone: "good",
      text: `You feel happier on days with ${TAGS[bestMood.tag].label.toLowerCase()}.`,
    });
  }
  if (worstStress) {
    out.push({
      id: "stress-tag",
      emoji: TAGS[worstStress.tag].emoji,
      tone: "watch",
      text: `Your stress rises on days with ${TAGS[worstStress.tag].label.toLowerCase()}. A breathing break can help.`,
    });
  }

  // Hardest day of the week
  if (checkins.length >= 8) {
    const byDay = new Map<number, number[]>();
    for (const c of checkins) {
      const d = new Date(c.date + "T12:00:00").getDay();
      byDay.set(d, [...(byDay.get(d) ?? []), score(c)]);
    }
    const overall = avg(checkins.map(score));
    let lowest: { day: number; v: number } | null = null;
    for (const [day, xs] of byDay) {
      if (xs.length < 2) continue;
      const v = avg(xs);
      if (!lowest || v < lowest.v) lowest = { day, v };
    }
    if (lowest && overall - lowest.v >= 1) {
      out.push({
        id: "weekday",
        emoji: "📅",
        tone: "info",
        text: `${WEEKDAYS[lowest.day]} tend to feel harder. Plan something nice for that day.`,
      });
    }
  }

  // Stress trend: this week vs last week
  if (checkins.length >= 8) {
    const recent = checkins.slice(-4).map((c) => c.stress);
    const before = checkins.slice(-8, -4).map((c) => c.stress);
    const diff = avg(recent) - avg(before);
    if (diff >= 0.75)
      out.push({ id: "trend-up", emoji: "📈", tone: "watch", text: "Your stress has been climbing lately." });
    if (diff <= -0.75)
      out.push({ id: "trend-down", emoji: "🌈", tone: "good", text: "Your stress is going down. Nice work!" });
  }

  return out;
}

/** Gentle nudge to talk to a grown-up when hard days keep repeating. */
export function findConcern(checkins: CheckIn[]): Concern {
  const recent = checkins.slice(-5);
  if (recent.length < 3) return { level: "none", reason: "" };
  const low = recent.filter((c) => LOW_MOODS.includes(c.mood));
  const stressed = recent.filter((c) => c.stress >= 4);
  if (low.length >= 3) {
    const common = mostCommon(low.map((c) => c.mood));
    return {
      level: "watch",
      reason: `I noticed you've felt ${MOODS[common].label.toLowerCase()} a few days.`,
    };
  }
  if (stressed.length >= 3) {
    return { level: "watch", reason: "I noticed your stress has been high a few days." };
  }
  return { level: "none", reason: "" };
}

export function suggestActivities(checkins: CheckIn[], mood?: MoodId): ActivityId[] {
  const last = checkins[checkins.length - 1];
  const m = mood ?? last?.mood ?? "calm";
  const picks = [...ACTIVITIES_FOR_MOOD[m]];
  if (last && last.sleepHours < 7 && !picks.includes("wind-down")) picks.splice(1, 0, "wind-down");
  if (last && last.stress >= 4 && !picks.includes("box-breathing")) picks.splice(1, 0, "box-breathing");
  return picks.slice(0, 4);
}

function mostCommon<T>(xs: T[]): T {
  const counts = new Map<T, number>();
  xs.forEach((x) => counts.set(x, (counts.get(x) ?? 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

/** Keyword fallback for "tell me in your own words". */
export function guessMood(text: string): MoodId | null {
  const t = text.toLowerCase();
  const rules: [MoodId, RegExp][] = [
    ["sad", /\b(sad|cry|cried|crying|lonely|alone|left out|miss|upset|nobody|hurt)\b/],
    ["angry", /\b(angry|mad|furious|annoyed|unfair|hate|shouted|yelled)\b/],
    ["worried", /\b(worried|scared|nervous|anxious|afraid|exam|test|stress|panic)\b/],
    ["tired", /\b(tired|sleepy|exhausted|no energy|bored|didn'?t sleep)\b/],
    ["happy", /\b(happy|great|fun|excited|awesome|won|love|amazing|good day)\b/],
    ["calm", /\b(calm|okay|fine|relaxed|peaceful|chill)\b/],
  ];
  return rules.find(([, r]) => r.test(t))?.[0] ?? null;
}
