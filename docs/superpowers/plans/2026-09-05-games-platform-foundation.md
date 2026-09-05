# Games Platform Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Correction (during execution, 2026-09-05):** the originally planned
> Cloudflare Pages project name for GeoQuiz (`geoquiz`) turned out to
> already be taken by an unrelated third-party site (`.pages.dev` names
> are global across all Cloudflare accounts). Every reference below has
> been updated to the actual project name used: **`jarvantage-geoquiz`**
> (origin `https://jarvantage-geoquiz.pages.dev`). `primequiz` was
> unaffected.

**Goal:** Stand up two independent placeholder game sites (PrimeQuiz, GeoQuiz)
and a Cloudflare Worker "gateway" that routes `games.jarvantage.com/<game>`
to each, so future games can be added the same way without touching each
other.

**Architecture:** Each game is its own private GitHub repo deployed as its
own Cloudflare Pages project (default `<name>.pages.dev` domain, no custom
domain on the game itself). A separate `games-gateway` repo holds a
Cloudflare Worker attached to the custom domain `games.jarvantage.com`; it
reverse-proxies by URL path to the right game's `.pages.dev` origin, and
separately serves a (currently empty) `/.well-known/assetlinks.json` for
future Android apps.

**Tech Stack:** Plain static HTML/CSS (placeholders, no framework), vanilla
JS Cloudflare Worker, Vitest (Worker unit tests), Wrangler CLI, GitHub CLI
(`gh`).

**Spec:** [docs/superpowers/specs/2026-09-05-games-platform-foundation-design.md](../specs/2026-09-05-games-platform-foundation-design.md)

## Global Constraints

- All three new repos are **private** on GitHub (`jarva77/primeQuiz`,
  `jarva77/geoQuiz`, `jarva77/games-gateway`).
- Everything stays on Cloudflare's **free tier** — no paid plan, no new
  vendor.
