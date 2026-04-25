# Free Multi-VPS Setup & HA Guide

**DuitLater · TNG FINHACK 2026 · Financial Inclusion Track**
**Audience:** Moon (Backend / Foundation-Keeper) — primary implementer
**Companion to:** [`infra/RELEASE.md`](../../infra/RELEASE.md) (single-EC2 baseline runbook)
**Status:** v2.0 · 2026-04-26 · Free VPS mode default

---

## Ringkasan Eksekutif

Guide ni tunjuk macam mana setup **3 VPS/server** untuk DuitLater dengan kos serendah mungkin: **Cloudflare Free DNS round-robin**, **Postgres replication** untuk data aplikasi, dan **Syncthing** untuk fail upload lokal. Tiada WireGuard. Tiada paid Cloudflare Load Balancer sebagai default. Tiada S3/OSS sebagai default untuk upload.

**Free topology summary:**
- 3 VPS/server, setiap satu boleh run prod + dev stack.
- `duitlater.com` ada 3 proxied A records: Server 1, Server 2, Server 3.
- `dev.duitlater.com` juga ada 3 proxied A records: Server 1, Server 2, Server 3.
- Postgres primary di Server 1, replicas di Server 2/3.
- Semua app writes pergi ke Postgres primary; replicas untuk standby/read verification.
- Local uploads disimpan di folder VPS dan disync ke peer server pakai Syncthing.
- Alibaba Function Compute kekal optional untuk AI Penasihat.
- S3/Alibaba OSS kekal optional advanced backup, bukan default setup.

**Important boundary:**
- Syncthing sync **files only**: gambar, PDF, resit, agreement.
- Syncthing **tidak boleh** sync Postgres data directory.
- User register, pool, vote, repayment, auth session = Postgres source of truth.

**Free-mode limitation:** Cloudflare Free DNS round-robin tidak ada paid health monitor, origin pools, priority steering, atau guaranteed automatic failover. Kalau satu VPS rosak, buang IP itu dari DNS secara manual atau upgrade kemudian ke Cloudflare Load Balancing.

---

## Daftar Kandungan

