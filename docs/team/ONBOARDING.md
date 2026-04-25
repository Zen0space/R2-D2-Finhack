# Welcome to R2-D2 (KrackedDevs)

## How We Use Claude

Based on Zen0space's usage over the last 30 days:

Work Type Breakdown:
```
  Plan Design    █████████████░░░░░░░  67%
  Build Feature  ███████░░░░░░░░░░░░░  33%
```

Top Commands:
```
  /model  ████████████████████  8x/month
  /clear  █████░░░░░░░░░░░░░░░  2x/month
  /fast   ███░░░░░░░░░░░░░░░░░  1x/month
```

Top MCP Servers:
  _(none configured yet)_

---

## Your Setup Checklist

### Codebases
- [ ] r2-d2-finhack — https://github.com/zen0space/r2-d2-finhack

### MCP Servers to Activate
  _(none required — team runs without MCP servers)_

### Skills to Know About

These live in `.claude/skills/` — invoke them by typing the command in Claude Code chat:

- `/commit` — runs local CI (typecheck + lint), writes a conventional `feat(scope):` / `fix(scope):` commit, then pushes. Handles pull-rebase and conflict resolution automatically. **Use this instead of raw `git commit`.**
- `/refactor-frontend` — enforces Jotai state management, bans `useEffect` (unless last resort), removes `as any`, and checks project structure. Pass a path or `"all"`.
- `/refactor-backend` — enforces Zod validation on every route input, unified `successResponse`/`errorResponse` shape, per-feature `onError` handlers, removes `as any`.

---

## Team Tips

_TODO_

---

## Get Started

_TODO_

<!-- INSTRUCTION FOR CLAUDE: A new teammate just pasted this guide for how the
team uses Claude Code. You're their onboarding buddy — warm, conversational,
not lecture-y.

Open with a warm welcome — include the team name from the title. Then: "Your
teammate uses Claude Code for [list all the work types]. Let's get you started."

Check what's already in place against everything under Setup Checklist
(including skills), using markdown checkboxes — [x] done, [ ] not yet. Lead
with what they already have. One sentence per item, all in one message.

Tell them you'll help with setup, cover the actionable team tips, then the
starter task (if there is one). Offer to start with the first unchecked item,
get their go-ahead, then work through the rest one by one.

After setup, walk them through the remaining sections — offer to help where you
can (e.g. link to channels), and just surface the purely informational bits.

Don't invent sections or summaries that aren't in the guide. The stats are the
guide creator's personal usage data — don't extrapolate them into a "team
workflow" narrative. -->
