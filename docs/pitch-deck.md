# Pitch Deck — DuitLater

**TNG FINHACK 2026 · Financial Inclusion Track · 8 slides · 4 minutes · 16:9 · PDF export**

Visual discipline per [BRAND.md](../BRAND.md): Cormorant Garamond display, Inter body, JetBrains Mono numbers. Tabung-gold + heritage maroon + cream parchment. No 3D fintech metaphors. Typography-driven hierarchy. Whitespace over illustration.

Narration: [pitch-narration.md](./pitch-narration.md). This file is slide content only.

---

## Slide 1 — Title · 10 seconds

**Visual**
- Left third: brand mark (8 interlocking arrows in songket-diamond formation)
- Right two-thirds: headline + subheadline

**Headline** (Cormorant Garamond 70pt, weight 600)
> DuitLater

**Subheadline** (Cormorant Garamond italic 26pt)
> Sendiri tak mampu, ramai-ramai boleh.

**Footer metadata** (Inter 14pt, slate)
- Team R2-D2 — Ijam · Moon · Akmal · Kairu · MatNep
- Track: **Financial Inclusion**
- TNG FINHACK 2026

---

## Slide 2 — The Gap · 35 seconds

**Visual**
- Left half: photo or illustration of a Felda settler / B40 household setting (kampung Felda, oil palm in background, simple home interior)
- Right half: hero statistic + supporting numbers

**Headline** (Cormorant Garamond 50pt)
> RM 300 doesn't buy a sewing machine.

**Hero number** (Cormorant Garamond 90pt, gold)
> **RM 300**

**Sub-line** (Inter 18pt)
> Mak Cik Aminah's TNG PayLater allowance.
> A sewing machine costs RM 1,800.
> She lives in Felda Gedangsa with six neighbours in similar situations.

**Supporting stack** (Inter 16pt)
- **23M+** TNG eWallet users — rails already in every pocket
- **15%** of adult Malaysians remain unbanked or underbanked
- **2.9M** B40 households nationally
- Combined PayLater of six Felda neighbours: **RM 2,000+** — but no mechanism to combine

**Caption** (Inter 14pt italic, slate)
> Individual limits. Communal needs. The platform is missing.

---

## Slide 3 — The Solution · 40 seconds

**Visual**
- Center: 4-step horizontal flow with icons
- Below: institutional partner row

**Headline** (Cormorant Garamond 40pt)
> DuitLater. Pool the PayLater. Buy what we couldn't alone.

**4-step flow** (Inter 18pt, each with icon)

| 1 · Form pool | 2 · Combine PayLater | 3 · Penasihat suggests | 4 · Pool votes & buys |
|---|---|---|---|
| 2–8 members at NADI centre | Sum of individual TNG limits | AI in BM picks from MyKasih catalogue | Majority approves; TNG processes; NADI confirms delivery |

**Institutional partners** (cream on maroon banner)
- **TNG** (PayLater rail) · **NADI** (community facilitator · 84 in Selangor) · **MyKasih** (MySARA item catalogue + merchant network) · **B40 households** (the pool)

**Caption** (Cormorant Garamond italic 22pt, maroon)
> Four real Malaysian institutions. One product. Zero new welfare programmes invented.

---

## Slide 4 — How DuitLater Earns Each Criterion · 60 seconds

**Visual**
- 5-row table mapping criterion → DuitLater feature
- Sponsor cloud logos (AWS · Alibaba Cloud) bottom-center

**Headline** (Cormorant Garamond 36pt)
> Five criteria. Five answers. One product.

**Mapping table** (Inter 14pt)
| Criterion | DuitLater fit |
|---|---|
| **AI & Intelligent Systems** | **3 layers** · (1) AI generated 2,400+ lines of planning artifacts before code · (2) `maji-core` team coordinator enforces phase gates + memory + discipline during build · (3) in-product Penasihat suggester + NADI summary · Qwen when configured · heuristic fallback |
| **Technical Implementation** | Append-only ledger · HMAC webhooks · argon2 · role-scoped NADI portal · documented scale path |
| **Multi-Cloud Service Usage** | **AWS** (compute · DB · S3) + **Alibaba Cloud** (Function Compute · Qwen LLM · OSS mirror) — Gold + Platinum sponsors both used |
| **Impact & Feasibility** | **NADI Felda Gedangsa** pilot · 188 NADIs nationally · 2.9M B40 households · zero new welfare programmes invented |
| **Presentation & Teamwork** | 600-line PRD · maji-core team coordinator · this deck · /about-team page |

**Test bed footer** (Inter 14pt, slate)
> Test bed: **NADI Felda Gedangsa, Hulu Selangor** — Felda smallholder community, MCMC-run NADI centre, ~1.5h drive from this venue.

**Closing line** (Cormorant Garamond italic 22pt, maroon, centered)
> Not retrofitted. Designed criterion-first.

