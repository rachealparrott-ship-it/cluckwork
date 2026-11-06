import { createFileRoute, Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Bell, Egg as EggIcon, Plus, RotateCw, Sun, Warehouse } from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import { PageTitle, btnPrimary, btnSecondary } from "@/components/AppShell";
import { formatDay, incubationDay, localToday, milestonesFor } from "@/lib/schedule";
import { checkReminders, notificationsSupported, requestNotifications } from "@/lib/reminders";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today · Hatch & Flock" },
      { name: "description", content: "Today's candling, turning, lockdown and hatch tasks for your incubators." },
      { property: "og:title", content: "Hatch & Flock — incubation tracker" },
      { property: "og:description", content: "Track egg batches, candling days and hatches for your backyard flock." },
    ],
  }),
  component: Dashboard,
});

type Task = { batchId: string; batchName: string; text: string; kind: string };

function Dashboard() {
  const [today, setToday] = useState<string | null>(null);
  const [perm, setPerm] = useState<string>("default");
  useEffect(() => {
    setToday(localToday());
    setPerm(notificationsSupported() ? Notification.permission : "unsupported");
  }, []);

  const data = useLiveQuery(async () => {
    const batches = await db.batches.where("status").equals("active").sortBy("setDate");
    const eggs = await db.eggs.toArray();
    const incubators = await db.incubators.toArray();
    return { batches, eggs, incubators };
  });

  if (!data || !today) return <PageTitle>Today</PageTitle>;

  const tasks: Task[] = [];
  for (const b of data.batches) {
    const day = incubationDay(b.setDate, today);
    for (const m of milestonesFor(b.setDate)) {
      if (m.date === today) tasks.push({ batchId: b.id, batchName: b.name, text: m.label, kind: m.kind });
    }
    if (day >= 1 && day < 18) tasks.push({ batchId: b.id, batchName: b.name, text: "Check eggs are turning", kind: "turn" });
    if (day > 21) tasks.push({ batchId: b.id, batchName: b.name, text: "Overdue — record hatch results", kind: "hatch" });
  }

  return (
    <>
      <PageTitle sub={formatDay(today)}>Good day, keeper</PageTitle>

      {perm === "default" && (
        <button
          className={`${btnSecondary} mb-5 w-full`}
          onClick={async () => {
            const r = await requestNotifications();
            setPerm(r);
            void checkReminders();
          }}
        >
          <Bell className="size-5" /> Turn on reminders
        </button>
      )}

      <section className="mb-7">
        <h2 className="mb-3 text-xl font-semibold">Today's tasks</h2>
        {tasks.length === 0 ? (
          <div className="card-soft flex items-center gap-3 p-5 text-muted-foreground">
            <Sun className="size-6 text-yolk" /> Nothing due today. Enjoy the sunshine.
          </div>
        ) : (
          <ul className="space-y-3">
            {tasks.map((t, i) => (
              <li key={i}>
                <Link
                  to="/batches/$batchId"
                  params={{ batchId: t.batchId }}
                  className="card-soft flex min-h-16 items-center gap-4 p-4"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
                    {t.kind === "turn" ? <RotateCw className="size-5" /> : <EggIcon className="size-5" />}
                  </span>
                  <span>
                    <span className="block text-lg font-bold">{t.text}</span>
                    <span className="text-muted-foreground">{t.batchName}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-7">
        <h2 className="mb-3 text-xl font-semibold">Active batches</h2>
        {data.batches.length === 0 ? (
          <p className="text-muted-foreground">No eggs in the incubator yet.</p>
        ) : (
          <ul className="space-y-3">
            {data.batches.map((b) => {
              const day = Math.max(0, incubationDay(b.setDate, today));
              const eggs = data.eggs.filter((e) => e.batchId === b.id);
              const inc = data.incubators.find((x) => x.id === b.incubatorId);
              return (
                <li key={b.id}>
                  <Link to="/batches/$batchId" params={{ batchId: b.id }} className="card-soft block p-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-bold">{b.name}</span>
                      <span className="font-display text-2xl text-primary">Day {day}</span>
                    </div>
                    <p className="text-muted-foreground">
                      {eggs.length} eggs · {inc?.name ?? "Incubator"} · hatch {formatDay(milestonesFor(b.setDate).at(-1)!.date)}
                    </p>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (day / 21) * 100)}%` }} />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Link to="/batches/new" className={btnPrimary}>
          <Plus className="size-5" /> New batch
        </Link>
        <Link to="/incubators" className={btnSecondary}>
          <Warehouse className="size-5" /> Incubator
        </Link>
      </section>
    </>
  );
}
