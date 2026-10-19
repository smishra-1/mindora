# Mindora — Mental Health Monitor

A friendly, private wellness app: record mood, stress and sleep each day, see patterns in a
"Feelings Garden", get personalised self-care ideas, and get gently guided to a trusted grown-up
or helpline when things look hard. Mindora is a wellness tool and does not replace medical advice.

## Screens

1. **Meet your buddy** (`/`): pick Bear, Fox, Bunny or Dragon and name them.
2. **How are you today?** (`/checkin`): feeling, own words (AI guesses the mood), stress, sleep, what happened.
3. **Chat with buddy** (`/chat`): kind, short replies with quick-reply chips.
4. **Feeling Helper** (`/helper`): guided breathing, grounding, stretches, 3 good things.
5. **My Feelings Garden** (`/garden`): one flower per check-in, patterns, AI notes, Chart.js mood/stress/sleep chart.
6. **Talk to a grown-up** (`/grown-up`): editable message for a teacher, parent or counsellor, plus helplines.

## Running

```bash
pnpm install
pnpm dev
```

Copy `.env.example` to `.env.local` and add an `AI_GATEWAY_API_KEY` to turn on AI. Without it every
AI feature falls back to built-in rules, so the app works offline.

## Safety and privacy

- Worrying messages are caught by fixed rules (`lib/safety.ts`) before any AI call, and always
  lead to the grown-up/helpline screen.
- Check-ins are stored only in the browser (`localStorage`). "Delete all my data" is on the garden page.
- Patterns are computed by `lib/insights.ts`; the AI only rewrites them in friendly words.
