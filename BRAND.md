# Brand & Visual Identity — Kutu Digitizer

**Designed under MatNep's classical direction · executed by Akmal · system anchored by Reka's rules**

**Aesthetic anchor:** **Neo Nusantara** — traditional Malay/Nusantara craft (songket, tenun, ukiran kayu, batik geometry) elevated to modern editorial form. Heritage is not decoration; it is structure.

**Design doctrine (MatNep):** *"Classic bukan membosankan. Classic sebab dia kekal lawa bila trend mati."* Typography and grid take precedence over illustration. Rules before flair.

---

## Voice

**Bilingual default. BM-first.** All copy primary in BM with English available via toggle. Code-switching natural in Malaysian developer register.

**Tone:**
- Quietly confident, not loud
- Respectful of practice (kutu is older than us; we serve, not save)
- Direct without being curt
- No corporate finance jargon
- No mystical "fintech revolution" language
- Honest about money

**Words we avoid:**
- "Disrupt" / "revolution" / "game-changer"
- "Empower" used vaguely
- "Unleash" / "transform" / "supercharge"
- Generic English fintech vocabulary

**Words we use:**
- *Tabung* (the fund), *Kutu* (the practice), *Ahli* (member), *Pusingan* (cycle/rotation), *Kepercayaan* (trust), *Catatan* (record)
- "Honour the cycle" (from cultural register)
- "Visible record"
- "Auto-deduct" (functional, not euphemized)

---

## Colour Palette

Anchored by the practice — communal warmth + financial seriousness.

| Role | Hex | Use |
|---|---|---|
| **Primary — Tabung Gold** | `#C8941F` | Brand mark · key CTAs · trust-score positive |
| **Primary Dark — Burnt Brass** | `#8A6014` | Hover states · pressed buttons · active rings |
| **Secondary — Heritage Maroon** | `#7A2E2E` | Accent · selected state · payout highlight |
| **Background — Cream Parchment** | `#F8F4EC` | App background (light mode) |
| **Surface — Ivory** | `#FFFFFF` | Card surfaces |
| **Text Primary — Ink** | `#1A1A1A` | Body copy |
| **Text Secondary — Slate** | `#5A5A5A` | Captions, metadata |
| **Border — Sand** | `#E0D8C8` | Dividers · card outlines |
| **Success — Forest** | `#2F6A3F` | Confirmation · paid state · trust-score gain |
| **Warning — Amber** | `#D4811C` | Cycle approaching · pending action |
| **Error — Maroon Deep** | `#8B1F1F` | Failed contribution · cycle violation |

**Dark mode:** flip Cream Parchment → `#1F1B14` (dark warm-brown), Ink → `#F4EFE3` (parchment-on-dark), gold and maroon stay anchored.

**Tailwind tokens (extend in `tailwind.config`):**

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        tabung: {
          gold: '#C8941F',
          'gold-dark': '#8A6014',
          maroon: '#7A2E2E',
          cream: '#F8F4EC',
          ink: '#1A1A1A',
          sand: '#E0D8C8',
          forest: '#2F6A3F',
          amber: '#D4811C',
        },
      },
    },
  },
};
```

---

## Typography

### Font Pairing

| Use | Font | Fallback Stack |
|---|---|---|
| **Display & Headings** | **Cormorant Garamond** (classical serif, editorial) | `'Cormorant Garamond', 'Iowan Old Style', Georgia, serif` |
| **Body & UI** | **Inter** (clean modern sans-serif) | `Inter, -apple-system, 'Segoe UI', Roboto, sans-serif` |
| **Numbers & Code** | **JetBrains Mono** (monospaced) | `'JetBrains Mono', 'SF Mono', Menlo, monospace` |

Cormorant Garamond chosen for headlines — it carries editorial classical weight (MatNep's Heritage Atelier discipline) without being archaic. Inter for everything UI — Akmal's clean interaction skin.

### Modular Scale (1.333 — perfect fourth)

```
xs   12px  / 18px  leading
sm   14px  / 21px
base 16px  / 24px
lg   18px  / 27px   ← body copy default
xl   22px  / 30px
2xl  28px  / 36px
3xl  37px  / 44px
4xl  50px  / 56px   ← hero headline
5xl  66px  / 72px   ← pitch-deck only
```

### Hierarchy Rules

1. **Display headlines** — Cormorant Garamond · 50-66px · weight 600
2. **Section headings** — Cormorant Garamond · 28-37px · weight 500
3. **Sub-headings** — Inter · 22px · weight 600
4. **Body** — Inter · 16-18px · weight 400 · leading 1.5-1.6
5. **Small / metadata** — Inter · 12-14px · weight 400 · colour Slate
6. **Numbers** — JetBrains Mono · matched to surrounding text size · tabular figures

**Measure:** body copy max-width `65ch`. No paragraph wider.

---

## Iconography

| Source | Library |
|---|---|
| Primary | `lucide-react` (clean stroke, MatNep-compatible) |
| Custom heritage glyphs | Hand-drawn songket-derived geometric icons (4-8 custom · render once for nav + key features) |

**Stroke:** 1.5px · rounded line caps · rounded line joins · matches Cormorant Garamond's serif weight when scaled small.

**Custom heritage glyphs** (commission MatNep · manual work · use sparingly):
- Tabung mark (stylized circular pool with rotation arrows · diamond-within-diamond inset)
- Trust seal (songket-derived octagon with checkmark inset)
- Kongsi mark (interlocking diamonds = sharing motif)
- Penasihat (stylized speaking-leaf icon)

---

## Layout

### Grid

- **12-column responsive grid** at `1440px` desktop, `768px` tablet, `375px` mobile
- **8pt baseline** for all spacing (use Tailwind's default `space-*` scale)
- **Golden-section** for hero compositions: text 38%, visual 62%

### Spacing Scale

```
xs   4px
sm   8px
md   16px
lg   24px
xl   32px
2xl  48px
3xl  64px
4xl  96px
```

### Component Anatomy

| Element | Pattern |
|---|---|
| **Card** | white surface · 1px sand border · 8px radius · 24px padding · subtle shadow `0 1px 2px rgba(0,0,0,0.04)` |
| **Button primary** | tabung-gold bg · ink text · 8px radius · 12px vertical / 16px horizontal padding · hover darken to gold-dark |
| **Input** | white bg · 1.5px sand border · focus ring tabung-gold · 8px radius · 12px padding |
| **Badge** | small pill · 4px radius · 4px vertical / 8px horizontal padding · semibold |
| **Modal** | center overlay · max-width 480px · cream bg with subtle parchment texture (optional) |

---

## Logo & Brand Mark

### Mark

A circular brand mark referencing the rotation cycle — eight interlocking arrows arranged in songket-diamond formation. Gold on cream by default; maroon-on-cream for restrained contexts.

```
   .—.
  / · \    ← simplified ASCII representation
 (  ⋄  )      Refer to MatNep for actual SVG
  \ · /
   '—'
