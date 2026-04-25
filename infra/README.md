# Infra — Kutu Digitizer Deployment

**Docker · Caddy · EC2 · AWS S3 · Elastic IP**

---

## Files (to create Saturday)

```
infra/
├── docker-compose.dev.yml       # Postgres only · for laptops
├── docker-compose.prod.yml      # Caddy + frontend + app + postgres · for EC2
├── Caddyfile                    # reverse proxy + SSL config
├── secrets/
│   └── pg_password.txt          # gitignored, EC2 only
├── ec2/
│   ├── launch-instance.sh       # AWS CLI launch helper
│   ├── security-group.json      # SG rules (22 team-IPs · 80 · 443)
│   └── user-data.sh             # cloud-init: install Docker
└── deploy.sh                    # one-shot: ssh + git pull + compose up + migrate
```

---

## EC2 Spec

| Item | Value |
|---|---|
| Instance type | t3.medium (2 vCPU · 4 GB RAM) |
| AMI | Ubuntu 24.04 LTS · `ami-0d3e5ee74e79c8ca7` (ap-southeast-1) |
| Storage | gp3 EBS · 30 GB |
| Region | ap-southeast-1 (Singapore) |
| Elastic IP | required for stable address |

## Security Group Inbound

| Port | Source | Purpose |
|---|---|---|
| 22 | Team IPs only | SSH |
| 80 | 0.0.0.0/0 | HTTP (auto-redirects to 443) |
| 443 | 0.0.0.0/0 | HTTPS |

## DNS

```
kutu.yourdomain.com   A   <ELASTIC_IP>
```

## Deploy Sequence (first time)

```bash
ssh ubuntu@<ELASTIC_IP>
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER && newgrp docker

git clone <repo-url> kutu && cd kutu/infra
mkdir -p secrets
openssl rand -base64 32 > secrets/pg_password.txt
chmod 600 secrets/pg_password.txt

cp ../backend/.env.example ../backend/.env.prod
nano ../backend/.env.prod     # fill all values

docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec app npm run db:migrate
```

## Deploy Sequence (subsequent)

```bash
git pull && \
docker compose -f docker-compose.prod.yml up -d --build && \
docker compose -f docker-compose.prod.yml exec app npm run db:migrate
```

## Owner

Mung (primary) · Ijam (sponsor credit redemption)
