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

1. Create a Supabase project and run `supabase/migrations/20261019000000_mindora_schema.sql`
   in the SQL Editor.
2. In Supabase **Authentication → URL Configuration**, add `http://localhost:3000/auth/confirm`
   (and your production URL + `/auth/confirm`) to the redirect URLs.
3. Copy `.env.example` to `.env.local` and fill in the Supabase URL, publishable key and
   `AI_GATEWAY_API_KEY`.

```bash
pnpm install
pnpm dev
```

Without an AI Gateway key every AI feature falls back to built-in rules.

## Safety and privacy

- Worrying messages are caught by fixed rules (`lib/safety.ts`) before any AI call, and always
  lead to the grown-up/helpline screen.
- Accounts use Supabase Auth (email + password). Check-ins, profile and "good things" live in
  Supabase with row-level security, so each user can only read their own rows. Today's buddy chat
  stays on the device. "Delete all my data" (garden page) removes the rows from Supabase.
- The AI routes only answer signed-in users.
- Patterns are computed by `lib/insights.ts`; the AI only rewrites them in friendly words.
