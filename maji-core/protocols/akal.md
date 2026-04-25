# Akal Protocol — Coding Discipline

**Four pillars. In order. Before writing any code, making structural decisions, or proposing changes.**

This protocol applies to every team member and every AI assistant working on the Kutu Digitizer codebase.

---

## 1. THINK

Before writing code, state your assumptions explicitly.

- If uncertain, **ASK** — do not guess.
- If multiple interpretations exist, **present them** — do not pick silently.
- If something is unclear, **stop and name what is confusing**.

Clarifying questions come BEFORE implementation, not after a broken PR is already open.

---

## 2. SIMPLE

Minimum code that solves the stated problem.

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" that wasn't requested.
- No premature generalization.

If 200 lines could be 50 lines, rewrite. Three similar lines is better than a clever abstraction.

Bias toward **deletion**. Every line is a liability.

---

## 3. SURGICAL

Touch only what you must.

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd prefer another.
- If your changes create orphans, clean only YOUR mess — not the codebase's.

Each PR does one thing. If you find yourself writing "also:" in the PR description, split the PR.

---

## 4. VERIFY

Transform tasks into **verifiable goals with success criteria**.

- State a brief plan with checks before coding.
- Loop test → fix → retest until verified.
- Don't declare done without evidence.

"Verified" means:

- The testable outcome for the phase passes end-to-end, on a machine other than the author's.
- The build is green.
- No `console.log` debugging left in shipped code.
- Manual smoke-test of the happy path completed.

---

## Operational signals this protocol is working

- Fewer unnecessary changes in diffs
- Fewer rewrites from overcomplication
- Clarifying questions come BEFORE implementation
- Commits describe one shipped thing each
- PR reviews take minutes, not hours

---

## Operational signals the protocol is NOT being followed

- 500-line PRs that "refactor while fixing"
- "Also fixed X" bullets in PR descriptions
- Comments explaining WHY code exists instead of WHY decisions were made
- Tests that mock the thing being tested
- "I'll clean it up later"

When you see these, call them out. Akal is a team discipline, not a personal one.

---

## For AI assistants

If you are an AI helping a team member, you MUST apply Akal to your own output:

- If the user's request is ambiguous, **ask before coding**.
- If you would need to write 300 lines to answer, check if there's a 30-line version.
- If the user asked to change line 42, change line 42 — do not touch lines 43–78.
- After each change, restate the verification step and wait for the user to run it.

Akal applies equally to machine output and human output.
