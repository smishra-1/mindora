import { generateText, Output } from "ai";
import { z } from "zod";
import { aiAvailable, BASE_RULES, MODEL, moodSchema } from "@/lib/ai";
import { guessMood } from "@/lib/insights";

const bodySchema = z.object({ text: z.string().min(1).max(300) });

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });
  const { text } = parsed.data;

  if (aiAvailable()) {
    try {
      const { output } = await generateText({
        model: MODEL,
        system: `${BASE_RULES}\n\nPick the one feeling that best matches what the user wrote.`,
        prompt: text,
        output: Output.choice({ options: moodSchema.options }),
        maxOutputTokens: 20,
      });
      return Response.json({ mood: output, source: "ai" });
    } catch (err) {
      console.error("[guess] AI failed, using fallback", err);
    }
  }
  return Response.json({ mood: guessMood(text), source: "rules" });
}
