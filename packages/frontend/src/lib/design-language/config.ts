export const designLanguages = [
  {
    id: "zine",
    shortName: "DuitLater",
    name: "Pitch Zine + Brutalist + SaaS",
    badge: "DuitLater brand DNA",
    description:
      "Editorial-collage zine identity (brush headlines, scribbles, paper grain) wrapped in neo-brutalist surfaces (square corners, hard offset shadows, thick borders) on a SaaS structural skeleton (predictable nav, dense info hierarchy).",
    tokens: "Teal · cream paper · brick · forest · burnt orange",
    traits: ["Anton + Splatink", "Hard offset shadows", "Square corners + 2px ink borders"],
  },
] as const;

export type DesignLanguage = (typeof designLanguages)[number]["id"];

export const defaultDesignLanguage: DesignLanguage = "zine";
export const designLanguageStorageKey = "duitlater.design-language";

const designLanguageSet = new Set<DesignLanguage>(designLanguages.map((item) => item.id));

export function isDesignLanguage(value: string | null | undefined): value is DesignLanguage {
  return typeof value === "string" && designLanguageSet.has(value as DesignLanguage);
}
