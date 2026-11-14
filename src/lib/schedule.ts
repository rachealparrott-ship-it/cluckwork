export type MilestoneKind = "candle1" | "candle2" | "candle3" | "lockdown" | "hatch";

export interface Milestone {
  kind: MilestoneKind;
  day: number;
  date: string; // YYYY-MM-DD
  label: string;
}

export const MILESTONES: { kind: MilestoneKind; day: number; label: string }[] = [
  { kind: "candle1", day: 7, label: "First candling" },
  { kind: "candle2", day: 14, label: "Second candling" },
  { kind: "candle3", day: 18, label: "Final candling – before lockdown" },
  { kind: "lockdown", day: 18, label: "Lockdown – stop turning" },
  { kind: "hatch", day: 21, label: "Hatch due" },
];

export function parseDay(iso: string): Date {
  const [y = 1970, m = 1, d = 1] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(iso: string, n: number): string {
  const d = parseDay(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return toIso(d);
}

/** Day of incubation (set date = day 0). */
export function incubationDay(setDate: string, today: string): number {
  return Math.round((parseDay(today).getTime() - parseDay(setDate).getTime()) / 86400000);
}

/** Written chicken-incubation guidance, shared by every batch; no network or AI. */
export function guidanceForDay(day: number) {
  const candle = [7, 14, 18].includes(day);
  const turn = day >= 1 && day < 18;
  const phase = day < 0 ? "waiting" : day === 0 ? "set" : day < 18 ? "incubating" : day < 21 ? "lockdown" : day === 21 ? "hatch" : "late";
  const humidity = day >= 18 ? { min: 65, max: 70 } : undefined;
  const reminder = phase === "waiting"
    ? "Check the incubator is ready for your set date."
    : phase === "set"
      ? "Set your eggs, check water and temperature, and follow your incubator's turning instructions."
      : turn
        ? "Turn eggs (or check the automatic turner), check water and check temperature."
        : "Keep turning off, check temperature and humidity through the display, and keep the lid closed.";
  return { phase, candle, turn, humidity, reminder };
}

export function milestonesFor(setDate: string): Milestone[] {
  return MILESTONES.map((m) => ({ ...m, date: addDays(setDate, m.day) }));
}

export function localToday(): string {
  return toLocalIso(new Date());
}

/** A moment as the device's local calendar date (YYYY-MM-DD). */
export function toLocalIso(n: Date): string {
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

export function formatDay(iso: string): string {
  return parseDay(iso).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}
