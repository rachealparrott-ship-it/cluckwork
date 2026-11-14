import type { Guide } from "./types";
import { sexingChicks } from "./sexing-chicks";
import { candling } from "./candling";
import { hatchDay } from "./hatch-day";

export type { Guide, GuideSection, GuideSign, Reliability } from "./types";

/** Add new guides here (one file per guide). Order = order shown in the app. */
export const guides: Guide[] = [candling, hatchDay, sexingChicks];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}
