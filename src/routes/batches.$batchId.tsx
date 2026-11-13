import { createFileRoute, Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Bird as BirdIcon, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { db, uid, type Egg, type EggStatus } from "@/lib/db";
import { PageTitle, btnPrimary, btnSecondary, field } from "@/components/AppShell";
import { formatDay, incubationDay, localToday, milestonesFor } from "@/lib/schedule";
import { flockActionForEgg } from "@/lib/flock";

export const Route = createFileRoute("/batches/$batchId")({
  head: () => ({
    meta: [
      { title: "Batch · Hatch & Flock" },
      { name: "description", content: "Candling calendar and egg-by-egg progress for this batch." },
      { property: "og:title", content: "Batch · Hatch & Flock" },
      { property: "og:description", content: "Candling calendar and egg-by-egg progress for this batch." },
    ],
  }),
  component: BatchPage,
});

const STATUSES: { s: EggStatus; label: string; cls: string }[] = [
  { s: "unknown", label: "Not checked", cls: "bg-egg-unknown" },
  { s: "developing", label: "Developing", cls: "bg-egg-developing text-primary-foreground" },
  { s: "clear", label: "Clear", cls: "bg-egg-clear border-2 border-dashed" },
  { s: "quit", label: "Quit", cls: "bg-egg-quit text-primary-foreground" },
  { s: "hatched", label: "Hatched", cls: "bg-egg-hatched" },
];
const styleOf = (s: EggStatus) => STATUSES.find((x) => x.s === s)!;

function BatchPage() {
  const { batchId } = Route.useParams();
  const [today, setToday] = useState<string | null>(null);
  const [selected, setSelected] = useState<Egg | null>(null);
  useEffect(() => setToday(localToday()), []);

  const data = useLiveQuery(async () => {
    const batch = await db.batches.get(batchId);
    if (!batch) return { batch: null };
    const eggs = await db.eggs.where("batchId").equals(batchId).sortBy("position");
    const incubator = await db.incubators.get(batch.incubatorId);
    return { batch, eggs, incubator };
  }, [batchId]);

  if (!data || !today) return <PageTitle>Batch</PageTitle>;
  if (!data.batch) return <PageTitle sub={<Link to="/" className="underline">Back home</Link>}>Batch not found</PageTitle>;

  const { batch, eggs = [], incubator } = data;
  const day = incubationDay(batch.setDate, today);
  const counts = Object.fromEntries(STATUSES.map((x) => [x.s, eggs.filter((e) => e.status === x.s).length]));

  return (
    <>
      <PageTitle sub={`${incubator?.name ?? "Incubator"} · set ${formatDay(batch.setDate)}`}>{batch.name}</PageTitle>

      <section className="card-soft mb-6 p-4">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">Calendar</h2>
          <span className="font-display text-2xl text-primary">Day {Math.max(0, day)}</span>
        </div>
        <ol className="space-y-2">
          {milestonesFor(batch.setDate).map((m) => {
            const done = m.date < today;
            const isToday = m.date === today;
            return (
              <li key={m.kind} className={`flex items-center gap-3 rounded-xl p-3 ${isToday ? "bg-accent text-accent-foreground" : ""}`}>
                <span className={`grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold ${done ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {done ? <Check className="size-5" /> : m.day}
                </span>
                <span className="flex-1 font-semibold">{m.label}</span>
                <span className="text-muted-foreground">{isToday ? "Today" : formatDay(m.date)}</span>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mb-6">
        <h2 className="mb-1 text-xl font-semibold">Eggs</h2>
        <p className="mb-3 text-muted-foreground">Tap an egg to update it.</p>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {eggs.map((e) => (
            <button
              key={e.id}
              onClick={() => setSelected(e)}
              className={`egg-shape flex aspect-[4/5] flex-col items-center justify-center p-1 text-center shadow-sm transition active:scale-95 ${styleOf(e.status).cls}`}
            >
              <span className="text-base font-extrabold leading-none">{e.label}</span>
              <span className="mt-1 line-clamp-1 text-[0.7rem] font-semibold opacity-80">{e.breed || "?"}{e.breedUncertain ? "?" : ""}</span>
            </button>
          ))}
        </div>
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {STATUSES.map((x) => (
            <li key={x.s} className="flex items-center gap-2">
              <span className={`egg-shape inline-block h-4 w-3 ${x.cls}`} /> {x.label} ({counts[x.s]})
            </li>
          ))}
        </ul>
      </section>

      {batch.status === "active" ? (
        <button className={`${btnSecondary} w-full`} onClick={() => db.batches.update(batch.id, { status: "done", updatedAt: Date.now(), synced: 0 })}>
          Mark batch finished
        </button>
      ) : (
        <p className="text-center text-muted-foreground">This batch is finished.</p>
      )}

      {selected && <EggSheet egg={selected} day={Math.max(0, day)} onClose={() => setSelected(null)} />}
    </>
  );
}

function EggSheet({ egg, day, onClose }: { egg: Egg; day: number; onClose: () => void }) {
  const history = useLiveQuery(() => db.eggEvents.where("eggId").equals(egg.id).sortBy("at"), [egg.id]);
  const bird = useLiveQuery(() => db.birds.where("fromEggId").equals(egg.id).first(), [egg.id]);
  const [status, setStatus] = useState(egg.status);
  const [breed, setBreed] = useState(egg.breed);
  const [uncertain, setUncertain] = useState(egg.breedUncertain);

  async function save(next = status) {
    const now = Date.now();
    const today = localToday();
    await db.transaction("rw", [db.eggs, db.eggEvents, db.birds, db.tombstones], async () => {
      const updated: Egg = { ...egg, status: next, breed: breed.trim(), breedUncertain: uncertain, updatedAt: now, synced: 0 };
      await db.eggs.put(updated);
      if (next !== egg.status) {
        await db.eggEvents.add({ id: uid(), eggId: egg.id, batchId: egg.batchId, from: egg.status, to: next, day, at: now, synced: 0 });
      }
      // Keep the flock register in step: a hatched chick gets its own bird profile.
      const existing = await db.birds.where("fromEggId").equals(egg.id).first();
      const action = flockActionForEgg(updated, egg.status, existing, today, now);
      if (action.kind === "create") await db.birds.put(action.bird);
      else if (action.kind === "update" && existing) await db.birds.update(existing.id, action.changes);
      else if (action.kind === "remove" && existing) {
        await db.birds.delete(existing.id);
        await db.tombstones.put({ id: existing.id, table: "birds" });
      }
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-foreground/40" onClick={onClose}>
      <div className="mx-auto max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Egg {egg.label}</h2>
            <p className="text-muted-foreground">{egg.source || "No source recorded"}</p>
          </div>
          <button aria-label="Close" className="grid size-12 place-items-center" onClick={onClose}><X className="size-6" /></button>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {STATUSES.filter((x) => x.s !== "unknown").map((x) => (
            <button
              key={x.s}
              onClick={() => (x.s === "hatched" ? setStatus(x.s) : save(x.s))}
              className={`min-h-14 rounded-xl text-lg font-bold ${x.cls} ${status === x.s ? "ring-4 ring-ring" : ""}`}
            >
              {x.label}
            </button>
          ))}
        </div>
        {(status === "hatched" || egg.status === "hatched") && (
          <div className="mb-4 space-y-3">
            <p className="font-semibold">Confirm breed now the chick's out</p>
            {bird ? (
              <Link to="/flock/$birdId" params={{ birdId: bird.id }} className={`${btnSecondary} w-full`}>
                <BirdIcon className="size-5" /> Open {bird.name}'s profile
              </Link>
            ) : (
              egg.status !== "hatched" && <p className="text-muted-foreground">Saving adds this chick to your flock.</p>
            )}
            <Link to="/guides/$slug" params={{ slug: "sexing-chicks" }} className="inline-flex min-h-11 items-center font-semibold text-primary underline">
              Cockerel or pullet? What to look for
            </Link>
            <Link to="/sexing-helper" search={breed ? { breed } : {}} className="ml-4 inline-flex min-h-11 items-center font-semibold text-primary underline">
              Ask the helper
            </Link>
            <input className={field} value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="Breed" />
            <label className="flex min-h-12 items-center gap-3 text-lg">
              <input type="checkbox" className="size-6 accent-primary" checked={uncertain} onChange={(e) => setUncertain(e.target.checked)} />
              Still uncertain
            </label>
          </div>
        )}
        <div className="mb-4">
          <p className="mb-2 font-semibold">History</p>
          {history && history.length > 0 ? (
            <ol className="space-y-1">
              {history.map((h) => (
                <li key={h.id} className="flex items-center gap-3">
                  <span className="w-16 shrink-0 font-bold text-primary">Day {h.day}</span>
                  <span className={`egg-shape inline-block h-4 w-3 ${styleOf(h.to).cls}`} />
                  <span>{styleOf(h.to).label}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-muted-foreground">No checks recorded yet.</p>
          )}
        </div>
        <button className={`${btnPrimary} w-full`} onClick={() => save()}>Save</button>
      </div>
    </div>
  );
}
