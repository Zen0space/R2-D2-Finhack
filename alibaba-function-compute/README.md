# Alibaba Cloud Function Compute · DuitLater AI workloads

This folder contains the deployable Function Compute artifacts that host DuitLater's AI workloads on Alibaba Cloud, separate from the AWS-hosted main backend.

## Why multi-cloud

| Cloud | Role | Why |
|---|---|---|
| **AWS** (`Ijam18/duitlater` main app) | Compute · Postgres · object storage | Primary backend, sponsor-aligned (Gold) |
| **Alibaba Cloud** (this folder) | AI workloads (Penasihat suggest · NADI summary) | Qwen LLM is BM-native · sponsor-aligned (Platinum) · data sovereignty narrative |

The split is deliberate:
- **B40 user financial context stays in regional sovereign cloud** (Alibaba Cloud)
- **AI inference cost optimised** (Qwen pricing for small structured-output is favourable)
- **BM-native LLM** (Qwen handles Bahasa Melayu reasoning more accurately than English-first models)
- **Failover preserved** — backend falls back to the deterministic heuristic ranker if Alibaba FC is unreachable

## Functions

| Folder | Purpose | Backend env var |
|---|---|---|
| [`penasihat-suggest/`](./penasihat-suggest/) | Top-5 catalogue item ranker per pool context | `ALIBABA_FUNCTION_COMPUTE_URL` |
| `nadi-summary/` (planned · same pattern) | Weekly digest for NADI staff dashboard | `ALIBABA_FUNCTION_COMPUTE_URL_NADI` |

## Deploy a function

```bash
cd penasihat-suggest

# 1. Create the FC service via Alibaba Cloud console:
#    Console → Function Compute → Service → Create
#    Name: duitlater-penasihat
#    Runtime: nodejs18

# 2. Create function under the service:
#    Trigger type: HTTP
#    Method: POST
#    Memory: 512 MB
#    Timeout: 10s

# 3. Set environment variables:
#    DASHSCOPE_API_KEY=<your Qwen / DashScope API key>

# 4. Upload code (zip this folder · upload via console)
zip -r penasihat-suggest.zip index.js package.json
# or use Alibaba's `fun` CLI: fun deploy

# 5. Get the HTTP trigger URL · paste into backend .env:
#    ALIBABA_FUNCTION_COMPUTE_URL=https://<your-fc-trigger>.alibabacloudapi.com/
```

## Local invocation (dev)

```bash
# In one terminal — start the FC locally with `fun local invoke`
fun local invoke duitlater-penasihat/penasihat-suggest

# In another — backend dev with the local FC URL
ALIBABA_FUNCTION_COMPUTE_URL=http://localhost:8000/2016-08-15/proxy/duitlater-penasihat/penasihat-suggest \
  npm run dev
```

If `ALIBABA_FUNCTION_COMPUTE_URL` is unset, the backend falls back to the local deterministic heuristic ranker.

## Multi-cloud architecture

```
┌──────────────────────┐                    ┌──────────────────────────┐
│  AWS (ap-southeast-1)│                    │ Alibaba Cloud            │
│                      │                    │ (ap-southeast-1 KL/SG)   │
│  EC2 t3.medium       │  HTTPS             │                          │
│  ├── Caddy           │  POST /suggest     │  Function Compute        │
│  ├── Frontend (Next) │ ─────────────────> │  ├── penasihat-suggest   │
│  ├── Backend (Hono)  │                    │  │   └── Qwen-plus       │
│  └── Postgres        │ <───────────────── │  └── nadi-summary        │
│                      │  JSON 5 items      │      └── Qwen-plus       │
│  S3 (assets)         │                    │                          │
└──────────────────────┘                    │  OSS (catalogue mirror)  │
                                            └──────────────────────────┘
```

## Sponsor alignment

- **Alibaba Cloud — Platinum sponsor** of TNG FINHACK 2026
- **AWS — Gold sponsor**
- Multi-cloud usage criterion explicitly judged at preliminary + grand final
- Both sponsors get visible architecture presence

## Notes

- The `penasihat-suggest` function is a thin wrapper around DashScope's Qwen API. No DuitLater business logic lives in Alibaba Cloud — only the AI inference call. This keeps regulatory + ops surface minimal.
- Qwen request/response shape is mirrored by the backend heuristic path; keep `backend/src/services/penasihat.ts` as the canonical wire contract.
