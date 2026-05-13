# Dungeon Tools 5e

Companion app for Dungeons & Dragons 5th Edition players: track a character,
keep a personal spell list and class-feature list, roll dice, and chat with
an in-app goblin assistant that knows the SRD.

Scope is intentionally 5e-only — the SRD 5.1 spell catalog, racial traits,
and class features are bundled into the app and the assistant is grounded in
that same content.

> Unofficial fan utility. Not affiliated with, endorsed, sponsored, or
> approved by Wizards of the Coast.

## Layout

This is a pnpm + Turborepo monorepo.

```
apps/
  mobile/   Expo (React Native + web) — the user-facing app
  api/      Cloudflare Worker (Hono + ai-sdk + Gemini) — chat endpoint
packages/
  shared/   Types + helpers shared between mobile and api
```

The mobile app stores characters and lists locally in SQLite (`expo-sqlite`).
The only thing the API does is proxy chat requests so the LLM key never lives
on a user's device.

## Develop

Prereqs: Node 24, pnpm 10, and the Expo tooling for whichever target you want
to run.

```bash
pnpm install
pnpm dev            # runs `turbo run dev` across all apps
```

Or run a single app:

```bash
pnpm --filter @dungeon-tools/mobile dev
pnpm --filter @dungeon-tools/api dev
```

The mobile app reads `EXPO_PUBLIC_API_BASE_URL` to find the chat endpoint
(defaults to `http://localhost:8787`, which is wrangler's default).

## Type-check / lint

```bash
pnpm typecheck
pnpm lint
```

## SRD data

Spell, class-feature, and racial-trait data is pre-generated from
[5e-bits/5e-database](https://github.com/5e-bits/5e-database) and checked
into `apps/mobile/assets`. To refresh:

```bash
pnpm --filter @dungeon-tools/mobile fetch-spells
pnpm --filter @dungeon-tools/mobile fetch-srd
node apps/mobile/scripts/build-feature-data.mjs
```

## Deploy

The API auto-deploys to Cloudflare Workers on pushes to `main` that touch
`apps/api/**` or `packages/shared/**` (see
`.github/workflows/deploy-api.yml`). The mobile web build is currently a
static export under `apps/mobile/dist`.

## Attribution

Includes material from the System Reference Document 5.1 by Wizards of the
Coast LLC, used under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
Spell data has been reformatted; rules text is unmodified.
