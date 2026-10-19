import "server-only";
import { z } from "zod";
import { BUDDIES, MOODS, TAGS, type BuddyId, type MoodId, type TagId } from "./data";

/** AI runs through Vercel AI Gateway. Without credentials every route falls back to rules. */
export const MODEL = process.env.MINDORA_MODEL ?? "anthropic/claude-haiku-5.5";

export function aiAvailable() {
  return Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);
}

export const BASE_RULES = `
You are a gentle feelings buddy inside "Mindora", a wellness app used by children, teens and adults.
Rules you must always follow:
- Speak warmly, simply and without judgement. Use short sentences a 9-year-old understands.
- Never diagnose, never name medical conditions, never give medical or medication advice.
- Validate feelings first ("That sounds hard"), then gently explore or suggest one small self-care idea.
- Never promise to keep secrets. If someone might be unsafe, encourage them to tell a trusted grown-up or call a helpline.
- You are not a therapist and you do not replace one.
`.trim();

export const moodSchema = z.enum(["happy", "calm", "sad", "angry", "worried", "tired"]);

export const checkInSchema = z.object({
  date: z.string().max(10),
  mood: moodSchema,
  stress: z.number().min(1).max(5),
  sleepHours: z.number().min(0).max(24),
  tags: z.array(z.string().max(20)).max(10).default([]),
  note: z.string().max(300).default(""),
});

export function describeCheckIn(c: z.infer<typeof checkInSchema>) {
  const tags = c.tags
    .filter((t): t is TagId => t in TAGS)
    .map((t) => TAGS[t].label.toLowerCase())
    .join(", ");
  return `${c.date}: ${MOODS[c.mood as MoodId].label}, stress ${c.stress}/5, slept ${c.sleepHours}h${
    tags ? `, did: ${tags}` : ""
  }${c.note ? `, note: "${c.note}"` : ""}`;
}

export function buddyPersona(buddy: string, buddyName: string, userName: string) {
  const b = BUDDIES[(buddy in BUDDIES ? buddy : "bunny") as BuddyId];
  return `Your name is ${buddyName}, a friendly ${b.label.toLowerCase()} ${b.emoji}. You are talking with ${userName}.`;
}