- Local folders: `D:\src\jarvantage\games\primeQuiz\`,
  `D:\src\jarvantage\games\geoQuiz\`, `D:\src\jarvantage\games\gateway\`.
- Placeholder game pages are plain static HTML/CSS — no framework, no build
  step. Do not scaffold Vue/Vite for them in this plan.
- primeQuiz/geoQuiz deploy via Cloudflare Pages' native Git integration
  (auto-build on push) — no GitHub Actions workflow files for them.
- The gateway is a Cloudflare **Worker**, not a Pages project — deployed via
  `wrangler deploy`, not git-connected auto-deploy.
- The existing `quiz.jarvantage.com` / `jarva77/jarvEducation` repo is not
  touched by any task in this plan.
- `wrangler` and `gh` are already authenticated on this machine (see
  `~/.claude/CLAUDE.md`) — no login steps needed.

---

### Task 1: PrimeQuiz placeholder — repo + Cloudflare Pages

**Files:**
- Create: `D:/src/jarvantage/games/primeQuiz/index.html`
- Create: `D:/src/jarvantage/games/primeQuiz/.gitignore`

**Interfaces:**
- Produces: a live URL `https://primequiz.pages.dev/` that the gateway
  (Task 4-5) will proxy to. Cloudflare Pages project name: `primequiz`
  (lowercase — Cloudflare Pages project names don't allow uppercase).

- [ ] **Step 1: Create the local folder and placeholder page**

```bash
mkdir -p D:/src/jarvantage/games/primeQuiz
```

Write `D:/src/jarvantage/games/primeQuiz/index.html`:

```html
<!doctype html>
<html lang="el">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PrimeQuiz — Υπό κατασκευή</title>
<style>
  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0f172a;
    color: #e2e8f0;
    font-family: system-ui, -apple-system, sans-serif;
    text-align: center;
  }
  h1 { font-size: 2rem; margin-bottom: .5rem; }
  p { color: #94a3b8; }
</style>
</head>
<body>
  <div>
    <h1>🚧 PrimeQuiz</h1>
    <p>Έρχεται σύντομα.</p>
  </div>
</body>
</html>
```

Write `D:/src/jarvantage/games/primeQuiz/.gitignore`:

```
.DS_Store
```

- [ ] **Step 2: Init git, commit, create the private GitHub repo, and push**

```bash
cd D:/src/jarvantage/games/primeQuiz
git init -b main
git add index.html .gitignore
git commit -m "Add PrimeQuiz under-construction placeholder"
gh repo create jarva77/primeQuiz --private --source=. --remote=origin --push
```

Expected: command prints the new repo URL
`https://github.com/jarva77/primeQuiz`, and `git remote -v` shows `origin`
pointing at it.

- [ ] **Step 3 (manual — you do this): connect the repo to Cloudflare Pages**

This step needs your Cloudflare login and GitHub App authorization, which
can't be done from the CLI/agent side:

1. Open the [Cloudflare dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create application** → **Pages** tab → **Connect to Git**.
2. Authorize/select the `jarva77/primeQuiz` repository (installs the
   Cloudflare Pages GitHub App on this repo if not already installed).
3. Project name: `primequiz` (lowercase).
4. Build settings: **Framework preset = None**, **Build command = (empty)**,
   **Build output directory = /**.
5. Click **Save and Deploy**.

- [ ] **Step 4: Verify it's live**

```bash
curl -s https://primequiz.pages.dev/ | grep "PrimeQuiz"
```

Expected: prints the `<h1>🚧 PrimeQuiz</h1>` line (may take ~1 minute after
step 3 for the first deploy to finish — re-run if empty).

---

### Task 2: GeoQuiz placeholder — repo + Cloudflare Pages

**Files:**
- Create: `D:/src/jarvantage/games/geoQuiz/index.html`
- Create: `D:/src/jarvantage/games/geoQuiz/.gitignore`

**Interfaces:**
- Produces: a live URL `https://jarvantage-geoquiz.pages.dev/`. Cloudflare Pages
  project name: `jarvantage-geoquiz`.

- [ ] **Step 1: Create the local folder and placeholder page**

```bash
mkdir -p D:/src/jarvantage/games/geoQuiz
```

Write `D:/src/jarvantage/games/geoQuiz/index.html`:

```html
<!doctype html>
<html lang="el">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>GeoQuiz — Υπό κατασκευή</title>
<style>
  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0f172a;
    color: #e2e8f0;
    font-family: system-ui, -apple-system, sans-serif;
    text-align: center;
  }
  h1 { font-size: 2rem; margin-bottom: .5rem; }
  p { color: #94a3b8; }
</style>
</head>
<body>
  <div>
    <h1>🌍 GeoQuiz</h1>
    <p>Έρχεται σύντομα.</p>
  </div>
</body>
</html>
```

Write `D:/src/jarvantage/games/geoQuiz/.gitignore`:

```
.DS_Store
```

- [ ] **Step 2: Init git, commit, create the private GitHub repo, and push**

```bash
cd D:/src/jarvantage/games/geoQuiz
git init -b main
git add index.html .gitignore
git commit -m "Add GeoQuiz under-construction placeholder"
gh repo create jarva77/geoQuiz --private --source=. --remote=origin --push
```

Expected: prints the new repo URL `https://github.com/jarva77/geoQuiz`.

- [ ] **Step 3 (manual — you do this): connect the repo to Cloudflare Pages**

Same as Task 1 Step 3, but:
1. Select repository `jarva77/geoQuiz`.
2. Project name: `jarvantage-geoquiz`.
3. Framework preset = None, Build command = empty, Build output directory = `/`.
4. Save and Deploy.

- [ ] **Step 4: Verify it's live**

```bash
curl -s https://jarvantage-geoquiz.pages.dev/ | grep "GeoQuiz"
```

Expected: prints the `<h1>🌍 GeoQuiz</h1>` line.

---

### Task 3: games-gateway — routing logic (TDD)

**Files:**
- Create: `D:/src/jarvantage/games/gateway/package.json`
- Create: `D:/src/jarvantage/games/gateway/src/routing.js`
- Test: `D:/src/jarvantage/games/gateway/test/routing.test.js`

**Interfaces:**
- Produces: `resolveOrigin(pathname: string): string | null` — used by
  Task 4's Worker entrypoint. Returns the origin URL (no trailing slash,
  no path) for a known game prefix, or `null` if the path matches no game.

- [ ] **Step 1: Scaffold the project**

```bash
mkdir -p D:/src/jarvantage/games/gateway/src D:/src/jarvantage/games/gateway/test
cd D:/src/jarvantage/games/gateway
npm init -y
npm install -D vitest wrangler
```

- [ ] **Step 2: Write the failing test**

Write `D:/src/jarvantage/games/gateway/test/routing.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { resolveOrigin } from '../src/routing.js'

describe('resolveOrigin', () => {
  it('routes /primeQuiz paths to the primeQuiz origin', () => {
    expect(resolveOrigin('/primeQuiz')).toBe('https://primequiz.pages.dev')
    expect(resolveOrigin('/primeQuiz/assets/app.js')).toBe('https://primequiz.pages.dev')
  })

  it('routes /geoQuiz paths to the geoQuiz origin', () => {
    expect(resolveOrigin('/geoQuiz')).toBe('https://jarvantage-geoquiz.pages.dev')
    expect(resolveOrigin('/geoQuiz/index.html')).toBe('https://jarvantage-geoquiz.pages.dev')
  })

  it('returns null for unknown paths', () => {
    expect(resolveOrigin('/unknown')).toBeNull()
    expect(resolveOrigin('/')).toBeNull()
  })

  it('does not match a path that only shares a text prefix', () => {
    expect(resolveOrigin('/primeQuizzical')).toBeNull()
  })
})
```

- [ ] **Step 3: Run the test to verify it fails**

Add to `package.json` `"scripts"`: `"test": "vitest run"`.

Run: `npm test`
Expected: FAIL — `src/routing.js` does not exist / `resolveOrigin` is not
defined.

- [ ] **Step 4: Write the minimal implementation**

Write `D:/src/jarvantage/games/gateway/src/routing.js`:

```js
const ROUTES = [
  { prefix: '/primeQuiz', origin: 'https://primequiz.pages.dev' },
  { prefix: '/geoQuiz', origin: 'https://jarvantage-geoquiz.pages.dev' },
]

export function resolveOrigin(pathname) {
  const route = ROUTES.find(
    (r) => pathname === r.prefix || pathname.startsWith(r.prefix + '/')
  )
  return route ? route.origin : null
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test`
Expected: all 4 tests PASS.

- [ ] **Step 6: Commit**

```bash
cd D:/src/jarvantage/games/gateway
git init -b main
git add package.json package-lock.json src/routing.js test/routing.test.js
git commit -m "Add gateway routing logic with tests"
```

---

### Task 4: games-gateway — Worker entrypoint + repo push

**Files:**
- Create: `D:/src/jarvantage/games/gateway/src/index.js`
- Create: `D:/src/jarvantage/games/gateway/wrangler.toml`
- Create: `D:/src/jarvantage/games/gateway/.gitignore`

**Interfaces:**
- Consumes: `resolveOrigin(pathname)` from Task 3 (`../src/routing.js`).
- Produces: a `fetch` handler runnable locally via `wrangler dev` on
  `http://localhost:8787`.

- [ ] **Step 1: Write the Worker entrypoint**

Write `D:/src/jarvantage/games/gateway/src/index.js`:

```js
import { resolveOrigin } from './routing.js'

const ASSET_LINKS = []

export default {
  async fetch(request) {
    const url = new URL(request.url)

    if (url.pathname === '/.well-known/assetlinks.json') {
      return new Response(JSON.stringify(ASSET_LINKS), {
        headers: { 'content-type': 'application/json' },
      })
    }

    const origin = resolveOrigin(url.pathname)
    if (!origin) {
      return new Response('Not found', { status: 404 })
    }

    const targetUrl = origin + url.pathname + url.search
    return fetch(new Request(targetUrl, request))
  },
}
```

- [ ] **Step 2: Write the wrangler config**

Write `D:/src/jarvantage/games/gateway/wrangler.toml`:

```toml
name = "games-gateway"
main = "src/index.js"
compatibility_date = "2026-09-05"

[[routes]]
pattern = "games.jarvantage.com"
custom_domain = true
```

Write `D:/src/jarvantage/games/gateway/.gitignore`:

```
node_modules/
.wrangler/
```

- [ ] **Step 3: Verify locally with wrangler dev**

```bash
cd D:/src/jarvantage/games/gateway
npx wrangler dev --port 8787 &
sleep 3
curl -s http://localhost:8787/primeQuiz | head -c 200
curl -s http://localhost:8787/.well-known/assetlinks.json
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8787/unknown
```

Expected: first curl proxies through to the live `primequiz.pages.dev`
placeholder HTML (from Task 1); second prints `[]`; third prints `404`.
Stop the dev server afterward (`kill %1` or Ctrl+C in its terminal).

- [ ] **Step 4: Push to GitHub**

```bash
gh repo create jarva77/games-gateway --private --source=. --remote=origin --push
git add src/index.js wrangler.toml .gitignore
git commit -m "Add gateway Worker fetch handler"
git push
```

Expected: prints the new repo URL
`https://github.com/jarva77/games-gateway`.

---

### Task 5: games-gateway — deploy + DNS + end-to-end verification

**Files:** none new — deploys what Tasks 3-4 built.

**Interfaces:**
- Produces: live routing at `https://games.jarvantage.com/<game>`.

- [ ] **Step 1: Deploy the Worker**

```bash
cd D:/src/jarvantage/games/gateway
npx wrangler deploy
```

Expected: output includes `games.jarvantage.com` under the deployed routes.
This also creates the necessary proxied DNS record for
`games.jarvantage.com` automatically (Workers custom domains manage their
own DNS record) — no manual Cloudflare DNS step needed.

- [ ] **Step 2: Verify end-to-end**

```bash
curl -s https://games.jarvantage.com/primeQuiz | grep "PrimeQuiz"
curl -s https://games.jarvantage.com/geoQuiz | grep "GeoQuiz"
curl -s https://games.jarvantage.com/.well-known/assetlinks.json
curl -s -o /dev/null -w "%{http_code}\n" https://games.jarvantage.com/unknown
```

Expected: first two print their respective `<h1>` lines, third prints `[]`,
fourth prints `404`. DNS can take a minute or two to propagate on the very
first deploy — retry if you get a connection error rather than a 404/200.

- [ ] **Step 3: Commit the wrangler.toml route (if not already committed)**

```bash
git status
```

If `wrangler.toml` shows modified (wrangler may rewrite it during deploy),
review the diff, then:

```bash
git add wrangler.toml
git commit -m "Confirm games.jarvantage.com custom domain route"
git push
```

If `git status` is clean, skip the commit.

---

### Task 6: Project CLAUDE.md for each new repo

**Files:**
- Create: `D:/src/jarvantage/games/primeQuiz/CLAUDE.md`
- Create: `D:/src/jarvantage/games/geoQuiz/CLAUDE.md`
- Create: `D:/src/jarvantage/games/gateway/CLAUDE.md`

**Interfaces:** none — documentation only, read by future sessions opened
in each of these folders.

- [ ] **Step 1: Write primeQuiz's CLAUDE.md**

Write `D:/src/jarvantage/games/primeQuiz/CLAUDE.md`:

```markdown
# PrimeQuiz

Placeholder site for the future PrimeQuiz game — part of the
`games.jarvantage.com` multi-game platform (see
`~/.claude/CLAUDE.md` → "Games platform" for the cross-project picture,
and `jarva77/jarvantageEducation`'s
`docs/superpowers/specs/2026-09-05-games-platform-foundation-design.md`
for the full design).

## Status

Currently just a static "under construction" `index.html` — no framework,
no build step. The tech stack for the real game is **not yet decided** —
don't assume Vue/Vite just because the older quiz app used it.

## Hosting

Cloudflare Pages project `primequiz` (native Git integration — push to
`main` auto-deploys, no GitHub Actions). Default domain:
`https://primequiz.pages.dev`. Reached publicly via
`https://games.jarvantage.com/primeQuiz` through the `games-gateway` Worker
(separate repo `jarva77/games-gateway`), which reverse-proxies by path —
this repo has no custom domain of its own and doesn't need one.

## Relationship to the old quiz app

The live app at `quiz.jarvantage.com` (repo `jarva77/jarvEducation`) is a
**separate, unrelated, still-live project** — this repo does not inherit
its content or Firebase setup automatically. Porting real question content
here is a distinct, not-yet-started phase.
```

- [ ] **Step 2: Write geoQuiz's CLAUDE.md**

Write `D:/src/jarvantage/games/geoQuiz/CLAUDE.md`:

```markdown
# GeoQuiz

Placeholder site for a future world-geography quiz game — part of the
`games.jarvantage.com` multi-game platform (see
`~/.claude/CLAUDE.md` → "Games platform" for the cross-project picture,
and `jarva77/jarvantageEducation`'s
`docs/superpowers/specs/2026-09-05-games-platform-foundation-design.md`
for the full design).

## Status

Currently just a static "under construction" `index.html` — no framework,
no build step, no game content or design yet.

## Hosting

Cloudflare Pages project `jarvantage-geoquiz` (native Git integration — push to
`main` auto-deploys, no GitHub Actions). Default domain:
`https://jarvantage-geoquiz.pages.dev`. Reached publicly via
`https://games.jarvantage.com/geoQuiz` through the `games-gateway` Worker
(separate repo `jarva77/games-gateway`), which reverse-proxies by path —
this repo has no custom domain of its own and doesn't need one.
```

- [ ] **Step 3: Write games-gateway's CLAUDE.md**

Write `D:/src/jarvantage/games/gateway/CLAUDE.md`:

```markdown
# games-gateway

Cloudflare Worker that reverse-proxies `games.jarvantage.com/<game>` to
each game's own Cloudflare Pages project. This is the "glue" for the
`games.jarvantage.com` multi-game platform — see `~/.claude/CLAUDE.md` →
"Games platform" for the cross-project picture, and
`jarva77/jarvantageEducation`'s
`docs/superpowers/specs/2026-09-05-games-platform-foundation-design.md`
for the full design.

## How routing works

`src/routing.js` maps a URL path prefix to a game's `.pages.dev` origin —
see its tests in `test/routing.test.js` for the exact matching rules
(prefix must be the whole path or followed by `/`, so `/primeQuiz` matches
but `/primeQuizzical` doesn't). `src/index.js` is the actual Worker
`fetch` handler: it also serves `/.well-known/assetlinks.json` (currently
an empty array — fill in with `{package_name, sha256_cert_fingerprints}`
entries once an Android TWA app exists for a game).

**Adding a new game:** add one entry to the `ROUTES` array in
`src/routing.js` (and a matching test), redeploy with `wrangler deploy`.
Nothing else in this repo changes.

## Deploy

```bash
npx wrangler deploy
```

Deploys to the `games.jarvantage.com` custom domain (configured in
`wrangler.toml` — Cloudflare manages the DNS record automatically for
Workers custom domains, no manual DNS step). No CI is set up yet; deploy
is manual.

## Testing

```bash
npm test
```

Runs the Vitest suite against `src/routing.js`. There is no test harness
for the Worker's `fetch` handler itself (`src/index.js`) — it's a thin
wrapper around `resolveOrigin`, verified manually via `wrangler dev` +
curl during development (see the implementation plan's Task 4).
```

- [ ] **Step 4: Commit and push all three**

```bash
cd D:/src/jarvantage/games/primeQuiz
git add CLAUDE.md
git commit -m "Add project CLAUDE.md"
git push

cd D:/src/jarvantage/games/geoQuiz
git add CLAUDE.md
git commit -m "Add project CLAUDE.md"
git push

cd D:/src/jarvantage/games/gateway
git add CLAUDE.md
git commit -m "Add project CLAUDE.md"
git push
```
