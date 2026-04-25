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
    nameBm: "Beras 10kg",
    category: "makanan",
    priceCents: 4_200,
    descriptionBm: "Bekalan asas dapur untuk keluarga sepanjang minggu.",
    imageUrl: null,
    keywords: ["beras", "dapur", "makan", "staple", "makanan"],
  },
  {
    id: "mk-minyak-masak",
    nameBm: "Minyak masak 5kg",
    category: "makanan",
    priceCents: 3_400,
    descriptionBm: "Keperluan memasak harian untuk dapur keluarga.",
    imageUrl: null,
    keywords: ["minyak", "masak", "dapur", "makanan"],
  },
  {
    id: "mk-pakej-dapur-asas",
    nameBm: "Pakej dapur asas",
    category: "makanan",
    priceCents: 9_800,
    descriptionBm: "Kombinasi barang dapur asas untuk simpanan awal bulan.",
    imageUrl: null,
    keywords: ["dapur", "bekalan", "makanan", "asas"],
  },
  {
    id: "mk-hamper-protein",
    nameBm: "Hamper protein keluarga",
    category: "makanan",
    priceCents: 15_800,
    descriptionBm: "Stok makanan kering dan protein untuk kegunaan isi rumah.",
    imageUrl: null,
    keywords: ["makanan", "keluarga", "storan", "dapur"],
  },
  {
    id: "mk-stok-susu-anak",
    nameBm: "Stok susu anak 4 tin",
    category: "makanan",
    priceCents: 17_900,
    descriptionBm: "Bekalan susu untuk anak sekolah dalam rumah yang sama.",
    imageUrl: null,
    keywords: ["anak", "susu", "sekolah", "keluarga"],
  },
  {
    id: "mk-set-alat-tulis",
    nameBm: "Set alat tulis sekolah",
    category: "alat-sekolah",
    priceCents: 2_900,
    descriptionBm: "Set asas alat tulis untuk kegunaan harian di sekolah.",
    imageUrl: null,
    keywords: ["sekolah", "alat tulis", "anak", "belajar"],
  },
  {
    id: "mk-buku-latihan",
    nameBm: "Pakej buku latihan",
    category: "alat-sekolah",
    priceCents: 3_900,
    descriptionBm: "Buku latihan tambahan untuk ulang kaji di rumah.",
    imageUrl: null,
    keywords: ["buku", "latihan", "sekolah", "belajar"],
  },
  {
    id: "mk-beg-sekolah",
    nameBm: "Beg sekolah tahan lasak",
    category: "alat-sekolah",
    priceCents: 7_900,
    descriptionBm: "Beg sekolah dengan ruang besar untuk kegunaan harian.",
    imageUrl: null,
    keywords: ["beg", "sekolah", "anak", "belajar"],
  },
  {
    id: "mk-meja-belajar",
    nameBm: "Meja belajar kompak",
    category: "alat-sekolah",
    priceCents: 14_900,
    descriptionBm: "Ruang belajar kecil yang lebih sesuai untuk anak di rumah.",
    imageUrl: null,
    keywords: ["meja", "belajar", "sekolah", "anak"],
  },
  {
    id: "mk-printer-rumah",
    nameBm: "Printer rumah asas",
    category: "alat-sekolah",
    priceCents: 26_900,
    descriptionBm: "Cetakan kerja sekolah dan dokumen penting tanpa keluar rumah.",
    imageUrl: null,
    keywords: ["printer", "sekolah", "dokumen", "belajar"],
  },
  {
    id: "mk-rak-simpan",
    nameBm: "Rak simpan besi",
    category: "peralatan",
    priceCents: 18_900,
    descriptionBm: "Susun barang rumah atau stok kecil dengan lebih kemas.",
    imageUrl: null,
    keywords: ["rak", "simpan", "rumah", "peralatan"],
  },
  {
    id: "mk-peti-alat",
    nameBm: "Peti alat kerja",
    category: "peralatan",
    priceCents: 12_900,
    descriptionBm: "Penyimpanan alat kerja asas untuk kegunaan bersama.",
    imageUrl: null,
    keywords: ["alat", "kerja", "baiki", "peralatan"],
  },
  {
    id: "mk-blender-keluarga",
    nameBm: "Blender heavy-duty",
    category: "peralatan",
    priceCents: 24_900,
    descriptionBm: "Peralatan dapur lebih tahan untuk kegunaan kerap.",
    imageUrl: null,
    keywords: ["dapur", "blender", "peralatan", "rumah"],
  },
  {
    id: "mk-sealer",
    nameBm: "Sealer plastik meja",
    category: "peralatan",
    priceCents: 27_900,
    descriptionBm: "Sesuai untuk pembungkusan kecil atau simpan stok dengan kemas.",
    imageUrl: null,
    keywords: ["jahit", "bungkus", "sealer", "peralatan"],
  },
  {
    id: "mk-mesin-jahit",
    nameBm: "Mesin jahit asas",
    category: "peralatan",
    priceCents: 64_900,
    descriptionBm: "Mesin permulaan untuk kerja jahitan di rumah atau komuniti kecil.",
    imageUrl: null,
    keywords: ["jahit", "mesin", "peralatan", "pendapatan"],
  },
  {
    id: "mk-seterika-wap",
    nameBm: "Seterika wap",
    category: "elektrik",
    priceCents: 9_900,
    descriptionBm: "Peralatan elektrik asas untuk kegunaan rumah.",
    imageUrl: null,
    keywords: ["elektrik", "rumah", "seterika"],
  },
  {
    id: "mk-kipas-berdiri",
    nameBm: "Kipas berdiri",
    category: "elektrik",
    priceCents: 12_900,
    descriptionBm: "Pengudaraan asas untuk bilik atau ruang keluarga.",
    imageUrl: null,
    keywords: ["kipas", "elektrik", "rumah", "panas"],
  },
  {
    id: "mk-rice-cooker",
    nameBm: "Periuk nasi 1.8L",
    category: "elektrik",
    priceCents: 15_900,
    descriptionBm: "Peralatan dapur elektrik yang terus guna setiap hari.",
    imageUrl: null,
    keywords: ["nasi", "dapur", "elektrik", "makanan"],
  },
  {
    id: "mk-lampu-solar",
    nameBm: "Lampu solar rumah",
    category: "elektrik",
    priceCents: 21_900,
    descriptionBm: "Sokongan lampu asas jika bekalan elektrik terganggu.",
    imageUrl: null,
    keywords: ["lampu", "solar", "elektrik", "rumah"],
  },
  {
    id: "mk-mesin-basuh-mini",
    nameBm: "Mesin basuh mini",
    category: "elektrik",
    priceCents: 48_900,
    descriptionBm: "Pilihan kompak untuk rumah kecil yang perlukan bantuan cucian.",
    imageUrl: null,
    keywords: ["basuh", "elektrik", "rumah", "keluarga"],
  },
  {
    id: "mk-generator-mini",
    nameBm: "Generator mini komuniti",
    category: "elektrik",
    priceCents: 149_000,
    descriptionBm: "Sesuai untuk kegunaan berkongsi bila pool cap lebih besar.",
    imageUrl: null,
    keywords: ["generator", "surau", "elektrik", "komuniti"],
  },
  {
    id: "mk-baja-starter",
    nameBm: "Baja starter",
    category: "pertanian",
    priceCents: 9_900,
    descriptionBm: "Input asas untuk kebun kecil atau blok keluarga.",
    imageUrl: null,
    keywords: ["baja", "kebun", "pertanian", "blok"],
  },
  {
    id: "mk-set-pruning",
    nameBm: "Set pruning kebun",
    category: "pertanian",
    priceCents: 14_900,
    descriptionBm: "Alatan kecil untuk penjagaan pokok dan kebun.",
    imageUrl: null,
    keywords: ["pruning", "kebun", "pertanian", "pokok"],
  },
  {
    id: "mk-knapsack",
    nameBm: "Knapsack sprayer",
    category: "pertanian",
    priceCents: 31_900,
    descriptionBm: "Peralatan praktikal untuk semburan kebun atau blok pertanian.",
    imageUrl: null,
    keywords: ["sprayer", "pertanian", "blok", "kebun"],
  },
  {
    id: "mk-pam-air",
    nameBm: "Pam air mudah alih",
    category: "pertanian",
    priceCents: 55_900,
    descriptionBm: "Membantu kerja kebun yang perlukan aliran air lebih konsisten.",
    imageUrl: null,
    keywords: ["pam", "air", "pertanian", "kebun"],
  },
  {
    id: "mk-mesin-rumput",
    nameBm: "Mesin rumput ringan",
    category: "pertanian",
    priceCents: 86_900,
    descriptionBm: "Peralatan kerja untuk kawasan kebun atau halaman yang lebih luas.",
    imageUrl: null,
    keywords: ["rumput", "pertanian", "blok", "kebun"],
  },
  {
    id: "mk-paip-fleksibel",
    nameBm: "Paip fleksibel 30m",
    category: "air",
    priceCents: 5_900,
    descriptionBm: "Penyambung air asas untuk rumah atau kebun kecil.",
    imageUrl: null,
    keywords: ["air", "paip", "rumah", "kebun"],
  },
  {
    id: "mk-tong-air",
    nameBm: "Tong simpanan air",
    category: "air",
    priceCents: 7_900,
    descriptionBm: "Simpanan air sementara untuk kegunaan rumah.",
    imageUrl: null,
    keywords: ["air", "simpan", "rumah", "tong"],
  },
  {
    id: "mk-dispenser",
    nameBm: "Dispenser air asas",
    category: "air",
    priceCents: 16_900,
    descriptionBm: "Kemudahan air minum yang lebih teratur untuk rumah.",
    imageUrl: null,
    keywords: ["air", "minum", "rumah", "keluarga"],
  },
  {
    id: "mk-tangki-lipat",
    nameBm: "Tangki air lipat",
    category: "air",
    priceCents: 28_900,
    descriptionBm: "Opsyen simpanan air tambahan yang tidak makan ruang tetap.",
    imageUrl: null,
    keywords: ["air", "tangki", "rumah", "simpanan"],
  },
  {
    id: "mk-penapis-air",
    nameBm: "Penapis air keluarga",
    category: "air",
    priceCents: 42_900,
    descriptionBm: "Sesuai bila rumah perlu akses air minum yang lebih yakin.",
    imageUrl: null,
    keywords: ["air", "penapis", "keluarga", "minum"],
  },
  {
    id: "mk-rak-kasut",
    nameBm: "Rak kasut keluarga",
    category: "rumah",
    priceCents: 8_900,
    descriptionBm: "Penyusunan masuk rumah yang lebih kemas untuk ramai ahli.",
    imageUrl: null,
    keywords: ["rumah", "simpan", "rak", "keluarga"],
  },
  {
    id: "mk-set-langsir",
    nameBm: "Set langsir asas",
    category: "rumah",
    priceCents: 11_900,
    descriptionBm: "Kemasan rumah yang bantu privasi dan teduhan.",
    imageUrl: null,
    keywords: ["rumah", "langsir", "privasi"],
  },
  {
    id: "mk-meja-lipat",
    nameBm: "Meja lipat serbaguna",
    category: "rumah",
    priceCents: 14_900,
    descriptionBm: "Boleh guna untuk makan, belajar, atau kerja kecil di rumah.",
    imageUrl: null,
    keywords: ["rumah", "meja", "belajar", "keluarga"],
  },
  {
    id: "mk-almari-plastik",
    nameBm: "Almari plastik",
    category: "rumah",
    priceCents: 18_900,
    descriptionBm: "Storan tambahan yang mudah dialih dan dipasang.",
    imageUrl: null,
    keywords: ["rumah", "almari", "simpan"],
  },
  {
    id: "mk-tilam-bujang",
    nameBm: "Tilam bujang",
    category: "rumah",
    priceCents: 24_900,
    descriptionBm: "Keperluan asas rumah bila tempat tidur perlu ditambah.",
    imageUrl: null,
    keywords: ["rumah", "tilam", "tidur", "keluarga"],
  },
  {
    id: "mk-kit-gotong",
    nameBm: "Kit gotong-royong",
    category: "lain-lain",
    priceCents: 9_900,
    descriptionBm: "Set kecil untuk kegunaan komuniti semasa program bersama.",
    imageUrl: null,
    keywords: ["komuniti", "gotong", "kegunaan bersama"],
  },
  {
    id: "mk-kerusi-plastik",
    nameBm: "Set kerusi plastik",
    category: "lain-lain",
    priceCents: 17_900,
    descriptionBm: "Kerusi tambahan untuk aktiviti keluarga atau komuniti kecil.",
    imageUrl: null,
    keywords: ["komuniti", "kerusi", "keluarga"],
  },
  {
    id: "mk-kanopi-mini",
    nameBm: "Kanopi mini",
    category: "lain-lain",
    priceCents: 45_900,
    descriptionBm: "Sesuai untuk kegunaan acara kecil atau ruang luar rumah.",
    imageUrl: null,
    keywords: ["komuniti", "kanopi", "luar rumah"],
  },
] as const;

