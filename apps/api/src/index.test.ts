import { beforeEach, describe, expect, it, vi } from 'vitest';

import app from './index';
import * as ai from 'ai';

vi.mock('ai', async () => {
  const actual = await vi.importActual<typeof import('ai')>('ai');
  return {
    ...actual,
    streamText: vi.fn(() => ({
      toUIMessageStreamResponse: () =>
        new Response('data: {"type":"finish"}\n\n', {
          headers: { 'Content-Type': 'text/event-stream' },
        }),
    })),
  };
});

vi.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: () => () => ({ id: 'fake-model' }),
}));

type Bindings = {
  GEMINI_API_KEY: string;
  CHAT_RATE_LIMIT: {
    limit: (args: { key: string }) => Promise<{ success: boolean }>;
  };
};

function makeEnv(over: Partial<Bindings> = {}): Bindings {
  return {
    GEMINI_API_KEY: 'test-key',
    CHAT_RATE_LIMIT: {
      limit: vi.fn(async () => ({ success: true })),
    },
    ...over,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /', () => {
  it('returns a health-check body', async () => {
    const res = await app.request('/', {}, makeEnv());
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('dungeon-tools api ok');
  });
});

describe('CORS', () => {
  it('echoes the Origin header when it matches the allowlist', async () => {
    const res = await app.request(
      '/',
      { headers: { Origin: 'https://dungeon-tools.luke-randolph.com' } },
      makeEnv(),
    );
    expect(res.headers.get('access-control-allow-origin')).toBe(
      'https://dungeon-tools.luke-randolph.com',
    );
  });

  it('allows the localhost dev origins', async () => {
    const res = await app.request(
      '/',
      { headers: { Origin: 'http://localhost:8081' } },
      makeEnv(),
    );
    expect(res.headers.get('access-control-allow-origin')).toBe(
      'http://localhost:8081',
    );
  });

  it('omits the allow-origin header for a disallowed origin', async () => {
    const res = await app.request(
      '/',
      { headers: { Origin: 'https://evil.example.com' } },
      makeEnv(),
    );
    expect(res.headers.get('access-control-allow-origin')).toBeNull();
  });

  it('answers OPTIONS preflights for allowed origins', async () => {
    const res = await app.request(
      '/chat',
      {
        method: 'OPTIONS',
        headers: {
          Origin: 'https://dungeon-tools.luke-randolph.com',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'content-type',
        },
      },
      makeEnv(),
    );
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-methods')).toMatch(/POST/);
  });
});

describe('POST /chat', () => {
  it('returns 429 when the rate limiter rejects', async () => {
    const env = makeEnv({
      CHAT_RATE_LIMIT: { limit: vi.fn(async () => ({ success: false })) },
    });
    const res = await app.request(
      '/chat',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }),
      },
      env,
    );
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: 'rate limit exceeded' });
    expect(ai.streamText).not.toHaveBeenCalled();
  });

  it('keys the rate limit on the client IP', async () => {
    const limit = vi.fn(async () => ({ success: true }));
    const env = makeEnv({ CHAT_RATE_LIMIT: { limit } });
    await app.request(
      '/chat',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'cf-connecting-ip': '203.0.113.42',
        },
        body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }),
      },
      env,
    );
    expect(limit).toHaveBeenCalledWith({ key: '203.0.113.42' });
  });

  it('returns 400 for invalid JSON', async () => {
    const res = await app.request(
      '/chat',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not json',
      },
      makeEnv(),
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'invalid JSON body' });
  });

  it('returns 400 when messages is empty', async () => {
    const res = await app.request(
      '/chat',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [] }),
      },
      makeEnv(),
    );
    expect(res.status).toBe(400);
  });

  it('returns 400 when a user message exceeds the char limit', async () => {
    const tooLong = 'x'.repeat(4097);
    const res = await app.request(
      '/chat',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: tooLong }],
        }),
      },
      makeEnv(),
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'message too long' });
  });

  it('returns 500 when GEMINI_API_KEY is not configured', async () => {
    const env = makeEnv({ GEMINI_API_KEY: '' });
    const res = await app.request(
      '/chat',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }),
      },
      env,
    );
    expect(res.status).toBe(500);
  });

  it('happy path: dispatches to streamText and returns the stream response', async () => {
    const res = await app.request(
      '/chat',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'tell me about fireball' }],
          activeCharacterSummary: 'Eldrin, level 5 elf wizard',
        }),
      },
      makeEnv(),
    );
    expect(res.status).toBe(200);
    expect(ai.streamText).toHaveBeenCalledOnce();
    const call = vi.mocked(ai.streamText).mock.calls[0][0];
    expect(call.system).toContain('Eldrin');
    expect(call.messages).toEqual([
      { role: 'user', content: 'tell me about fireball' },
    ]);
    expect(Object.keys(call.tools ?? {})).toEqual(
      expect.arrayContaining([
        'searchSpells',
        'searchSRD',
        'getActiveCharacter',
        'listCharacterSpells',
      ]),
    );
  });

  it('exposes only catalog tools when no active character summary is sent', async () => {
    await app.request(
      '/chat',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }),
      },
      makeEnv(),
    );
    const call = vi.mocked(ai.streamText).mock.calls[0][0];
    expect(Object.keys(call.tools ?? {}).sort()).toEqual([
      'searchSRD',
      'searchSpells',
    ]);
  });
});

describe('404', () => {
  it('returns 404 for unmatched routes', async () => {
    const res = await app.request('/nope', {}, makeEnv());
    expect(res.status).toBe(404);
  });
});
