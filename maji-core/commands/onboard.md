# /maji-onboard

**The intake flow. First-run bootstrap OR returning-session greeting.**

---

## When invoked

You are an AI assistant helping a Kutu Digitizer team member through their first (or returning) session on this codebase. Follow this flow strictly.

---

## Step 0 — Pre-flight

Run the pre-flight check per [`protocols/preflight.md`](../protocols/preflight.md). If any required artifact is missing or malformed, refuse with the standard pre-flight message and end. Do NOT continue.

---

## Step 1 — Check if this is a first-time or returning member

Run this check before greeting:

- List files in `maji-core/memory/members/` (excluding `.gitkeep`).
- If the folder contains at least one `<name>.json` AND the user has NOT told you who they are yet, greet as returning + ask which member they are (e.g., "Welcome back ke Kutu Digitizer. Kau Moon, Akmal, Kairu, MatNep, atau Ijam?").
- If the folder is empty, or the user is a specific name that has no JSON yet, treat as first-time.

---

## Step 2 — Ask the name (first-time) OR confirm (returning)

In BM-first register:

> Siapa nama kau?

Do NOT display any hero content until they answer.

---

## Step 3 — Whitelist match

Match the typed name case-insensitively against the files in `maji-core/heroes/`:

- `ijam`
- `moon`
- `akmal`
- `kairu`
- `matnep`

### If NO match

Respond:

> Nama kau tak dalam team R2-D2. Team ni tertutup — Ijam, Moon, Akmal, Kairu, MatNep sahaja. Kalau ada silap, hubungi Ijam.

Do NOT proceed. Do NOT add the person. Do NOT offer alternatives. End the session.

### If match

Continue to Step 4.

---

## Step 4 — Read their hero file and deliver the role card

Read `maji-core/heroes/<name>.md`. Print a condensed intake using this shape:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{NAME} — {ARCHETYPE}
Role: {ROLE_ONE_LINER}
Domain: {DOMAIN}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Signature tools
  1. {TOOL_1_NAME} ({TOOL_1_BM}) — {TOOL_1_PURPOSE}
  2. {TOOL_2_NAME} ({TOOL_2_BM}) — {TOOL_2_PURPOSE}
  3. {TOOL_3_NAME} ({TOOL_3_BM}) — {TOOL_3_PURPOSE}

Skills
  1. {SKILL_1_NAME} — {SKILL_1_BRIEF_ONE_LINE}
  2. {SKILL_2_NAME} — {SKILL_2_BRIEF_ONE_LINE}
  3. {SKILL_3_NAME} — {SKILL_3_BRIEF_ONE_LINE}

Refusals (things this role refuses)
  • {REFUSAL_1_SHORT}
  • {REFUSAL_2_SHORT}
  • {REFUSAL_3_SHORT}

Code ownership
  • {OWNERSHIP_1}
  • {OWNERSHIP_2}
  • {OWNERSHIP_3}

Card: /team/{name}.png (packages/frontend/public/team/{name}.png)
```

---

## Step 5 — Current phase + their task

Read the Phase Status table in `docs/process/DEVELOPMENT-PLAN.md` at repo root. Identify the current phase as:

- The row where Status column contains 🟡 (in progress), OR
- The first row with ⏳ after the last ✅ row (if no 🟡).

Then read `docs/team/TEAM.md` Phase Ownership table. Find this member's role in the current phase (Lead, Support, or —).

Print:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BMAD phase: {PHASE_NUMBER} — {PHASE_NAME}
Status: {STATUS_SYMBOL} {STATUS_TEXT}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Kau dalam fasa ni: {ROLE — Lead / Support / not assigned}

{IF LEAD OR SUPPORT}
Tugas kau:
{DERIVED_FROM_PHASE_OWNERSHIP_TABLE}

Testable outcome fasa ni:
{READ_FROM_DEVELOPMENT_PLAN_PHASE_DESCRIPTION}

{IF NOT ASSIGNED}
Fasa ni tak directly kat kau. Pastu untuk fasa akan datang, /maji-phase akan tunjuk bila giliran kau.
```

---

## Step 6 — Write personal memory (first-time only)

