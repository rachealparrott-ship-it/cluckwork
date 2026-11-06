import { describe, expect, it } from "vitest";
import { incubationDay, milestonesFor } from "./schedule";

describe("incubation schedule", () => {
  const ms = milestonesFor("2026-11-01");
  const by = (k: string) => ms.find((m) => m.kind === k)!.date;
  it("candles on day 7", () => expect(by("candle1")).toBe("2026-11-08"));
  it("candles on day 14", () => expect(by("candle2")).toBe("2026-11-15"));
  it("locks down on day 18", () => expect(by("lockdown")).toBe("2026-11-19"));
  it("hatch due day 21, across month end", () =>
    expect(milestonesFor("2026-11-20").find((m) => m.kind === "hatch")!.date).toBe("2026-12-11"));
  it("counts set date as day 0", () => expect(incubationDay("2026-11-01", "2026-11-01")).toBe(0));
});
