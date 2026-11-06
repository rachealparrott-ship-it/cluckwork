import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { db, uid } from "@/lib/db";
import { PageTitle, btnPrimary, field } from "@/components/AppShell";

export const Route = createFileRoute("/incubators")({
  head: () => ({
    meta: [
      { title: "Incubators · Hatch & Flock" },
      { name: "description", content: "Manage your incubators and their egg capacity." },
      { property: "og:title", content: "Incubators · Hatch & Flock" },
      { property: "og:description", content: "Manage your incubators and their egg capacity." },
    ],
  }),
  component: Incubators,
});

function Incubators() {
  const list = useLiveQuery(() => db.incubators.toArray());
  const batches = useLiveQuery(() => db.batches.where("status").equals("active").toArray());
  const [name, setName] = useState("");
  const [cap, setCap] = useState("12");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const now = Date.now();
    await db.incubators.add({ id: uid(), name: name.trim(), capacity: Math.max(1, Number(cap) || 1), createdAt: now, updatedAt: now, synced: 0 });
    setName("");
  }

  return (
    <>
      <PageTitle sub="Add each incubator you use and how many eggs it holds.">Incubators</PageTitle>
      <form onSubmit={add} className="card-soft mb-6 space-y-3 p-4">
        <input className={field} placeholder="Name, e.g. Brinsea Mini" value={name} onChange={(e) => setName(e.target.value)} />
        <label className="flex items-center gap-3">
          <span className="w-24 font-semibold">Capacity</span>
          <input className={field} type="number" inputMode="numeric" min={1} value={cap} onChange={(e) => setCap(e.target.value)} />
        </label>
        <button className={`${btnPrimary} w-full`}>Add incubator</button>
      </form>
      <ul className="space-y-3">
        {list?.map((i) => {
          const inUse = batches?.some((b) => b.incubatorId === i.id);
          return (
            <li key={i.id} className="card-soft flex items-center justify-between p-4">
              <div>
                <p className="text-lg font-bold">{i.name}</p>
                <p className="text-muted-foreground">Holds {i.capacity} eggs{inUse ? " · in use" : ""}</p>
              </div>
              {!inUse && (
                <button aria-label={`Remove ${i.name}`} className="grid size-12 place-items-center rounded-xl text-destructive" onClick={() => db.incubators.delete(i.id)}>
                  <Trash2 className="size-5" />
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
