import { expect, test, vi, beforeEach } from 'vitest';
import urBackend from '../src/index';

const mockApiKey = 'pk_live_test';
const client = urBackend({ apiKey: mockApiKey });

beforeEach(() => {
  vi.resetAllMocks();
});

test('getSchema returns collection schema', async () => {
  const mockSchema = {
    name: 'products',
    model: [
      { key: 'name', type: 'String', required: true },
      { key: 'price', type: 'Number', required: true }
    ]
  };
  
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ success: true, data: mockSchema }),
    }),
  );

  const schema = await client.schema.getSchema('products');
  expect(schema).toEqual(mockSchema);
  expect(schema.name).toBe('products');
});
