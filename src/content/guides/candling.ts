import type { Guide } from "./types";

export const candling: Guide = {
  slug: "candling",
  title: "Candling your eggs",
  summary: "Checking chicken eggs on days 7, 14 and just before lockdown on day 18.",
  topic: "Hatching",
  readMinutes: 3,
  updated: "2026-11-14",
  sections: [
    {
      id: "how",
      heading: "A quick, gentle check",
      points: [
        "Use a cool LED candler in a dark room. Wash and dry your hands, hold the egg gently and avoid shaking or spinning it.",
        "Keep each check brief and return eggs promptly so they do not cool. Dark or thick shells can be difficult to see through.",
        "Day 18 is an optional final check before lockdown. Do not candle again once lockdown starts, especially after a chick has pipped.",
      ],
    },
    {
      id: "day7",
      heading: "Day 7: look for veins",
      points: [
        "A developing egg usually shows a branching network of blood vessels around a dark embryo. Movement may be visible, but lack of movement in a brief check does not prove the chick has died.",
        "A clear egg may be infertile or may have stopped very early. If the view is uncertain, leave it and check again rather than discarding a potentially living embryo.",
        "A distinct blood ring, with no healthy branching vessels, can indicate an embryo that has died. Compare with your developing eggs before deciding.",
      ],
    },
    {
      id: "day14",
      heading: "Day 14: compare progress",
      points: [
        "The embryo is larger and the egg looks darker, with an air cell at the broad end and vessels in the remaining light areas.",
        "An egg marked Developing on day 7 can stop later. Update its status to Quit if you are confident development has stopped; its earlier checks remain in the history.",
        "Little growth since the previous check and deteriorating vessels are concerning, but poor visibility alone is not proof of death.",
      ],
    },
    {
      id: "day18",
      heading: "Day 18: before lockdown",
      points: [
        "Most of the egg is now dark. Expect an air cell at the broad end; it is normal not to see the chick clearly.",
        "If you choose a final check, finish it before stopping turning and setting up lockdown. Leave doubtful eggs unless there is clear evidence they have failed.",
        "Remove eggs that are leaking or smell rotten promptly and carefully: they can contaminate the incubator. Do not crack a suspect egg inside the incubator.",
      ],
    },
  ],
  sources: [
    { title: "Hatching Quality Chicks – Mississippi State University Extension", url: "https://extension.msstate.edu/sites/default/files/publications/P1182_web-1.pdf" },
    { title: "Care and Incubation of Hatching Eggs – Mississippi State University", url: "https://www.poultry.msstate.edu/pdf/extension/incubation.pdf" },
  ],
};