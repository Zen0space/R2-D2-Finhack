export const designLanguages = [
  {
    id: "zine",
    shortName: "Zine",
    name: "Pitch Zine",
    badge: "Pitch deck DNA",
    description: "Editorial collage — torn paper, brush headlines, hand-drawn scribbles, meme cats. Match deck FINHACK 2026.",
    tokens: "Teal, cream paper, brick red, forest green, burnt orange",
    traits: ["Brush + condensed display", "Paper grain", "Cat humanizers"],
  },
  {
    id: "neo-nusantara",
    shortName: "Neo",
    name: "Neo Nusantara",
    badge: "Heritage base",
    description: "Editorial, BM-first, dan terasa seperti produk institusi yang hangat dan tersusun.",
    tokens: "Cream parchment, heritage maroon, tabung gold",
    traits: ["Typography-led", "Warm surfaces", "Quiet hierarchy"],
  },
  {
    id: "skeu",
    shortName: "Skeu",
    name: "Skeumorphism",
    badge: "Experimental",
    description: "Lebih tactile, depth lebih tebal, dan affordance lebih jelas pada surface serta control.",
    tokens: "Orange-red, amber, white",
    traits: ["Raised controls", "Playful depth", "Physical cues"],
  },
] as const;

export type DesignLanguage = (typeof designLanguages)[number]["id"];

export const defaultDesignLanguage: DesignLanguage = "zine";
export const designLanguageStorageKey = "duitlater.design-language";

const designLanguageSet = new Set<DesignLanguage>(designLanguages.map((item) => item.id));

export function isDesignLanguage(value: string | null | undefined): value is DesignLanguage {
  return typeof value === "string" && designLanguageSet.has(value as DesignLanguage);
}
