import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { sexingChicks } from "@/content/guides/sexing-chicks";
import {
  describeAge,
  guideToReference,
  parseAdvice,
  sexingAdviceJsonSchema,
  sexingInputSchema,
  toAgeDays,
  type SexingResult,
} from "./sexing-helper";

const INSTRUCTIONS = `You help backyard poultry keepers judge whether a young chicken is likely a cockerel or a pullet.
Write in warm, plain British English for a non-expert reading outdoors on a phone. Short sentences, no jargon without explaining it.

Rules:
- Base your answer on the reference guide below plus well-established poultry science. Never invent breed traits. If you are not sure a trait applies to this breed, say so or leave it out.
- Only include signs that make sense for the chick's age right now or within the next few weeks. Say plainly when a sign's window has passed (e.g. feather sexing after day 3, down colour once feathers replace down).
- Rate each sign: "reliable" (trustworthy on its own for this breed), "fair" (usually right, combine with others), "hint" (weak, never decide on it alone).
- Autosexing, sex-link and feather-sexing rules only work for the exact breeds/crosses they apply to. If the breed is uncertain, mixed, or a barnyard cross, fall back to general signs and say why.
- Mention breed-specific caveats: slow-maturing breeds, breeds where hens have large combs (e.g. Leghorns, Minorcas), small-combed breeds (e.g. Silkies, Brahmas, Wyandottes, Chanteclers), bantams, and breeds where both sexes can look similar.
- Never claim certainty before clear adult traits (crowing, pointed hackle/saddle feathers, laying). Vent sexing by a trained sexer or a DNA feather test are the only certain early methods.
- Debunk myths (egg shape, pendulum, temperament at hatch) if relevant to the keeper's details.

Reference guide:
${guideToReference(sexingChicks)}`;

export const explainSexingSigns = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => sexingInputSchema.parse(input))
  .handler(async ({ data }): Promise<SexingResult> => {
    const { generateResponse, GatewayError, PaymentRequiredError, RateLimitError } = await import("@lovable.dev/ai-gateway");
    const ageDays = toAgeDays(data.age, data.ageUnit);
    const details = [
      `Breed: ${data.breed}${data.breedUncertain ? " (the keeper is NOT sure of the breed)" : ""}`,
      `Age: ${ageDays} days (${describeAge(ageDays)})`,
      data.parents ? `Parents / cross: ${data.parents}` : "Parents / cross: not given",
    ].join("\n");

    try {
      const res = await generateResponse({
        model: "openai/gpt-6-astra",
        reasoning: { effort: "low" },
        instructions: INSTRUCTIONS,
        input: [{ role: "user", content: `Explain the likely sexing signs for this chick.\n\n${details}` }],
        text: {
          format: { type: "json_schema", name: "sexing_advice", strict: true, schema: sexingAdviceJsonSchema },
        },
      });

      let text = "";
      for (const item of res.output ?? []) {
        if (item.type !== "message") continue;
        for (const c of item.content) {
          if (c.type === "refusal") return { ok: false, error: "The helper couldn't answer that one. Try rewording the breed." };
          if (c.type === "output_text") text += c.text;
        }
      }
      const advice = parseAdvice(text);
      if (!advice) {
        console.error("sexing helper: unexpected model output", res.status, text.slice(0, 500));
        return { ok: false, error: "The helper gave an incomplete answer. Please try again." };
      }
      return { ok: true, advice };
    } catch (err) {
      if (err instanceof PaymentRequiredError) return { ok: false, error: "The helper is out of AI credits right now. Please try again later." };
      if (err instanceof RateLimitError) return { ok: false, error: "The helper is busy. Please wait a minute and try again." };
      if (err instanceof GatewayError) {
        console.error("sexing helper gateway error", err.code, err.httpStatus, err.ids);
        return { ok: false, error: "Couldn't reach the helper. Check your connection and try again." };
      }
      throw err;
    }
  });
