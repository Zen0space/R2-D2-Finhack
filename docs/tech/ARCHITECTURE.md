# Architecture — DuitLater

**Single EC2 instance · 4 Docker containers · same-domain routing · four-way Malaysian institutional integration**

---

## 1. System Architecture (Container-Level)

```mermaid
graph TB
    User([B40 user · TNG eWallet])
    NadiStaff([NADI staff · Felda Gedangsa])

    subgraph DNS
        Domain[duitlater.domain.com<br/>A record → Elastic IP]
    end

    subgraph EC2["EC2 · t3.medium · ap-southeast-1"]
        subgraph Net["Docker Network: duitlater_web"]
            Caddy["caddy:2-alpine<br/>:80 · :443<br/>SSL + path-routing"]
            Frontend["frontend<br/>Next.js 15 standalone<br/>:3000"]
            App["app<br/>Hono + Better Auth<br/>:4000"]
            Postgres[("postgres:16-alpine<br/>:5432<br/>postgres_data")]
        end
    end

    subgraph External["External Services"]
        TNG["TNG PayLater sandbox<br/>(simulated for demo)"]
        Claude["Anthropic Claude API<br/>AI Penasihat"]
        MyKasih["MyKasih catalogue<br/>(seeded for demo)"]
    end

    User -->|HTTPS :443| Domain
    NadiStaff -->|HTTPS :443| Domain
    Domain --> Caddy
    Caddy -->|handle /*| Frontend
    Caddy -->|handle_path /api/*| App
    App -->|SQL internal| Postgres
    App -->|HTTPS| TNG
    App -->|HTTPS| Claude
    App -->|read-only seed| MyKasih
```

---

## 2. Pool Formation Flow

```mermaid
sequenceDiagram
    autonumber
    participant U as Initiator (Mak Cik Aminah)
    participant F as Frontend
    participant A as Backend (Hono)
    participant P as Postgres
    participant U2 as Member 2 (Pak Cik Razali)

    U->>F: Click "Cipta pool"
    F->>F: Show form (name, stated need, target budget)
    U->>F: Submit
    F->>A: POST /api/pools
    A->>P: INSERT pools (state=draft)
    A->>P: INSERT pool_members (initiator)
    A-->>F: { poolId, inviteCode }
    F-->>U: Pool detail page · combined cap = RM 300

    U->>U2: Share invite link / QR (out-of-band)
    U2->>F: Open /join/<code>
    F->>A: GET /api/pools/by-code/<code>
    A-->>F: Pool preview (initiator + need)
    U2->>F: Click "Sertai pool"
    F->>A: POST /api/pools/join
    A->>P: INSERT pool_members (Pak Cik Razali)
    A-->>F: { ok, poolId }
    F-->>U2: Redirect to pool detail · combined cap = RM 700

    Note over U,U2: ... more members join ...

    U->>F: Click "Lock pool"
    F->>A: POST /api/pools/<id>/lock
    A->>P: UPDATE pools SET state=locked, combined_cap_cents=SUM(allowances)
    A->>P: UPDATE pool_members SET individual_allowance_at_lock_cents (snapshot)
    A-->>F: { ok, combinedCap, memberCount }
    F-->>U: "Pool dah dikunci. Cadangkan barang →"
```

---

## 3. AI Penasihat Suggestion Flow

```mermaid
sequenceDiagram
    autonumber
    participant U as Pool member
    participant F as Frontend
    participant A as Backend (Hono)
    participant P as Postgres
    participant C as Claude API

    U->>F: Click "Cadangkan barang"
    F->>A: POST /api/penasihat/suggest<br/>{ poolId }

    A->>P: SELECT pool + members + combined_cap
    P-->>A: pool context
    A->>P: SELECT mykasih_catalogue WHERE price ≤ combined_cap
    P-->>A: candidate items
    A->>P: SELECT recent suggestions for pool (cache check)
    alt cache hit (< 30 min old)
        P-->>A: cached items
        A-->>F: 5 cached suggestions
    else cache miss
        A->>C: prompt: BM-first item ranker<br/>+ pool context (cap, stated need, season)<br/>+ candidate catalogue<br/>+ structured output schema
        C-->>A: { items: [{ id, name, price, allocation_pct, reasoning_bm }] × 5 }
        A->>P: INSERT pool_suggestions (cache)
        A-->>F: 5 ranked suggestions in BM
    end

    F-->>U: Render 5 suggestion cards
    U->>F: Click "Pilih barang ini" on a card
    F->>A: POST /api/pools/<id>/select-item<br/>{ catalogueItemId }
    A->>P: UPDATE pools SET selected_item_id, state='voting'
    A-->>F: { ok }
    F-->>U: Transition to vote view
```

---

## 4. Pool Vote + Simulated TNG Approval Flow

