# Architecture — Kutu Digitizer

**Single EC2 instance · 4 Docker containers · same-domain routing**

---

## 1. System Architecture (Container-Level)

```mermaid
graph TB
    User([User Browser])

    subgraph DNS
        Domain[kutu.domain.com<br/>A record → Elastic IP]
    end

    subgraph EC2["EC2 · t3.medium · ap-southeast-1"]
        subgraph Net["Docker Network: kutu_web"]
            Caddy["caddy:2-alpine<br/>:80 · :443<br/>SSL + routing"]
            Frontend["frontend<br/>Next.js standalone<br/>:3000"]
            App["app<br/>Hono + Better Auth<br/>:4000"]
            Postgres[("postgres:16-alpine<br/>:5432<br/>postgres_data")]
        end
    end

    subgraph AWS["AWS Cloud · Sponsor Credit"]
        S3[("S3 Bucket<br/>kutu-uploads")]
    end

    subgraph External["External APIs"]
        Claude["Anthropic Claude API<br/>AI Penasihat"]
        TNG["TNG eWallet API<br/>contribution rails"]
    end

    User -->|HTTPS :443| Domain
    Domain --> Caddy
    Caddy -->|handle /*| Frontend
    Caddy -->|handle_path /api/*| App
    App -->|SQL internal| Postgres
    App -->|AWS SDK| S3
    App -->|HTTPS| Claude
    App -->|HTTPS| TNG
```

---

## 2. Request Flow — Create Tabung

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant C as Caddy
    participant F as Frontend
    participant A as Backend (Hono)
    participant P as Postgres

    U->>C: GET /
    C->>F: proxy frontend:3000
    F-->>C: HTML + JS bundle
    C-->>U: rendered page

    Note over U: user fills create-tabung form

    U->>C: POST /api/tabung<br/>Cookie: session_token
    C->>A: proxy app:4000
    A->>A: Better Auth middleware
    A->>P: SELECT user FROM sessions
    P-->>A: user row
    A->>A: validate zod schema
    A->>P: INSERT tabung + members
    P-->>A: tabung.id
    A-->>C: 201 + JSON
    C-->>U: tabung created
```

---

## 3. Auth Flow — Better Auth

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant A as Backend
    participant P as Postgres

    Note over U,P: SIGN-UP
    U->>A: POST /api/auth/sign-up
    A->>A: argon2 hash
    A->>P: INSERT users
    A->>P: INSERT sessions
    P-->>A: session token
    A-->>U: Set-Cookie HttpOnly Secure SameSite=Lax

    Note over U,P: AUTHENTICATED REQUEST
    U->>A: GET /api/tabung (Cookie)
    A->>P: SELECT sessions JOIN users
    P-->>A: session + user
    A->>P: SELECT tabung WHERE user_id
    P-->>A: rows
    A-->>U: 200 + data
```

---

## 4. Contribution + Rotation Flow

```mermaid
sequenceDiagram
    autonumber
    participant U as Member
    participant F as Frontend
    participant A as Backend
    participant P as Postgres
    participant T as TNG eWallet

    U->>F: Click "Contribute RM 100"
    F->>A: POST /api/contributions/initiate
    A->>P: INSERT contribution (status=pending)
    A->>T: Create payment intent
    T-->>A: payment_url + reference
    A-->>F: { paymentUrl, contributionId }
    F-->>U: Redirect to TNG sandbox

    U->>T: Complete payment
    T->>A: POST /api/webhooks/tng (signed)
    A->>A: Verify HMAC signature
    A->>P: UPDATE contribution status=paid
    A->>P: UPDATE member trust_score +1

    A->>A: Check if all members paid this cycle
    alt all members paid
        A->>P: INSERT rotation (recipient = scheduled member)
        A->>P: INSERT payout
        A->>T: Initiate payout to recipient
        T-->>A: payout_reference
        A->>P: UPDATE rotation status=paid
    end

    Note over U,T: User returns from TNG to app
    U->>F: GET /tabung/:id
    F->>A: GET /api/tabung/:id
    A-->>F: updated ledger
    F-->>U: green checkmark + new state
```

---

