import { generateText, Output } from "ai";
import { currentUserId } from "@/lib/supabase/server";
import { z } from "zod";
import { aiAvailable, BASE_RULES, checkInSchema, describeCheckIn, MODEL } from "@/lib/ai";
import { ACTIVITIES } from "@/lib/data";
import { findConcern, findPatterns, suggestActivities } from "@/lib/insights";
import type { CheckIn } from "@/lib/store";

const bodySchema = z.object({
  checkins: z.array(checkInSchema).min(1).max(60),
  name: z.string().max(40),
  buddyName: z.string().max(40),
});

const notesSchema = z.object({
  summary: z.string().describe("2–3 friendly sentences explaining the user's patterns in simple words."),
  tips: z.array(z.string()).max(3).describe("Up to 3 short, personalised self-care tips based on their data."),
});

export async function POST(req: Request) {
  if (!(await currentUserId())) return Response.json({ error: "Please log in" }, { status: 401 });
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });
  const { checkins, name, buddyName } = parsed.data;

  const asCheckIns = checkins.map((c, i) => ({ ...c, id: String(i), createdAt: i })) as CheckIn[];
  const patterns = findPatterns(asCheckIns);
  const concern = findConcern(asCheckIns);
  const activities = suggestActivities(asCheckIns).map((id) => ACTIVITIES[id].title);

  if (aiAvailable()) {
    try {
      const { output } = await generateText({
        model: MODEL,
        system: `${BASE_RULES}\n\nYou are ${buddyName}. Write notes for ${name} about their recent check-ins. Talk directly to them ("you"). Be encouraging and specific to their data. Suggest from these activities when helpful: ${activities.join(", ")}, or a sleep routine.${
          concern.level === "watch"
            ? " Hard days have been repeating, so include one gentle line encouraging them to talk to a trusted grown-up."
            : ""
        }`,
        prompt: [
          "Check-ins (oldest first):",
          ...checkins.map(describeCheckIn),
          "",
          "Patterns already found by the app:",
          ...(patterns.length ? patterns.map((p) => `- ${p.text}`) : ["- none yet"]),
        ].join("\n"),
        output: Output.object({ schema: notesSchema }),
        maxOutputTokens: 400,
      });
      return Response.json({ ...output, source: "ai" });
    } catch (err) {
      console.error("[insights] AI failed, using fallback", err);
    }
  }

  const last = checkins[checkins.length - 1];
  const summary = patterns.length
    ? `Here's what I noticed, ${name}: ${patterns
        .slice(0, 2)
        .map((p) => p.text.charAt(0).toLowerCase() + p.text.slice(1))
        .join(" Also, ")}`
    : `You've checked in ${checkins.length} times, ${name}. Keep going and I'll spot more patterns soon!`;
  const tips = [
    last.sleepHours < 7 ? "Try the Sleep wind-down tonight. Aim for 8+ hours." : null,
    last.stress >= 4 ? "Take a 2-minute Box breathing break when stress feels big." : null,
    `Today's pick for you: ${activities[0]}.`,
    concern.level === "watch" ? "Hard days keep coming back. Telling a grown-up you trust can really help." : null,
  ].filter((t): t is string => Boolean(t));

  return Response.json({ summary, tips: tips.slice(0, 3), source: "rules" });
}
