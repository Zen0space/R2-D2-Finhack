# AI Methodology — Three Layers Across the Project Lifecycle

**TNG FINHACK 2026 · Financial Inclusion Track · Judging criterion: AI & Intelligent Systems**

DuitLater integrates AI across **three distinct layers of the project lifecycle**, not just inside the product surface. Each layer is concrete, evidenced in the repo, and verifiable by judges.

---

## Layer 1 — Pre-product AI: requirement generation

**Before a single line of product code was written, AI orchestration generated all planning artifacts.**

### What was AI-generated

| Artifact | Purpose | Lines |
|---|---|---|
| [PRD.md](../PRD.md) | Product Requirements Document — 18 sections covering personas, user stories, functional + non-functional requirements, risks, judging-criteria mapping | 617 |
| [WORLD.md](../WORLD.md) | Manifesto — the cultural why, B40 narrative, institutional package | 200+ |
| [ARCHITECTURE.md](../ARCHITECTURE.md) | System architecture · 8 mermaid sequence + ER diagrams · multi-cloud topology · Production Scale Path · Security Posture | 500+ |
| [DEVELOPMENT-PLAN.md](../DEVELOPMENT-PLAN.md) | 7-phase build plan · per-phase testable outcomes · cut-line strategy · verifier assignments | 300+ |
| [BRAND.md](../BRAND.md) | Visual identity · Cormorant Garamond + Inter + JetBrains Mono lock · Neo Nusantara aesthetic anchor | 280+ |
| [TEAM.md](../TEAM.md) | R2-D2 roster · phase ownership · norms · decision log | 80+ |
| [docs/pitch-deck.md](./pitch-deck.md) | 8-slide pitch content · 240s timing · per-slide visual specs | 220+ |
| [docs/pitch-narration.md](./pitch-narration.md) | 4-min on-stage script · BM-first register · recovery phrases per slide | 180+ |

**Total:** ~2,400+ lines of planning + design artifacts produced through AI-collaborative authoring before product implementation began.

### How it was produced

- **Multi-agent AI orchestration** with role-specialised agents (Pitch lead · Backend architect · UX/Frontend designer · Design direction · PM phase-gate enforcer)
- **Persistent context across sessions** — committed memory artifacts, traceable decision history (see `maji-core/memory/team-ledger.md`)
- **Iterative refinement loops** — each artifact reviewed against:
  1. The official 5 judging criteria (received Day 0)
  2. The TNG FINHACK 2026 Financial Inclusion track brief (verbatim)
  3. The institutional reality (TNG, NADI/MCMC, MyKasih Foundation — all verified via official sources)

### Evidence of effectiveness

- Initial product concept (Kutu Digitizer · 3-pillar Innovation track) was **pivoted twice** based on AI-assisted criteria audit — landing on DuitLater · single-track Financial Inclusion fit
- Multi-cloud strategy (AWS + Alibaba Cloud) was **identified as critical gap** by AI audit of judging criteria, then resolved with concrete code routing
- Test bed selection (NADI Felda Gedangsa) was **validated through AI-assisted research** of MCMC's NADI portal, B40 demographics, Felda settlement structure

The full decision history is committed to [`maji-core/memory/team-ledger.md`](../maji-core/memory/team-ledger.md). Every pivot, every track switch, every architecture decision is logged with timestamp and rationale.

---

## Layer 2 — Process AI: team coordination during build

**The repo ships with [`maji-core/`](../maji-core/) — an AI-pattern team coordinator that runs across the 48-hour build.**

### What maji-core does

Six slash commands available in any AI-assisted IDE (Claude Code · Cursor · Codex · generic AI chat):

| Command | Purpose |
|---|---|
| `/maji-onboard` | First-time intake · ask name · whitelist match against R2-D2 roster · deliver role card with archetype, signature tools, skills, refusals, code ownership · create persistent personal memory |
| `/maji-whoami` | Returning-session quick check · current phase task · open blockers · active pair |
| `/maji-phase` | Cross-team BMAD phase status · per-member state visible after `git pull` |
| `/maji-gate` | Kairu's ladder check · refuses phase advancement without testable outcome verification + independent verifier + concrete evidence |
| `/maji-pair` | Log collaboration between two members · both members' memory updated atomically · cross-consistent task record |
| `/maji-handoff` | End-of-session save to personal memory · conditional team-ledger append for blockers or phase closures |

### What this earns the AI criterion

- **AI-enforced discipline**: phase gates aren't social norms — they're command-enforced. A phase cannot transition to ✅ unless the testable outcome passes on a machine other than the author's.
- **AI-managed memory**: per-member state (current phase, active pair, last blocker, session count) committed to git. Team sees everyone's state on `git pull`. No status-board, no Slack roll-up.
- **AI-aware coding discipline** ([Akal protocol](../maji-core/protocols/akal.md)): four pillars (THINK · SIMPLE · SURGICAL · VERIFY) applied to both human and AI output.
- **AI-managed communication register** ([Jimat protocol](../maji-core/protocols/jimat.md)): three compression modes (ringan · penuh · ultra), default penuh — concise high-signal exchange across the 48 hours.
- **Schema-locked AI memory** ([schema.md](../maji-core/protocols/schema.md)): personal memory JSON shape documented, type-safe, invariant-checked.
- **Pre-flight checks** ([preflight.md](../maji-core/protocols/preflight.md)): every command refuses to run if required artifacts are missing — fail-fast over silent garbage output.

