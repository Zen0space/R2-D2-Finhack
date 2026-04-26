---
title: "DuitLater"
subtitle: "Sendiri tak mampu, ramai-ramai boleh."
event: "TNG FINHACK 2026 · Financial Inclusion Track"
team: "R2-D2 — Ijam · Moon · Akmal · Kairu · MatNep"
date: "25–26 April 2026"
duration: "4 minutes · 8 slides · landscape PDF"
---

::: slide :::

# DuitLater

## *Sendiri tak mampu, ramai-ramai boleh.*

Pool PayLater untuk komuniti B40 di Malaysia.

**Team R2-D2** · KrackedDevs

> TNG FINHACK 2026 · **Financial Inclusion Track** · 25–26 April 2026

:::

::: slide :::

# The Gap

## RM 300 doesn't buy a sewing machine.

Mak Cik Aminah dari Felda Gedangsa ada TNG eWallet.
PayLater allowance dia: **RM 300**.

Dia nak mesin jahit untuk start home tailoring side income — **RM 1,800**.
Sendiri tak mampu.

Tapi dengan enam jiran dia, gabung PayLater allowance — **RM 2,000+**.
Cukup. Lebih.

::: split :::

**The numbers:**

- **23M+** TNG eWallet users · rails dah ada di poket setiap orang
- **15%** rakyat Malaysia masih unbanked atau underbanked
- **2.9M** isi rumah B40 nasional
- **0** mekanisme dalam TNG eWallet untuk gabung PayLater antara users

Individual limits. Communal needs. Platform missing.

:::

:::

::: slide :::

# DuitLater

## Pool PayLater. Beli yang sendiri tak boleh.

::: 4steps :::

**1. Form pool**
2–8 ahli daftar di NADI centre · staff bantu pool formation

**2. Combine PayLater**
Sum of individual TNG limits · combined cap pool muncul

**3. Penasihat (AI · BM-first)**
Cadangkan top-5 barang dari katalog MyKasih MySARA

**4. Pool vote & buy**
Majoriti setuju · TNG approve · NADI sahkan delivery · ahli bayar balik bulanan

:::

**Empat institusi Malaysia, satu rail TNG:**

> **TNG** (PayLater) · **NADI / MCMC** (community facilitator · 188 centres) · **MyKasih** (MySARA catalogue · 10,000+ merchants) · **B40 households** (the pool)

Tiada welfare baru. Tiada lender baru. Cuma compose institusi yang dah ada.

:::

::: slide :::

# Five Criteria · Five Answers

| Kriteria | Bagaimana DuitLater jawab |
|---|---|
| **AI & Intelligent Systems** | **Tiga lapisan** — (1) AI generate 2,400+ baris planning artifacts sebelum kod ditulis · (2) `maji-core` team coordinator enforce phase gates + memory · (3) Penasihat suggester + NADI summary in-product |
| **Technical Implementation** | Append-only ledger · HMAC webhooks · argon2 · role-scoped portals · Postgres streaming replication · documented scale path |
| **Multi-Cloud Service Usage** | **AWS** (compute · DB · S3) **+ Alibaba Cloud** (Function Compute · Qwen LLM · OSS) — Gold + Platinum sponsors actively used · failover tested |
| **Impact & Feasibility** | NADI Felda Gedangsa pilot · 188 NADIs nasional · 2.9M B40 households · existing institutions composed |
| **Presentation & Teamwork** | 600-line PRD · 1,400-line multi-cloud setup guide · 8-slide deck · 4-min narration · maji-core coordinator |

> *Not retrofitted. Designed criterion-first.*

:::

::: slide :::

# Mari saya tunjuk

::: demo-grid :::

| **Daftar** | **Cipta pool** | **Lock + invite** |
| Sign up · individual PayLater displayed | Nama · need · members 1/8 | Combined cap RM 1,800 |

| **Penasihat** | **Pool vote** | **Repayment** |
| 5 BM suggestions via Alibaba Qwen | 3-of-4 majority · TNG approval | Ledger green · kampung trust score 87 |

:::

> **Live URL:** demo.duitlater.com · Felda Gedangsa kampung pre-seeded · 4 members per pool · NADI staff login pre-loaded

:::

::: slide :::

# Two Clouds. Both Sponsor-Aligned.

::: stack-split :::

**AWS** *(Gold sponsor)*
- EC2 t3.medium × 3 (HA cluster · Cloudflare-fronted)
- PostgreSQL 17 (streaming replication primary → 2 replicas)
- S3 (assets + backup)
- CloudFlare LB + auto-failover

**Alibaba Cloud** *(Platinum sponsor)*
- Function Compute (Penasihat · NADI summary)
- Qwen-plus LLM (BM-native)
- Object Storage Service (cross-cloud DR backup mirror)

:::

**Ops profile:**
Backend: **Hono + Prisma + Postgres 17** · Frontend: **Next.js 15 + React 19 + Tailwind v4** · AI fallback: **deterministic heuristic** when Alibaba 5xx · Caddy reverse proxy · Docker Compose · GitHub Actions release pipeline → GHCR.

> Tiga server. Auto-failover via Cloudflare. Multi-cloud orchestration real, not theatre.

:::

::: slide :::

# We're Standing on Lineage

| Reference | Region | Raised | Mechanic |
|---|---|---|---|
| **MoneyFellows** | Egypt | USD 31M | Communal financial digitization |
| **Esusu** | USA | ~USD 1B valuation | Trust-score for invisible populations |
| **Stokfella** | South Africa | Regional leader | Stokvel digital ledger |
| **Easypaisa Pool Buy** | Pakistan | Mobile-wallet group purchase | Direct pool-PayLater precedent |

> Pool credit dah scale di Mesir, Amerika, Afrika Selatan, Pakistan.
> Malaysia ada TNG. Malaysia ada NADI. Malaysia ada MyKasih.
> **DuitLater is the wiring.**

:::

::: slide :::

# What We Need From You

::: asks :::

**1. TNG**
PayLater sandbox API access untuk pool transaction flow. Risk model real, bukan simulated.

**2. MCMC / NADI**
Formal collaboration framework dengan NADI Selangor — 84 centres ready as distribution channel.

**3. MyKasih Foundation**
Merchant network access + MySARA catalogue API untuk last-mile fulfilment.

:::

::: contact :::

**Pitch:** Ijam · zarulijam@gmail.com
**Backend:** Moon · **Frontend:** Akmal · **PM:** Kairu · **Design:** MatNep
**Repo:** github.com/Zen0space/R2-D2-Finhack

:::

> *Tiga institusi Malaysia. Satu produk yang TNG boleh ship. Empat juta isi rumah B40 yang akan akses kapasiti kewangan kolektif buat pertama kali.*

> *Sendiri tak mampu, ramai-ramai boleh.*

> **Terima kasih.**

:::
