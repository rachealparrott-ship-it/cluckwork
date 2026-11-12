import { describe, expect, it } from "vitest";
import { parseAdvice, sexingInputSchema, toAgeDays } from "./sexing-helper";

const base = { breed: "Cream Legbar", breedUncertain: false, ageUnit: "days" as const };

describe("sexing helper input", () => {
  it("converts weeks to days", () => {
    expect(toAgeDays(6, "weeks")).toBe(42);
    expect(toAgeDays(3, "days")).toBe(3);
  });
  it("requires a breed", () => {
    expect(sexingInputSchema.safeParse({ ...base, breed: "  ", age: 2 }).success).toBe(false);
  });
  it("accepts chicks up to 52 weeks and rejects older", () => {
    expect(sexingInputSchema.safeParse({ ...base, age: 52, ageUnit: "weeks" }).success).toBe(true);
    expect(sexingInputSchema.safeParse({ ...base, age: 53, ageUnit: "weeks" }).success).toBe(false);
  });
  it("rejects negative age", () => {
    expect(sexingInputSchema.safeParse({ ...base, age: -1 }).success).toBe(false);
  });
});

describe("parseAdvice", () => {
  it("rejects an unknown reliability rating", () => {
    const bad = { headline: "x", signs: [{ title: "t", whatToLook: "w", when: "now", reliability: "certain" }], caveats: [], nextLook: "", certainty: "" };
    expect(parseAdvice(JSON.stringify(bad))).toBeNull();
  });
  it("rejects non-JSON text", () => {
    expect(parseAdvice("not json")).toBeNull();
  });
});
