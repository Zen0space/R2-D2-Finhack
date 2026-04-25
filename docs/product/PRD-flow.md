# DuitLater — PRD Visual Flow

**Companion to `PRD.md`** — same product spec, expressed as flow diagrams for fast comprehension during pitch, stand-up, and handoff.

**Source of truth:** [PRD.md](./PRD.md). If diagrams here disagree with the PRD, the PRD wins.

---

## 1. The Institutional Package (4-way Malaysian)

```mermaid
flowchart TB
    User["B40 Household<br/>Mak Cik Aminah · Pak Cik Razali · Adik Faiz"]

    subgraph DL ["DuitLater · pool combinator"]
        Pool["Pool of 2–8 members"]
        Penasihat["AI Penasihat<br/>BM-first item suggester"]
    end

    TNG["TNG eWallet<br/>PayLater rail<br/>per-user limit"]
    NADI["NADI Centre<br/>community facilitator<br/>84 in Selangor"]
    MyKasih["MyKasih Foundation<br/>MySARA-eligible catalogue<br/>+ merchant network"]

    User -->|"trusts · onboards via"| NADI
    User -->|"forms · joins"| Pool
    Pool <-->|"debit pro-rata"| TNG
    Pool --> Penasihat
    Penasihat <-->|"queries"| MyKasih
    NADI -->|"confirms delivery"| Pool
    MyKasih -->|"ships to"| NADI

    style DL fill:#fff8dc,stroke:#b8860b
    style TNG fill:#e6f3ff
    style NADI fill:#e8f5e9
    style MyKasih fill:#fce4ec
    style User fill:#ffe4b5
```

**Key insight:** zero new institutions invented. Every actor already exists in Malaysia today. DuitLater is the *missing connector*.

---

## 2. End-to-End User Journey

```mermaid
sequenceDiagram
    actor Initiator as Pool Initiator<br/>(Pak Cik Razali)
    actor Members as 1–7 Members
    participant App as DuitLater
    participant TNG as TNG PayLater
    participant AI as AI Penasihat
    participant Cat as MyKasih Catalogue
    participant NADI as NADI Centre

    Note over Initiator,App: Phase 2 — Formation
    Initiator->>App: Create pool (name · need · budget)
    Initiator->>App: Generate 8-char invite code (DL-A1B2C3)
    Members->>App: Join via code
    Initiator->>App: Lock pool (≥ 2 members)
    App->>TNG: Σ individual allowances
    TNG-->>App: combinedCap

    Note over App,Cat: Phase 3 — Suggestion
    App->>AI: suggest(combinedCap, statedNeed, season)
    AI->>Cat: query items ≤ cap
    Cat-->>AI: candidate items
    AI-->>App: top-5 BM-ranked + reasoning

    Note over Members,App: Phase 4 — Vote + Purchase
    Members->>App: Setuju / Tak setuju
    App->>App: simple majority approves
    App->>TNG: debit each member proportionally
    TNG-->>App: approved
    App->>Cat: place order
    Cat->>NADI: deliver to centre
    NADI->>App: confirm delivery

    Note over Members,TNG: Phase 5 — Repayment cycle
    loop monthly until completed
        Members->>App: "Bayar bulan ni"
        App->>TNG: collect monthly share
        App->>App: append to ledger · update kampung trust
    end
```

---

## 3. Pool Lifecycle (state machine)

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Create pool form
    DRAFT --> LOCKED: 2+ members + initiator locks
    DRAFT --> [*]: Discard

    LOCKED --> SUGGESTING: "Cadangkan barang"
    LOCKED --> DISSOLVED: Cancelled

    SUGGESTING --> VOTING: Members select item

    VOTING --> APPROVED: Simple majority "Setuju"
    VOTING --> SUGGESTING: Tied · re-call after 24h

    APPROVED --> ACTIVE: NADI confirms delivery

    ACTIVE --> COMPLETED: All cycles repaid

    DISSOLVED --> [*]
    COMPLETED --> [*]: Audit record (append-only)
```

| State | Mutations allowed | Owner |
|---|---|---|
| `DRAFT` | Edit any field | Initiator |
| `LOCKED` | Roster frozen · combinedCap fixed | TNG |
| `SUGGESTING` | Penasihat queries Claude API | AI |
| `VOTING` | Each member votes once | Members |
| `APPROVED` | TNG debits committed | TNG + Backend |
| `ACTIVE` | Monthly repayments accrue | Members + NADI |
| `COMPLETED` | Read-only audit | None |

---

## 4. Personas at a Glance

```mermaid
flowchart LR
    subgraph Primary [Primary]
        Aminah["👩 Mak Cik Aminah · 47<br/>Felda peneroka<br/>RM 300 PayLater<br/>Wants: sewing machine"]
    end

    subgraph Secondary [Secondary]
        Razali["👨 Pak Cik Razali · 58<br/>Felda smallholder<br/>RM 400 PayLater<br/>Wants: generator + sprayer<br/><br/>Likely pool initiator"]
    end

    subgraph Tertiary [Tertiary]
        Faiz["🛵 Adik Faiz · 24<br/>Grab driver, urban-fringe<br/>RM 500 PayLater<br/>Wants: school supplies"]
    end

    subgraph Institutional [Institutional]
        Hidayah["💼 Cik Hidayah<br/>NADI Felda Gedangsa staff<br/>6 years in role<br/>Trusted intermediary"]
    end

    Razali -->|invites| Aminah
    Razali -->|invites| Faiz
    Hidayah -->|facilitates| Razali

    style Aminah fill:#fff3e0
    style Razali fill:#e3f2fd
    style Faiz fill:#f3e5f5
    style Hidayah fill:#e0f2f1
