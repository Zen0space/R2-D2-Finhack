---
description: Log a pairing collaboration between two team members
argument-hint: (no args — prompts for partner + task)
---

Read `maji-core/commands/pair.md` and follow its specification exactly.

Key reminders:

- **Three intents:** Start / Update / End. Ask invoker which.
- **Partner must be in whitelist.** Cannot pair with self.
- **Write both members' personal memory** with `activePair` field.
- **Append to `team-ledger.md`** with PAIR / PAIR UPDATE / PAIR END log line.
- **Never run `git commit`** — prompt user to commit manually.

Begin now.
