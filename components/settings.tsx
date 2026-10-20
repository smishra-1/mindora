"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { BUDDIES, GROWN_UPS, type GrownUpId } from "@/lib/data";
import { deleteAllData, saveProfile, signOut, type Profile } from "@/lib/store";
import { BuddyAvatar, BuddyPicker, PageTitle, PrimaryButton, RequireProfile, SpeechBubble, type ReadyState } from "./ui";

export function Settings() {
  return <RequireProfile>{(state) => <SettingsForm state={state} />}</RequireProfile>;
}

function SettingsForm({ state }: { state: ReadyState }) {
  const saved = state.profile;
  const [draft, setDraft] = useState<Profile>(saved);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const buddyName = draft.buddyName.trim() || BUDDIES[draft.buddy].defaultName;
  const clean = (p: Profile): Profile => ({
    ...p,
    name: p.name.trim() || "friend",
    buddyName: p.buddyName.trim() || BUDDIES[p.buddy].defaultName,
    grownUps: Object.fromEntries(Object.entries(p.grownUps).map(([k, v]) => [k, v?.trim() ?? ""])),
  });
  const dirty = JSON.stringify(clean(draft)) !== JSON.stringify(clean(saved));

  // warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  function update(patch: Partial<Profile>) {
    setDraft((d) => ({ ...d, ...patch }));
    setJustSaved(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!dirty) return;
    setSaving(true);
    try {
      const next = clean(draft);
      await saveProfile(next);
      setDraft(next);
      setJustSaved(true);
    } catch {
      // the error banner explains what happened
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pop-in grid gap-6">
      <PageTitle sub="Make Mindora feel like yours. Changes save when you press the button.">
        Settings <span aria-hidden>⚙️</span>
      </PageTitle>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <form onSubmit={save} className="grid content-start gap-6">
          <Section title="About you" emoji="🙂">
            <label className="grid gap-1">
              <span className="font-semibold">What should {buddyName} call you?</span>
              <input
                value={draft.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="Your first name"
                maxLength={24}
                autoComplete="given-name"
                className="field px-4 py-3 text-lg"
              />
            </label>
          </Section>

          <Section id="buddy" title="Your buddy" emoji="🐾">
            <BuddyPicker value={draft.buddy} onChange={(buddy) => update({ buddy })} />
            <label className="grid gap-1">
              <span className="font-semibold">Buddy&apos;s name</span>
              <div className="flex gap-2">
                <input
                  value={draft.buddyName}
                  onChange={(e) => update({ buddyName: e.target.value })}
                  placeholder={BUDDIES[draft.buddy].defaultName}
                  maxLength={20}
                  className="field min-w-0 flex-1 px-4 py-3 font-display text-xl"
                />
                <button
                  type="button"
                  onClick={() => update({ buddyName: randomName(draft.buddyName) })}
                  className="sketch-btn shrink-0 bg-sun px-4 font-display"
                  title="Pick a random name"
                >
                  🎲 <span className="hidden sm:inline">Surprise me</span>
                  <span className="sr-only sm:hidden">Pick a random name</span>
                </button>
              </div>
            </label>
          </Section>

          <Section title="Your grown-ups" emoji="💛" sub="These names fill in your message on the Talk to a Grown-Up page.">
            <div className="grid gap-3 sm:grid-cols-3">
              {(Object.keys(GROWN_UPS) as GrownUpId[]).map((id) => (
                <label key={id} className="grid gap-1">
                  <span className="font-semibold">
                    <span aria-hidden>{GROWN_UPS[id].emoji}</span> {GROWN_UPS[id].label}
                  </span>
                  <input
                    value={draft.grownUps[id] ?? ""}
                    onChange={(e) => update({ grownUps: { ...draft.grownUps, [id]: e.target.value.slice(0, 40) } })}
                    placeholder={GROWN_UPS[id].placeholder}
                    className="field px-3 py-2.5"
                  />
                </label>
              ))}
            </div>
          </Section>

          <div className="sticky bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-10 flex flex-wrap items-center gap-3 rounded-2xl bg-bg/85 p-1 backdrop-blur sm:bottom-4">
            <PrimaryButton type="submit" disabled={!dirty || saving} className="w-full sm:w-auto">
              {saving ? "Saving…" : dirty ? "Save changes" : justSaved ? "Saved! ✅" : "All saved"}
            </PrimaryButton>
            {dirty && !saving && (
              <button type="button" onClick={() => setDraft(saved)} className="mx-auto px-2 text-sm font-bold text-muted underline sm:mx-0">
                Undo changes
              </button>
            )}
          </div>
        </form>

        <aside className="grid content-start gap-4 lg:sticky lg:top-24 lg:self-start">
          <Preview profile={{ ...draft, buddyName }} />
        </aside>
      </div>

      <Account email={state.email} />
      <DangerZone />
    </div>
  );
}

function Preview({ profile }: { profile: Profile }) {
  return (
    <section aria-label="Preview" className="sketch grid justify-items-center gap-3 bg-card p-5 text-center">
      <p className="text-xs font-bold uppercase tracking-wide text-muted">Preview</p>
      <span key={profile.buddy} className="pop-in">
        <BuddyAvatar profile={profile} size={110} />
      </span>
      <SpeechBubble className="w-full text-base">
        Hi {profile.name.trim() || "friend"}! I&apos;m {profile.buddyName}. 💜
      </SpeechBubble>
    </section>
  );
}

function Section({
  id,
  title,
  emoji,
  sub,
  children,
}: {
  id?: string;
  title: string;
  emoji: string;
  sub?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="sketch grid scroll-mt-24 gap-4 bg-card p-5">
      <div>
        <h2 className="font-display text-xl">
          <span aria-hidden>{emoji}</span> {title}
        </h2>
        {sub && <p className="text-sm text-muted">{sub}</p>}
      </div>
      {children}
    </section>
  );
}

function Account({ email }: { email: string }) {
  const router = useRouter();
  return (
    <Section title="Account" emoji="🔑">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted">Signed in as</p>
          <p className="font-bold">{email}</p>
        </div>
        <button
          onClick={async () => {
            await signOut();
            router.replace("/login");
          }}
          className="sketch-btn bg-card px-4 py-2 font-display"
        >
          Log out 👋
        </button>
      </div>
    </Section>
  );
}

function DangerZone() {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  return (
    <section id="data" className="grid scroll-mt-24 gap-3 rounded-[18px] border-2 border-dashed border-[#d2475b]/60 bg-card/70 p-5">
      <div>
        <h2 className="font-display text-xl">
          <span aria-hidden>🔒</span> Privacy & data
        </h2>
        <p className="text-sm text-muted">
          Your check-ins are saved to your private account. Only you can see them. Today&apos;s chat stays on this device.
        </p>
      </div>
      {confirming ? (
        <div role="alert" className="pop-in grid gap-3 rounded-xl border-2 border-line bg-rose p-3">
          <p className="font-semibold">Delete all your check-ins, good things and your buddy? This can&apos;t be undone.</p>
          <div className="flex flex-wrap gap-2">
            <button
              disabled={deleting}
              className="sketch-btn bg-card px-3 py-1.5 font-bold"
              onClick={async () => {
                setDeleting(true);
                try {
                  await deleteAllData();
                } finally {
                  setDeleting(false);
                }
              }}
            >
              {deleting ? "Deleting…" : "Yes, delete everything"}
            </button>
            <button className="rounded-xl px-3 py-1.5 font-bold underline" onClick={() => setConfirming(false)}>
              Keep my garden
            </button>
          </div>
        </div>
      ) : (
        <button className="sketch-btn justify-self-start bg-rose px-3 py-1.5 font-semibold" onClick={() => setConfirming(true)}>
          Delete all my data
        </button>
      )}
    </section>
  );
}

const FUN_NAMES = ["Pebble", "Biscuit", "Sunny", "Maple", "Pip", "Clover", "Noodle", "Juniper", "Mochi", "Twinkle", "Bean", "Skipper"];

function randomName(current: string) {
  const options = FUN_NAMES.filter((n) => n !== current);
  return options[Math.floor(Math.random() * options.length)];
}
