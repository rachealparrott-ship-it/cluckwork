import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { BirdForm } from "@/components/BirdForm";
import { PageTitle } from "@/components/AppShell";
import { db, uid } from "@/lib/db";

export const Route = createFileRoute("/flock/new")({
  head: () => ({
    meta: [
      { title: "Add a bird · Hatch & Flock" },
      { name: "description", content: "Add a bird to your flock register with photo, breed, hatch date, parents and notes." },
      { property: "og:title", content: "Add a bird · Hatch & Flock" },
      { property: "og:description", content: "Add a bird to your flock register with photo, breed, hatch date, parents and notes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewBird,
});

function NewBird() {
  const navigate = useNavigate();
  return (
    <>
      <Link to="/flock" className="mb-3 inline-flex min-h-11 items-center gap-2 font-semibold text-primary">
        <ArrowLeft className="size-5" /> Flock
      </Link>
      <PageTitle sub="For birds you already keep or bought in.">Add a bird</PageTitle>
      <BirdForm
        submitLabel="Add to flock"
        onSubmit={async (d) => {
          const now = Date.now();
          const id = uid();
          await db.birds.add({ id, ...d, photoAt: d.photo ? now : undefined, photoSynced: 0, createdAt: now, updatedAt: now, synced: 0 });
          await navigate({ to: "/flock/$birdId", params: { birdId: id } });
        }}
      />
    </>
  );
}
