import { z } from "zod";
import type { Guide, Reliability } from "@/content/guides/types";

/** Oldest chick the helper accepts, in days. By about 20 weeks most birds show their sex plainly. */
export const MAX_AGE_DAYS = 52 * 7;

export const sexingInputSchema = z.object({
  breed: z.string().trim().min(1, "Enter a breed").max(80, "Keep the breed under 80 characters"),
  breedUncertain: z.boolean(),
  age: z.number({ invalid_type_error: "Enter the chick's age" }).finite().min(0, "Age can't be negative"),
  ageUnit: z.enum(["days", "weeks"]),
  parents: z.string().trim().max(120, "Keep this under 120 characters").optional(),
}).refine((v) => toAgeDays(v.age, v.ageUnit) <= MAX_AGE_DAYS, {
  message: "The helper covers chicks up to 52 weeks old",
  path: ["age"],
});

export type SexingInput = z.infer<typeof sexingInputSchema>;

export function toAgeDays(age: number, unit: "days" | "weeks"): number {
  return Math.round(unit === "weeks" ? age * 7 : age);
}

/** Human description of an age in days, e.g. "Day-old", "10 days", "6 weeks". */
export function describeAge(days: number): string {
  if (days <= 1) return "day-old";
  if (days < 14) return `${days} days old`;
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks === 1 ? "" : "s"} old`;
}

export interface SexingSign {
  title: string;
  whatToLook: string;
  when: string;
  reliability: Reliability;
}

export interface SexingAdvice {
  headline: string;
  signs: SexingSign[];
  caveats: string[];
  nextLook: string;
  certainty: string;
}

export type SexingResult =
  | { ok: true; advice: SexingAdvice }
  | { ok: false; error: string };

const RELIABILITIES = ["reliable", "fair", "hint"] as const;

/** JSON schema the model must follow (strict structured output). */
export const sexingAdviceJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["headline", "signs", "caveats", "nextLook", "certainty"],
  properties: {
    headline: { type: "string", description: "One or two plain sentences: what can realistically be told for this breed at this age." },
    signs: {
      type: "array",
      description: "Signs worth checking now or soon, most useful first. 2 to 6 items.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "whatToLook", "when", "reliability"],
        properties: {
          title: { type: "string" },
          whatToLook: { type: "string", description: "What a cockerel vs a pullet shows, in plain words." },
          when: { type: "string", description: "Age window, e.g. 'Now', '3–6 weeks'." },
          reliability: { type: "string", enum: [...RELIABILITIES] },
        },
      },
    },
    caveats: { type: "array", items: { type: "string" }, description: "Breed-specific caveats and things that commonly mislead. 1 to 5 items." },
    nextLook: { type: "string", description: "When to look again and what should be clearer then." },
    certainty: { type: "string", description: "How sure anyone can be at this age, and what would confirm it (e.g. crowing, laying, DNA test)." },
  },
} as const;

const adviceSchema = z.object({
  headline: z.string().min(1),
  signs: z.array(z.object({
    title: z.string().min(1),
    whatToLook: z.string().min(1),
    when: z.string(),
    reliability: z.enum(RELIABILITIES),
  })).min(1).max(8),
  caveats: z.array(z.string()).max(8),
  nextLook: z.string(),
  certainty: z.string(),
});

/** Parse and check the model's JSON. Returns null when it doesn't match the expected shape. */
export function parseAdvice(text: string): SexingAdvice | null {
  try {
    const r = adviceSchema.safeParse(JSON.parse(text));
    return r.success ? r.data : null;
  } catch {
    return null;
  }
}

/** Compact plain-text version of a guide, used as the model's reference material. */
export function guideToReference(guide: Guide): string {
  const lines: string[] = [`# ${guide.title}`];
  for (const s of guide.sections) {
    lines.push(`\n## ${s.heading}`);
    if (s.intro) lines.push(s.intro);
    for (const p of s.points ?? []) lines.push(`- ${p}`);
    for (const g of s.signs ?? []) {
      const meta = [g.when, g.appliesTo, g.reliability].filter(Boolean).join(" | ");
      lines.push(`- ${g.title} [${meta}]: ${g.body}`);
    }
  }
  return lines.join("\n");
}
