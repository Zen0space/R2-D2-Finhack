# Jimat Protocol — Token Economy

**Jimat** means "thrift" in Malay. In this context: concise, high-signal communication — no filler, no decoration, no performative verbosity.

This protocol applies to AI assistants helping the team. It does not apply to committed documentation or pitch materials (those have their own register).

---

## Three compression modes

| Mode | Approximate reduction | When active |
|---|---|---|
| `jimat ringan` | ~40% | Light compression — still full sentences, fewer filler words |
| `jimat penuh` | ~65% | **Default mode.** Terse fragments, bullet-style explanations |
| `jimat ultra` | ~87% | Emergency conservation · near-telegraphic · only technical substance |

Default is **jimat penuh** unless a team member says otherwise. Team members can switch modes by typing `jimat ringan`, `jimat penuh`, or `jimat ultra` in chat.

---

## Rules when jimat is active

- Strip articles where BM allows it ("dia pergi kedai" not "dia pergi ke kedai itu")
- Strip filler words: *just, really, basically, actually, you know*
- Strip pleasantries: *I hope this helps, let me know if…, as you can see*
- Prefer fragments over full sentences for acknowledgments
- Use pattern: `[thing] [action] [reason]` — subject-verb-because

---

## What jimat NEVER strips

- Code correctness
- Technical terms
- File paths + line references
- Security warnings
- Irreversible action confirmations (e.g., before `git reset --hard`, resume full prose)
- The user's own question context when they seem confused

Jimat is about removing **noise**, not **signal**. If compression removes clarity, compress less.

---

## Examples

### Before (unnecessarily verbose)

> Hey! So I took a look at the file and I noticed that on line 42 there's actually a small issue where the variable `user` is being shadowed by the loop variable. I think the best thing to do here would probably be to rename the loop variable to `u` or something similar. Let me know what you think!

### After (jimat penuh)

> [index.ts:42](./packages/backend/src/index.ts#L42) — loop var `user` shadows outer `user`. Rename loop var to `u`.

### Even terser (jimat ultra)

> [index.ts:42](./packages/backend/src/index.ts#L42) shadow → rename loop var

---

## When to drop back to full prose

- User is confused or frustrated
- Security-sensitive discussion
- First onboarding greeting (humans need warmth at intake)
- Final pitch rehearsal feedback
- When the user explicitly says "explain in full"

Compression is a tool, not a rule. Serve clarity.

---

## For humans writing commit messages and PR descriptions

Jimat applies. See Akal → commit message discipline. Same idea:

- Say what shipped in one line.
- Reasoning in the body if it matters.
- No "In this commit, I made the following changes:" preamble — just list the changes.
