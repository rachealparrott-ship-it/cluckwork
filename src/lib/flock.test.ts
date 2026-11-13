import { describe, expect, it } from "vitest";
import type { Bird, Egg } from "./db";
import { flockActionForEgg } from "./flock";

const egg = (over: Partial<Egg> = {}): Egg => ({
  id: "egg-1", batchId: "b1", position: 0, label: "A1", breed: "Barred Rock", breedUncertain: false,
  source: "", status: "hatched", updatedAt: 1, synced: 0, ...over,
});
const bird = (over: Partial<Bird> = {}): Bird => ({
  id: "egg-1", name: "Chick A1", breed: "Barred Rock", breedUncertain: false, hatchDate: "2026-11-13",
  sire: "", dam: "", notes: "", fromEggId: "egg-1", updatedAt: 1, synced: 1, ...over,
});

describe("flock register from hatched eggs", () => {
  it("creates a bird profile when an egg is marked hatched, with breed and hatch date", () => {
    const a = flockActionForEgg(egg(), "developing", undefined, "2026-11-13", 100);
    expect(a.kind).toBe("create");
    if (a.kind !== "create") return;
    expect(a.bird).toMatchObject({ id: "egg-1", fromEggId: "egg-1", name: "Chick A1", breed: "Barred Rock", hatchDate: "2026-11-13" });
  });

  it("does not create a second profile when a hatched egg is saved again", () => {
    expect(flockActionForEgg(egg(), "hatched", bird(), "2026-11-14", 100).kind).toBe("none");
  });

  it("does not recreate a profile the keeper deleted", () => {
    expect(flockActionForEgg(egg(), "hatched", undefined, "2026-11-14", 100).kind).toBe("none");
  });

  it("updates the profile's breed when it is corrected on the egg", () => {
    const a = flockActionForEgg(egg({ breed: "Cuckoo Maran" }), "hatched", bird(), "2026-11-14", 100);
    expect(a).toMatchObject({ kind: "update", changes: { breed: "Cuckoo Maran" } });
  });

  it("removes an untouched profile when the egg is changed back from hatched", () => {
    expect(flockActionForEgg(egg({ status: "quit" }), "hatched", bird(), "2026-11-14", 100).kind).toBe("remove");
  });

  it("keeps the profile if the keeper added notes or parents", () => {
    expect(flockActionForEgg(egg({ status: "quit" }), "hatched", bird({ notes: "Lively" }), "2026-11-14", 100).kind).toBe("none");
    expect(flockActionForEgg(egg({ status: "quit" }), "hatched", bird({ dam: "Henrietta" }), "2026-11-14", 100).kind).toBe("none");
  });

  it("creates nothing for eggs that never hatched", () => {
    expect(flockActionForEgg(egg({ status: "clear" }), "developing", undefined, "2026-11-14", 100).kind).toBe("none");
  });
});