function calculatePoolCapCents(pool: PoolRecord) {
  return pool.combinedCapCents ?? pool.members.reduce((sum, member) => sum + member.individualAllowanceCents, 0);
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
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
  const monthLabel = new Intl.DateTimeFormat("ms-MY", { month: "long" }).format(new Date());

  if (category === "air") {
    return `Bulan ${monthLabel} masih sesuai untuk fikir simpanan air dan akses air minum di rumah.`;
  }

  if (category === "pertanian") {
    return `Bulan ${monthLabel} memberi konteks kerja kebun dan alat yang tahan untuk kegunaan berulang.`;
  }

  if (category === "elektrik") {
    return `Bulan ${monthLabel} juga mengingatkan bahawa peralatan elektrik asas sering jadi keutamaan bila rumah perlukan kestabilan harian.`;
  }

  return `Bulan ${monthLabel} diambil kira sebagai konteks semasa supaya cadangan terasa dekat dengan kegunaan sebenar.`;
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
    `${product.nameBm} masih berada dalam cap pool ${new Intl.NumberFormat("ms-MY", {
      style: "currency",
      currency: "MYR",
      maximumFractionDigits: 0,
    }).format(capCents / 100)} dan menggunakan kira-kira ${allocationPct}% daripada jumlah itu.`,
    `Cadangan ini paling dekat dengan keperluan "${pool.statedNeedText}" dalam kategori ${pool.statedNeedCategory.replace("-", " ")}.`,
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
