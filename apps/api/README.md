# @dungeon-tools/api

Cloudflare Worker that backs the in-app goblin assistant. Built with Hono +
the Vercel AI SDK; routes chat completions to Gemini so the API key stays
off user devices.

## Develop

```bash
pnpm --filter @dungeon-tools/api dev   # wrangler dev on :8787
```

Set `GEMINI_API_KEY` in `apps/api/.dev.vars` for local dev. In production
it's a Worker secret: `pnpm exec wrangler secret put GEMINI_API_KEY`.

## Deploy

Auto-deploys via `.github/workflows/deploy-api.yml` on pushes to `main`
that touch this package or `packages/shared`. Manual deploy:

```bash
pnpm --filter @dungeon-tools/api deploy
```

## Rate limit

25 requests / minute / IP (see `wrangler.jsonc`). Each user turn can fan out
to ~5 POSTs because of the client-side tool loop, so this gives roughly 5
user turns per minute.
