import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Sparkles } from "lucide-react";
import { PageTitle } from "@/components/AppShell";
import { getGuide, type Reliability } from "@/content/guides";

export const Route = createFileRoute("/guides/$slug")({
  loader: ({ params }) => {
    const guide = getGuide(params.slug);
    if (!guide) throw notFound();
    return { guide };
  },
  head: ({ loaderData }) => {
    const g = loaderData?.guide;
    const title = g ? `${g.title} · Hatch & Flock` : "Guide · Hatch & Flock";
    const description = g?.summary ?? "A Hatch & Flock guide for backyard poultry keepers.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
      ],
    };
  },
  notFoundComponent: () => (
    <PageTitle sub={<Link to="/guides" className="underline">All guides</Link>}>Guide not found</PageTitle>
  ),
  component: GuidePage,
});

const RELIABILITY: Record<Reliability, { label: string; cls: string }> = {
  reliable: { label: "Reliable", cls: "bg-primary text-primary-foreground" },
  fair: { label: "Fairly reliable", cls: "bg-accent text-accent-foreground" },
  hint: { label: "Hint only", cls: "bg-muted text-muted-foreground border" },
};

function GuidePage() {
  const { guide } = Route.useLoaderData();
  return (
    <article>
      <Link to="/guides" className="mb-3 inline-flex min-h-11 items-center gap-1 font-semibold text-primary">
        <ArrowLeft className="size-5" /> Guides
      </Link>
      <PageTitle sub={guide.summary}>{guide.title}</PageTitle>
      {guide.slug === "sexing-chicks" && (
        <Link to="/sexing-helper" className="card-soft mb-5 flex min-h-14 items-center gap-3 p-4 font-semibold text-primary">
          <Sparkles className="size-6 shrink-0" /> Get signs for your chick's breed and age
        </Link>
      )}

      <nav aria-label="On this page" className="mb-6 flex flex-wrap gap-2">
        {guide.sections.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="rounded-full border bg-card px-3 py-2 text-sm font-semibold">
            {s.heading.split(":")[0]}
          </a>
        ))}
      </nav>

      <div className="mb-6 flex flex-wrap gap-2 text-sm">
        {(Object.keys(RELIABILITY) as Reliability[]).map((r) => (
          <span key={r} className={`rounded-full px-3 py-1 font-bold ${RELIABILITY[r].cls}`}>{RELIABILITY[r].label}</span>
        ))}
      </div>

      {guide.sections.map((s) => (
        <section key={s.id} id={s.id} className="mb-8 scroll-mt-4">
          <h2 className="mb-2 text-2xl font-semibold">{s.heading}</h2>
          {s.intro && <p className="mb-3 text-lg leading-relaxed">{s.intro}</p>}
          {s.points && (
            <ul className="space-y-2">
              {s.points.map((p, i) => (
                <li key={i} className="flex gap-3 text-lg leading-relaxed">
                  <span className="egg-shape mt-2 h-3 w-2.5 shrink-0 bg-primary" aria-hidden />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          )}
          {s.signs && (
            <ul className="space-y-3">
              {s.signs.map((sign) => (
                <li key={sign.title} className="card-soft p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    {sign.when && <span className="rounded-full bg-secondary px-3 py-1 text-sm font-bold text-secondary-foreground">{sign.when}</span>}
                    {sign.reliability && (
                      <span className={`rounded-full px-3 py-1 text-sm font-bold ${RELIABILITY[sign.reliability].cls}`}>
                        {RELIABILITY[sign.reliability].label}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold">{sign.title}</h3>
                  {sign.appliesTo && <p className="mb-1 text-sm font-semibold text-muted-foreground">For: {sign.appliesTo}</p>}
                  <p className="text-lg leading-relaxed">{sign.body}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <section className="border-t pt-5">
        <h2 className="mb-2 text-xl font-semibold">Sources</h2>
        <ul className="space-y-2">
          {guide.sources.map((src) => (
            <li key={src.url}>
              <a href={src.url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-start gap-2 text-primary underline">
                <ExternalLink className="mt-1 size-4 shrink-0" /> {src.title}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted-foreground">Last checked {guide.updated}.</p>
      </section>
    </article>
  );
}