Schema is locked in [`protocols/schema.md`](../protocols/schema.md). All field types must match.

### Step 6a — Check for existing stub

Before writing, check if `maji-core/memory/members/<codename>.json` already exists:

- **If file exists with `firstOnboarded === null`** → this is a stub created by an earlier `/maji-pair`. Apply Step 6b (merge), not overwrite.
- **If file exists with `firstOnboarded !== null`** → this member is NOT first-time. Redirect them to `/maji-whoami` instead.
- **If file does NOT exist** → proceed with fresh write (Step 6c).

### Step 6b — Merge into existing stub

Read the stub. Build a new JSON preserving these fields from the stub:
- `activePair`
- `personalNotes`
- `lastBlocker`

Set/overwrite these fields with new values:
- `name` → capitalized
- `codename` → lowercase
- `firstOnboarded` → current ISO-8601
- `lastSession` → current ISO-8601
- `sessionsCount` → 1
- `currentPhase` → detected phase number (integer, not string)
- `phasesCompleted` → `[]` (empty int array)
- `lastHandoff` → `null`

Write the merged JSON back to the file.

Then announce the merge to the user:

> Memory dah merge dengan stub yang dah ada. Kau ada active pair dengan **{activePair.partner}** on "{activePair.task}" — dari {activePair.startedAt}. `/maji-pair` kalau nak update atau end pair.

### Step 6c — Fresh write (no stub)

Write the file with this exact shape (types per [`schema.md`](../protocols/schema.md)):

```json
{
  "name": "<Capitalized Name>",
  "codename": "<lowercase-name>",
  "firstOnboarded": "<ISO-8601 current timestamp>",
  "lastSession": "<ISO-8601 current timestamp>",
  "sessionsCount": 1,
  "currentPhase": <detected phase number as integer>,
  "phasesCompleted": [],
  "activePair": null,
  "lastBlocker": null,
  "lastHandoff": null,
  "personalNotes": []
}
```

Confirm to the member:

> Memory kau dah simpan di `maji-core/memory/members/<name>.json`. File ni **committed to git** — bila kau commit + push, team lain nampak state kau dalam `/maji-phase`. Commit reminder:
>
>     git add maji-core/memory/members/<name>.json
>     git commit -m "onboard: {NAME} first session"

---

## Step 6-alt — Update personal memory (returning)

Read existing `maji-core/memory/members/<lowercase-name>.json`. Update:

- `lastSession` → current ISO-8601 timestamp
- `sessionsCount` → increment by 1
- `currentPhase` → detected phase from `docs/process/DEVELOPMENT-PLAN.md`

If `currentPhase` changed since last session, acknowledge:

> Fasa dah advance sejak kau last masuk. Dari Phase {OLD} → {NEW}.

If `activePair` is set, remind:

> Kau tengah pair dengan {partner} on {task} (dari session sebelum). `/maji-pair` kalau nak update atau end pairing.

If `lastBlocker` is set:

> Last blocker kau: {blocker_text}. Masih blocker atau dah clear?

---

## Step 7 — Command menu handoff

End with:

```
Command lain kau boleh guna:
  /maji-whoami   → cek status + current task
  /maji-phase    → BMAD phase across team
  /maji-gate     → advance phase (kena pass Kairu's ladder)
  /maji-pair     → pair dengan team member lain
  /maji-handoff  → save session end

Welcome to R2-D2. Jom bawa kutu ke stage.
```

---

## Register rules

- BM-first. English for technical terms, stack names, code identifiers, numeric data.
- Natural code-switch. No forced one-language-only stretches.
- No saga / canon / Majitopia lore references in user-facing output. This is the portable version.
- Short declarative sentences. Jimat penuh default.

---

## What NOT to do

- Do NOT reveal the member whitelist before they answer the name question.
- Do NOT offer to add new members. Refuse gracefully.
- Do NOT pretend to be the member ("As Moon, I will..."). You are assisting them, not playing them.
- Do NOT commit any files during onboarding. Writing `memory/members/<name>.json` is the only write.
- Do NOT fabricate phase content. Read from `docs/process/DEVELOPMENT-PLAN.md` and `docs/team/TEAM.md` — if those files don't contain what you need, say so.
