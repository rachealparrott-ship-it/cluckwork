import type { Bird, Egg, EggStatus } from "./db";
import { parseDay } from "./schedule";

/** Default name for a chick's profile, e.g. "Chick A1". */
export function chickName(egg: Pick<Egg, "label">): string {
  return egg.label.trim() ? `Chick ${egg.label.trim()}` : "New chick";
}

/** The profile a newly hatched chick gets. Its id is the egg id, so two devices never create duplicates. */
export function birdFromHatchedEgg(egg: Egg, hatchDate: string | undefined, now: number): Bird {
  return {
    id: egg.id,
    name: chickName(egg),
    breed: egg.breed,
    breedUncertain: egg.breedUncertain,
    hatchDate,
    sire: "",
    dam: "",
    notes: "",
    fromEggId: egg.id,
    createdAt: now,
    updatedAt: now,
    synced: 0,
  };
}

/** True when the keeper hasn't added anything to an auto-created chick profile yet. */
export function isUntouched(bird: Bird, egg: Pick<Egg, "label">): boolean {
  return !bird.photo && !bird.notes?.trim() && !bird.sire?.trim() && !bird.dam?.trim() && bird.name === chickName(egg);
}

export type FlockAction =
  | { kind: "create"; bird: Bird }
  | { kind: "update"; changes: Partial<Bird> }
  | { kind: "remove" }
  | { kind: "none" };

/**
 * What the flock register should do after an egg is saved.
 * - Becomes hatched → create the chick's profile (once).
 * - Still hatched → keep the profile's breed in step with the egg.
 * - No longer hatched → drop the profile only if nothing was added to it.
 */
export function flockActionForEgg(
  egg: Egg,
  prevStatus: EggStatus,
  existing: Bird | undefined,
  today: string,
  now: number,
): FlockAction {
  if (egg.status === "hatched") {
    if (!existing) return prevStatus === "hatched" ? { kind: "none" } : { kind: "create", bird: birdFromHatchedEgg(egg, today, now) };
    if (existing.breed === egg.breed && !!existing.breedUncertain === egg.breedUncertain) return { kind: "none" };
    return { kind: "update", changes: { breed: egg.breed, breedUncertain: egg.breedUncertain, updatedAt: now, synced: 0 } };
  }
  if (existing && prevStatus === "hatched" && isUntouched(existing, egg)) return { kind: "remove" };
  return { kind: "none" };
}

/** "5 days old", "6 weeks old", "4 months old", "2 years old". */
export function ageLabel(hatchDate: string | undefined, today: string): string | null {
  if (!hatchDate) return null;
  const days = Math.round((parseDay(today).getTime() - parseDay(hatchDate).getTime()) / 86400000);
  if (days < 0) return null;
  if (days === 0) return "Hatched today";
  if (days < 14) return `${days} day${days === 1 ? "" : "s"} old`;
  if (days < 16 * 7) return `${Math.floor(days / 7)} weeks old`;
  if (days < 730) return `${Math.floor(days / 30.44)} months old`;
  return `${Math.floor(days / 365.25)} years old`;
}

/** Shrink a phone photo before storing it on the device (max 1200px, JPEG). */
export async function shrinkPhoto(file: Blob, max = 1200): Promise<Blob> {
  const img = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  img.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not read that photo"))), "image/jpeg", 0.85),
  );
}
