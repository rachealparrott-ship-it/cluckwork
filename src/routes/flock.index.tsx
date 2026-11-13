import { createFileRoute, Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Bird as BirdIcon, ChevronRight, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { PageTitle, btnPrimary } from "@/components/AppShell";
import { useObjectUrl } from "@/hooks/use-object-url";
import { db, type Bird } from "@/lib/db";
import { ageLabel } from "@/lib/flock";
import { localToday } from "@/lib/schedule";

export const Route = createFileRoute("/flock/")({
  head: () => ({
    meta: [
      { title: "Flock register · Hatch & Flock" },
      { name: "description", content: "Every bird in your flock with photo, breed, hatch date, parents and notes." },
      { property: "og:title", content: "Flock register · Hatch & Flock" },
      { property: "og:description", content: "Every bird in your flock with photo, breed, hatch date, parents and notes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FlockPage,
});

function FlockPage() {
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(localToday()), []);
  const birds = useLiveQuery(async () => {
    const all = await db.birds.toArray();
    // Youngest first; birds without a hatch date go last.
    return all.sort((a, b) => (b.hatchDate ?? "").localeCompare(a.hatchDate ?? "") || a.name.localeCompare(b.name));
  });

  return (
    <>
      <PageTitle sub={birds ? `${birds.length} bird${birds.length === 1 ? "" : "s"}. Chicks are added when you mark an egg hatched.` : undefined}>
        Flock register
      </PageTitle>
      <Link to="/flock/new" className={`${btnPrimary} mb-5 w-full`}>
        <Plus className="size-5" /> Add a bird
      </Link>
      {birds && birds.length === 0 && (
        <div className="card-soft p-5 text-muted-foreground">
          No birds yet. Mark an egg as hatched in a batch, or add a bird you already keep.
        </div>
      )}
      <ul className="space-y-3">
        {birds?.map((b) => (
          <li key={b.id}>
            <BirdRow bird={b} today={today} />
          </li>
        ))}
      </ul>
    </>
  );
}

function BirdRow({ bird, today }: { bird: Bird; today: string | null }) {
  const url = useObjectUrl(bird.photo);
  const age = today ? ageLabel(bird.hatchDate, today) : null;
  return (
    <Link to="/flock/$birdId" params={{ birdId: bird.id }} className="card-soft flex min-h-20 items-center gap-4 p-3">
      {url ? (
        <img src={url} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
      ) : (
        <span className="grid size-16 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
          <BirdIcon className="size-7" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-lg font-bold">{bird.name}</span>
        <span className="block truncate text-muted-foreground">
          {bird.breed || "Breed not set"}
          {bird.breedUncertain ? " (uncertain)" : ""}
          {age ? ` · ${age}` : ""}
        </span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
    </Link>
  );
}
