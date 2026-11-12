import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Sparkles } from "lucide-react";
import { PageTitle } from "@/components/AppShell";
import { guides } from "@/content/guides";

export const Route = createFileRoute("/guides/")({
  head: () => ({
    meta: [
      { title: "Guides · Hatch & Flock" },
      { name: "description", content: "Practical, sourced guides for backyard poultry keepers, from hatching to sexing chicks." },
      { property: "og:title", content: "Guides · Hatch & Flock" },
      { property: "og:description", content: "Practical, sourced guides for backyard poultry keepers, from hatching to sexing chicks." },
    ],
  }),
  component: GuidesList,
});

function GuidesList() {
  return (
    <>
      <PageTitle sub="Know-how for the coop, checked against trusted sources.">Guides</PageTitle>
      <Link to="/sexing-helper" className="card-soft mb-4 flex items-center gap-4 border-2 border-primary/40 p-4">
        <Sparkles className="size-8 shrink-0 text-primary" />
        <div className="flex-1">
          <p className="font-display text-xl font-semibold leading-snug">Cockerel or pullet helper</p>
          <p className="mt-1 text-muted-foreground">Enter a chick's breed and age for tailored signs and caveats.</p>
        </div>
        <ChevronRight className="size-6 shrink-0 text-muted-foreground" />
      </Link>
      <ul className="space-y-3">
        {guides.map((g) => (
          <li key={g.slug}>
            <Link to="/guides/$slug" params={{ slug: g.slug }} className="card-soft flex items-center gap-4 p-4">
              <div className="flex-1">
                <p className="mb-1 text-sm font-bold uppercase tracking-wide text-primary">
                  {g.topic} · {g.readMinutes} min read
                </p>
                <p className="font-display text-xl font-semibold leading-snug">{g.title}</p>
                <p className="mt-1 text-muted-foreground">{g.summary}</p>
              </div>
              <ChevronRight className="size-6 shrink-0 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-center text-muted-foreground">More guides coming soon.</p>
    </>
  );
}
