"use client";

import { useMemo } from "react";
import { useSelangorNadiCentresQuery } from "@/hooks/use-nadi-centres-query";

// Stylised Selangor outline + 9 district centroids hand-mapped from
// approximate (lng, lat) coordinates. The viewBox is sized so 1 SVG unit
// ≈ 0.001 degree, with origin at (100.85°E, 3.85°N) and Y inverted.
const SELANGOR_OUTLINE = [
  "M 95 220",
  "L 175 80",
  "L 700 80",
  "L 950 240",
  "L 1110 510",
  "L 1140 820",
  "L 1010 1100",
  "L 870 1235",
  "L 620 1265",
  "L 510 1180",
  "L 380 1010",
  "L 350 820",
  "L 245 510",
  "L 105 320",
  "Z",
].join(" ");

type DistrictPin = {
  key: string;
  name: string;
  x: number;
  y: number;
};

const districts: DistrictPin[] = [
  { key: "sabak-bernam", name: "Sabak Bernam", x: 200, y: 200 },
  { key: "kuala-selangor", name: "Kuala Selangor", x: 350, y: 530 },
  { key: "hulu-selangor", name: "Hulu Selangor", x: 700, y: 300 },
  { key: "gombak", name: "Gombak", x: 850, y: 580 },
  { key: "klang", name: "Klang", x: 580, y: 810 },
  { key: "petaling", name: "Petaling", x: 720, y: 750 },
  { key: "hulu-langat", name: "Hulu Langat", x: 1000, y: 800 },
  { key: "kuala-langat", name: "Kuala Langat", x: 700, y: 1000 },
  { key: "sepang", name: "Sepang", x: 850, y: 1100 },
];

// Maps free-text districtHint values from the scraper to canonical district keys.
function normaliseDistrict(hint: string | null | undefined): string | null {
  if (!hint) return null;
  const lower = hint.toLowerCase();
  if (lower.includes("sabak bernam")) return "sabak-bernam";
  if (lower.includes("kuala selangor")) return "kuala-selangor";
  if (lower.includes("hulu selangor")) return "hulu-selangor";
  if (lower.includes("gombak")) return "gombak";
  if (lower.includes("klang")) return "klang";
  if (lower.includes("petaling")) return "petaling";
  if (lower.includes("hulu langat")) return "hulu-langat";
  if (lower.includes("kuala langat")) return "kuala-langat";
  if (lower.includes("sepang")) return "sepang";
  return null;
}

const FELDA_GEDANGSA_PIN = { x: 610, y: 270 };

export function SelangorNadiMap() {
  const { data, isLoading } = useSelangorNadiCentresQuery();

  const centresByDistrict = useMemo(() => {
    const counts = new Map<string, number>();
    if (!data?.centres) return counts;
    for (const centre of data.centres) {
      const key = normaliseDistrict(centre.districtHint);
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [data]);

  const total = data?.total ?? null;

  return (
    <div className="grid gap-4">
      <figure
        className="relative overflow-hidden border-2 border-[var(--dl-zine-ink)] bg-[var(--dl-paper-warm)] p-4"
        style={{ boxShadow: "6px 6px 0 var(--dl-zine-ink)" }}
      >
        <svg
          viewBox="0 0 1200 1300"
          role="img"
          aria-label="Map of Selangor showing NADI centres across nine districts, with Felda Gedangsa highlighted as the pilot site"
          className="h-auto w-full"
        >
          <defs>
            <pattern
              id="selangor-paper-grain"
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
            >
              <rect width="6" height="6" fill="var(--dl-paper)" />
              <circle cx="1" cy="1" r="0.4" fill="var(--dl-zine-ink)" opacity="0.18" />
            </pattern>
          </defs>

          {/* Selangor land mass */}
          <path
            d={SELANGOR_OUTLINE}
            fill="url(#selangor-paper-grain)"
            stroke="var(--dl-zine-ink)"
            strokeWidth="6"
            strokeLinejoin="round"
          />

          {/* District pins */}
          {districts.map((district) => {
            const count = centresByDistrict.get(district.key) ?? 0;
            const isPilotDistrict = district.key === "hulu-selangor";
            return (
              <g key={district.key} transform={`translate(${district.x} ${district.y})`}>
                <circle
                  r={isPilotDistrict ? 22 : 14}
                  fill={isPilotDistrict ? "var(--dl-zine-brick)" : "var(--dl-zine-forest)"}
                  stroke="var(--dl-zine-ink)"
                  strokeWidth="3"
                />
                {count > 0 ? (
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="14"
                    fontWeight="700"
                    fill="var(--dl-paper)"
                  >
                    {count}
                  </text>
                ) : null}
                <text
                  textAnchor="middle"
                  y={isPilotDistrict ? 44 : 32}
                  fontSize="22"
                  fontWeight="600"
                  fill="var(--dl-zine-ink)"
                  className="zine-display"
                >
                  {district.name}
                </text>
              </g>
            );
          })}

          {/* Pilot site callout — Felda Gedangsa */}
          <g transform={`translate(${FELDA_GEDANGSA_PIN.x} ${FELDA_GEDANGSA_PIN.y})`}>
            <line
              x1="0"
              y1="0"
              x2="-110"
              y2="-110"
              stroke="var(--dl-zine-brick-dark)"
              strokeWidth="3"
              strokeDasharray="6 4"
            />
            <g transform="translate(-260 -160)">
              <rect
                width="220"
                height="60"
                fill="var(--dl-zine-brick)"
                stroke="var(--dl-zine-ink)"
                strokeWidth="3"
              />
              <text
                x="110"
                y="38"
                textAnchor="middle"
                fontSize="22"
                fontWeight="700"
                fill="var(--dl-paper)"
                className="zine-display"
              >
                Felda Gedangsa
              </text>
            </g>
            <circle r="10" fill="var(--dl-zine-brick-dark)" stroke="var(--dl-paper)" strokeWidth="3" />
          </g>
        </svg>

        <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-3 border-t-2 border-dashed border-[var(--dl-zine-ink)]/30 pt-3 text-xs uppercase tracking-[0.18em] text-[var(--dl-slate)]">
          <span>Selangor · 9 districts</span>
          <span>
            {isLoading
              ? "Loading NADI centres..."
              : total !== null
                ? `${total} NADI centres · live from /api/v1/nadi/centres`
                : "84+ NADI centres in Selangor"}
          </span>
        </figcaption>
      </figure>

      <p className="text-center text-sm text-[var(--dl-slate)]">
        Real institutions. Real settlement. Real household pool dynamics — not synthetic.
      </p>
    </div>
  );
}
