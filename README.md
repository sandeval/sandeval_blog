# sandeval.dev

Personal site for Alejandro Sandoval — security & networking background, now deep in AI/ML. Built with Cloudflare Workers + static HTML/CSS. No frameworks, no build step.

## Stack

- **Frontend** — single `index.html`, vanilla CSS + JS
- **Worker** — `worker.js` runs on Cloudflare Workers, proxies GitHub API calls
- **Hosting** — Cloudflare Workers Assets (`wrangler deploy`)

## Structure

```
index.html          # main page
worker.js           # Cloudflare Worker (GitHub commits API)
wrangler.jsonc      # Cloudflare deployment config
favicon.*           # favicon assets (ico, svg, png sizes)
apple-touch-icon.png
blog.html           # placeholder pages (coming soon)
now.html
setup.html
secops.html
journey.html
etc.html
.wranglerignore     # excludes .git, .claude, .DS_Store from deploy
```

## Worker — `/api/commits`

Fetches real commit data from GitHub GraphQL API using a stored secret. Returns:

```json
{ "count": 9, "grid": [0,0,1,2,4,...] }
```

- `count` — total commits this calendar month (public + private)
- `grid` — 28-day activity array (oldest → newest), normalized to 0–4 intensity

Cached 1 hour via `Cache-Control`.

## Environment Variables

| Secret | Where | Purpose |
|--------|-------|---------|
| `GITHUB_TOKEN` | Cloudflare Workers secret | GitHub GraphQL API auth (needs `repo` + `read:user` scopes) |

Set via:
```
wrangler secret put GITHUB_TOKEN
```

Never commit tokens to the repo.

## Deploy

```
wrangler deploy
```

Requires `wrangler` CLI and an active Cloudflare session (`wrangler login`).
