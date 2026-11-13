import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft, Check, Egg as EggIcon, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { BirdForm } from "@/components/BirdForm";
import { PageTitle, btnSecondary } from "@/components/AppShell";
import { db } from "@/lib/db";
import { ageLabel } from "@/lib/flock";
import { formatDay, localToday } from "@/lib/schedule";

export const Route = createFileRoute("/flock/$birdId")({
  head: () => ({
    meta: [
      { title: "Bird profile · Hatch & Flock" },
      { name: "description", content: "Photo, breed, hatch date, parents and notes for one bird in your flock." },
      { property: "og:title", content: "Bird profile · Hatch & Flock" },
      { property: "og:description", content: "Photo, breed, hatch date, parents and notes for one bird in your flock." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BirdPage,
});

function BirdPage() {
  const { birdId } = Route.useParams();
  const navigate = useNavigate();
  const [today, setToday] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  useEffect(() => setToday(localToday()), []);

  const data = useLiveQuery(async () => {
    const bird = await db.birds.get(birdId);
    if (!bird) return { bird: null };
    const egg = bird.fromEggId ? await db.eggs.get(bird.fromEggId) : undefined;
    const batch = egg ? await db.batches.get(egg.batchId) : undefined;
    return { bird, egg, batch };
  }, [birdId]);

  const back = (
    <Link to="/flock" className="mb-3 inline-flex min-h-11 items-center gap-2 font-semibold text-primary">
      <ArrowLeft className="size-5" /> Flock
    </Link>
  );
  if (!data) return back;
  if (!data.bird) return (<>{back}<PageTitle sub="It may have been removed.">Bird not found</PageTitle></>);

  const { bird, egg, batch } = data;
  const age = today ? ageLabel(bird.hatchDate, today) : null;
  const sub = [age, bird.hatchDate && `hatched ${formatDay(bird.hatchDate)}`].filter(Boolean).join(" · ");

  return (
    <>
      {back}
      <PageTitle sub={sub || undefined}>{bird.name}</PageTitle>

      {(egg || bird.breed) && (
        <div className="mb-5 flex flex-wrap gap-2">
          {egg && batch && (
            <Link to="/batches/$batchId" params={{ batchId: batch.id }} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-secondary px-4 font-semibold text-secondary-foreground">
              <EggIcon className="size-4" /> Egg {egg.label} · {batch.name}
            </Link>
          )}
          <Link to="/sexing-helper" search={bird.breed ? { breed: bird.breed } : {}} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-4 font-semibold text-accent-foreground">
            <Sparkles className="size-4" /> Cockerel or pullet?
          </Link>
        </div>
      )}

      <BirdForm
        key={bird.id}
        initial={bird}
        selfId={bird.id}
        submitLabel="Save changes"
        onSubmit={async (d, photoChanged) => {
          const now = Date.now();
          const { photo, ...rest } = d;
          await db.birds.update(bird.id, {
            ...rest,
            ...(photoChanged ? { photo, photoAt: photo ? now : undefined, photoSynced: 0 as const } : {}),
            updatedAt: now,
            synced: 0,
          });
          setSaved(true);
          window.setTimeout(() => setSaved(false), 2500);
        }}
      />
      {saved && (
        <p role="status" className="mt-3 flex items-center justify-center gap-2 font-semibold text-primary">
          <Check className="size-5" /> Saved
        </p>
      )}

      <button
        className={`${btnSecondary} mt-8 w-full text-destructive`}
        onClick={async () => {
          if (!confirmDelete) return setConfirmDelete(true);
          await db.transaction("rw", db.birds, db.tombstones, async () => {
            await db.birds.delete(bird.id);
            await db.tombstones.put({ id: bird.id, table: "birds" });
          });
          await navigate({ to: "/flock" });
        }}
      >
        <Trash2 className="size-5" /> {confirmDelete ? "Tap again to remove from flock" : "Remove from flock"}
      </button>
    </>
  );
}
