import { describe, expect, it } from "vitest";
import { guidanceForDay, incubationDay, milestonesFor } from "./schedule";

describe("incubation schedule", () => {
  const ms = milestonesFor("2026-11-01");
  const by = (k: string) => ms.find((m) => m.kind === k)?.date;
  it("candles on day 7", () => expect(by("candle1")).toBe("2026-11-08"));
  it("candles on day 14", () => expect(by("candle2")).toBe("2026-11-15"));
  it("candles on day 18 before lockdown", () => expect(by("candle3")).toBe("2026-11-19"));
  it("locks down on day 18", () => expect(by("lockdown")).toBe("2026-11-19"));
  it("hatch due day 21, across month end", () =>
    expect(milestonesFor("2026-11-20").find((m) => m.kind === "hatch")?.date).toBe("2026-12-11"));
  it("counts set date as day 0", () => expect(incubationDay("2026-11-01", "2026-11-01")).toBe(0));
});

describe("daily chicken guidance", () => {
  it("candles only on days 7, 14 and 18", () => {
    expect(Array.from({ length: 25 }, (_, day) => day).filter((day) => guidanceForDay(day).candle)).toEqual([7, 14, 18]);
  });
  it("turns on days 1 to 17, never during lockdown or late hatches", () => {
    expect(Array.from({ length: 25 }, (_, day) => day).filter((day) => guidanceForDay(day).turn)).toEqual(Array.from({ length: 17 }, (_, i) => i + 1));
  });
  it("sets hatching humidity to 65–70 from day 18", () => {
    expect(guidanceForDay(17).humidity).toBeUndefined();
    for (const day of [18, 19, 20, 21, 22, 28]) expect(guidanceForDay(day).humidity).toEqual({ min: 65, max: 70 });
  });
  it("has hatch day on 21 and late hatch care from 22 onward", () => {
    expect(guidanceForDay(20).phase).toBe("lockdown");
    expect(guidanceForDay(21).phase).toBe("hatch");
    expect(guidanceForDay(22).phase).toBe("late");
    expect(guidanceForDay(30).phase).toBe("late");
  });
});
