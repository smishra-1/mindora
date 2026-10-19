"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { PrimaryButton } from "./ui";

export function AuthForm({ mode, confirmFailed = false }: { mode: "login" | "signup"; confirmFailed?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    confirmFailed ? "That confirmation link didn't work. Try logging in, or sign up again." : null,
  );
  const [sentTo, setSentTo] = useState<string | null>(null);
  const isSignup = mode === "signup";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = supabaseBrowser();
    if (isSignup) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${location.origin}/auth/confirm` },
      });
      if (error) setError(friendly(error.message));
      else if (data.session) router.replace("/");
      else setSentTo(email);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(friendly(error.message));
      else router.replace("/");
    }
    setBusy(false);
  }

  if (sentTo) {
    return (
      <Card>
        <span aria-hidden className="text-6xl">
          📬
        </span>
        <h1 className="font-display text-3xl font-semibold">Check your email</h1>
        <p className="text-muted">
          We sent a link to <strong className="text-ink">{sentTo}</strong>. Open it to finish signing up, then
          you&apos;ll meet your buddy!
        </p>
        <Link href="/login" className="font-bold text-primary underline">
          Back to log in
        </Link>
      </Card>
    );
  }

  return (
    <Card>
      <span aria-hidden className="text-6xl sway">
        🌱
      </span>
      <div>
        <h1 className="font-display text-3xl font-semibold">{isSignup ? "Join Mindora" : "Welcome back!"}</h1>
        <p className="text-muted">
          {isSignup
            ? "Make an account so your feelings garden is saved safely. Ask a grown-up to help if you need."
            : "Log in to see your buddy and your feelings garden."}
        </p>
      </div>
      <form onSubmit={submit} className="grid w-full gap-3 text-left">
        <label className="grid gap-1">
          <span className="font-display text-lg">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="sketch bg-card px-4 py-3"
          />
        </label>
        <label className="grid gap-1">
          <span className="font-display text-lg">Password</span>
          <input
            type="password"
            required
            minLength={6}
            autoComplete={isSignup ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="sketch bg-card px-4 py-3"
          />
          {isSignup && <span className="text-xs text-muted">At least 6 characters.</span>}
        </label>
        {error && (
          <p role="alert" className="rounded-xl border-2 border-line bg-rose px-3 py-2 text-sm font-semibold">
            {error}
          </p>
        )}
        <PrimaryButton type="submit" disabled={busy}>
          {busy ? "One moment…" : isSignup ? "Sign up 🌻" : "Log in 👋"}
        </PrimaryButton>
      </form>
      <p className="text-sm text-muted">
        {isSignup ? "Already have an account? " : "New here? "}
        <Link href={isSignup ? "/login" : "/signup"} className="font-bold text-primary underline">
          {isSignup ? "Log in" : "Create an account"}
        </Link>
      </p>
      <p className="text-xs text-muted">🔒 Only you can see your check-ins.</p>
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="pop-in sketch mx-auto mt-4 grid max-w-md justify-items-center gap-4 bg-card p-6 text-center sm:p-8">
      {children}
    </div>
  );
}

function friendly(message: string) {
  if (/invalid login credentials/i.test(message)) return "That email or password doesn't match. Try again?";
  if (/email not confirmed/i.test(message)) return "Please open the link in your email first, then log in.";
  if (/already registered/i.test(message)) return "That email already has an account. Try logging in.";
  if (/rate limit/i.test(message)) return "Too many tries. Please wait a minute and try again.";
  return message;
}