```mermaid
sequenceDiagram
    autonumber
    participant Members as Pool members (4)
    participant F as Frontend
    participant A as Backend
    participant P as Postgres
    participant T as TNG PayLater (sandbox simulated)

    Note over Members,A: Pool state: 'voting'
    Members->>F: Each opens pool detail
    F-->>Members: Vote modal (item · share · monthly)
    Members->>F: Vote yes / no
    F->>A: POST /api/pools/<id>/vote { vote }
    A->>P: INSERT pool_votes
    A->>A: Tally votes
    A-->>F: { tally: yes:3, no:1, threshold: 3 } (majority reached)

    A->>P: UPDATE pools SET state='approved'
    A->>P: INSERT pool_transactions (item, total)
    A->>P: INSERT paylater_obligations (per member, proportional shares)

    loop For each member
        A->>T: Simulate PayLater approval<br/>(member, share)
        T-->>A: { approved: true, reference: SIM-XXX }
        A->>P: UPDATE paylater_obligations SET tng_reference
    end

    A-->>F: All members notified (next page load)
    F-->>Members: "Pool diluluskan. Menunggu pengesahan dari NADI."
```

---

## 5. NADI Confirm Delivery + Repayment Cycle

```mermaid
sequenceDiagram
    autonumber
    participant N as NADI staff (Cik Hidayah)
    participant F as Frontend (NADI portal)
    participant A as Backend
    participant P as Postgres
    participant Mem as Pool member
    participant T as TNG (simulated payment)

    Note over N,P: Pool state: 'approved'
    N->>F: Open /nadi/dashboard
    F->>A: GET /api/nadi/pending-deliveries
    A->>P: SELECT pools WHERE state='approved' AND kampung=<NADI's>
    P-->>A: pending pools
    A-->>F: List
    F-->>N: Pending deliveries view

    N->>F: Click "Sahkan dah hantar"
    F->>A: POST /api/pools/<id>/confirm-delivery
    A->>P: UPDATE pools SET state='active', delivered_at=NOW()
    A->>P: Initialize repayment cycle 1
    A-->>F: { ok }
    F-->>N: Pool moved to "Active"

    Note over Mem,P: Cycle 1 begins
    Mem->>F: Open pool detail
    F->>A: GET /api/pools/<id>/ledger
    A->>P: SELECT repayments + obligations
    A-->>F: Ledger (member · cycle · status)
    F-->>Mem: "Bayar bulan ni — RM 75"

    Mem->>F: Click "Bayar bulan ni"
    F->>A: POST /api/repayments/pay { obligationId, cycleNumber }
    A->>T: Simulate TNG payment
    T-->>A: { paid, reference }
    A->>P: INSERT repayments
    A->>A: Recalculate kampung trust score
    A->>P: UPDATE kampung_trust_scores
    A-->>F: { ok, newTrustScore }
    F-->>Mem: Ledger row turns green
```

---

## 6. Dev vs Prod

```mermaid
graph TB
    subgraph Dev["DEV — Team Laptops"]
        direction LR
        DBrowser([Browser]) -->|:3000| DF[Frontend<br/>npm run dev]
        DBrowser -->|fetch :4000/api| DA[Backend<br/>npm run dev]
        DA --> DP[(Postgres<br/>Docker :5432)]
    end

    subgraph Prod["PROD — EC2 Single Instance"]
        direction LR
        PBrowser([Browser]) -->|HTTPS :443| PC[Caddy container]
        PC -->|"/*"| PF[Frontend container]
        PC -->|"/api/*"| PA[Backend container]
        PA --> PP[(Postgres container)]
    end
```

---

## 7. Data Model