1. [Free VPS Mode — Default](#0-free-vps-mode--default)
2. [Konsep Asas](#1-konsep-asas)
3. [Topology Penuh](#2-topology-penuh)
4. [Prasyarat](#3-prasyarat)
5. [Bahagian A — Setup VPS Side](#bahagian-a--setup-vps-side)
6. [Bahagian B — Setup Alibaba Cloud Side](#bahagian-b--setup-alibaba-cloud-side)
7. [Bahagian C — Local Upload Sync](#bahagian-c--local-upload-sync)
8. [Bahagian D — Failover Playbook](#bahagian-d--failover-playbook)
9. [Bahagian E — Verification Checklist](#bahagian-e--verification-checklist)
10. [Advanced Optional — Paid Cloudflare + S3/OSS](#advanced-optional--paid-cloudflare--s3oss)

---

## 0. Free VPS Mode — Default

### 0.1 DNS

Cloudflare Free DNS records:

```text
duitlater.com       A   <SERVER_1_PUBLIC_IP>   proxied
duitlater.com       A   <SERVER_2_PUBLIC_IP>   proxied
duitlater.com       A   <SERVER_3_PUBLIC_IP>   proxied
dev.duitlater.com   A   <SERVER_1_PUBLIC_IP>   proxied
dev.duitlater.com   A   <SERVER_2_PUBLIC_IP>   proxied
dev.duitlater.com   A   <SERVER_3_PUBLIC_IP>   proxied
```

Cloudflare Free DNS can distribute traffic across origins, but it is not a health-checked load balancer. During incident, remove the broken VPS IP from DNS.

### 0.2 `.env` files

On each VPS:

```bash
cp infra/.env.example infra/.env
cp packages/backend/.env.example packages/backend/.env.prod
cp packages/backend/.env.example packages/backend/.env.dev
cp packages/frontend/.env.example packages/frontend/.env.prod
cp packages/frontend/.env.example packages/frontend/.env.dev
```

Prod backend uses:

```env
APP_ENV=prod
PUBLIC_APP_URL=https://duitlater.com
FRONTEND_URL=https://duitlater.com
CORS_ORIGIN=https://duitlater.com
BETTER_AUTH_URL=https://duitlater.com
POSTGRES_DB=duitlater
DATABASE_URL=postgresql://duitlater:<password>@<primary-public-ip>:5432/duitlater
UPLOAD_ROOT=/data/uploads
UPLOAD_PUBLIC_PATH=/uploads
```

Dev backend uses:

```env
APP_ENV=dev
PUBLIC_APP_URL=https://dev.duitlater.com
FRONTEND_URL=https://dev.duitlater.com
CORS_ORIGIN=https://dev.duitlater.com
BETTER_AUTH_URL=https://dev.duitlater.com
POSTGRES_DB=duitlater_dev
DATABASE_URL=postgresql://duitlater:<password>@<primary-public-ip>:5432/duitlater_dev
UPLOAD_ROOT=/data/uploads
UPLOAD_PUBLIC_PATH=/uploads
```

### 0.3 Firewall allowlist

No WireGuard. Lock public ports with firewall:

```text
22          Moon/team IP only
80,443      public / Cloudflare
5432        only Server 1/2/3 public IPs
22000/tcp   only Server 1/2/3 public IPs
22000/udp   only Server 1/2/3 public IPs
8384        localhost only (Syncthing GUI through SSH tunnel)
```

### 0.4 Start stack

```bash
docker compose --env-file infra/.env -f infra/docker-compose.sync.yml -p sync up -d

docker compose --env-file infra/.env -f infra/docker-compose.prod.yml -p prod up -d --build
docker compose --env-file infra/.env -f infra/docker-compose.prod.yml -p prod exec app pnpm --filter db migrate

docker compose --env-file infra/.env -f infra/docker-compose.dev.yml -p dev up -d --build
docker compose --env-file infra/.env -f infra/docker-compose.dev.yml -p dev exec app pnpm --filter db migrate
```

### 0.5 Upload sync

Runtime paths:

```text
Prod host uploads: /var/lib/duitlater/prod/uploads
Dev host uploads:  /var/lib/duitlater/dev/uploads
Backend path:      /data/uploads
Public URL:        /uploads/<yyyy>/<mm>/<dd>/<uuid>.<ext>
```

Syncthing folders:

```text
duitlater-prod-uploads -> /var/syncthing/prod-uploads
duitlater-dev-uploads  -> /var/syncthing/dev-uploads
```

Set Syncthing to send/receive between Server 1/2/3. Never add Postgres volumes to Syncthing.

---

## 1. Konsep Asas

### 1.1 High Availability (HA)

HA = sistem yang masih boleh berfungsi **walaupun ada bahagian yang rosak**. Daripada 1 server (single point of failure), kita gunakan beberapa server. Bila satu down, yang lain ambil alih. Pengguna tak sedar apa-apa terjadi.

### 1.2 Failover

Failover = proses tukar dari server primary ke server backup. Boleh **automatik** (Cloudflare detect server down dan auto-route ke backup) atau **manual** (sysadmin SSH dan promote replica jadi primary).

**Untuk DuitLater:**
- Web traffic failover = **automatik** (Cloudflare detect ~90s)
- Database write failover = **manual** (Moon run satu command, ~10s)

### 1.3 Active-Passive vs Active-Active

| Mode | Penjelasan | Sesuai bila |
|---|---|---|
| **Active-Passive** | 1 server serve traffic, lain-lain standby (idle). Kalau active down, salah satu standby ambil alih. | Setup ringkas. DB write split mudah. |
| **Active-Active** | Semua server serve traffic concurrently. Load balanced. | Setup kompleks. DB write split kena multi-master atau read-replica + smart routing. |

**DuitLater pakai Active-Passive** — paling sesuai untuk hackathon scope dengan single-primary Postgres.

### 1.4 Postgres Streaming Replication

Mechanism untuk sync data antara Postgres servers:

1. Server primary tulis data → simpan dalam **Write-Ahead Log (WAL)** (binary log file)
2. WAL stream via TCP ke replica servers
3. Replica apply WAL → data muncul di replica DB
4. Replica = read-only (tak boleh terima write)
5. Lag biasa: ~10-100 milliseconds (async mode)

**Async vs Sync mode:**
- **Async** — primary tak tunggu replica acknowledge sebelum commit. Faster writes, tiny risk of data loss kalau primary crash sebelum WAL stream sampai (~last 100ms writes mungkin hilang).
- **Sync** — primary tunggu sekurang-kurangnya 1 replica acknowledge. Slower writes, zero data loss.

**DuitLater pakai async** — untuk hackathon, kelajuan write lagi penting dari guarantee zero loss. Acceptable trade-off.

---

## 2. Topology Penuh

```
                                  ┌──────────────────────────┐
                                  │     Pengguna Browser     │
                                  └────────────┬─────────────┘
                                               │
                                               │ HTTPS https://duitlater.com
                                               ▼
                            ┌──────────────────────────────────────────┐
                            │      Cloudflare Free DNS + WAF           │
                            │  - DNS proxy (orange cloud)              │
                            │  - Multiple proxied A records            │
                            │  - No paid health monitor by default     │
                            │  - Auto SSL (Universal SSL)              │
                            │                                          │
                            │  DNS records:                            │
                            │    duitlater.com → Server 1/2/3          │
                            │    dev.duitlater.com → Server 1/2/3      │
                            │                                          │
                            │  Manual DNS removal if one VPS fails     │
                            └────────────────┬─────────────────────────┘
                                             │
                                             │ HTTPS internal
                                             │ (route ke server priority paling tinggi yang sihat)
                                             │
                ┌────────────────────────────┼────────────────────────────┐
                │                            │                            │
                ▼                            ▼                            ▼
        ┌───────────────┐            ┌───────────────┐            ┌───────────────┐
        │  Server 1     │            │  Server 2     │            │  Server 3     │
        │  (Primary)    │            │  (Replica 1)  │            │  (Replica 2)  │
        │  13.x.x.x     │            │  18.x.x.x     │            │  52.x.x.x     │
        │  ─────────    │            │  ─────────    │            │  ─────────    │
        │  Caddy :443   │            │  Caddy :443   │            │  Caddy :443   │
        │  Frontend     │            │  Frontend     │            │  Frontend     │
        │  Backend      │            │  Backend      │            │  Backend      │
        │  Postgres     │ ──WAL──▶   │  Postgres     │            │  Postgres     │
        │  (PRIMARY)    │ ──WAL──────┼─────────────▶ │  (REPLICA)    │
        │  Uploads      │ ◀─sync────▶│  Uploads      │◀─sync────▶ │  Uploads      │
        └───────┬───────┘            └───────────────┘            └───────────────┘
                │
                │ AI request: HTTPS POST
                ▼
        ┌──────────────────────────────────────────────────────────┐
        │         Alibaba Cloud (ap-southeast-1 KL/SG)              │
        │  ──────────────────────────────────────────────────────  │
        │  Function Compute:                                        │
        │    - penasihat-suggest (wraps Qwen-plus LLM)              │
        │    - nadi-summary     (wraps Qwen-plus LLM)               │
        │  Optional later: OSS backup mirror                         │
        └──────────────────────────────────────────────────────────┘

                         Local VPS storage
                  ┌────────────────────────────────┐
                  │ /var/lib/duitlater/*/uploads   │  ← Syncthing files only
                  │ Postgres WAL replication       │  ← app records
                  └────────────────────────────────┘
```

### 2.1 Komponen Utama

| Komponen | Fungsi | Lokasi |
|---|---|---|
| Cloudflare DNS | Resolve `duitlater.com` ke Cloudflare proxy | Cloud |
| Cloudflare Free DNS | Multiple proxied A records for both domains | Cloud |
| Server 1 (EC2 t3.medium) | Active web stack + Postgres primary | AWS ap-southeast-1 |
| Server 2 (EC2 t3.medium) | Standby web stack + Postgres replica | AWS ap-southeast-1 |
| Server 3 (EC2 t3.medium) | Standby web stack + Postgres replica | AWS ap-southeast-1 |
| Alibaba Function Compute | Penasihat AI · NADI summary AI | Alibaba Cloud |
| Syncthing | Local upload file sync only | Each VPS |
| AWS S3 | Optional later backup storage | AWS |
| Alibaba Cloud OSS | Optional later backup mirror | Alibaba |

### 2.2 Network Flow Examples

**Normal request (semua sihat):**
```
Pengguna → Cloudflare → Server 1 (active) → DB write succeeds → response
```

**Server 1 down:**
```
Pengguna → Cloudflare → Server 2 (took over) → DB read OK · DB write FAILS (read-only)
                                              → 503 returned to user (until manual promote)
```

**Lepas manual promote Server 2:**
```
Pengguna → Cloudflare → Server 2 (now primary) → DB writes work → response
```

---

## 3. Prasyarat

### 3.1 Akaun & Akses

| Yang Moon perlu | Sebab |
|---|---|
| VPS/AWS account dengan permission compute + firewall | Provision 3 server |
| Cloudflare Free account | DNS proxy + multiple A records |
| Alibaba Cloud account dengan permission FC + DashScope | Optional AI workloads |
| Domain (e.g., `duitlater.com`) di Cloudflare | DNS gateway |
| GitHub PAT classic dengan `read:packages` scope | Pull pre-built backend image dari GHCR |
| 1 SSH key pair (.pem file) | Connect ke 3 EC2 |

### 3.2 Tools Tempatan

```bash
# Moon install ni di laptop/workstation:
brew install awscli                    # AWS CLI
brew install cloudflared              # Cloudflare CLI (optional)
pip3 install aliyun-cli               # Alibaba CLI
brew install postgresql@17            # Postgres client (psql, pg_dump)
```

### 3.3 Maklumat yang Moon kena pegang

Sebelum mula, sediakan dalam satu file selamat (e.g., 1Password atau secure notes):

```
=== AWS ===
EC2 Server 1: i-xxxxx · IP 13.x.x.x · SSH key: ~/.ssh/duitlater.pem
EC2 Server 2: i-xxxxx · IP 18.x.x.x · SSH key: ~/.ssh/duitlater.pem
EC2 Server 3: i-xxxxx · IP 52.x.x.x · SSH key: ~/.ssh/duitlater.pem
Region: ap-southeast-1
Upload folders: /var/lib/duitlater/prod/uploads · /var/lib/duitlater/dev/uploads

=== Cloudflare ===
Domain: duitlater.com
Account ID: xxxxxxxxxxxx
Zone ID: xxxxxxxxxxxx
API Token: optional, only if automating DNS edits

=== Alibaba Cloud ===
Account: xxxxx@xxx.com
Access Key ID: LTAI...
Access Key Secret: xxxxx
Region: ap-southeast-1 (or 3 = KL)
DashScope API Key: sk-xxxxx
FC Service: duitlater-fc
OSS Bucket: optional later

=== Postgres ===
Master Password (for replication): generate via `openssl rand -base64 32`
Replication User: replicator
Replication Password: generate via `openssl rand -base64 32`
```

---

## Bahagian A — Setup VPS Side

### A.1 Provision 3 EC2

Ikut **`infra/RELEASE.md` Section 2** untuk setiap server. Ulang 3 kali. **Beza** dari single-server runbook:

| Setting | Server 1 | Server 2 | Server 3 |
|---|---|---|---|
| Name tag | `duitlater-server-1` | `duitlater-server-2` | `duitlater-server-3` |
| AMI | Ubuntu 24.04 LTS | sama | sama |
| Type | t3.medium | t3.medium | t3.medium |
| Storage | 30 GB gp3 | 30 GB gp3 | 30 GB gp3 |
| Security Group | `duitlater-sg` (shared) | sama | sama |
| Key pair | `duitlater.pem` (shared) | sama | sama |
| Elastic IP | EIP-1 | EIP-2 | EIP-3 |

**Security Group (`duitlater-sg`) rules:**
```
Inbound:
  Port 22  (SSH)            from your IP only
  Port 80  (HTTP)           from 0.0.0.0/0  (Cloudflare proxy will hit this)
  Port 443 (HTTPS)          from 0.0.0.0/0  (Cloudflare proxy)
  Port 5432 (Postgres rep)  from same SG (so 3 servers boleh sync antara satu sama lain)

Outbound:
  All allowed (default)
```

**PENTING:** Port 5432 hanya buka antara 3 server (intra-SG). Tak buka ke Internet — Postgres tak boleh expose publicly.

### A.2 Install Docker Stack on Each Server

Untuk setiap server (Server 1, 2, 3), SSH masuk dan jalan:

```bash
# Per `infra/RELEASE.md` Section 3
ssh -i ~/.ssh/duitlater.pem ubuntu@<server-ip>

# Update + install dependencies
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ca-certificates gnupg lsb-release

# Install Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker ubuntu

# Logout + login balik so docker group apply
exit
ssh -i ~/.ssh/duitlater.pem ubuntu@<server-ip>

# Login ke GHCR (untuk pull backend image)
echo "<github-pat>" | docker login ghcr.io -u <github-username> --password-stdin

# Clone repo
cd ~
git clone https://github.com/Zen0space/R2-D2-Finhack.git duitlater
cd duitlater
git checkout main  # atau dev untuk dev stack

# Install pnpm (untuk DB migrations)
curl -fsSL https://get.pnpm.io/install.sh | sh -
export PATH="$HOME/.local/share/pnpm:$PATH"
echo 'export PATH="$HOME/.local/share/pnpm:$PATH"' >> ~/.bashrc

# Pull pre-built backend image
docker pull ghcr.io/zen0space/duitlater-backend:latest
```

### A.3 Setup Postgres Primary (Server 1)

**Server 1 = primary.** Bina volume yang persist + configure WAL streaming.

```bash
# SSH ke Server 1
ssh -i ~/.ssh/duitlater.pem ubuntu@<server-1-ip>
cd ~/duitlater

# Buat .env files
cat > packages/backend/.env.prod <<EOF
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://duitlater:<generate-password>@postgres:5432/duitlater?schema=public
ALIBABA_FUNCTION_COMPUTE_URL=  # akan set lepas Bahagian B
ALIBABA_FUNCTION_COMPUTE_URL_NADI=
ALIBABA_FUNCTION_COMPUTE_KEY=
ANTHROPIC_API_KEY=             # fallback
TNG_API_BASE=https://sandbox.tngwallet.com.my
LOG_LEVEL=info
EOF

cat > infra/.env.prod <<EOF
POSTGRES_USER=duitlater
POSTGRES_PASSWORD=<generate-password>
POSTGRES_DB=duitlater
POSTGRES_PORT=5432
EOF

# Start prod stack pertama kali (untuk inisial DB)
cd infra
docker compose -f docker-compose.prod.yml -p prod up -d postgres
sleep 10  # Beri Postgres masa untuk init

# Run Prisma migration (setup schema)
cd ..
pnpm --filter db install
DATABASE_URL="postgresql://duitlater:<password>@localhost:5432/duitlater?schema=public" \
  pnpm --filter db migrate
```

#### Configure WAL streaming pada Server 1's Postgres

Tukar Postgres config supaya boleh stream WAL ke replicas:

```bash
# Edit Postgres config dalam container
docker exec -it duitlater-prod-postgres bash

# Inside container:
cat >> /var/lib/postgresql/data/postgresql.conf <<EOF

# === Replication settings ===
wal_level = replica
max_wal_senders = 5
wal_keep_size = 1GB
hot_standby = on
synchronous_commit = on  # tukar ke 'off' kalau nak async (faster)
EOF

# Add replication permissions
cat >> /var/lib/postgresql/data/pg_hba.conf <<EOF

# === Replication clients (Server 2 + 3) ===
host  replication  replicator  <server-2-private-ip>/32  md5
host  replication  replicator  <server-3-private-ip>/32  md5
EOF

# Create replication user
psql -U duitlater -d duitlater <<EOF
CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD '<rep-password>';
EOF

exit  # Keluar dari container

# Restart Postgres untuk apply changes
docker restart duitlater-prod-postgres
sleep 10

# Verify replication user
docker exec duitlater-prod-postgres psql -U duitlater -d duitlater \
  -c "SELECT usename, userepl FROM pg_user WHERE usename='replicator';"
```

### A.4 Setup Postgres Replicas (Server 2 + 3)

Buat untuk **Server 2** dan **Server 3** (sama steps).

```bash
# SSH ke Server 2 (atau 3)
ssh -i ~/.ssh/duitlater.pem ubuntu@<server-2-ip>
cd ~/duitlater

# Setup .env files (sama dengan Server 1)
# (copy dari Server 1 dengan scp atau retype)

# Start Postgres container WITHOUT initial data (kita nak base backup dari Server 1)
cd infra
docker compose -f docker-compose.prod.yml -p prod up -d postgres
sleep 5

# Stop Postgres dulu (kena ganti data dengan base backup)
docker stop duitlater-prod-postgres

# Wipe data volume
docker volume rm duitlater_prod_postgres_data 2>/dev/null || true
docker volume create duitlater_prod_postgres_data

# Run pg_basebackup dari Server 1 (primary) — copy semua data + WAL state
docker run --rm \
  -v duitlater_prod_postgres_data:/var/lib/postgresql/data \
  -e PGPASSWORD='<replicator-password>' \
  postgres:17-alpine \
  pg_basebackup -h <server-1-private-ip> -p 5432 -U replicator \
                -D /var/lib/postgresql/data \
                -X stream -P -R

# Note: -R flag auto-create standby.signal + primary_conninfo dalam postgresql.auto.conf
# Bermakna replica auto-detect dirinya sebagai standby, dan stream WAL dari Server 1

# Start Postgres balik (sekarang dalam standby mode)
docker compose -f docker-compose.prod.yml -p prod up -d postgres

# Verify replica is in recovery (read-only) mode
sleep 10
docker exec duitlater-prod-postgres psql -U duitlater -d duitlater \
  -c "SELECT pg_is_in_recovery();"
# Expected: t  (true = recovery mode = replica)
```

Ulang same steps untuk **Server 3**.

### A.5 Verify Replication

Pada **Server 1** (primary), check status:

```bash
ssh -i ~/.ssh/duitlater.pem ubuntu@<server-1-ip>
docker exec duitlater-prod-postgres psql -U duitlater -d duitlater <<EOF
SELECT
  client_addr,
  state,
  sent_lsn,
  write_lsn,
  flush_lsn,
  replay_lsn,
  sync_state
FROM pg_stat_replication;
EOF
```

Expected output: 2 baris (Server 2 + Server 3), `state = streaming`, `sync_state = async`.

**Test write/read:**

```bash
# Pada Server 1 (primary), insert
docker exec duitlater-prod-postgres psql -U duitlater -d duitlater \
  -c "INSERT INTO \"HealthCheck\" (id, message) VALUES ('test-1', 'replication test');"

# Pada Server 2 (replica), check muncul
docker exec duitlater-prod-postgres psql -U duitlater -d duitlater \
  -c "SELECT * FROM \"HealthCheck\" WHERE id='test-1';"
# Expected: 1 row · same data · within ~1 second

# Try write pada Server 2 (kena fail)
docker exec duitlater-prod-postgres psql -U duitlater -d duitlater \
  -c "INSERT INTO \"HealthCheck\" (id, message) VALUES ('fail', 'test');"
# Expected: ERROR: cannot execute INSERT in a read-only transaction
```

Kalau semua ni jalan = replication setup OK.

### A.6 Setup Cloudflare Free DNS Round-Robin

**Step 1: Add domain ke Cloudflare Free**

1. Login ke Cloudflare dashboard.
2. Add Site → `duitlater.com`.
3. Pilih Free plan.
4. Update nameservers dekat registrar.

**Step 2: DNS A records untuk production dan dev**

Dalam Cloudflare → DNS → Records:

```text
Type: A   Name: @     Content: <Server 1 public IP>   Proxy: ON
Type: A   Name: @     Content: <Server 2 public IP>   Proxy: ON
Type: A   Name: @     Content: <Server 3 public IP>   Proxy: ON
Type: A   Name: dev   Content: <Server 1 public IP>   Proxy: ON
Type: A   Name: dev   Content: <Server 2 public IP>   Proxy: ON
Type: A   Name: dev   Content: <Server 3 public IP>   Proxy: ON
```

This gives:

```text
https://duitlater.com      -> any healthy/reachable VPS origin
https://dev.duitlater.com  -> any healthy/reachable VPS origin
```

Cloudflare Free DNS does not provide origin pools, health checks, priority order, or guaranteed failover timing. If a VPS breaks, remove that VPS IP from both DNS hostnames until fixed.

### A.7 Health Endpoints

Backend exposes two health endpoints:

```text
/health          DB-aware readiness
/api/v1/health   app/demo compatibility
```

Verify every VPS directly:

```bash
curl -k https://<server-1-ip>/health
curl -k https://<server-2-ip>/health
curl -k https://<server-3-ip>/health

curl -k https://<server-1-ip>/api/v1/health
curl -k https://<server-2-ip>/api/v1/health
curl -k https://<server-3-ip>/api/v1/health
```

Verify through domains:

```bash
curl https://duitlater.com/health
curl https://duitlater.com/api/v1/health
curl https://dev.duitlater.com/health
curl https://dev.duitlater.com/api/v1/health
```

### A.8 Test Free DNS Failure Handling

**Test 1 — Normal state**

```bash
curl https://duitlater.com/health
curl https://dev.duitlater.com/health
```

**Test 2 — Simulate one app down**

```bash
ssh -i ~/.ssh/duitlater.pem ubuntu@<server-1-ip>
docker stop duitlater-prod-app
```

Then test from outside:

```bash
curl https://duitlater.com/health
```

If requests still hit the stopped server, remove Server 1 IP from Cloudflare DNS temporarily. This is the free-mode trade-off.

**Test 3 — Restore server**

```bash
ssh -i ~/.ssh/duitlater.pem ubuntu@<server-1-ip>
docker start duitlater-prod-app
```

Add the IP back in Cloudflare DNS after `/health` returns OK.

---

## Bahagian B — Setup Alibaba Cloud Side

### B.1 Create Alibaba Cloud Account

1. Sign up di [alibabacloud.com](https://www.alibabacloud.com)
2. Verify identity (Malaysian credit card OK)
3. Get access — boleh ambil masa beberapa jam untuk activation

### B.2 Get DashScope API Key (Qwen)

DashScope = Alibaba's LLM service yang host Qwen models.

1. Login ke Alibaba Cloud Console
2. Search "DashScope" → klik "Model Studio"
3. Sidebar → "API Keys" → Create new
4. Copy key — format: `sk-xxxxxxxxxxxxxxxxxxxxxxxxxx`
5. Simpan secure (akan masuk Function Compute env var nanti)

### B.3 Deploy `penasihat-suggest` Function

**Step 1: Create FC Service**

1. Console → Function Compute → Services → Create
2. Name: `duitlater-fc`
3. Region: `ap-southeast-1` (Singapore) — closest to KL
4. Description: "DuitLater AI workloads — Penasihat suggester + NADI summary"
5. Save

**Step 2: Create Function**

Inside `duitlater-fc` service:

1. Click "Create Function"
2. **Method:** "Use a built-in runtime"
3. Configuration:
   ```
   Function name: penasihat-suggest
   Runtime: Node.js 18
   Memory: 512 MB
   Timeout: 10 seconds
   Triggers: HTTP trigger
       Authentication: anonymous (atau dengan key kalau Moon mahu lock)
       HTTP methods: POST
       Disable web protection: yes (HTTP trigger akan handle)
   ```
4. Code source: "Upload zip"

**Step 3: Prepare zip**

Pada laptop Moon:
```bash
cd /path/to/R2-D2-Finhack/alibaba-function-compute/penasihat-suggest
zip -r penasihat-suggest.zip index.js package.json
ls -la penasihat-suggest.zip  # confirm exists
```

**Step 4: Upload + configure**

Back to Function Compute Console:
1. Click "Upload zip" → pick `penasihat-suggest.zip`
2. Environment variables:
   ```
   DASHSCOPE_API_KEY = sk-xxxxxxxxxxxxxxxxxxxxxxxxxx   (dari B.2)
   NODE_ENV = production
   ```
3. Save

**Step 5: Get HTTP trigger URL**

1. Function detail page → "Triggers" tab
2. Copy "Public URL" — looks like:
   ```
   https://duitlater-fc.fcv3.<region>.fc.aliyuncs.com/2023-03-30/proxy/duitlater-fc/penasihat-suggest/
   ```
3. Save URL — akan masuk ke `.env.prod` di Step B.5

**Step 6: Test the function**

```bash
curl -X POST "<your-fc-url>" \
  -H "Content-Type: application/json" \
  -d '{
    "context": {
      "poolId": "test-1",
      "combinedCapCents": 200000,
      "statedNeed": "Mesin jahit untuk mula tailoring",
      "statedNeedCategory": "EQUIPMENT",
      "kampungName": "Felda Gedangsa",
      "monthOfYear": 4
    },
    "candidates": [
      {"id": "1", "name_bm": "Mesin jahit Brother", "category": "EQUIPMENT", "price_cents": 180000},
      {"id": "2", "name_bm": "Beras 100kg", "category": "GROCERY", "price_cents": 28000},
      {"id": "3", "name_bm": "Generator 2.5kVA", "category": "EQUIPMENT", "price_cents": 120000}
    ]
  }'
```

Expected: JSON response dengan top items dalam BM. Kalau dapat 5xx — check `DASHSCOPE_API_KEY` dah set, dan function logs dalam Cloudflare console.

### B.4 Deploy `nadi-summary` Function

Sama dengan penasihat-suggest, tapi:
- Function name: `nadi-summary`
- Code: take from `alibaba-function-compute/nadi-summary/index.js` (kalau ada · belum ditulis · atau tulis sekarang based on `backend/src/services/nadi-summary.ts`)
- Different HTTP trigger URL

Note: Moon boleh skip ni dulu kalau Phase 5b belum priority. Phase 3 (Penasihat suggester) lagi penting.

### B.5 Configure Backend `.env.prod` on All 3 EC2

SSH ke setiap server, update `packages/backend/.env.prod`:

```bash
ssh -i ~/.ssh/duitlater.pem ubuntu@<server-ip>
cd ~/duitlater
nano packages/backend/.env.prod

# Tambah/ubah:
ALIBABA_FUNCTION_COMPUTE_URL=https://duitlater-fc.fcv3.<region>.fc.aliyuncs.com/2023-03-30/proxy/duitlater-fc/penasihat-suggest/
ALIBABA_FUNCTION_COMPUTE_URL_NADI=https://duitlater-fc.fcv3.<region>.fc.aliyuncs.com/2023-03-30/proxy/duitlater-fc/nadi-summary/
ALIBABA_FUNCTION_COMPUTE_KEY=  # leave empty kalau anonymous trigger
ANTHROPIC_API_KEY=sk-ant-xxxxx  # fallback kalau Alibaba down

# Save
```

Restart backend container untuk apply:
```bash
cd infra
docker compose -f docker-compose.prod.yml -p prod restart app
```

Test integration dari server (or via Cloudflare):
```bash
# Trigger Penasihat suggest endpoint
curl -X POST https://duitlater.com/api/v1/penasihat/suggest \
  -H "Content-Type: application/json" \
  -d '{"poolId": "test-pool"}'

# Backend akan call Alibaba FC, return suggestions
# Check response includes provider="alibaba-qwen"
```

Ulang untuk Server 2 + Server 3. Multi-cloud routing live.

---

## Bahagian C — Local Upload Sync

Tujuan: semua gambar/PDF/resit/agreement disimpan lokal di VPS, kemudian auto-sync ke server lain dengan Syncthing. Ini menggantikan S3/OSS sebagai default upload path.

### C.1 Runtime paths

```text
Prod host path: /var/lib/duitlater/prod/uploads
Dev host path:  /var/lib/duitlater/dev/uploads
Backend path:   /data/uploads
Caddy paths:    /srv/uploads/prod and /srv/uploads/dev
Public path:    /uploads/<yyyy>/<mm>/<dd>/<uuid>.<ext>
```

Compose mounts:

```text
app    read/write host uploads -> /data/uploads
caddy  read-only host uploads  -> /srv/uploads/<env>
```

### C.2 Backend upload API

Endpoint:

```text
POST /api/v1/uploads
multipart field: file
```

Rules:

- Auth required.
- `UPLOAD_DRIVER=local`.
- Max size controlled by `UPLOAD_MAX_MB`.
- MIME allowlist controlled by `UPLOAD_ALLOWED_MIME`.
- Filename is randomized UUID, never raw user filename.
- File is written to temp path first, then atomically renamed.
- Metadata is stored in Postgres `UploadAsset`.

### C.3 Syncthing setup

Start Syncthing once per VPS:

```bash
docker compose --env-file infra/.env -f infra/docker-compose.sync.yml -p sync up -d
```

Open GUI through SSH tunnel only:

```bash
ssh -L 8384:127.0.0.1:8384 ubuntu@<server-ip>
open http://127.0.0.1:8384
```

Create two folders in Syncthing:

```text
Folder ID: duitlater-prod-uploads
Path:      /var/syncthing/prod-uploads

Folder ID: duitlater-dev-uploads
Path:      /var/syncthing/dev-uploads
```

Share both folders between Server 1/2/3. Use send/receive mode. Do not sync deletes automatically until the team is confident with restore behaviour.

### C.4 Local backup without cloud

Keep compressed local dumps on each VPS. These are files, so they may be copied manually or synced later, but they are not the Postgres live data directory.

```bash
mkdir -p /var/lib/duitlater/backups
docker exec duitlater-prod-postgres pg_dump -U duitlater -d duitlater \
  | gzip > /var/lib/duitlater/backups/prod-$(date -u +%Y%m%dT%H%M%SZ).sql.gz
```

Restore drill should use a temporary test Postgres container, not production.

### C.5 Advanced optional cloud backup

AWS S3 and Alibaba OSS can be added later for off-site backup. They are optional, not required for the free VPS mode.

---

## Bahagian D — Failover Playbook

### D.1 Web Failure Handling (Free DNS)

Cloudflare Free DNS round-robin has no paid health monitor or priority routing. If one VPS app fails:

1. Verify the failed node:
   ```bash
   curl -k https://<server-ip>/health
   docker logs duitlater-prod-app --tail 100
   ```
2. Remove that server IP from both DNS records:
   - `duitlater.com`
   - `dev.duitlater.com`
3. Keep traffic on the remaining VPS nodes.
4. After the VPS is fixed and `/health` returns OK, add the IP back.

This is the free-mode trade-off. For automatic health-checked failover later, use optional paid Cloudflare Load Balancing.

### D.2 Database Promotion (Manual)

**Bila perlu:** Server 1 (primary) down + Moon nak Server 2 jadi primary supaya writes work balik.

**Pre-conditions:**
- Server 1 confirmed down (tak respond SSH or shutdown EC2)
- DNS has been moved away from Server 1, or users are reaching Server 2
- Backend pada Server 2 cuba write → fail dengan "read-only transaction" error

**Steps:**

```bash
# 1. SSH to Server 2
ssh -i ~/.ssh/duitlater.pem ubuntu@<server-2-ip>

# 2. Promote Postgres replica to primary
docker exec duitlater-prod-postgres \
  pg_ctl promote -D /var/lib/postgresql/data

# Verify promotion
docker exec duitlater-prod-postgres psql -U duitlater -d duitlater \
  -c "SELECT pg_is_in_recovery();"
# Expected: f  (false = no longer in recovery = is primary)

# 3. Restart backend container untuk reset connection pool
cd ~/duitlater/infra
docker compose -f docker-compose.prod.yml -p prod restart app

# 4. Test write
curl -X POST https://duitlater.com/api/v1/some-write-endpoint \
  -H "Content-Type: application/json" \
  -d '{"test":"after-promotion"}'
# Expected: 200 success (write went to Server 2's promoted DB)
```

**Total time:** ~10 saat command + ~30 saat backend restart. DNS recovery time depends on Cloudflare routing/cache and manual IP removal.

**PENTING:** After promotion, Server 1 (when up balik) **TIDAK BOLEH directly serve traffic dengan data lama dia**. Server 1 mesti re-sync dari Server 2 sebagai replica. See Section D.3.

### D.3 Recovery — Server 1 Up Balik

Selepas Moon dah promote Server 2 jadi primary, kalau Server 1 up balik:

**Problem:** Server 1's Postgres masih ingat dia primary (data lama). Server 2 sekarang primary (data baru). Jangan add Server 1 IP balik ke DNS sebelum DB dia re-synced.

**Solution: Re-sync Server 1 sebagai replica from Server 2.**

```bash
# 1. SSH to Server 1
ssh -i ~/.ssh/duitlater.pem ubuntu@<server-1-ip>

# 2. STOP backend immediately (jangan biar dia serve traffic dengan data lama)
cd ~/duitlater/infra
docker compose -f docker-compose.prod.yml -p prod stop app

# 3. Stop Postgres container
docker stop duitlater-prod-postgres

# 4. Wipe old data volume
docker volume rm duitlater_prod_postgres_data
docker volume create duitlater_prod_postgres_data

# 5. Re-base from Server 2 (sekarang primary baru)
docker run --rm \
  -v duitlater_prod_postgres_data:/var/lib/postgresql/data \
  -e PGPASSWORD='<replicator-password>' \
  postgres:17-alpine \
  pg_basebackup -h <server-2-private-ip> -p 5432 -U replicator \
                -D /var/lib/postgresql/data \
                -X stream -P -R

# 6. Start Postgres balik (sekarang dalam standby mode, replicating dari Server 2)
docker compose -f docker-compose.prod.yml -p prod up -d postgres
sleep 10

# 7. Verify replica state
docker exec duitlater-prod-postgres psql -U duitlater -d duitlater \
  -c "SELECT pg_is_in_recovery();"
# Expected: t (true · is replica)

# 8. Start backend
docker compose -f docker-compose.prod.yml -p prod up -d app
```

Sekarang topology jadi:
- **Server 2 = primary** (yang ambik alih masa Server 1 down)
- **Server 1 = replica** (re-synced from Server 2)
- **Server 3 = replica** (still replicating from old primary lineage; might need re-sync too)

Perhati Server 3 — kalau dia masih replica dari Server 1 (yang dah crash), dia mungkin stuck atau diverge. Re-base Server 3 from Server 2 sama macam Step 4-7 di atas.

Cloudflare priority: traffic balik ke Server 1 (priority 1, healthy). Tapi Server 1's Postgres = replica sekarang, so writes still go through Server 2. Backend connection string pada Server 1 kena point ke Server 2's Postgres untuk writes — atau gunakan a connection pooler like PgBouncer with read/write split.

**Untuk hackathon scope:** simplest, just leave Server 2 sebagai primary sampai event habis. Don't fail back. Kalau Server 1 up balik tapi Server 2 dah amik tempat = leave alone.

### D.4 Failback (Optional · Post-hackathon)

Kalau Moon nak revert kembali (Server 1 jadi primary lagi):

```bash
# 1. Pause writes (announce maintenance window)
# 2. Wait for Server 1 (current replica) to fully catch up dengan Server 2 (primary)
docker exec duitlater-prod-postgres psql -U duitlater -d duitlater \
  -c "SELECT pg_last_wal_receive_lsn() = pg_last_wal_replay_lsn();"
# Expected: t (caught up)

# 3. Stop Server 2's Postgres (current primary)
ssh ubuntu@server-2-ip docker stop duitlater-prod-postgres

# 4. Promote Server 1's Postgres
ssh ubuntu@server-1-ip docker exec duitlater-prod-postgres \
  pg_ctl promote -D /var/lib/postgresql/data

# 5. Re-base Server 2 + Server 3 as replicas from Server 1
# (sama macam D.3 step 4-7)

# 6. Restart backends
# 7. Resume traffic
```

**Recommended:** Don't failback during hackathon. Stable > clean.

---

## Bahagian E — Verification Checklist

Moon tick satu-satu sebelum demo:

### Pre-deploy
- [ ] 3 VPS/server provisioned with static public IPs
- [ ] Firewall allows `22` from Moon/team IPs, `80/443` public, `5432` and `22000` only from peer VPS IPs
- [ ] Cloudflare Free nameservers active for `duitlater.com`
- [ ] `duitlater.com` has 3 proxied A records
- [ ] `dev.duitlater.com` has 3 proxied A records
- [ ] `infra/.env` configured on all 3 VPS
- [ ] Alibaba Cloud/DashScope ready only if AI FC is being enabled

### Stack deploy
- [ ] Docker installed on all 3 VPS
- [ ] GHCR login successful on all 3
- [ ] Backend image `duitlater-backend:latest` pulled on all 3
- [ ] `.env.prod`, `.env.dev`, and frontend env files configured on all 3
- [ ] `docker-compose.sync.yml` running on all 3
- [ ] Postgres container up on Server 1 with WAL streaming config
- [ ] Postgres replication user `replicator` created
- [ ] `pg_hba.conf` allows replication from Server 2 + 3 IPs

### Replication
- [ ] Server 2 ran `pg_basebackup` from Server 1
- [ ] Server 3 ran `pg_basebackup` from Server 1
- [ ] Both replicas in standby mode (`pg_is_in_recovery() = true`)
- [ ] `SELECT * FROM pg_stat_replication` on Server 1 shows 2 active streams
- [ ] Test INSERT on Server 1 visible on Server 2 + 3 within 5 seconds
- [ ] Write attempt on Server 2 returns "read-only transaction" error

### Cloudflare Free DNS
- [ ] DNS resolves `duitlater.com` through Cloudflare proxy
- [ ] DNS resolves `dev.duitlater.com` through Cloudflare proxy
- [ ] `https://duitlater.com/health` returns DB-connected JSON
- [ ] `https://dev.duitlater.com/health` returns DB-connected JSON
- [ ] Manual runbook exists to remove a failed VPS IP from both hostnames

### Multi-cloud (Alibaba)
- [ ] FC service `duitlater-fc` created in ap-southeast-1
- [ ] Function `penasihat-suggest` deployed (Node.js 18 · 512 MB · 10s timeout)
- [ ] HTTP trigger created (POST · anonymous)
- [ ] `DASHSCOPE_API_KEY` set in function env
- [ ] Test curl returns valid suggestions
- [ ] Backend `.env.prod` updated with `ALIBABA_FUNCTION_COMPUTE_URL` on all 3 EC2
- [ ] Backend restart applied
- [ ] `provider="alibaba-qwen"` in response when calling `/api/v1/penasihat/suggest`

### Backup
- [ ] Local `pg_dump` backup tested on Server 1
- [ ] Restore drill completed once in a test container
- [ ] S3/OSS backup documented as optional later, not required for free mode

### Upload sync tests
- [ ] Upload image/PDF via `POST /api/v1/uploads`
- [ ] File appears under prod/dev upload host folder
- [ ] Syncthing syncs file to Server 2 + Server 3
- [ ] `https://duitlater.com/uploads/<file>` loads after sync
- [ ] Syncthing GUI only accessible through SSH tunnel

### Failover tests
- [ ] Test 1 — Stop Server 1 app, remove Server 1 IP from Cloudflare DNS, verify domain still works
- [ ] Test 2 — Restart Server 1 app, verify `/health`, then add IP back
- [ ] Test 3 — DB promotion playbook run end-to-end on Server 2
- [ ] Test 4 — Re-sync Server 1 as replica successful

### Demo readiness
- [ ] `https://duitlater.com/health` returns 200 from any browser
- [ ] `https://duitlater.com/api/v1/health` returns 200 from any browser
- [ ] `https://dev.duitlater.com/health` returns 200 from any browser
- [ ] Pool formation flow works end-to-end
- [ ] Penasihat suggestion API returns BM-first results within 6s
- [ ] Failover playbook printed/saved offline (in case Moon phone tak ada signal)
- [ ] Cloudflare DNS dashboard + VPS terminals ready on Moon's laptop

---

## Advanced Optional — Paid Cloudflare + S3/OSS

Free mode is the default. These upgrades are optional later:

| Upgrade | Why add it later |
|---|---|
| Cloudflare Load Balancing | Health-checked origin pools, failover order, faster automated removal of unhealthy VPS |
| AWS S3 | Off-site Postgres backup and object storage if local VPS disk is not enough |
| Alibaba OSS | Cross-cloud backup mirror after S3 is already stable |

Do not mix these into the free baseline until the core VPS setup passes: app deploy, DB replication, upload sync, and failover drill.

## Bahagian F — Troubleshooting

### F.1 Domain sometimes hits a failed VPS

**Symptom:** `duitlater.com` sometimes fails even though another VPS is healthy.

**Cause:** Cloudflare Free DNS round-robin has no origin health monitor. A failed VPS IP can remain in the DNS set.

**Fix:**
- Remove the bad VPS IP from both `duitlater.com` and `dev.duitlater.com` records.
- Verify the server directly with `curl -k https://<server-ip>/health`.
- Add the IP back only after `/health` and `/api/v1/health` pass.

### F.2 Replica falls behind — data not syncing

**Symptom:** `pg_stat_replication` shows large `lag` value.

**Causes:**
- Network bandwidth between servers saturated
- Replica server CPU bound on apply WAL
- WAL files getting deleted on primary before replica can stream

**Fix:**
- Increase `wal_keep_size` on primary (default 1GB → try 4GB)
- Use replication slots:
  ```sql
  -- On primary
  SELECT pg_create_physical_replication_slot('replica_slot_2');
  
  -- On replica (in postgresql.auto.conf)
  primary_slot_name = 'replica_slot_2'
  ```
- Replication slots prevent primary from deleting WAL until replica has consumed it

### F.3 Promotion fails — replica still in recovery mode

**Symptom:** `pg_ctl promote` runs without error, but `pg_is_in_recovery()` still returns `t`.

**Cause:** Promotion takes a few seconds to complete.

**Fix:** Wait 10-30 seconds, then check again. If still recovery, check Postgres logs:
```bash
docker logs duitlater-prod-postgres --tail 100
```

### F.4 Backend can't connect to Postgres after promotion

**Symptom:** Backend logs "connection refused" after promoting Server 2.

**Cause:** Connection pool still has connections to old primary (Server 1, now down).

**Fix:** Restart backend container:
```bash
cd ~/duitlater/infra
docker compose -f docker-compose.prod.yml -p prod restart app
```

### F.5 Alibaba FC return 5xx or timeout

**Symptom:** Penasihat call returns slow/empty, backend logs show `Alibaba Function Compute failed`.

**Cause possibilities:**
- DashScope API rate limit hit (Qwen rate-limited)
- Alibaba FC region down
- DashScope API key expired

**Fix:**
- Check Alibaba Cloud status page
- Backend auto-falls-back to Anthropic Claude per the routing logic in `services/penasihat.ts`
- Verify Claude API key in `.env.prod`
- Re-test FC endpoint directly with curl

### F.6 Optional OSS mirror fails

**Symptom:** Mirror script log shows AccessDenied or timeout.

**Cause:** Alibaba OSS access key might not have write permission, wrong endpoint region, or optional cloud backup not configured.

**Fix:**
- Re-check `ALIBABA_OSS_ACCESS_KEY` and `ALIBABA_OSS_SECRET` env vars
- Verify OSS bucket policy allows writes from your IAM user
- Try `oss2.Bucket(...).list_objects()` first to test read permission

### F.7 Cloudflare TLS handshake fails

**Symptom:** Cloudflare dashboard shows "Origin not reachable", Caddy logs show TLS errors.

**Cause:** Cloudflare ↔ Caddy SSL not configured.

**Fix:**
- In Cloudflare, set SSL/TLS encryption mode to "Full" or "Full (strict)"
- Caddy auto-generates Let's Encrypt cert on first request
- For "Full (strict)", Caddy must serve a valid CA-signed cert (Let's Encrypt is fine)

---

## Lampiran — Quick Reference

### Common Commands

```bash
# === Per-server health checks ===
curl -k https://13.x.x.x/health
curl -k https://18.x.x.x/health
curl -k https://52.x.x.x/health

# === Cloudflare Free DNS endpoints ===
curl https://duitlater.com/health
curl https://duitlater.com/api/v1/health
curl https://dev.duitlater.com/health

# === Postgres replication status (run on primary) ===
docker exec duitlater-prod-postgres psql -U duitlater -d duitlater \
  -c "SELECT * FROM pg_stat_replication;"

# === Promote replica ke primary ===
docker exec duitlater-prod-postgres pg_ctl promote -D /var/lib/postgresql/data

# === Check is replica? ===
docker exec duitlater-prod-postgres psql -U duitlater -d duitlater \
  -c "SELECT pg_is_in_recovery();"
# t = replica, f = primary

# === Restart backend ===
docker compose -f infra/docker-compose.prod.yml -p prod restart app

# === Local backup manual ===
docker exec duitlater-prod-postgres pg_dump -U duitlater -d duitlater \
  | gzip > /var/lib/duitlater/backups/prod-$(date -u +%Y%m%dT%H%M%SZ).sql.gz

# === Syncthing service ===
docker compose --env-file infra/.env -f infra/docker-compose.sync.yml -p sync ps

# === Test Alibaba FC ===
curl -X POST <fc-url> -H "Content-Type: application/json" -d '{...}'
```

### Ports

| Port | Where | What |
|---|---|---|
| 22 | All VPS | SSH (Moon/team IP only) |
| 80 | All VPS | HTTP (Cloudflare → Caddy) |
| 443 | All VPS | HTTPS (Cloudflare → Caddy) |
| 4000 | Docker network | Backend (not public) |
| 3000 | Docker network | Frontend (not public) |
| 5432 | Peer VPS IPs only | Postgres app connection + replication |
| 22000 | Peer VPS IPs only | Syncthing file sync |
| 8384 | localhost only | Syncthing GUI via SSH tunnel |

### Env Variables (backend `.env.prod`)

```
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://duitlater:<pass>@postgres:5432/duitlater?schema=public
FRONTEND_URL=https://duitlater.com
CORS_ORIGIN=https://duitlater.com
UPLOAD_DRIVER=local
UPLOAD_ROOT=/data/uploads
UPLOAD_PUBLIC_PATH=/uploads
UPLOAD_MAX_MB=10

# Multi-cloud AI
ALIBABA_FUNCTION_COMPUTE_URL=https://<fc>.fcv3.ap-southeast-1.fc.aliyuncs.com/2023-03-30/proxy/duitlater-fc/penasihat-suggest/
ALIBABA_FUNCTION_COMPUTE_URL_NADI=
ALIBABA_FUNCTION_COMPUTE_KEY=
ANTHROPIC_API_KEY=sk-ant-xxxxx

# TNG (sandbox simulated for hackathon)
TNG_API_BASE=https://sandbox.tngwallet.com.my
TNG_CLIENT_ID=
TNG_CLIENT_SECRET=
TNG_WEBHOOK_SECRET=

# Logging
LOG_LEVEL=info
```

### Endpoints

| URL | Purpose |
|---|---|
| `https://duitlater.com/health` | DB-aware readiness |
| `https://duitlater.com/api/v1/health` | App/demo health |
| `https://duitlater.com/api/v1/uploads` | Local upload API |
| `https://duitlater.com/api/v1/penasihat/suggest` | Penasihat AI suggester |
| `https://<fc-url>` | Alibaba FC direct (for testing) |
| `https://dashboard.cloudflare.com/...` | Cloudflare DNS records |

### Useful Logs

```bash
# Backend app
docker logs duitlater-prod-app --tail 100 --follow

# Postgres
docker logs duitlater-prod-postgres --tail 100 --follow

# Caddy
docker logs duitlater-prod-caddy --tail 100 --follow

# System cron
sudo journalctl -u cron --since "1 hour ago"

# Backup script
tail -f /var/log/duitlater-backup.log

# Syncthing
docker logs duitlater-syncthing --tail 100 --follow
```

---

## Penutup

Setup ni mungkin ambik **4-6 jam first time** untuk Moon implement penuh (provision VPS + replication + Cloudflare DNS + Syncthing + Alibaba FC optional). Kalau dah ada experience dengan Postgres replication, lagi cepat (~3 jam).

**Demo strategy untuk hackathon judging:**
1. Show normal flow — pengguna access `duitlater.com`, traffic to Server 1
2. SSH stop app on Server 1 — dramatic moment
3. Remove Server 1 IP from Cloudflare DNS to demonstrate free-mode recovery
4. Show domain works through remaining VPS
5. Show uploaded file already exists on peer VPS via Syncthing
6. Show Postgres replication still working (insert on primary, query replica)
7. Optional: live promote Server 2 to primary for DB failover demo

**Ringkasan strategi multi-cloud orchestration:**

| Layer | Cloud | Component |
|---|---|---|
| DNS + WAF | **Cloudflare Free** | Proxied DNS round-robin for prod + dev |
| Compute (web) | **VPS/EC2** × 3 | Same app stack on each server |
| Database | **Postgres on VPS** | Streaming replication, manual primary promotion |
| AI inference | **Alibaba Cloud Function Compute** | Qwen LLM (BM-native) |
| AI fallback | **Anthropic** Claude | When Alibaba 5xx |
| Upload files | **Local VPS disk** | Syncthing syncs files only |
| Optional backup | **AWS S3 / Alibaba OSS** | Add later after free baseline works |

**Sponsor alignment** = Alibaba AI path remains visible; AWS/S3/OSS can be added later as optional backup path.

Kalau ada bahagian yang tak jelas atau perlu Moon clarify, catatkan dalam team-ledger atau ping di group. Failover playbook printout berguna untuk hari demo — print Bahagian D + Bahagian E sahaja untuk reference cepat.

---

**Authored by:** Prime (AI orchestration)
**Reviewer:** Moon (Backend Lead) · Kairu (PM gate)
**Last updated:** 2026-04-25
**Companion:** [`infra/RELEASE.md`](../../infra/RELEASE.md) (single-EC2 baseline)

*Sendiri tak mampu, ramai-ramai boleh.*
