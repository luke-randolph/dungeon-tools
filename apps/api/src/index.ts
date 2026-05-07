import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { handleChat } from './chat';

export type Bindings = {
  GEMINI_API_KEY: string;
  CHAT_RATE_LIMIT: RateLimit;
};

const ALLOWED_ORIGINS = [
  /^https?:\/\/localhost:(?:8081|19006|3000|8787)$/,
  /^https:\/\/dungeon-tools\.luke-randolph\.com$/,
];

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  '*',
  cors({
    origin: (origin) => {
      if (!origin) return null;
      return ALLOWED_ORIGINS.some((re) => re.test(origin)) ? origin : null;
    },
    allowMethods: ['POST', 'OPTIONS', 'GET'],
    allowHeaders: ['Content-Type'],
    credentials: false,
  }),
);

app.get('/', (c) => c.text('dungeon-tools api ok'));

app.post('/chat', async (c) => {
  const ip =
    c.req.header('cf-connecting-ip') ??
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown';
  const { success } = await c.env.CHAT_RATE_LIMIT.limit({ key: ip });
  if (!success) {
    return c.json(
      { error: 'rate limit exceeded — slow down a bit, traveller' },
      429,
    );
  }
  return handleChat(c);
});

app.notFound((c) => c.text('not found', 404));

app.onError((err, c) => {
  console.error('Worker error:', err);
  return c.json({ error: 'internal error' }, 500);
});

export default app;
