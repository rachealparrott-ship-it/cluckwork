/** How much a sign can be trusted on its own. */
export type Reliability = "reliable" | "fair" | "hint";

export interface GuideSign {
  title: string;
  body: string;
  /** e.g. "At hatch", "10–16 weeks" */
  when?: string;
  /** e.g. "Cream Legbar, Barred Rock" */
  appliesTo?: string;
  reliability?: Reliability;
}

export interface GuideSection {
  id: string;
  heading: string;
  intro?: string;
  signs?: GuideSign[];
  points?: string[];
}

export interface GuideSource {
  title: string;
  url: string;
}

export interface Guide {
  slug: string;
  title: string;
  summary: string;
  topic: "Hatching" | "Chicks" | "Flock" | "Health" | "Eggs";
  readMinutes: number;
  updated: string; // YYYY-MM-DD
  sections: GuideSection[];
  sources: GuideSource[];
}
