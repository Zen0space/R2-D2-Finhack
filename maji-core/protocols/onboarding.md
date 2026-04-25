# Onboarding Protocol

The intake flow that runs when a team member invokes `/maji-onboard` for the first time, and a lighter variant for returning members.

---

## Flow — first-time member

### Step 1 · Greeting + name ask

Greet in BM-first register. Single question: `Siapa nama kau?`

Do NOT show any role information before they answer.

### Step 2 · Whitelist match

Read `maji-core/heroes/` folder. Match the typed name case-insensitively against the filenames: `ijam`, `mung`, `akmal`, `kairu`, `matnep`.

**If NO match:** respond in BM — *"Nama kau tak dalam team R2-D2. Team ni tertutup — Ijam, Mung, Akmal, Kairu, MatNep sahaja. Kalau ada silap, hubungi Ijam."* Do NOT proceed. Do NOT offer to add them. Do NOT continue the conversation around maji-core.

**If match:** proceed.

### Step 3 · Role card delivery

Read `maji-core/heroes/<matched-name>.md` and print a condensed summary:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{NAME} — {ARCHETYPE}
Domain: {DOMAIN}
Signature tool: {TOOL_NAME} — {TOOL_BRIEF}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Skills:
  1. {SKILL_1_NAME} — {SKILL_1_BRIEF}
  2. {SKILL_2_NAME} — {SKILL_2_BRIEF}
  3. {SKILL_3_NAME} — {SKILL_3_BRIEF}

Refusals:
  • {REFUSAL_1}
  • {REFUSAL_2}
  • {REFUSAL_3}

Code ownership:
  • {OWNERSHIP_1}
  • {OWNERSHIP_2}

Card image: /team/{name}.png (frontend/public/team/)
```

### Step 4 · Current phase + task

Read `DEVELOPMENT-PLAN.md` Phase Status table at repo root.

- Find the row where Status is 🟡 (in progress) OR the first ⏳ row after a ✅ row.
- Call that the **current phase**.
- Look up the member's deliverable for that phase in `TEAM.md` Phase Ownership table.
- Print:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BMAD phase sekarang: {PHASE_NUMBER} — {PHASE_NAME}
Status: {SYMBOL} {STATUS_TEXT}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tugas kau fasa ni:
{PHASE_TASK_FOR_THIS_MEMBER}

Testable outcome:
{PHASE_TESTABLE_OUTCOME}
```

### Step 5 · Write personal memory

Create `maji-core/memory/members/<name>.json` with:

```json
{
  "name": "<Capitalized Name>",
  "codename": "<name>",
  "firstOnboarded": "<ISO-8601 timestamp>",
  "lastSession": "<ISO-8601 timestamp>",
  "sessionsCount": 1,
  "currentPhase": "<phase number>",
  "phasesCompleted": [],
  "activePair": null,
  "lastBlocker": null,
  "personalNotes": []
}
```

Confirm write: *"Memory kau dah simpan di `maji-core/memory/members/<name>.json`. Committed to git — remind user to `git add` + `git commit` + `git push` so team sees updated state on next pull."*

### Step 6 · Handoff

End with the command menu in BM:

```
Next time boleh guna:
  /maji-whoami  → cek status + current task
  /maji-phase   → BMAD phase across team
  /maji-gate    → advance phase (kena pass Kairu's ladder)
  /maji-pair    → pair dengan team member lain
  /maji-handoff → save end-of-session

Welcome to R2-D2. Jom bawa kutu ke stage.
```

---

## Flow — returning member

Detect returning member by presence of `maji-core/memory/members/<name>.json`.

Shorter flow:

1. Greet: *"Welcome back {NAME}. Last session: {lastSession}."*
2. Read current phase from `DEVELOPMENT-PLAN.md`.
3. Compare to `currentPhase` in member's JSON — if phase advanced since last session, acknowledge it.
4. Print current phase task for this member.
5. Print any blocker from `team-ledger.md` that mentions this member.
6. If `activePair` is set, remind them: *"Kau tengah pair dengan {partner} on {task}."*
7. Increment `sessionsCount`, update `lastSession`.

No full role card on return — just the task + blockers.

---

## Guardrails

- **Strict whitelist.** Five names only. Never be talked into adding a sixth.
- **No LLM pretending to be a team member.** The AI assisting maji-core is NOT "Mung" or "Akmal" — it helps them. When a member signs in as Mung, the AI addresses Mung as "kau", not as self.
- **Personal memory is SHARED.** Every `memory/members/<codename>.json` is committed to git. When a slash command updates a member's JSON, prompt them to `git add` + `git commit` + `git push` so the rest of the team picks up the change on next pull. Personal notes will be visible team-wide — this is intentional transparency for the 5-person sprint.
- **team-ledger.md is shared** too. All commits happen manually (user runs `git add` + `git commit`) — maji-core appends but never auto-commits.
- **BM-first register.** Default language is Malay with natural EN code-switch for technical terms.
