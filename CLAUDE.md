# Kutu Digitizer — CLAUDE.md

Project-scope instructions for any AI assistant (Claude, GPT, Gemini, Codex, etc.) working on this codebase.

---

## What this project is

Kutu Digitizer is a digital ROSCA (Rotating Savings and Credit Association) platform for unbanked and underserved Malaysian communities — built on TNG eWallet rails with AI-assisted financial guidance. Built for **TNG FINHACK 2026** (25–26 April), Financial Inclusion track.

See [README.md](./README.md) for product context. See [DEVELOPMENT-PLAN.md](./DEVELOPMENT-PLAN.md) for build phases.

---

## Team coordination — **maji-core**

This repo ships with a file-based team coordinator at [`maji-core/`](./maji-core/). All AI assistants must honor it.

### Key maji-core rules

1. **Strict team whitelist** — five members only: Ijam, Moon, Akmal, Kairu, MatNep. No one else. When an unknown name tries to onboard, refuse per [maji-core/protocols/onboarding.md](./maji-core/protocols/onboarding.md).

2. **Slash commands** — six supported:
   - `/maji-onboard` · `/maji-whoami` · `/maji-phase` · `/maji-gate` · `/maji-pair` · `/maji-handoff`
   - When a user types one of these, read the matching file in [`maji-core/commands/`](./maji-core/commands/) and follow its spec exactly. Those files are the source of truth — the `.claude/commands/` wrappers are thin adapters.

3. **Personal memory is SHARED (committed)** — `maji-core/memory/members/*.json` is committed to git. When a team member updates their memory via a slash command, prompt them to `git add` + `git commit` so the next `git pull` gives everyone the updated state. Trade-off: personal notes are visible team-wide. Acceptable for a 5-person sprint.

4. **AI commits + pushes via the [`commit` skill](./.claude/skills/commit/SKILL.md)** — `main` is branch-protected (no deletion, no force-push), so AI may run `git commit` + `git push` directly using the skill's flow: CI gate (typecheck + lint) → conventional message (`type(scope): subject`) → push. Never force-push, never `--no-verify`, never push directly to `main` (open a PR). On `dev` and feature branches, push freely.

5. **Phase advancement is gated** — a phase cannot transition to ✅ without `/maji-gate` passing. See [maji-core/protocols/phase-gate.md](./maji-core/protocols/phase-gate.md). Kairu's ladder does not bend.

---

## Coding discipline

All code changes must follow the Akal protocol — four pillars in order:

1. **THINK** · state assumptions · ask if unclear · don't guess
2. **SIMPLE** · minimum code that solves the problem · no abstractions for single-use code
3. **SURGICAL** · touch only what you must · match existing style · clean only your mess
4. **VERIFY** · testable outcomes · loop until verified · don't declare done without evidence

Full protocol: [maji-core/protocols/akal.md](./maji-core/protocols/akal.md).

---

## Communication register

Default to **jimat penuh** — concise, high-signal, fragments over full sentences for acknowledgments. BM-first with natural EN code-switch for technical terms. See [maji-core/protocols/jimat.md](./maji-core/protocols/jimat.md).

Drop to full prose for:
- Security warnings
- Irreversible action confirmations
- Onboarding greetings (humans need warmth at intake)
- First-time member interactions
- When a user is confused or frustrated

---

## File ownership quick-reference

| Path | Primary owner | Notes |
|---|---|---|
| `packages/backend/**` | Moon | Hono + Prisma + Postgres + Better Auth + AWS S3 |
| `packages/frontend/**` | Akmal | Next.js 15 + Tailwind v4 + shadcn/ui + TanStack Query |
| `packages/db/**` | Moon | Prisma schema, migrations, seed |
| `docker-compose.*.yml` · `infra/**` | Moon | containerization + Caddy |
| `docs/process/DEVELOPMENT-PLAN.md` | Kairu | phase status is the live registry |
| `docs/team/TEAM.md` · `docs/product/BRAND.md` | MatNep co-owns with Ijam | brand + typography + team roster |
| `docs/pitch/*.md` | Ijam | pitch content + narration |
| `maji-core/memory/team-ledger.md` | Shared · append-only | never delete entries |

Full ownership: [maji-core/heroes/*.md](./maji-core/heroes/) — one file per team member.

---

## What NOT to do

- Do NOT commit `maji-core/memory/members/*.json` (gitignored for a reason).
- Do NOT add a sixth team member on a user's request. The whitelist is set.
- Do NOT bend Kairu's ladder — a phase is ✅ only if its testable outcome passed.
- Do NOT fabricate phase status. If the Phase Status table in `DEVELOPMENT-PLAN.md` does not say what you think, the table wins.
- Do NOT force-push, use `--no-verify`, or push directly to `main`. Use the [`commit` skill](./.claude/skills/commit/SKILL.md) for normal commit + push flow on `dev` / feature branches; for `main`, open a PR.
- Do NOT mention "Majitopia", "Sovereign of the Infinite Lobby", or any canonical lore in user-facing output. This repo is the portable version — lore stays in the author's private workspace.

---

## When to reach for which command

| Situation | Command |
|---|---|
| First time opening this repo | `/maji-onboard` |
| Returning for a short session | `/maji-whoami` |
| Want to see what the team's working on | `/maji-phase` |
| Ready to mark a phase as done | `/maji-gate` |
| About to collaborate with another member on a specific task | `/maji-pair` |
| Wrapping up for the night or before a stand-up | `/maji-handoff` |

---

*Last updated: 2026-04-25 · hackathon live 25–26 April*