### Evidence

The full system is committed to the repo and runnable on Day 1. Judges can clone, type `/maji-onboard`, and observe the orchestration first-hand.

---

## Layer 3 — In-product AI: Penasihat + NADI Summary

**Inside DuitLater itself, AI appears at two distinct user-facing surfaces.**

### 3.1 Penasihat — Catalogue Suggester

**Surface:** Pool members click "Cadangkan barang" after locking their pool.

**Behaviour:** AI receives the pool's combined PayLater cap, stated need (free-text + category), kampung name, and current month. Returns top-5 ranked items from the MyKasih MySARA-eligible catalogue with per-item:
- Allocation % of combined cap
- BM reasoning grounded in the pool's stated need + seasonal context
- EN reasoning supplemental

**Routing:** [`backend/src/services/penasihat.ts`](../packages/backend/src/services/penasihat.ts) calls **Alibaba Cloud Function Compute** (wrapping Qwen-plus, BM-native LLM) when configured, and falls back to a deterministic local heuristic on 5xx, timeout, or missing config. Both paths return the same structured-output schema.

**Why Qwen primary:** Bahasa Melayu reasoning is more accurate on Qwen than on English-trained-then-multilingualised models. Cost-optimised for small structured-output workloads. Sponsor-aligned (Alibaba is Platinum sponsor). Data sovereignty narrative — B40 user financial context stays in regional sovereign cloud.

**Demonstrable in pitch:** Slide 5 demo includes a live Penasihat call. Provider used (`alibaba-qwen` or `heuristic`) is logged for observability.

### 3.2 NADI Weekly Summary — Anomaly Detection

**Surface:** NADI staff opens `/nadi/dashboard`. The "Ringkasan Minggu" card surfaces an AI-generated weekly digest.

**Behaviour:** AI receives weekly context (pools formed, top-requested items, kampung trust score Δ, late-payment events). Returns:
- Headline in BM
- 3-5 BM observations
- 0-3 anomalies flagged (e.g., *"3 ahli pool {id} bayar lewat 5 hari — clusters seperti ni boleh jadi tanda kesusahan kampung"*)
- BM-first action suggestion

**Anomaly detection rule:** clusters of 3+ late payments same week → flagged as kampung-distress signal, prompting NADI staff to follow up with affected members.

**Routing:** Same pattern as Penasihat — [`packages/backend/src/services/nadi-summary.ts`](../packages/backend/src/services/nadi-summary.ts) routes to Alibaba Function Compute when configured, with deterministic heuristic fallback.

**Why this earns the AI criterion deeper:** This is not single-shot inference — it's longitudinal pattern surfacing. AI looks across weekly state to identify something humans wouldn't easily spot at scale (188 NADI centres × weekly cycles = 9,776 weekly contexts annually). Cost-optimised serverless inference scales transparently.

---

## Why three layers matter for judging

The criterion text reads:

> *"Effective and meaningful integration of Artificial Intelligence to address the problem statements"*

A team that adds an AI feature to an otherwise traditional product hits the criterion at one layer. DuitLater hits it at **three layers**:

| Layer | Where AI appears | Evidence |
|---|---|---|
| 1 — Pre-product | All planning artifacts (~2,400 lines of PRD/architecture/pitch authored AI-collaboratively) | Every doc in the repo |
| 2 — Process | Team coordinator with phase gates, schema-locked memory, code-discipline protocol | [`maji-core/`](../maji-core/) folder |
| 3 — In-product | Penasihat suggester + NADI weekly summary (multi-cloud · BM-native) | [`backend/src/services/`](../backend/src/services/) + [`alibaba-function-compute/`](../alibaba-function-compute/) |

Each layer is independently demonstrable. Each layer has explicit code and committed artifacts.

---

## What this means for the pitch

The 4-minute pitch's slide 4 (Criteria Mapping) opens the AI row with this 3-layer framing. The narration leads with:

> *"AI muncul di tiga lapisan dalam projek ni. Pertama — sebelum kod product ditulis, AI orchestration generate semua six hundred-plus baris PRD, architecture, pitch deck. Kedua — masa build, repo ada `maji-core` team coordinator yang enforce phase gates, manage memory, jalankan akal discipline. Ketiga — dalam product sendiri, Penasihat suggest items, NADI summary detect anomalies. Tiga lapisan, satu produk."*

This positions DuitLater as a project where AI is **the methodology**, not just a feature.

---

## Repository evidence

Judges can verify each claim:

- **Layer 1:** Browse `*.md` files in repo root and `docs/` — all committed, all timestamped, all in git history
- **Layer 2:** Run `ls maji-core/` — see protocols (akal, jimat, bmad, phase-gate, schema, preflight, onboarding) + commands (6 prompt templates) + heroes (5 role cards) + memory (team-ledger.md committed)
- **Layer 3:** `cat packages/backend/src/services/penasihat.ts` — see the provider routing code · `cat packages/backend/src/services/nadi-summary.ts` · `cat alibaba-function-compute/penasihat-suggest/index.js` — see the deployable Qwen wrapper

No layer is theatrical. Every layer is shipped.
