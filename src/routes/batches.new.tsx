import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Copy, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { db, uid, type Egg } from "@/lib/db";
import { PageTitle, btnPrimary, btnSecondary, field } from "@/components/AppShell";
import { localToday } from "@/lib/schedule";

export const Route = createFileRoute("/batches/new")({
  head: () => ({
    meta: [
      { title: "New batch · Hatch & Flock" },
      { name: "description", content: "Set a new batch of eggs with breed, source and label codes." },
      { property: "og:title", content: "New batch · Hatch & Flock" },
      { property: "og:description", content: "Set a new batch of eggs with breed, source and label codes." },
    ],
  }),
  component: NewBatch,
});

type Draft = { label: string; breed: string; source: string; breedUncertain: boolean };

function NewBatch() {
  const navigate = useNavigate();
  const incubators = useLiveQuery(() => db.incubators.toArray());
  const [incubatorId, setIncubatorId] = useState("");
  const [name, setName] = useState("");
  const [setDate, setSetDate] = useState("");
  const [eggs, setEggs] = useState<Draft[]>([]);
  const [d, setD] = useState<Draft>({ label: "", breed: "", source: "", breedUncertain: false });
  const [qty, setQty] = useState("1");

  useEffect(() => setSetDate(localToday()), []);
  useEffect(() => {
    if (!incubatorId && incubators?.[0]) setIncubatorId(incubators[0].id);
  }, [incubators, incubatorId]);

  const inc = incubators?.find((i) => i.id === incubatorId);

  if (incubators && incubators.length === 0) {
    return (
      <>
        <PageTitle>New batch</PageTitle>
        <div className="card-soft space-y-4 p-5">
          <p>First, add the incubator you're using.</p>
          <Link to="/incubators" className={`${btnPrimary} w-full`}>Add an incubator</Link>
        </div>
      </>
    );
  }

  function addEggs() {
    const n = Math.max(1, Math.min(60, Number(qty) || 1));
    const start = eggs.length;
    const prefix = d.label.trim() || (d.breed.trim().slice(0, 3).toUpperCase() || "E");
    const added = Array.from({ length: n }, (_, k) => ({
      ...d,
      label: n === 1 && d.label.trim() ? d.label.trim() : `${prefix}${start + k + 1}`,
    }));
    setEggs([...eggs, ...added]);
    setD({ ...d, label: "" });
    setQty("1");
  }

  async function save() {
    if (!inc || !setDate || eggs.length === 0) return;
    const now = Date.now();
    const id = uid();
    await db.transaction("rw", db.batches, db.eggs, async () => {
      await db.batches.add({ id, incubatorId: inc.id, name: name.trim() || `Batch ${setDate}`, setDate, status: "active", createdAt: now, updatedAt: now, synced: 0 });
      await db.eggs.bulkAdd(
        eggs.map<Egg>((e, i) => ({ id: uid(), batchId: id, position: i, label: e.label, breed: e.breed.trim(), breedUncertain: e.breedUncertain, source: e.source.trim(), status: "unknown", updatedAt: now, synced: 0 })),
      );
    });
    navigate({ to: "/batches/$batchId", params: { batchId: id } });
  }

  const over = inc ? eggs.length > inc.capacity : false;

  return (
    <>
      <PageTitle>New batch</PageTitle>
      <div className="card-soft mb-5 space-y-4 p-4">
        <label className="block">
          <span className="mb-1 flex items-baseline justify-between font-semibold">
            Incubator
            <Link to="/incubators" className="text-base text-primary underline">Manage incubators</Link>
          </span>
          <select className={field} value={incubatorId} onChange={(e) => setIncubatorId(e.target.value)}>
            {incubators?.map((i) => (
              <option key={i.id} value={i.id}>{i.name} ({i.capacity} eggs)</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block font-semibold">Date eggs were set</span>
          <input className={field} type="date" value={setDate} onChange={(e) => setSetDate(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block font-semibold">Batch name (optional)</span>
          <input className={field} placeholder="e.g. Spring Marans" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
      </div>

      <h2 className="mb-3 text-xl font-semibold">Add eggs</h2>
      <div className="card-soft mb-4 space-y-3 p-4">
        <input className={field} placeholder="Breed, e.g. Cream Legbar" value={d.breed} onChange={(e) => setD({ ...d, breed: e.target.value })} />
        <label className="flex min-h-12 items-center gap-3 text-lg">
          <input type="checkbox" className="size-6 accent-primary" checked={d.breedUncertain} onChange={(e) => setD({ ...d, breedUncertain: e.target.checked })} />
          Breed uncertain
        </label>
        <input className={field} placeholder="Source / breeder" value={d.source} onChange={(e) => setD({ ...d, source: e.target.value })} />
        <div className="flex gap-3">
          <input className={field} placeholder="Label code" value={d.label} onChange={(e) => setD({ ...d, label: e.target.value })} />
          <input className={`${field} w-24`} aria-label="How many" type="number" inputMode="numeric" min={1} value={qty} onChange={(e) => setQty(e.target.value)} />
        </div>
        <p className="text-sm text-muted-foreground">With more than one, labels are numbered automatically.</p>
        <button type="button" className={`${btnSecondary} w-full`} onClick={addEggs}>
          Add {Number(qty) > 1 ? `${qty} eggs` : "egg"}
        </button>
      </div>

      {eggs.length > 0 && (
        <ul className="mb-4 divide-y rounded-xl border bg-card">
          {eggs.map((e, i) => (
            <li key={i} className="flex items-center gap-3 px-4 py-3">
              <span className="egg-shape grid h-10 w-8 shrink-0 place-items-center bg-egg-unknown text-xs font-bold">{e.label}</span>
              <span className="flex-1">
                <span className="block font-semibold">{e.breed || "Unknown breed"}{e.breedUncertain && " ?"}</span>
                <span className="text-sm text-muted-foreground">{e.source || "No source"}</span>
              </span>
              <button aria-label="Duplicate" className="grid size-11 place-items-center" onClick={() => setEggs([...eggs, { ...e, label: `${e.label}b` }])}><Copy className="size-5" /></button>
              <button aria-label="Remove" className="grid size-11 place-items-center text-destructive" onClick={() => setEggs(eggs.filter((_, k) => k !== i))}><Trash2 className="size-5" /></button>
            </li>
          ))}
        </ul>
      )}

      {over && <p className="mb-3 font-semibold text-destructive">That's more than {inc?.name} holds ({inc?.capacity}).</p>}
      <button className={`${btnPrimary} w-full`} disabled={eggs.length === 0 || !setDate} onClick={save}>
        Set {eggs.length} egg{eggs.length === 1 ? "" : "s"}
      </button>
    </>
  );
}
