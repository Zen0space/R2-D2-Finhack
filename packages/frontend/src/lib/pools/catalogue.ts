import type {
  CatalogueProduct,
  PoolNeedCategory,
  PoolRecord,
  PoolSuggestionFilter,
  PoolSuggestionRecord,
} from "@/types/pool";

export const myKasihCatalogue: CatalogueProduct[] = [
  {
    id: "mk-beras-10kg",
    nameBm: "Rice 10kg",
    category: "makanan",
    priceCents: 4_200,
    descriptionBm: "Basic kitchen staple for the family for a full week.",
    imageUrl: null,
    keywords: ["rice", "kitchen", "eat", "staple", "food"],
  },
  {
    id: "mk-minyak-masak",
    nameBm: "Cooking oil 5kg",
    category: "makanan",
    priceCents: 3_400,
    descriptionBm: "Daily cooking essential for the family kitchen.",
    imageUrl: null,
    keywords: ["oil", "cooking", "kitchen", "food"],
  },
  {
    id: "mk-pakej-dapur-asas",
    nameBm: "Basic kitchen pack",
    category: "makanan",
    priceCents: 9_800,
    descriptionBm: "A combined set of kitchen basics to start the month with stock at home.",
    imageUrl: null,
    keywords: ["kitchen", "supply", "food", "basics"],
  },
  {
    id: "mk-hamper-protein",
    nameBm: "Family protein hamper",
    category: "makanan",
    priceCents: 15_800,
    descriptionBm: "Dry food and protein stock for household use.",
    imageUrl: null,
    keywords: ["food", "family", "storage", "kitchen"],
  },
  {
    id: "mk-stok-susu-anak",
    nameBm: "Child milk supply (4 cans)",
    category: "makanan",
    priceCents: 17_900,
    descriptionBm: "Milk supply for school-age children at home.",
    imageUrl: null,
    keywords: ["child", "milk", "school", "family"],
  },
  {
    id: "mk-set-alat-tulis",
    nameBm: "School stationery set",
    category: "alat-sekolah",
    priceCents: 2_900,
    descriptionBm: "Basic stationery set for daily school use.",
    imageUrl: null,
    keywords: ["school", "stationery", "child", "study"],
  },
  {
    id: "mk-buku-latihan",
    nameBm: "Workbook pack",
    category: "alat-sekolah",
    priceCents: 3_900,
    descriptionBm: "Extra workbooks for revision at home.",
    imageUrl: null,
    keywords: ["book", "workbook", "school", "study"],
  },
  {
    id: "mk-beg-sekolah",
    nameBm: "Heavy-duty school bag",
    category: "alat-sekolah",
    priceCents: 7_900,
    descriptionBm: "Spacious school bag built for daily use.",
    imageUrl: null,
    keywords: ["bag", "school", "child", "study"],
  },
  {
    id: "mk-meja-belajar",
    nameBm: "Compact study desk",
    category: "alat-sekolah",
    priceCents: 14_900,
    descriptionBm: "A small dedicated study space that fits children at home.",
    imageUrl: null,
    keywords: ["desk", "study", "school", "child"],
  },
  {
    id: "mk-printer-rumah",
    nameBm: "Basic home printer",
    category: "alat-sekolah",
    priceCents: 26_900,
    descriptionBm: "Print schoolwork and important documents without leaving the house.",
    imageUrl: null,
    keywords: ["printer", "school", "documents", "study"],
  },
  {
    id: "mk-rak-simpan",
    nameBm: "Steel storage rack",
    category: "peralatan",
    priceCents: 18_900,
    descriptionBm: "Tidy household items or small stock with more order.",
    imageUrl: null,
    keywords: ["rack", "storage", "home", "equipment"],
  },
  {
    id: "mk-peti-alat",
    nameBm: "Tool box",
    category: "peralatan",
    priceCents: 12_900,
    descriptionBm: "Storage for basic tools shared across the household.",
    imageUrl: null,
    keywords: ["tools", "work", "repair", "equipment"],
  },
  {
    id: "mk-blender-keluarga",
    nameBm: "Heavy-duty blender",
    category: "peralatan",
    priceCents: 24_900,
    descriptionBm: "A more durable kitchen appliance for frequent use.",
    imageUrl: null,
    keywords: ["kitchen", "blender", "equipment", "home"],
  },
  {
    id: "mk-sealer",
    nameBm: "Tabletop plastic sealer",
    category: "peralatan",
    priceCents: 27_900,
    descriptionBm: "Suitable for small packaging or keeping stock neatly stored.",
    imageUrl: null,
    keywords: ["sewing", "packaging", "sealer", "equipment"],
  },
  {
    id: "mk-mesin-jahit",
    nameBm: "Basic sewing machine",
    category: "peralatan",
    priceCents: 64_900,
    descriptionBm: "An entry-level machine for sewing work at home or in a small community.",
    imageUrl: null,
    keywords: ["sewing", "machine", "equipment", "income"],
  },
  {
    id: "mk-seterika-wap",
    nameBm: "Steam iron",
    category: "elektrik",
    priceCents: 9_900,
    descriptionBm: "Basic electrical appliance for home use.",
    imageUrl: null,
    keywords: ["electrical", "home", "iron"],
  },
  {
    id: "mk-kipas-berdiri",
    nameBm: "Standing fan",
    category: "elektrik",
    priceCents: 12_900,
    descriptionBm: "Basic ventilation for a bedroom or living space.",
    imageUrl: null,
    keywords: ["fan", "electrical", "home", "heat"],
  },
  {
    id: "mk-rice-cooker",
    nameBm: "1.8L rice cooker",
    category: "elektrik",
    priceCents: 15_900,
    descriptionBm: "An everyday electric kitchen appliance.",
    imageUrl: null,
    keywords: ["rice", "kitchen", "electrical", "food"],
  },
  {
    id: "mk-lampu-solar",
    nameBm: "Home solar lamp",
    category: "elektrik",
    priceCents: 21_900,
    descriptionBm: "Backup lighting if the electricity supply is disrupted.",
    imageUrl: null,
    keywords: ["lamp", "solar", "electrical", "home"],
  },
  {
    id: "mk-mesin-basuh-mini",
    nameBm: "Mini washing machine",
    category: "elektrik",
    priceCents: 48_900,
    descriptionBm: "A compact option for small homes that need help with laundry.",
    imageUrl: null,
    keywords: ["wash", "electrical", "home", "family"],
  },
  {
    id: "mk-generator-mini",
    nameBm: "Community mini generator",
    category: "elektrik",
    priceCents: 149_000,
    descriptionBm: "Suitable for shared use when the pool cap is larger.",
    imageUrl: null,
    keywords: ["generator", "surau", "electrical", "community"],
  },
  {
    id: "mk-baja-starter",
    nameBm: "Starter fertiliser",
    category: "pertanian",
    priceCents: 9_900,
    descriptionBm: "Basic input for a small garden or family plot.",
    imageUrl: null,
    keywords: ["fertiliser", "garden", "farming", "plot"],
  },
  {
    id: "mk-set-pruning",
    nameBm: "Garden pruning set",
    category: "pertanian",
    priceCents: 14_900,
    descriptionBm: "Small tools for tree and garden care.",
    imageUrl: null,
    keywords: ["pruning", "garden", "farming", "tree"],
  },
  {
    id: "mk-knapsack",
    nameBm: "Knapsack sprayer",
    category: "pertanian",
    priceCents: 31_900,
    descriptionBm: "A practical tool for spraying gardens or farming plots.",
    imageUrl: null,
    keywords: ["sprayer", "farming", "plot", "garden"],
  },
  {
    id: "mk-pam-air",
    nameBm: "Portable water pump",
    category: "pertanian",
    priceCents: 55_900,
    descriptionBm: "Helps garden work that needs more consistent water flow.",
    imageUrl: null,
    keywords: ["pump", "water", "farming", "garden"],
  },
  {
    id: "mk-mesin-rumput",
    nameBm: "Light grass cutter",
    category: "pertanian",
    priceCents: 86_900,
    descriptionBm: "Workhorse for larger garden or yard areas.",
    imageUrl: null,
    keywords: ["grass", "farming", "plot", "garden"],
  },
  {
    id: "mk-paip-fleksibel",
    nameBm: "30m flexible hose",
    category: "air",
    priceCents: 5_900,
    descriptionBm: "Basic water connector for the home or a small garden.",
    imageUrl: null,
    keywords: ["water", "hose", "home", "garden"],
  },
  {
    id: "mk-tong-air",
    nameBm: "Water storage drum",
    category: "air",
    priceCents: 7_900,
    descriptionBm: "Temporary water storage for household use.",
    imageUrl: null,
    keywords: ["water", "storage", "home", "drum"],
  },
  {
    id: "mk-dispenser",
    nameBm: "Basic water dispenser",
    category: "air",
    priceCents: 16_900,
    descriptionBm: "Better organised drinking water access for the household.",
    imageUrl: null,
    keywords: ["water", "drink", "home", "family"],
  },
  {
    id: "mk-tangki-lipat",
    nameBm: "Foldable water tank",
    category: "air",
    priceCents: 28_900,
    descriptionBm: "Extra water storage option that doesn't take permanent space.",
    imageUrl: null,
    keywords: ["water", "tank", "home", "storage"],
  },
  {
    id: "mk-penapis-air",
    nameBm: "Family water filter",
    category: "air",
    priceCents: 42_900,
    descriptionBm: "Suitable when the household needs more reliable drinking-water access.",
    imageUrl: null,
    keywords: ["water", "filter", "family", "drink"],
  },
  {
    id: "mk-rak-kasut",
    nameBm: "Family shoe rack",
    category: "rumah",
    priceCents: 8_900,
    descriptionBm: "Tidier entry organisation for a household with many members.",
    imageUrl: null,
    keywords: ["home", "storage", "rack", "family"],
  },
  {
    id: "mk-set-langsir",
    nameBm: "Basic curtain set",
    category: "rumah",
    priceCents: 11_900,
    descriptionBm: "Home finishing that helps with privacy and shade.",
    imageUrl: null,
    keywords: ["home", "curtain", "privacy"],
  },
  {
    id: "mk-meja-lipat",
    nameBm: "Multi-purpose folding table",
    category: "rumah",
    priceCents: 14_900,
    descriptionBm: "Useful for eating, studying, or small work tasks at home.",
    imageUrl: null,
    keywords: ["home", "table", "study", "family"],
  },
  {
    id: "mk-almari-plastik",
    nameBm: "Plastic cabinet",
    category: "rumah",
    priceCents: 18_900,
    descriptionBm: "Extra storage that's easy to move and assemble.",
    imageUrl: null,
    keywords: ["home", "cabinet", "storage"],
  },
  {
    id: "mk-tilam-bujang",
    nameBm: "Single mattress",
    category: "rumah",
    priceCents: 24_900,
    descriptionBm: "Basic household need when an extra sleeping space is required.",
    imageUrl: null,
    keywords: ["home", "mattress", "sleep", "family"],
  },
  {
    id: "mk-kit-gotong",
    nameBm: "Community work kit",
    category: "lain-lain",
    priceCents: 9_900,
    descriptionBm: "A small set for community use during shared activities.",
    imageUrl: null,
    keywords: ["community", "shared", "joint use"],
  },
  {
    id: "mk-kerusi-plastik",
    nameBm: "Plastic chair set",
    category: "lain-lain",
    priceCents: 17_900,
    descriptionBm: "Extra chairs for family activities or small community gatherings.",
    imageUrl: null,
    keywords: ["community", "chair", "family"],
  },
  {
    id: "mk-kanopi-mini",
    nameBm: "Mini canopy",
    category: "lain-lain",
    priceCents: 45_900,
    descriptionBm: "Suitable for small events or outdoor space at home.",
    imageUrl: null,
    keywords: ["community", "canopy", "outdoor"],
  },
] as const;