```mermaid
erDiagram
    USERS ||--o{ SESSIONS : has
    USERS }o--|| KAMPUNGS : "lives in"
    USERS ||--o{ POOL_MEMBERS : "joins as"
    KAMPUNGS ||--o{ POOLS : "hosts"
    KAMPUNGS ||--o| KAMPUNG_TRUST_SCORES : "has"
    POOLS ||--|{ POOL_MEMBERS : contains
    POOLS ||--o{ POOL_SUGGESTIONS : "received"
    POOLS ||--o{ POOL_VOTES : "voted on"
    POOLS ||--o| POOL_TRANSACTIONS : "results in"
    POOL_TRANSACTIONS ||--|{ PAYLATER_OBLIGATIONS : "split into"
    PAYLATER_OBLIGATIONS ||--o{ REPAYMENTS : "paid via"
    MYKASIH_CATALOGUE ||--o{ POOL_TRANSACTIONS : "purchased from"

    USERS {
        uuid id PK
        string email UK
        string name
        string password_hash
        uuid kampung_id FK
        int individual_paylater_allowance_cents
        string role
        timestamp created_at
    }

    KAMPUNGS {
        uuid id PK
        string name
        string nadi_centre_name
        string district
    }

    SESSIONS {
        uuid id PK
        uuid user_id FK
        string token UK
        timestamp expires_at
    }

    POOLS {
        uuid id PK
        uuid kampung_id FK
        uuid initiator_user_id FK
        string name
        string stated_need_text
        string stated_need_category
        int target_budget_cents
        int combined_cap_cents
        uuid selected_catalogue_item_id FK
        string state
        timestamp created_at
        timestamp locked_at
        timestamp delivered_at
    }

    POOL_MEMBERS {
        uuid id PK
        uuid pool_id FK
        uuid user_id FK
        int individual_allowance_at_lock_cents
        timestamp joined_at
    }

    MYKASIH_CATALOGUE {
        uuid id PK
        string name_bm
        string name_en
        string category
        int price_cents
        string image_url
        string description_bm
    }

    POOL_SUGGESTIONS {
        uuid id PK
        uuid pool_id FK
        json items_json
        timestamp suggested_at
    }

    POOL_VOTES {
        uuid id PK
        uuid pool_id FK
        uuid user_id FK
        uuid suggestion_item_id FK
        string vote
        timestamp voted_at
    }

    POOL_TRANSACTIONS {
        uuid id PK
        uuid pool_id FK
        uuid catalogue_item_id FK
        int total_amount_cents
        timestamp approved_at
        timestamp delivered_at
    }

    PAYLATER_OBLIGATIONS {
        uuid id PK
        uuid transaction_id FK
        uuid user_id FK
        int share_amount_cents
        decimal share_pct
        string tng_reference
    }

    REPAYMENTS {
        uuid id PK
        uuid obligation_id FK
        uuid user_id FK
        int cycle_number
        int amount_cents
        string tng_reference
        timestamp paid_at
    }

    KAMPUNG_TRUST_SCORES {
        uuid kampung_id PK_FK
        decimal score
        int signal_count
        timestamp last_updated_at
    }
```

### Key invariants

- Money columns are integer cents (never float)
- `pool.state` transitions forward only (`draft → locked → suggesting → voting → approved → active → completed | dissolved`)
- `pool.combined_cap_cents` set at lock time; never recalculated
- `pool_members.individual_allowance_at_lock_cents` is a snapshot (TNG may change individual allowances later; pool obligation uses snapshot)
- `paylater_obligations` rows are append-only after creation
- `repayments` are append-only; corrections via compensating rows, never destructive UPDATE
- `kampung_trust_scores` recalculated on every repayment or pool completion

---

## 8. Network Security

```mermaid
graph TB
    subgraph Internet["Public Internet"]
        Users[B40 users · NADI staff]
    end

    subgraph SecGroup["EC2 Security Group"]
        Allow["ALLOW :22 team IPs<br/>ALLOW :80 :443 public"]
        Block["BLOCK :3000 :4000 :5432<br/>(Docker-internal only)"]
    end

    subgraph EC2Host["EC2 Host"]
        subgraph DockerNet["Docker duitlater_web"]
            CaddyC[Caddy]
            FEC[Frontend]
            APIC[API]
            DBC[(Postgres)]
        end
    end

    Users -->|HTTPS :443| SecGroup
    SecGroup --> CaddyC
    CaddyC --> FEC
    CaddyC --> APIC
    APIC --> DBC
```

Postgres never exposed publicly. Only `app` container reaches it via Docker network.

NADI portal is a route within the same frontend (`/nadi/*`), gated by the user's `role` field. No separate domain or auth provider.

---

## Container Inventory

| Container | Image | Public Ports | Internal Ports | Volumes |
|---|---|---|---|---|
| caddy | caddy:2-alpine | 80, 443 | — | caddy_data, caddy_config |
| frontend | custom (Next.js) | — | 3000 | — (stateless) |
| app | custom (Hono) | — | 4000 | — (stateless) |
| postgres | postgres:16-alpine | — | 5432 | postgres_data |

---

## Resource Footprint (t3.medium · 2 vCPU · 4 GB RAM)

| Container | RAM Idle | RAM Load |
|---|---|---|
| caddy | 15 MB | 30 MB |
| frontend | 120 MB | 250 MB |
| app | 80 MB | 200 MB |
| postgres | 40 MB | 300 MB |
| **Total** | **~255 MB** | **~900 MB** |

~3 GB RAM headroom remains.

---

## External integration notes

- **TNG PayLater** — for hackathon, simulated client returns success. Production: TNG sandbox API integration. Exposed via single backend service `services/tng.ts` for clean swap-out.
- **Claude API** — `services/claude.ts` wraps Anthropic SDK. System prompt locked in `backend/src/prompts/penasihat-suggest.md` (committed for review).
- **MyKasih catalogue** — for hackathon, ~30 items seeded into `mykasih_catalogue` table from `backend/src/db/seeds/catalogue.ts`. Production: sync job from MyKasih Foundation API (when partnership established).
