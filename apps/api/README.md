# @dungeon-tools/api

Cloudflare Worker that backs the in-app goblin assistant. Built with Hono +
the Vercel AI SDK; routes chat completions to Gemini so the API key stays
off user devices.

## Endpoints

CORS-restricted to the app's own origins; `Content-Type` is the only allowed request header.

| Method & path | Description |
| --- | --- |
| `GET /` | Health check. Returns `dungeon-tools api ok`. |
| `POST /chat` | Streams a Gemini completion (AI SDK UI message stream, not JSON). Body is `ChatRequestBody` from `@dungeon-tools/shared`: `{ messages, activeCharacterSummary? }`. `400` on a bad/empty body, `429` on rate limit, `500` if `GEMINI_API_KEY` is missing. |

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