function calculatePoolCapCents(pool: PoolRecord) {
  return pool.combinedCapCents ?? pool.members.reduce((sum, member) => sum + member.individualAllowanceCents, 0);
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function categoryRelevanceScore(productCategory: PoolNeedCategory, poolCategory: PoolNeedCategory) {
  if (productCategory === poolCategory) {
    return 26;
  }

  const crossMatches: Record<PoolNeedCategory, PoolNeedCategory[]> = {
    makanan: ["rumah"],
    "alat-sekolah": ["rumah"],
    peralatan: ["elektrik", "rumah"],
    elektrik: ["peralatan", "air", "rumah"],
    pertanian: ["air", "peralatan"],
    air: ["rumah", "pertanian"],
    rumah: ["peralatan", "air", "makanan"],
    "lain-lain": ["rumah", "peralatan"],
  };

  return crossMatches[poolCategory].includes(productCategory) ? 10 : 0;
}

function seasonalContext(category: PoolNeedCategory) {
  const monthLabel = new Intl.DateTimeFormat("en-MY", { month: "long" }).format(new Date());

  if (category === "air") {
    return `${monthLabel} is still a good time to plan water storage and household drinking-water access.`;
  }

  if (category === "pertanian") {
    return `${monthLabel} suits garden work and tools built for repeat use.`;
  }

  if (category === "elektrik") {
    return `${monthLabel} also reminds us that basic electrical appliances often become a priority when the household needs daily stability.`;
  }

  return `${monthLabel} is taken into account as the current context so the suggestion stays close to real, everyday use.`;
}

function keywordScore(product: CatalogueProduct, normalizedNeedText: string) {
  return product.keywords.reduce((score, keyword) => {
    return normalizedNeedText.includes(keyword) ? score + 8 : score;
  }, 0);
}

function buildReasoning({
  product,
  pool,
  capCents,
  allocationPct,
}: {
  allocationPct: number;
  capCents: number;
  pool: PoolRecord;
  product: CatalogueProduct;
}) {
  return [
    `${product.nameBm} fits within the pool cap of ${new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
      maximumFractionDigits: 0,
    }).format(capCents / 100)} and uses about ${allocationPct}% of that total.`,
    `This suggestion is closest to the need "${pool.statedNeedText}" in the ${pool.statedNeedCategory.replace("-", " ")} category.`,
    seasonalContext(product.category),
  ].join(" ");
}

export function listCatalogueItems(filter: PoolSuggestionFilter = "semua") {
  if (filter === "semua") {
    return [...myKasihCatalogue];
  }

  return myKasihCatalogue.filter((product) => product.category === filter);
}

export function buildPoolSuggestions(
  pool: PoolRecord,
  filter: PoolSuggestionFilter = "semua",
): PoolSuggestionRecord[] {
  const capCents = calculatePoolCapCents(pool);
  const normalizedNeedText = normalizeText(pool.statedNeedText);
  const filteredProducts = listCatalogueItems(filter).filter((product) => product.priceCents <= capCents);

  const rankedProducts = filteredProducts
    .map((product) => {
      const budgetDelta = Math.abs(pool.targetBudgetCents - product.priceCents);
      const budgetScore = Math.max(0, 32 - Math.round((budgetDelta / Math.max(pool.targetBudgetCents, 1)) * 32));
      const score =
        24 +
        budgetScore +
        keywordScore(product, normalizedNeedText) +
        categoryRelevanceScore(product.category, pool.statedNeedCategory) +
        Math.max(0, 12 - Math.round((product.priceCents / Math.max(capCents, 1)) * 12));

      return {
        product,
        score,
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.product.priceCents - right.product.priceCents;
    })
    .slice(0, 5);

  return rankedProducts.map(({ product }, index) => {
    const allocationPct = Math.max(1, Math.round((product.priceCents / Math.max(capCents, 1)) * 100));

    return {
      id: `suggestion-${pool.id}-${product.id}`,
      productId: product.id,
      nameBm: product.nameBm,
      priceCents: product.priceCents,
      category: product.category,
      allocationPct,
      imageUrl: product.imageUrl,
      rank: index + 1,
      reasoningBm: buildReasoning({
        product,
        pool,
        capCents,
        allocationPct,
      }),
    };
  });
}
