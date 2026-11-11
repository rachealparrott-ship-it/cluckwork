import type { Guide } from "./types";

export const sexingChicks: Guide = {
  slug: "sexing-chicks",
  title: "Cockerel or pullet? Sexing your chicks",
  summary: "What to look for from hatch day to 20 weeks, which signs you can trust, and the myths to ignore.",
  topic: "Chicks",
  readMinutes: 6,
  updated: "2026-11-11",
  sections: [
    {
      id: "why-hard",
      heading: "Why it's tricky",
      intro:
        "A cockerel's reproductive organs sit inside his body, so there's nothing obvious to see at hatch. Day-old cockerels and pullets weigh the same, and in most breeds they look the same too.",
      points: [
        "Hatcheries use vent sexing, which takes long, specialist training. It isn't a realistic option for backyard keepers.",
        "Some breeds and crosses can be sexed at hatch by down colour or wing feathers, but only those specific ones.",
        "For everything else, the most reliable approach is to watch them grow and look for several signs together, not just one.",
      ],
    },
    {
      id: "at-hatch",
      heading: "At hatch: down colour and markings",
      intro: "These only work for the breeds and crosses named. Use them on any other chick and you're just guessing.",
      signs: [
        {
          title: "Autosexing breeds",
          when: "At hatch",
          appliesTo: "Cream Legbar and other autosexing pure breeds",
          reliability: "reliable",
          body: "Cream Legbar pullets have distinct dark and light 'chipmunk' stripes down the back and through the eye. Cockerels are paler all over, with blurred or missing stripes and a pale spot on the head. Because they're pure breeds, they breed true and pass this on.",
        },
        {
          title: "Barred Plymouth Rock head spot",
          when: "At hatch",
          appliesTo: "Purebred Barred Rocks (similar in Dominiques)",
          reliability: "fair",
          body: "Both sexes have a pale spot on top of the head. Cockerels' spots are large and fuzzy-edged. Pullets' are smaller, narrower and more sharply defined, and pullets look darker overall. About 80% accurate. It helps to look from above with the chicks side by side.",
        },
        {
          title: "Black sex-links",
          when: "At hatch",
          appliesTo: "Non-barred cockerel (e.g. Rhode Island Red) × barred hen",
          reliability: "reliable",
          body: "All the chicks have black down, but the cockerels have a white spot on the head and grow up barred like their mother. Pullets grow up solid black. This only works this way round: a barred cockerel over a non-barred hen doesn't give sexable chicks.",
        },
        {
          title: "Red / gold sex-links",
          when: "At hatch",
          appliesTo: "Gold cockerel × silver hen crosses",
          reliability: "reliable",
          body: "Pullets hatch gold, buff or red. Cockerels hatch pale yellow or white.",
        },
        {
          title: "Cuckoo Marans",
          when: "At hatch",
          appliesTo: "Purebred Cuckoo Marans",
          reliability: "hint",
          body: "Cockerels are usually lighter than pullets, but this isn't a guarantee.",
        },
        {
          title: "Rhode Island Red wing spot",
          when: "At hatch",
          appliesTo: "Rhode Island Reds and New Hampshires",
          reliability: "hint",
          body: "Cockerels often have a white spot on the down over the wing web. The size of the spot varies a lot, so it's not always accurate, and it disappears once the down is replaced by feathers.",
        },
      ],
    },
    {
      id: "feather-sexing",
      heading: "Days 1–3: feather sexing",
      intro:
        "This only works when the father is from a fast-feathering line and the mother from a slow-feathering one. That's common in commercial hybrids but rare in pure breeds. It can only be read in the first few days.",
      signs: [
        {
          title: "Compare the two rows of wing feathers",
          when: "Days 1–3",
          appliesTo: "Feather-sexable crosses only",
          reliability: "reliable",
          body: "Gently spread the wing and look at the outer half from above. The top row is the coverts and the row underneath is the primaries. If the primaries are clearly longer than the coverts, it's a pullet. If they're the same length or shorter, it's a cockerel.",
        },
      ],
    },
    {
      id: "early-weeks",
      heading: "2–8 weeks: early clues",
      signs: [
        {
          title: "Feather colour in certain breeds",
          when: "2–3 weeks",
          appliesTo: "Salmon Faverolles, Wheaten Marans and other wheaten colours",
          reliability: "fair",
          body: "The chicks look alike at hatch, but by two to three weeks cockerels start growing dark brown or black feathers, while pullets grow lighter brown or buff ones.",
        },
        {
          title: "Comb and wattles",
          when: "From about 3–6 weeks",
          appliesTo: "Most breeds, especially single-combed ones",
          reliability: "fair",
          body: "A cockerel's comb and wattles start growing sooner and turn red sooner. Pullets' stay small and pale for longer. The timing varies by breed, so compare chicks of the same breed and age. This is harder in pea-combed and other small-combed breeds.",
        },
        {
          title: "Size, head and legs",
          when: "From about 4–6 weeks",
          appliesTo: "Most breeds",
          reliability: "hint",
          body: "Cockerels tend to grow bigger, with thicker legs and a broader, more angular head. Pullets stay smaller and finer.",
        },
        {
          title: "Behaviour",
          when: "Any age",
          appliesTo: "All",
          reliability: "hint",
          body: "Standing tall, chest-bumping and early attempts at crowing all point to a cockerel. But pullets can be bold too, and a dominant hen can occasionally crow, so never decide on behaviour alone.",
        },
      ],
    },
    {
      id: "feathers",
      heading: "10–22 weeks: hackles and saddles",
      intro:
        "For most breeds, the most reliable sign is the shape of the neck and back feathers. They start to show from around 10–12 weeks and are easiest to read at about 14–22 weeks.",
      signs: [
        {
          title: "Hackle (neck) feathers",
          when: "From about 10–12 weeks",
          appliesTo: "Most breeds",
          reliability: "reliable",
          body: "A cockerel's hackle feathers are long, narrow, pointed and shiny. A pullet's are shorter and rounded at the tip, like a neat cape.",
        },
        {
          title: "Saddle feathers",
          when: "From about 12–16 weeks",
          appliesTo: "Most breeds",
          reliability: "reliable",
          body: "Only cockerels grow saddle feathers: long, pointed feathers on the lower back that drape down in front of the tail. A pullet's back has rounded feathers instead.",
        },
        {
          title: "Sickle tail feathers",
          when: "From about 16 weeks",
          appliesTo: "Most breeds",
          reliability: "reliable",
          body: "Long, curved sickle feathers arching over the tail are a cockerel trait.",
        },
        {
          title: "Comb shape",
          when: "Older birds",
          appliesTo: "Single-combed breeds such as Leghorns",
          reliability: "fair",
          body: "A cockerel's comb stands upright. A hen's single comb often flops over to one side.",
        },
        {
          title: "Crests",
          when: "Older birds",
          appliesTo: "Crested breeds such as Polish, Sultans and Crèvecœurs",
          reliability: "fair",
          body: "A cockerel's crest feathers are pointed and spiky. A pullet's curve into a soft, rounded pom-pom.",
        },
      ],
    },
    {
      id: "confirming",
      heading: "Confirming it",
      signs: [
        {
          title: "Crowing",
          when: "Often 3–5 months",
          appliesTo: "All",
          reliability: "fair",
          body: "Cockerels move from cheeping to wobbly attempts at crowing. It's a strong sign, but now and then a hen crows too, especially in a flock with no cockerel.",
        },
        {
          title: "Spurs",
          when: "Later, up to about a year",
          appliesTo: "All",
          reliability: "fair",
          body: "Cockerels grow bigger spurs. Some hens grow small ones, so look at size rather than just whether they're there.",
        },
        {
          title: "Laying",
          when: "From about 18–24 weeks",
          appliesTo: "All",
          reliability: "reliable",
          body: "An egg settles it. Most pullets start laying at around 20 weeks if light and feed are right. Heritage breeds can take longer.",
        },
      ],
    },
    {
      id: "tricky-breeds",
      heading: "Breeds that fool people",
      points: [
        "Sebrights and Campines are 'hen-feathered': the cockerels have female-shaped hackle and saddle feathers, so feather shape won't help.",
        "Silkies' feathers lack the barbs that give hackles their pointed or rounded shape, which makes them hard to sex. Watch for comb size, wattles and crowing.",
        "Pea-combed breeds (Brahmas, Easter Eggers and others) have small combs in both sexes, so wait for the feathers.",
        "Bantams develop on the same timeline, but everything is smaller and harder to judge, so compare birds side by side.",
      ],
    },
    {
      id: "myths",
      heading: "Myths to ignore",
      intro: "None of these work any better than a coin toss.",
      points: [
        "Egg shape: long, pointy eggs don't make cockerels, and round eggs don't make pullets. Shape has nothing to do with the chick's sex.",
        "Candling: you can see whether an egg is developing, but not whether it's a cockerel or a pullet.",
        "Ring or needle on a string: swinging in circles or side to side tells you nothing.",
        "Air cell position or egg weight: neither is linked to the chick's sex.",
      ],
    },
  ],
  sources: [
    { title: "Sexing day-old chicks – University of Kentucky (Poultry Extension)", url: "https://poultry.extension.org/articles/poultry-management/sexing-day-old-chicks/" },
    { title: "Sex-linked traits in poultry – University of Kentucky (Poultry Extension)", url: "https://poultry.extension.org/articles/poultry-anatomy/poultry-genetics-an-introduction/sex-linked-traits-in-poultry/" },
    { title: "Sexing of day-old chicks – Mississippi State University Extension", url: "https://extension.msstate.edu/agriculture/livestock/poultry/sexing-day-old-chicks" },
    { title: "Feather sexing day-old chicks – Aviagen", url: "https://en.aviagen.com/assets/Tech_Center/BB_Resources_Tools/AA_How_Tos/AA-How-to-11-FeatherSexDayOldChicks-EN-17.pdf" },
    { title: "Cream Legbar – Rare Breeds Survival Trust", url: "https://www.rbst.org.uk/watchlist-breed/cream-legbar/" },
    { title: "Autosexing poultry – Poultrykeeper", url: "https://poultrykeeper.com/poultry-breeding/autosexing-poultry/" },
    { title: "Identifying sex-linked and autosexing breeds – Meyer Hatchery", url: "https://meyerhatchery.zendesk.com/hc/en-us/articles/21968631145101-Identifying-the-gender-of-sex-linked-and-autosexing-breeds" },
    { title: "Is my bird male or female? – Meyer Hatchery", url: "https://meyerhatchery.zendesk.com/hc/en-us/articles/360010076971-Is-my-bird-male-or-female" },
    { title: "Biology of the fowl – Penn State 4-H", url: "https://abe.psu.edu/programs/4-h/get-involved/teachers/embryology/teacher-resources/supporting-subject-matter/the-chicken/biology-of-the-fowl" },
  ],
};
