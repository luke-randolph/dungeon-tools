import { describe, expect, it } from 'vitest';

import { parseDataStream, type StreamChunk } from './chatStream';

function streamOf(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const c of chunks) controller.enqueue(encoder.encode(c));
      controller.close();
    },
  });
}

function sse(payload: object): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

async function collect(
  stream: ReadableStream<Uint8Array>,
  signal?: AbortSignal,
): Promise<StreamChunk[]> {
  const out: StreamChunk[] = [];
  for await (const chunk of parseDataStream(stream, signal)) {
    out.push(chunk);
  }
  return out;
}

describe('parseDataStream', () => {
  it('parses a sequence of text deltas in one chunk', async () => {
    const stream = streamOf([
      sse({ type: 'start' }) +
        sse({ type: 'text-delta', id: '1', delta: 'hello ' }) +
        sse({ type: 'text-delta', id: '1', delta: 'world' }) +
        sse({ type: 'finish' }),
    ]);
    const chunks = await collect(stream);
    expect(chunks).toEqual([
      { type: 'start' },
      { type: 'text-delta', id: '1', delta: 'hello ' },
      { type: 'text-delta', id: '1', delta: 'world' },
      { type: 'finish' },
    ]);
  });

  it('reassembles SSE messages split mid-payload and mid-separator', async () => {
    const stream = streamOf([
      'data: {"type":"text-delta","id":"1","de',
      'lta":"hi"}\n',
      '\ndata: {"type":"text-delta","id":"1","delta":"!"}\n\n',
    ]);
    const chunks = await collect(stream);
    expect(chunks).toEqual([
      { type: 'text-delta', id: '1', delta: 'hi' },
      { type: 'text-delta', id: '1', delta: '!' },
    ]);
  });

  it('emits tool-input-available with the parsed input object', async () => {
    const stream = streamOf([
      sse({
        type: 'tool-input-available',
        toolCallId: 'tc_1',
        toolName: 'searchSpells',
        input: { query: 'fireball', level: 3 },
      }),
    ]);
    const chunks = await collect(stream);
    expect(chunks).toEqual([
      {
        type: 'tool-input-available',
        toolCallId: 'tc_1',
        toolName: 'searchSpells',
        input: { query: 'fireball', level: 3 },
      },
    ]);
  });

  it('surfaces error frames as error chunks', async () => {
    const stream = streamOf([
      sse({ type: 'error', errorText: 'rate limited' }),
    ]);
    const chunks = await collect(stream);
    expect(chunks).toEqual([{ type: 'error', errorText: 'rate limited' }]);
  });

  it('skips malformed JSON without aborting the stream', async () => {
    const stream = streamOf([
      'data: not json\n\n' +
        sse({ type: 'text-delta', id: '1', delta: 'still here' }),
    ]);
    const chunks = await collect(stream);
    expect(chunks).toEqual([
      { type: 'text-delta', id: '1', delta: 'still here' },
    ]);
  });

  it('ignores [DONE] and empty data lines', async () => {
    const stream = streamOf([
      'data: [DONE]\n\n' +
        'data: \n\n' +
        sse({ type: 'text-delta', id: '1', delta: 'x' }),
    ]);
    const chunks = await collect(stream);
    expect(chunks).toEqual([{ type: 'text-delta', id: '1', delta: 'x' }]);
  });

  it('emits unknown chunks for unrecognised types', async () => {
    const stream = streamOf([sse({ type: 'mystery', foo: 'bar' })]);
    const chunks = await collect(stream);
    expect(chunks).toEqual([
      { type: 'unknown', raw: { type: 'mystery', foo: 'bar' } },
    ]);
  });

  it('coerces missing fields to safe defaults', async () => {
    // delta missing -> ''  ; errorText missing -> 'unknown error'
    const stream = streamOf([
      sse({ type: 'text-delta', id: '1' }) + sse({ type: 'error' }),
    ]);
    const chunks = await collect(stream);
    expect(chunks).toEqual([
      { type: 'text-delta', id: '1', delta: '' },
      { type: 'error', errorText: 'unknown error' },
    ]);
  });

  it('stops yielding once the signal is aborted mid-stream', async () => {
    const controller = new AbortController();
    const enc = new TextEncoder();
    let secondChunkResolve: () => void = () => {};
    const secondChunkReady = new Promise<void>((r) => {
      secondChunkResolve = r;
    });

    const stream = new ReadableStream<Uint8Array>({
      async pull(c) {
        if (c.desiredSize == null) return;
        c.enqueue(enc.encode(sse({ type: 'text-delta', id: '1', delta: 'a' })));
        await secondChunkReady;
        c.enqueue(enc.encode(sse({ type: 'text-delta', id: '1', delta: 'b' })));
        c.close();
      },
    });

    const out: StreamChunk[] = [];
    for await (const chunk of parseDataStream(stream, controller.signal)) {
      out.push(chunk);
      controller.abort();
      secondChunkResolve();
    }
    expect(out).toEqual([{ type: 'text-delta', id: '1', delta: 'a' }]);
  });
});
