---
name: commit
description: Run local CI (typecheck + lint), create a conventional commit, then push. Use when asked to commit, push, or save changes. Enforces feat(scope): / fix(scope): format for the DuitLater monorepo. Blocks on CI failures before committing.
argument-hint: optional message hint
disable-model-invocation: true
---

Follow this procedure exactly every time.

## Step 0 — Run CI locally (gate — do not skip)

Run all checks before touching git. If any check fails, fix it first.

```bash
pnpm typecheck
```

```bash
pnpm lint
```

If the changed files include `packages/backend/**`:
```bash
pnpm --filter backend typecheck
```

If the changed files include `packages/frontend/**`:
```bash
pnpm --filter frontend typecheck
```

If the changed files include `packages/db/**`:
```bash
pnpm --filter db generate
```

**On failure:** Fix every error and warning before proceeding. Never commit broken types or lint violations. The only exception is if the user explicitly says "commit anyway" — in that case note the failures in the commit body.

---

## Step 1 — Check what is staged

```bash
git diff --staged --stat
```

If nothing is staged, stop and ask the user which files to stage. Do not proceed.

## Step 2 — Read the diff

```bash
git diff --staged
```

Read the actual changes to understand the scope and nature of the work.

## Step 3 — Pick type and scope

**Type** — choose one:

| Type | Use when |
|---|---|
| `feat` | New feature or capability added |
| `fix` | Bug fixed |
| `chore` | Tooling, deps, config, seed data — no production logic change |
| `refactor` | Code restructured with no behaviour change |
| `docs` | Documentation only |
| `style` | Formatting / whitespace only |
| `test` | Tests added or fixed |
| `perf` | Performance improvement |
| `ci` | CI/CD changes |
| `build` | Docker, Dockerfile, build scripts |
| `revert` | Reverting a previous commit |

**Scope** — choose one based on changed file paths:

| Scope | File paths |
|---|---|
| `backend` | `packages/backend/**` |
| `frontend` | `packages/frontend/**` |
| `db` | `packages/db/**` |
| `api` | Route handlers / endpoint contracts |
| `auth` | Better Auth wiring |
| `pwa` | Service worker, manifest, offline |
| `infra` | `docker-compose.yml`, `Dockerfile`, `Caddyfile` |
| `docs` | `docs/**`, `README.md`, `CLAUDE.md` |
| `root` | Root workspace files |

For multi-package changes, use the most impactful scope and list others in the body.

## Step 4 — Write the subject

- Imperative mood: "add", "fix", "remove" — not "added" or "fixes"
- Max 72 characters total (type + scope + subject)
- No period at the end
- Lowercase after the colon

Breaking change: append `!` and add a `BREAKING CHANGE:` footer.

## Step 5 — Commit using HEREDOC

```bash
git commit -m "$(cat <<'EOF'
type(scope): subject

optional body — WHY, not WHAT
EOF
)"
```

No Co-Authored-By line. Never use `--no-verify` unless the user explicitly asks.

## Step 6 — Push (always)

Always push after a successful commit.

```bash
git push
```

### If push is rejected (remote has new commits)

Pull and merge first:

```bash
git pull --rebase
```

Then push again:

```bash
git push
```

### If there are merge conflicts

1. Read every conflicted file — understand both sides of the conflict.
2. Resolve by keeping whichever version is **more feature-complete or correct**:
   - Prefer the version with more functionality over a simpler one.
   - Prefer the version that matches the current task's intent.
   - If both sides have unique, valid changes — merge them together manually.
3. After resolving all conflicts:
   ```bash
   git add <resolved-files>
   git rebase --continue   # if rebasing
   # or
   git commit              # if merging
   ```
4. Then push:
   ```bash
   git push
   ```

Never force-push to `main`.

## Examples

```
feat(api): add GET /api/v1/mykasih/products with pagination and filtering
fix(backend): resolve EADDRINUSE on dev server restart
chore(db): seed 94 MyKasih products across 8 categories
refactor(api): extract ApiError class to lib/errors
feat(db): add MykasihProduct model and migration
docs(docs): add 02-prod.md product manifest with Mermaid flow diagrams
chore(root): wire db workspace dependency into backend
fix(frontend): correct offline fallback route in service worker
feat(pwa): add beforeinstallprompt capture and Pasang DuitLater button
perf(db): add @@index on MykasihProduct category and isActive fields
```
