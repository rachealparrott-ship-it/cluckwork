import type { Guide } from "./types";
import { sexingChicks } from "./sexing-chicks";

export type { Guide, GuideSection, GuideSign, Reliability } from "./types";

/** Add new guides here (one file per guide). Order = order shown in the app. */
export const guides: Guide[] = [sexingChicks];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}
