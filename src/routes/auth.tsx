import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BellRing, CloudCheck, LogOut, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { PageTitle, btnPrimary, btnSecondary, field } from "@/components/AppShell";
import { getSyncState, onSyncState, syncNow, type SyncState } from "@/lib/sync";
import { enablePush, pushEnabledHere, type PushResult } from "@/lib/push";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Account & sync · Hatch & Flock" },
      { name: "description", content: "Sign in to back up your batches and get reminders even when the app is closed." },
      { property: "og:title", content: "Account & sync · Hatch & Flock" },
      { property: "og:description", content: "Sign in to back up your batches and get reminders even when the app is closed." },
    ],
  }),
  component: AuthPage,
});

const pushMessages: Record<Exclude<PushResult["status"], "registered">, string> = {
  "not-configured": "Reminders aren't set up yet.",
  unsupported: "This browser can't receive reminders. On iPhone, add the app to your Home Screen first.",
  "open-in-new-tab": "Open the app in its own tab (or the published app) to turn on reminders.",
  denied: "Notifications are blocked. Allow them in your browser's site settings, then try again.",
  "signed-out": "Sign in first.",
  error: "Couldn't turn on reminders.",
};

function GoogleLogo() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
  );
}

function AuthPage() {
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  const [sync, setSync] = useState<SyncState>(getSyncState());
  const [pushOn, setPushOn] = useState(false);
  const [pushMsg, setPushMsg] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, session) => setEmail(session?.user.email ?? null));
    setPushOn(pushEnabledHere());
    const off = onSyncState(setSync);
    return () => {
      data.subscription.unsubscribe();
      off();
    };
  }, []);

  if (email === undefined) return <PageTitle>Account</PageTitle>;
  if (!email) return <SignIn />;

  return (
    <>
      <PageTitle sub={email}>Account</PageTitle>
      <section className="card-soft mb-4 space-y-3 p-4">
        <div className="flex items-center gap-3">
          <CloudCheck className="size-6 text-primary" />
          <p className="flex-1 font-semibold">
            {sync.status === "syncing" ? "Syncing…" : sync.status === "error" ? "Sync problem" : sync.status === "offline" ? "Offline — will sync later" : sync.lastSynced ? `Synced ${new Date(sync.lastSynced).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Backed up to the cloud"}
          </p>
        </div>
        {sync.status === "error" && <p className="text-sm text-destructive">{sync.error}</p>}
        <button className={`${btnSecondary} w-full`} onClick={() => void syncNow()}>
          <RefreshCw className="size-5" /> Sync now
        </button>
      </section>

      <section className="card-soft mb-4 space-y-3 p-4">
        <div className="flex items-center gap-3">
          <BellRing className="size-6 text-primary" />
          <p className="flex-1 font-semibold">{pushOn ? "Reminders on for this device" : "Reminders when the app is closed"}</p>
        </div>
        <p className="text-muted-foreground">Candling, lockdown and hatch day alerts, sent each morning.</p>
        {!pushOn && (
          <button
            className={`${btnPrimary} w-full`}
            onClick={async () => {
              setPushMsg("");
              const r = await enablePush();
              if (r.status === "registered") setPushOn(true);
              else setPushMsg(r.message ? `${pushMessages[r.status]} ${r.message}` : pushMessages[r.status]);
            }}
          >
            Turn on reminders
          </button>
        )}
        {pushMsg && <p className="text-sm text-destructive">{pushMsg}</p>}
      </section>

      <button
        className={`${btnSecondary} w-full`}
        onClick={async () => {
          await supabase.auth.signOut();
        }}
      >
        <LogOut className="size-5" /> Sign out
      </button>
      <p className="mt-3 text-center text-sm text-muted-foreground">Your data stays on this device after signing out.</p>
    </>
  );
}

function SignIn() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    if (mode === "up") {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth` } });
      setMsg(error ? error.message : "Check your email to confirm your account, then sign in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
    }
    setBusy(false);
  }

  return (
    <>
      <PageTitle sub="Back up your batches and get reminders even when the app is closed.">
        {mode === "in" ? "Sign in" : "Create account"}
      </PageTitle>
      <button
        type="button"
        className="mb-4 inline-flex min-h-14 w-full items-center justify-center gap-[10px] rounded-xl border border-[#747775] bg-[#FFFFFF] px-3 text-[14px] font-medium text-[#1F1F1F]"
        onClick={async () => {
          const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/auth` });
          if (r.error) setMsg(r.error.message);
        }}
      >
        <GoogleLogo /> Continue with Google
      </button>
      <div className="mb-4 flex items-center gap-3 text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>
      <form onSubmit={submit} className="space-y-3">
        <input className={field} type="email" autoComplete="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className={field} type="password" autoComplete={mode === "in" ? "current-password" : "new-password"} placeholder="Password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className={`${btnPrimary} w-full`} disabled={busy}>{mode === "in" ? "Sign in" : "Create account"}</button>
      </form>
      {msg && <p className="mt-3 font-semibold">{msg}</p>}
      <button className="mt-4 min-h-12 w-full font-semibold text-primary underline" onClick={() => setMode(mode === "in" ? "up" : "in")}>
        {mode === "in" ? "New here? Create an account" : "Already have an account? Sign in"}
      </button>
    </>
  );
}
