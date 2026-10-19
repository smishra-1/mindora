import { generateText, Output } from "ai";
import { z } from "zod";
import { aiAvailable, BASE_RULES, buddyPersona, checkInSchema, describeCheckIn, MODEL } from "@/lib/ai";
import { MOODS } from "@/lib/data";
import { checkSafety, CRISIS_REPLY } from "@/lib/safety";

const bodySchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(1000) }))
    .min(1)
    .max(20),
  profile: z.object({
    name: z.string().max(40),
    buddyName: z.string().max(40),
    buddy: z.string().max(20),
  }),
  checkin: checkInSchema.optional(),
});

const replySchema = z.object({
  reply: z.string().describe("Your reply: 1–3 short, warm sentences."),
  quickReplies: z
    .array(z.string())
    .max(3)
    .describe("Up to 3 short things the user might tap to reply (max 5 words each), written as the user."),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });
  const { messages, profile, checkin } = parsed.data;

  // Safety first, independent of the model
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  if (checkSafety(lastUser) === "crisis") {
    return Response.json({ reply: CRISIS_REPLY, quickReplies: [], crisis: true });
  }

  if (aiAvailable()) {
    try {
      const { output } = await generateText({
        model: MODEL,
        system: [
          BASE_RULES,
          buddyPersona(profile.buddy, profile.buddyName, profile.name),
          checkin ? `Today's check-in: ${describeCheckIn(checkin)}.` : "",
          "Keep the chat about feelings. After 3–4 exchanges, gently offer a calming activity (the user can tap 'Help me feel better') or suggest telling a grown-up if things sound hard.",
        ].join("\n\n"),
        messages,
        output: Output.object({ schema: replySchema }),
        maxOutputTokens: 300,
      });
      return Response.json({ ...output, crisis: false, source: "ai" });
    } catch (err) {
      console.error("[chat] AI failed, using fallback", err);
    }
  }

  return Response.json({ ...fallbackReply(messages.filter((m) => m.role === "user").length, checkin?.mood), crisis: false, source: "rules" });
}

function fallbackReply(turn: number, mood?: keyof typeof MOODS) {
  const positive = mood === "happy" || mood === "calm";
  if (turn <= 1)
    return positive
      ? { reply: "That's lovely! What was the best part?", quickReplies: ["Being with friends", "Playing", "I'm not sure"] }
      : { reply: "That sounds hard. Want to tell me more?", quickReplies: ["Yes, I'll tell you", "I feel lonely", "Not right now"] };
  if (turn === 2)
    return {
      reply: positive
        ? "I love hearing that. Remembering good moments helps on harder days."
        : "Thank you for sharing that with me. Your feelings make sense. How does your body feel right now?",
      quickReplies: positive ? ["Help me feel better", "Thanks!"] : ["Tight and heavy", "Tired", "A bit better"],
    };
  return {
    reply: positive
      ? "Want to try '3 good things' to save this feeling?"
      : "I'm proud of you for talking about it. Would a calming activity help? Or you could tell a grown-up you trust.",
    quickReplies: ["Help me feel better", "Not right now"],
  };
}
