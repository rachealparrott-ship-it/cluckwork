import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { PageTitle, btnPrimary, btnSecondary, field } from "@/components/AppShell";
import type { Reliability } from "@/content/guides";
import { explainSexingSigns } from "@/lib/sexing-helper.functions";
import { sexingInputSchema, type SexingAdvice } from "@/lib/sexing-helper";

const searchSchema = z.object({ breed: z.string().max(80).optional() });

export const Route = createFileRoute("/sexing-helper")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Cockerel or pullet helper · Hatch & Flock" },
      { name: "description", content: "Enter your chick's breed and age to see which sexing signs to check, how reliable they are and breed-specific caveats." },
      { property: "og:title", content: "Cockerel or pullet helper · Hatch & Flock" },
      { property: "og:description", content: "Enter your chick's breed and age to see which sexing signs to check, how reliable they are and breed-specific caveats." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SexingHelperPage,
});

const RELIABILITY: Record<Reliability, { label: string; cls: string }> = {
  reliable: { label: "Reliable", cls: "bg-primary text-primary-foreground" },
  fair: { label: "Fairly reliable", cls: "bg-accent text-accent-foreground" },
  hint: { label: "Hint only", cls: "bg-muted text-muted-foreground border" },
};

function SexingHelperPage() {
  const search = Route.useSearch();
  const [signedIn, setSignedIn] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, session) => setSignedIn(!!session));
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <>
      <Link to="/guides" className="mb-3 inline-flex min-h-11 items-center gap-1 font-semibold text-primary">
        <ArrowLeft className="size-5" /> Guides
      </Link>
      <PageTitle sub="Tell us the breed and age, and we'll explain which signs to look for and how far to trust them.">
        Cockerel or pullet helper
      </PageTitle>
      {signedIn === undefined ? null : signedIn ? (
        <HelperForm initialBreed={search.breed ?? ""} />
      ) : (
        <section className="card-soft space-y-3 p-4">
          <p className="text-lg">The helper uses AI, so it needs you to be signed in and online.</p>
          <Link to="/auth" className={`${btnPrimary} w-full`}>Sign in</Link>
          <Link to="/guides/$slug" params={{ slug: "sexing-chicks" }} className={`${btnSecondary} w-full`}>Read the sexing guide instead</Link>
        </section>
      )}
    </>
  );
}

function HelperForm({ initialBreed }: { initialBreed: string }) {
  const explain = useServerFn(explainSexingSigns);
  const [breed, setBreed] = useState(initialBreed);
  const [breedUncertain, setBreedUncertain] = useState(false);
  const [age, setAge] = useState("");
  const [ageUnit, setAgeUnit] = useState<"days" | "weeks">("days");
  const [parents, setParents] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [advice, setAdvice] = useState<SexingAdvice | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = sexingInputSchema.safeParse({
      breed,
      breedUncertain,
      age: age === "" ? undefined : Number(age),
      ageUnit,
      parents: parents.trim() || undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the details and try again.");
      return;
    }
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setError("You're offline. The helper needs a connection — the sexing guide works offline.");
      return;
    }
    setBusy(true);
    setAdvice(null);
    try {
      const r = await explain({ data: parsed.data });
      if (r.ok) setAdvice(r.advice);
      else setError(r.error);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <form onSubmit={submit} className="card-soft mb-6 space-y-4 p-4">
        <label className="block">
          <span className="mb-1 block font-semibold">Breed</span>
          <input className={field} value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="e.g. Cream Legbar, Barred Rock, mixed" maxLength={80} />
        </label>
        <label className="flex min-h-12 items-center gap-3 text-lg">
          <input type="checkbox" className="size-6 accent-primary" checked={breedUncertain} onChange={(e) => setBreedUncertain(e.target.checked)} />
          Not sure of the breed
        </label>
        <div>
          <span className="mb-1 block font-semibold">Age</span>
          <div className="flex gap-2">
            <input className={`${field} flex-1`} type="number" inputMode="numeric" min={0} value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 3" aria-label="Age" />
            <div role="radiogroup" aria-label="Age unit" className="grid grid-cols-2 gap-1 rounded-xl bg-secondary p-1">
              {(["days", "weeks"] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  role="radio"
                  aria-checked={ageUnit === u}
                  onClick={() => setAgeUnit(u)}
                  className={`min-h-12 rounded-lg px-4 text-lg font-bold capitalize ${ageUnit === u ? "bg-card text-foreground shadow-sm" : "text-secondary-foreground"}`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>
        <label className="block">
          <span className="mb-1 block font-semibold">Parents or cross <span className="font-normal text-muted-foreground">(optional)</span></span>
          <input className={field} value={parents} onChange={(e) => setParents(e.target.value)} placeholder="e.g. RIR cockerel × Barred Rock hen" maxLength={120} />
        </label>
        <button className={`${btnPrimary} w-full`} disabled={busy}>
          {busy ? <Loader2 className="size-5 animate-spin" /> : <Sparkles className="size-5" />}
          {busy ? "Thinking…" : "Explain the signs"}
        </button>
        {error && <p role="alert" className="font-semibold text-destructive">{error}</p>}
      </form>

      {advice && <AdviceView advice={advice} />}
    </>
  );
}

function AdviceView({ advice }: { advice: SexingAdvice }) {
  return (
    <section aria-live="polite">
      <p className="mb-4 text-lg leading-relaxed">{advice.headline}</p>

      <h2 className="mb-2 text-2xl font-semibold">Signs to check</h2>
      <ul className="mb-6 space-y-3">
        {advice.signs.map((s, i) => (
          <li key={i} className="card-soft p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {s.when && <span className="rounded-full bg-secondary px-3 py-1 text-sm font-bold text-secondary-foreground">{s.when}</span>}
              <span className={`rounded-full px-3 py-1 text-sm font-bold ${RELIABILITY[s.reliability].cls}`}>{RELIABILITY[s.reliability].label}</span>
            </div>
            <p className="mb-1 text-lg font-semibold">{s.title}</p>
            <p className="text-lg leading-relaxed">{s.whatToLook}</p>
          </li>
        ))}
      </ul>

      {advice.caveats.length > 0 && (
        <>
          <h2 className="mb-2 text-2xl font-semibold">Breed caveats</h2>
          <ul className="mb-6 space-y-2">
            {advice.caveats.map((c, i) => (
              <li key={i} className="flex gap-3 text-lg leading-relaxed">
                <span className="egg-shape mt-2 h-3 w-2.5 shrink-0 bg-primary" aria-hidden />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="card-soft mb-4 space-y-3 p-4">
        <p><span className="font-semibold">Look again: </span>{advice.nextLook}</p>
        <p><span className="font-semibold">How sure can you be? </span>{advice.certainty}</p>
      </div>
      <p className="text-sm text-muted-foreground">
        AI-generated from our{" "}
        <Link to="/guides/$slug" params={{ slug: "sexing-chicks" }} className="font-semibold text-primary underline">sexing guide</Link>{" "}
        and general poultry knowledge. It can be wrong — treat it as a guide, not a guarantee.
      </p>
    </section>
  );
}
