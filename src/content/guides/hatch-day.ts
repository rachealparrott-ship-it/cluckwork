import type { Guide } from "./types";

export const hatchDay: Guide = {
  slug: "hatch-day",
  title: "Lockdown and hatch day",
  summary: "From day 18 to late hatches: humidity, a closed lid and letting chicks hatch in their own time.",
  topic: "Hatching",
  readMinutes: 3,
  updated: "2026-11-14",
  sections: [
    {
      id: "lockdown",
      heading: "Day 18: lockdown",
      points: [
        "Complete any final candling before lockdown, then stop turning. Remove or disable the turner as your incubator's instructions advise and place eggs in their hatching position.",
        "Raise relative humidity to about 65–70%, following your incubator's hatching instructions. Keep ventilation open: chicks need oxygen, so never block vents to raise humidity.",
        "Don't open the lid during hatching. Use an external water-fill point if your incubator has one, and check temperature and humidity from outside.",
        "Follow your incubator's temperature instructions. Forced-air and still-air machines need different settings; do not raise the temperature to hurry a hatch.",
      ],
    },
    {
      id: "hatching",
      heading: "Day 21: hatch day",
      points: [
        "Chicken eggs usually hatch around day 21, counting the set date as day 0. Timing varies; not every chick hatches together.",
        "A chick first breaks into the air cell, then makes a small hole in the shell (an external pip), rests, and works around the shell to hatch. Long pauses can be normal.",
        "Keep the lid closed and humidity steady. Do not peel shell or membrane just because a chick is slow: it may still be absorbing yolk and blood vessels may still be active.",
        "Prepare a warm brooder with chick starter feed and a shallow, safe waterer. Transfer dry, fluffy chicks when the hatch allows it, following the incubator maker's advice and avoiding opening while other eggs are pipping.",
        "Mark each chick Hatched and save its egg record to create its flock profile.",
      ],
    },
    {
      id: "late",
      heading: "Day 22+: late hatches",
      points: [
        "Continue lockdown: no turning, steady hatching humidity, and observation through the lid. A slightly cool incubator can delay hatching.",
        "Day 22 alone does not mean an egg has failed. Do not discard eggs solely because the due date has passed, and do not open or candle pipped eggs.",
        "If progress has stopped or you are unsure when to end the hatch, seek advice from an experienced poultry keeper or poultry vet before assisting or discarding eggs. Keep a record of temperature and hatch timing.",
        "Remove leaking or foul-smelling eggs carefully if needed for safety, keeping disturbance to the other eggs as brief as possible.",
      ],
    },
  ],
  sources: [
    { title: "Important incubation factors – Mississippi State University Extension", url: "https://extension.msstate.edu/agriculture/livestock/poultry/important-incubation-factors" },
    { title: "Hatching Quality Chicks – Mississippi State University Extension", url: "https://extension.msstate.edu/sites/default/files/publications/P1182_web-1.pdf" },
  ],
};