```

**Common patterns:** TNG already installed · BM-first · trust through community (kampung + NADI staff) · excluded from formal credit · included in MySARA aid.

---

## 5. Pool Math — Worked Example

```
Pool: "Mesin Jahit Felda Gedangsa"
Members + individual TNG PayLater allowances
─────────────────────────────────────────────
  Mak Cik Aminah     RM   300
  Pak Cik Razali     RM   400
  Adik Faiz          RM   500
  3 others (avg)     RM 1,200 (RM 400 each)
                     ─────────
  combinedCap:       RM 2,400

Item chosen by majority vote: Industrial sewing machine RM 1,800
Proportional debit per member:

  Aminah   →  300 / 2400 × 1800 =  RM 225.00
  Razali   →  400 / 2400 × 1800 =  RM 300.00
  Faiz     →  500 / 2400 × 1800 =  RM 375.00
  Other-1  →  400 / 2400 × 1800 =  RM 300.00
  Other-2  →  400 / 2400 × 1800 =  RM 300.00
  Other-3  →  400 / 2400 × 1800 =  RM 300.00
                                  ─────────
  Total committed:                RM 1,800.00  ✓

Monthly share over 6 cycles:
  Aminah   →  RM  37.50 / month
  Razali   →  RM  50.00 / month
  Faiz     →  RM  62.50 / month
  Others   →  RM  50.00 / month each