## 5. S3 Upload Flow (Presigned URL)

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant F as Frontend
    participant A as Backend
    participant S as AWS S3

    U->>F: Select file
    F->>A: POST /api/uploads/presign
    A->>A: validate session + size + type
    A->>S: getSignedUrl putObject (300s TTL)
    S-->>A: presigned URL
    A-->>F: { uploadUrl, key }

    Note over F,S: Direct upload bypasses backend

    F->>S: PUT file
    S-->>F: 200 OK

    F->>A: POST /api/uploads/confirm
    A->>A: Persist reference in DB
    A-->>F: { url }
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
        DA -.->|AWS SDK| DS3[(S3 dev bucket)]
    end

    subgraph Prod["PROD — EC2 Single Instance"]
        direction LR
        PBrowser([Browser]) -->|HTTPS :443| PC[Caddy container]
        PC -->|"/*"| PF[Frontend container]
        PC -->|"/api/*"| PA[Backend container]
        PA --> PP[(Postgres container)]
        PA -.->|AWS SDK| PS3[(S3 prod bucket)]
    end
```

---

## 7. Deploy Pipeline

```mermaid
flowchart LR
    Dev[Dev Laptop] -->|git commit| Local[Local git]
    Local -->|git push| GH[(GitHub)]
    GH -->|SSH manual pull| EC2[EC2 Instance]
    EC2 -->|git pull| Pull[Updated code]
    Pull -->|docker compose up -d --build| Build[Rebuild images]
    Build --> Restart[Containers restart]
    Restart -->|db migrate| Migrate[Apply migrations]
    Migrate --> Live([Live])
```

Total deploy: ~90 seconds.

---

## 8. Data Model

```mermaid
erDiagram
    USERS ||--o{ SESSIONS : has
    USERS ||--o{ TABUNG : creates
    USERS ||--o{ TABUNG_MEMBERS : "joins as"
    TABUNG ||--|{ TABUNG_MEMBERS : contains
    TABUNG ||--o{ CONTRIBUTIONS : receives
    TABUNG ||--o{ ROTATIONS : schedules
    TABUNG_MEMBERS ||--o{ CONTRIBUTIONS : makes
    ROTATIONS ||--o{ PAYOUTS : triggers

    USERS {
        uuid id PK
        string email UK
        string name
        string password_hash
        int trust_score
        timestamp created_at
    }

    SESSIONS {
        uuid id PK
        uuid user_id FK
        string token UK
        timestamp expires_at
    }

    TABUNG {
        uuid id PK
        uuid created_by FK
        string name
        int monthly_amount_cents
        int duration_months
        string status
    }

    TABUNG_MEMBERS {
        uuid id PK
        uuid tabung_id FK
        uuid user_id FK
        int rotation_order
        string invite_code
    }

    CONTRIBUTIONS {
        uuid id PK
        uuid tabung_id FK
        uuid member_id FK
        int amount_cents
        string tng_reference
        string status
        timestamp paid_at
    }

    ROTATIONS {
        uuid id PK
        uuid tabung_id FK
        uuid recipient_member_id FK
        int cycle_number
        timestamp scheduled_at
        timestamp paid_at
    }

    PAYOUTS {
        uuid id PK
        uuid rotation_id FK
        uuid member_id FK
        int amount_cents
        string tng_reference
        timestamp paid_at
    }
```

---

## 9. Network Security

```mermaid
graph TB
    subgraph Internet["Public Internet"]
        Users[Users]
    end

    subgraph SecGroup["EC2 Security Group"]
        Allow["ALLOW :22 team IPs<br/>ALLOW :80 :443 public"]
        Block["BLOCK :3000 :4000 :5432<br/>(Docker-internal only)"]
    end

    subgraph EC2Host["EC2 Host"]
        subgraph DockerNet["Docker kutu_web"]
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

## Render These Diagrams to PDF

```bash
cd /path/to/Kutu-Digitizer
npx -y -p @mermaid-js/mermaid-cli mmdc -i ARCHITECTURE.md -o ARCHITECTURE-rendered.md -e png --scale 2
sed -i '' 's/!\[diagram\]/![]/g' ARCHITECTURE-rendered.md
pandoc ARCHITECTURE-rendered.md -o ARCHITECTURE.pdf --pdf-engine=weasyprint
```

(See `/Users/ijam/Desktop/Touch-N-Go/style.css` for styling reference.)
