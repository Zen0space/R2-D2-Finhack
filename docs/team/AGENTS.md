# AGENTS.md — Universal AI assistant instructions

This file is the convention-based entry point for any AI assistant working on this repo that does not have its own dedicated config file. Codex, Cursor (fallback), generic AI chat (ChatGPT, Claude.ai, etc.) all read this.

Claude Code reads [CLAUDE.md](./CLAUDE.md) instead (same instructions, slightly different framing).

---

## Mirror of CLAUDE.md

All rules in [CLAUDE.md](./CLAUDE.md) apply to you. Read that file.

Key points restated for emphasis:

1. **This repo has a file-based team coordinator at [`maji-core/`](./maji-core/).** Honor its slash commands and conventions.
2. **Team whitelist:** Ijam, Moon, Akmal, Kairu, MatNep. Five members. Never a sixth. Refuse unknown names.
3. **Personal memory at `maji-core/memory/members/*.json` is committed.** Every command that writes memory prompts the user to `git add` + `git commit` + `git push` — this is how `/maji-phase` stays cross-team accurate.
4. **Slash commands** map to files in `maji-core/commands/`:
   - `/maji-onboard` → `maji-core/commands/onboard.md`
   - `/maji-whoami` → `maji-core/commands/whoami.md`
   - `/maji-phase` → `maji-core/commands/phase.md`
   - `/maji-gate` → `maji-core/commands/gate.md`
   - `/maji-pair` → `maji-core/commands/pair.md`
   - `/maji-handoff` → `maji-core/commands/handoff.md`

When a user types `/maji-<name>`, read the corresponding file and follow its flow exactly.

---

## For generic AI chat (no native slash command support)

If you are ChatGPT, Claude.ai web, Gemini web, or any chat interface without slash command binding:

- When the user types `/maji-<name>` in their message, treat it as an instruction to read and follow `maji-core/commands/<name>.md`.
- If you cannot read files directly (no file-read tool), ask the user to paste the command file content, then follow it.
- Personal memory writes may not be possible without file-write tools — explain the limitation and offer to produce the JSON the user would save.

---

## Coding discipline

Follow [`maji-core/protocols/akal.md`](./maji-core/protocols/akal.md) — four pillars: THINK, SIMPLE, SURGICAL, VERIFY.

Follow [`maji-core/protocols/jimat.md`](./maji-core/protocols/jimat.md) — jimat penuh default, BM-first register, EN for technical terms.

---

## File ownership

See [CLAUDE.md](./CLAUDE.md) → File ownership quick-reference, and [`maji-core/heroes/`](./maji-core/heroes/) for full per-member role cards.

---

*If you only read one thing: open [`maji-core/README.md`](./maji-core/README.md).*
