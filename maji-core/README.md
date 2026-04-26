# maji-core

**Team onboarding + BMAD phase coordinator for Kutu Digitizer.**

maji-core is a portable, file-based team coordinator that lives inside this repo. It gives every team member a consistent entry point when they clone the project, persists their personal context across sessions, and keeps everyone aligned to the current build phase.

---

## What maji-core does

1. **Onboards each team member** with a consistent greeting + role card + current-phase task.
2. **Persists personal memory** per member (session count, current phase, last blocker, personal notes).
3. **Detects BMAD phase** by reading `docs/process/DEVELOPMENT-PLAN.md` Phase Status table.
4. **Enforces phase gates** — a phase cannot advance until the previous phase's testable outcome is verified.
5. **Logs collaboration** — when two members pair, both see it in their next `/maji-whoami`.
6. **Tracks team decisions** via a shared `team-ledger.md`.

No backend. No database. No auth server. Just markdown files + a small JSON per member. Works across any AI-assisted IDE.

---

## Who's on the team (R2-D2)

| Codename | Archetype | Domain |
|---|---|---|
| Ijam | Narrative Spine | Business pitch · stage voice · stakeholder framing |
| Moon | Foundation-Keeper | Backend · schema · auth · webhooks |
| Akmal | Surface-Weaver | Frontend · UI · interaction · forms |
| Kairu | Ladder-Keeper | Product · phase gates · scope discipline |
| MatNep | Orthodox Eye | Design · brand · typography · accessibility |

Full role cards live in [heroes/](./heroes/).

---

## Slash commands

| Command | Writes? | Commits? | Purpose |
|---|---|---|---|
| `/maji-onboard` | personal memory | manual | First-run intake · ask name · show role card + current phase task |
| `/maji-whoami` | personal memory (lastSession) | manual | Quick identity check · current phase task · outstanding blockers |
| `/maji-phase` | — (read-only) | — | Cross-team BMAD phase status |
| `/maji-gate` | DEV-PLAN + ledger + memory | manual | Kairu's ladder check before advancing a phase |
| `/maji-pair` | both members + ledger | manual | Log a pairing collaboration between two members |
| `/maji-handoff` | personal memory + (conditional) ledger | manual | End-of-session save |

Each command's full behavior spec is in [commands/](./commands/).

---

## Slash command mechanism by IDE

Different IDEs handle slash commands differently. **All four work** — but the user experience differs.

| IDE | How `/maji-*` is invoked | Notes |
|---|---|---|
| **Claude Code** | Native autocomplete from `.claude/commands/maji-*.md` | True slash commands. Type `/`, see suggestions, press Tab. |
| **Cursor** | Chat-invoked. `.cursor/rules/maji-core.mdc` is auto-loaded as agent rules. | Type `/maji-onboard` in chat. Cursor's AI reads the rule + executes the flow. No autocomplete dropdown. |
| **Codex** (OpenAI) | Chat-invoked via `AGENTS.md` at repo root. | Type `/maji-onboard` in chat. Codex reads AGENTS.md + follows the flow. |
| **Generic AI chat** (claude.ai, chatgpt.com, gemini, etc.) | Manual. User types `/maji-onboard`, AI reads `AGENTS.md` (if it has file access) or asks user to paste the command file content. | Some chat tools have no file-write — personal memory has to be pasted out + saved manually. Degraded but workable. |

**Bottom line:** in all IDEs, just type `/maji-onboard` (or any other `/maji-*` command) and the AI handles the rest. The autocomplete UX differs but the behavior is identical.

---

## How to use (first-time)

1. Clone the repo.
2. Open the repo in your IDE of choice (Claude Code, Cursor, Codex, or any AI chat).
3. Type `/maji-onboard` and follow the prompts.

If your tool does not support slash commands natively, read [AGENTS.md](../docs/team/AGENTS.md) at repo root — it instructs any AI to recognize `/maji-*` commands by reading this folder.

---

## Directory layout

```
maji-core/
├── README.md                   # this file
├── protocols/                  # methodology references
│   ├── onboarding.md           # the intake flow spec
│   ├── bmad.md                 # 7-phase method · phase detection rules
│   ├── akal.md                 # 4-pillar coding discipline
│   ├── jimat.md                # token economy · compression modes
│   └── phase-gate.md           # ladder rules for phase advancement
├── heroes/                     # role cards — one per team member
│   ├── ijam.md
│   ├── moon.md
│   ├── akmal.md
│   ├── kairu.md
│   └── matnep.md
├── commands/                   # slash command prompt templates (source of truth)
│   ├── onboard.md
│   ├── whoami.md
│   ├── phase.md
│   ├── gate.md
│   ├── pair.md
│   └── handoff.md
└── memory/
    ├── team-ledger.md          # shared decisions · blockers · phase closures
    └── members/                # <codename>.json per member · committed · team sees on pull
```

## Policy — personal memory is SHARED

All files in `memory/members/*.json` are **committed to git**. When a team member updates their memory (via any slash command that writes), they are expected to `git add` + `git commit` that JSON alongside any other work, so the next `git pull` gives the rest of the team the updated state.

This means `/maji-phase` and `/maji-whoami` can show **everyone's** current phase, active pair, and last blocker after a pull — no separate status board needed.

Trade-off: personal notes are visible to the whole team. The team is five people — acceptable transparency for a 48-hour sprint.

---

## License

Part of Kutu Digitizer. Same license as parent project.