---

## Slide 5 — The Demo · 50 seconds

**Cue slide** — minimal text so screen-share can dominate.

**Headline** (Cormorant Garamond 50pt, centered)
> Mari saya tunjuk.

**Screenshot grid** (3×2)
- Top-left: **Daftar** — sign-up · individual PayLater displayed
- Top-mid: **Cipta pool** — name, need, members 1/8
- Top-right: **Lock + invite** — combined cap RM 1,800
- Bottom-left: **Penasihat** — 5 BM-first item suggestions
- Bottom-mid: **Pool vote** — 3 of 4 majority · TNG approval
- Bottom-right: **Repayment + trust** — ledger green · kampung trust score 87

**Live URL footer** (Inter 14pt, slate, bottom-center)
> demo.duitlater.app · Felda Gedangsa kampung pre-seeded · 4 members per pool · NADI staff login pre-loaded

---

## Slide 6 — The Stack · 15 seconds

**Visual**
- Five logos in a horizontal row, evenly spaced

**Headline** (Cormorant Garamond 40pt)
> Two clouds. Both sponsor-aligned.

**Stack split** (Inter 16pt, two columns)

| AWS *(Gold sponsor)* | Alibaba Cloud *(Platinum sponsor)* |
|---|---|
| EC2 t3.medium · main backend | Function Compute · Penasihat AI |
| Postgres 16 · ledger of record | Function Compute · NADI summary AI |
| S3 · general assets | Qwen-plus · BM-native LLM |
| Caddy · TLS + path-routing | OSS · catalogue mirror |

**Sub-text** (Inter 14pt, slate, centered)
> Backend: Hono + Prisma + Better Auth · Frontend: Next.js 15 + Tailwind v4 · AI fallback: deterministic heuristic. No Kubernetes, no Redis, no GraphQL.

---

## Slide 7 — The Lineage · 15 seconds

**Visual**
- Single horizontal table

**Headline** (Cormorant Garamond 40pt)
> Pool credit has scaled before. We bring it home.

**Comparable table** (Inter 16pt)
| Reference | Region | Raised | Mechanic |
|---|---|---|---|
| MoneyFellows | Egypt | USD 31M | Communal financial digitization |
| Esusu | USA | ~USD 1B valuation | Trust-score for invisible populations |
| Stokfella | South Africa | Regional leader | Stokvel digital ledger |
| Easypaisa Pool Buy | Pakistan | (mobile-wallet group purchase) | Direct pool-PayLater precedent |

**Closing line** (Cormorant Garamond italic 22pt, maroon, centered)
> Malaysia has TNG · NADI · MyKasih. We have the rails. We have the institutions. DuitLater is the wiring.

---

## Slide 8 — The Ask · 15 seconds

**Visual**
- Three asks stacked vertically with gold bullets
- Team contact footer

**Headline** (Cormorant Garamond 40pt)
> What we need.

**Asks** (Inter 20pt, gold bullet each)
1. **TNG** — PayLater sandbox API access for the pool transaction flow
2. **MCMC** — formal collaboration framework with NADI Selangor (84 centres ready as distribution channel)
3. **MyKasih Foundation** — merchant network access + MySARA catalogue API for last-mile fulfilment

**Team footer** (Inter 14pt, slate)
- Pitch · Ijam (zarulijam@gmail.com)
- Technical · Moon (backend) · Akmal (frontend) · Kairu (PM) · MatNep (design)
- Repo · github.com/Ijam18/duitlater

**Footer signature** (Cormorant Garamond italic 18pt, centered, maroon)
> *Sendiri tak mampu, ramai-ramai boleh.*

---

## Export Checklist

- [ ] All slides 16:9 aspect (1920×1080 or 2560×1440)
- [ ] Cormorant Garamond + Inter + JetBrains Mono embedded
- [ ] No animations (static PDF)
- [ ] WCAG AA contrast on all slides (4.5:1 body · 3:1 large)
- [ ] File size under 10MB
- [ ] Exported as `pitch-deck.pdf`
- [ ] MatNep's Jangka Emas sign-off (golden-section composition on hero slides 1, 2, 3)
- [ ] Ijam's BM register sign-off
- [ ] Track header on slide 1 reads **Financial Inclusion**
- [ ] Slide 4 mapping table renders all 5 judging criteria clearly
- [ ] Slide 6 stack split shows AWS + Alibaba Cloud logos prominently (sponsor-visible)
- [ ] Total timing: 10+35+40+60+50+15+15+15 = 240 seconds strict

---

## Delivery Discipline

- **Rehearsal:** minimum twice, Sunday morning
- **Timer:** strict 4:00 stop
- **Demo cue:** slide 5 hands off to live demo for ~70s · returns for slides 6–8
- **Backup:** A3 single-page version for sponsor-booth hand-off
- **Projector failure plan:** narration script standalone readable