```

(MatNep delivers SVG before pitch — placeholder text-mark used until then.)

### Wordmark

Cormorant Garamond · weight 600 · letter-spacing -0.02em
- **Tabung Digitizer** OR
- **Kutu** (single word — short demo brand)

**Final brand decision:** TBD between Ijam & MatNep · before Sunday morning.

---

## Photography & Imagery

- No stock photography of "happy diverse families looking at phones"
- Real Malaysian context if photos used — markets, kampung, surau, working-class settings
- Otherwise: clean illustrations or icon-driven visuals
- Avoid: 3D-rendered fintech metaphors (coins floating, blockchain hexagons, growth arrows)

---

## Voice & Microcopy Examples

| Bad | Good |
|---|---|
| "Welcome to your financial future" | "Selamat datang. Tabung kau di sini." |
| "Empowering communities through technology" | "Kutu kau, dalam satu tempat." |
| "Auto-pay activated successfully!" | "Bayaran auto. Bulan ni dah selesai." |
| "Failed to process payment. Please try again." | "Bayaran tak masuk. Cuba lagi atau check TNG kau." |
| "Loading your dashboard..." | "Sebentar..." |

**Empty states** use the practice as anchor:
- No tabung yet: *"Belum ada tabung. Cipta satu untuk mula, atau tunggu jemputan dari ahli lain."*
- No contributions: *"Belum ada catatan. Bayaran pertama akan muncul di sini."*

---

## Pitch Deck Visual Standard

8 slides, 16:9, exported to PDF.

| Slide | Content |
|---|---|
| 1 | Title — Kutu Digitizer · subtitle in Cormorant Garamond italic |
| 2 | The Practice — visual: traditional kutu scene (illustration or photo) |
| 3 | The Gap — single bold statistic (15% unbanked) + supporting context |
| 4 | The Solution — three-pillar layout (Rails · Ledger · Trust) |
| 5 | The Demo — screenshot grid (4 key screens) |
| 6 | The Tech — minimal stack diagram (5 logos: Node, TS, Postgres, S3, Better Auth) |
| 7 | The Lineage — comparable references (MoneyFellows, Esusu, Stokfella) with valuations |
| 8 | The Ask — TNG sandbox · regulatory partner · next cohort · team contact |

Visual restraint: no animations in deck (PDF export). Type-driven hierarchy. Heavy reliance on whitespace + typography over illustration.

---

## Domain & Brand Continuity Post-Hackathon

If the project continues:
- Domain: `kutu.my` or `tabung.app` or similar (decide post-pitch based on availability)
- Logo: full SVG kit + brand guidelines doc
- Open-source consideration: MIT license · invitation to community contribution
- Commercial path: UjiVibe / Strategeist licensing route

---

## Brand Audit Checklist (Before Demo)

- [ ] All headings render in Cormorant Garamond (no fallback fonts visible)
- [ ] All body in Inter
- [ ] All numbers in JetBrains Mono with tabular figures
- [ ] No "Lorem ipsum" or placeholder copy
- [ ] All copy bilingual-checked by Ijam (BM register)
- [ ] All buttons in tabung-gold with proper hover state
- [ ] All forms have proper focus rings (tabung-gold)
- [ ] All loading states use minimal spinner + "Sebentar..." text
- [ ] All error states actionable (tell user what to do, not just what failed)
- [ ] All empty states honour the practice (warm, not punitive)
- [ ] WCAG AA contrast on all text (4.5:1 body, 3:1 large)
- [ ] Mobile responsive at 375px width minimum

---

*Brand stewardship: MatNep (direction) · Akmal (execution) · Reka (system rules) · Vizion (composition rhythm) — four-hero design axis aligned.*