```

**Invariants** (`PRD §10` + `§12`):
- All money in **integer cents** — never float
- Repayment ledger **append-only** — corrections via compensating rows
- `Pool.combinedCap` **frozen at lock** — never recalculated

---

## 6. Tech Architecture

```mermaid
flowchart LR
    Browser["User<br/>Browser"]
    Caddy["Caddy<br/>HTTPS :443<br/>reverse proxy"]
    Frontend["Next.js Frontend<br/>:3000<br/>App Router + PWA"]
    Backend["Hono Backend<br/>:4000<br/>Node 22"]
    Postgres[("Postgres :5432<br/>Prisma 6")]
    Auth[Better Auth<br/>sessions]
    TNG["TNG PayLater<br/>sandbox"]
    Claude["Claude API<br/>Penasihat"]
    Cat["MyKasih catalogue<br/>seeded · 94 items"]

    Browser --> Caddy
    Caddy -->|/*| Frontend
    Caddy -->|/api/*| Backend
    Frontend -.->|fetch| Caddy
    Backend --> Postgres
    Backend <--> Auth
    Backend -->|outbound| TNG
    Backend -->|outbound| Claude
    Backend --> Cat

    style Browser fill:#ffe4b5
    style Caddy fill:#90ee90
    style Backend fill:#87ceeb
    style Frontend fill:#dda0dd
    style Postgres fill:#f0e68c
```

**Repository layout — pnpm workspace monorepo:**

```
R2-D2-Finhack/
├── packages/
│   ├── backend/    Hono · Prisma · Better Auth · zod
│   ├── frontend/   Next.js 15 · Tailwind v4 · Jotai · TanStack Query · PWA
│   └── db/         Prisma schema · migrations · generated client
├── docs/{product,tech,team,process,pitch}/
├── maji-core/      protocols · heroes · slash commands
└── infra/ (Caddyfile + compose) · scripts/
```

---

## 7. Build Phases Timeline (48-hour window)

```mermaid
gantt
    title DuitLater · 48-hour build · 25–26 April 2026
    dateFormat YYYY-MM-DD HH:mm
    axisFormat %a %H:%M

    section Saturday
    P0 Stack Activation         :done, p0, 2026-04-25 09:00, 90m
    P1 Auth + Individual PayLater :active, p1, after p0, 240m
    P2 Pool Form + Lock         :p2, after p1, 180m
    P3 Penasihat + Catalogue    :p3, after p2, 300m

    section Sunday
    P4 Vote + Approval + Buy    :p4, 2026-04-26 09:00, 240m
    P5 Repayment + Kampung Trust:p5, after p4, 240m
    P6 NADI Portal + Pitch      :p6, 2026-04-26 14:00, 300m

    section Demo
    Pitch rehearsal             :crit, 2026-04-26 18:00, 60m
    Judging                     :milestone, 2026-04-26 20:00, 0m
```

| Phase | Lead | Testable outcome |
|---|---|---|
| 0 | Moon + Akmal · Kairu gate | `docker compose up` · `/health` returns 200 · landing renders |
| 1 | Moon + Akmal | Register → login → dashboard shows individual PayLater allowance |
| 2 | Akmal + Moon | Create pool → invite → 2nd user joins → lock → combinedCap visible |
| 3 | Moon | Locked pool → Penasihat returns top-5 BM-ranked items |
| 4 | Moon + Kairu | Members vote → majority approves → simulated TNG debit → ACTIVE |
| 5 | Moon + Akmal | Monthly Bayar → ledger appends → kampung trust score updates |
| 6 | Ijam + MatNep | NADI portal · pitch deck · 4-min on-stage rehearsal |

---

## 8. Functional Requirements Coverage by Phase

```mermaid
flowchart TB
    P0["Phase 0 · Stack Activation<br/>(scaffolded)"]
    P1["Phase 1 · Auth + PayLater<br/>F-A1..A4 (auth)<br/>F-P1..P3 (allowance)"]
    P2["Phase 2 · Pool Lifecycle<br/>F-PL1..PL5"]
    P3["Phase 3 · AI Penasihat<br/>F-AI1..AI5"]
    P4["Phase 4 · Vote + Purchase<br/>F-V1..V4 (vote)<br/>F-D1..D5 (purchase)"]
    P5["Phase 5 · Repayment + Trust<br/>F-R1..R5 (repayment)<br/>F-T1..T5 (kampung trust)"]
    P6["Phase 6 · NADI Portal + Brand<br/>F-N1..N5 (portal)<br/>F-B1..B6 (brand surface)"]

    P0 --> P1 --> P2 --> P3 --> P4 --> P5 --> P6

    style P0 fill:#e0e0e0
    style P1 fill:#bbdefb
    style P2 fill:#c8e6c9
    style P3 fill:#fff9c4
    style P4 fill:#ffccbc
    style P5 fill:#d1c4e9
    style P6 fill:#f8bbd0
```

---

## 9. Risk → Mitigation Map

```mermaid
flowchart LR
    subgraph Risks [Top risks]
        R1["TNG sandbox not<br/>provisioned Day 1"]
        R2["Claude API rate-limit<br/>during demo"]
        R3["Phase 4 eats Sunday morning"]
        R4["Demo machine fails on stage"]
        R5["Pitch overruns 4 min"]
    end

    subgraph Mitigations [Mitigations]
        M1["Mock TNG client<br/>returns success in dev"]
        M2["Pre-cache common<br/>Penasihat suggestions"]
        M3["Cut to manual<br/>admin-button approval"]
        M4["Backup video pre-recorded<br/>+ self-contained narration"]
        M5["Strict timer rehearsal<br/>twice Sun morning"]
    end

    R1 --> M1
    R2 --> M2
    R3 --> M3
    R4 --> M4
    R5 --> M5

    style R1 fill:#ffcdd2
    style R2 fill:#ffcdd2
    style R3 fill:#ffcdd2
    style R4 fill:#ffcdd2
    style R5 fill:#ffcdd2
    style M1 fill:#c8e6c9
    style M2 fill:#c8e6c9
    style M3 fill:#c8e6c9
    style M4 fill:#c8e6c9
    style M5 fill:#c8e6c9
```

---

## 10. NADI Portal Scope (F-N1..N5)

```mermaid
flowchart TB
    NADIstaff["Cik Hidayah<br/>(nadi_staff role)"]
    NADIstaff -->|"login → /nadi/dashboard"| Dashboard

    subgraph Dashboard [NADI Dashboard · aggregate-only]
        Active["Active pools count"]
        Members["Members per pool"]
        Items["Items purchased aggregate"]
        Repay["Repayment rate aggregate"]
        Trust["Kampung trust score"]
        Confirm["Confirm delivery action"]
    end

    Confirm -->|"flips Pool.status<br/>APPROVED → ACTIVE"| Pool["Pool record"]

    style NADIstaff fill:#e0f2f1
    style Dashboard fill:#fff8e1
```

**Privacy guarantee (F-N5):** NADI staff see *aggregate* numbers — never individual member amounts or transactions.

---

## 11. Track-fit Recap (Financial Inclusion)

```mermaid
flowchart LR
    Brief["TNG FINHACK 2026<br/>Financial Inclusion brief:<br/>'Empower underserved users<br/>which include unbanked +<br/>low-income communities'"]

    Brief --> A["Empower underserved<br/>= combine small individual<br/>limits → meaningful pool capacity"]
    Brief --> B["Unbanked<br/>= TNG eWallet only<br/>(no traditional bank required)"]
    Brief --> C["Low-income communities<br/>= B40 explicit<br/>Felda Gedangsa pilot"]

    style Brief fill:#fff3e0
    style A fill:#c8e6c9
    style B fill:#c8e6c9
    style C fill:#c8e6c9
```

---

*PRD-flow v1.0 · 2026-04-25 · derived from PRD v2.0 · companion visualisation for the same Financial Inclusion track submission.*

*"Sendiri tak mampu, ramai-ramai boleh."*
