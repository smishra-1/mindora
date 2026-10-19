// Deterministic safety checks. These never depend on the AI model so a
// worrying message is always handled the same way, even when AI is offline.

const CRISIS_PATTERNS = [
  /\bkill (myself|me)\b/i,
  /\bsuicid/i,
  /\bwant(ed)? to die\b/i,
  /\bend (it all|my life)\b/i,
  /\bhurt(ing)? myself\b/i,
  /\bself[- ]?harm/i,
  /\bcut(ting)? myself\b/i,
  /\bno reason to live\b/i,
  /\bbetter off (dead|without me)\b/i,
  /\bdon'?t want to (be alive|live|wake up)\b/i,
];

const HARM_FROM_OTHERS = [
  /\b(hits?|hitting|beats?|beating|touch(es|ed)?) me\b/i,
  /\bsomeone (is )?hurt(ing|s)? me\b/i,
  /\bnot safe at home\b/i,
  /\bscared to go home\b/i,
];

export type SafetyFlag = "none" | "crisis";

export function checkSafety(text: string): SafetyFlag {
  if (!text) return "none";
  if (CRISIS_PATTERNS.some((r) => r.test(text))) return "crisis";
  if (HARM_FROM_OTHERS.some((r) => r.test(text))) return "crisis";
  return "none";
}

export const CRISIS_REPLY =
  "Thank you for telling me. That sounds really heavy, and you deserve help from a real person right now. Please tell a grown-up you trust, or call one of the helplines — they are kind and free. You are not in trouble.";
