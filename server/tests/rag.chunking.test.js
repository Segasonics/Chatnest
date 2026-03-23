import test from 'node:test';
import assert from 'node:assert/strict';
import { splitIntoChunks } from '../src/services/rag/chunking.service.js';

test('splitIntoChunks creates multiple chunks for long text', () => {
  const input = `Pricing details `.repeat(220);
  const chunks = splitIntoChunks(input, { chunkSize: 200, overlap: 40 });
  assert.ok(chunks.length > 1);
  assert.ok(chunks.every((chunk) => chunk.length <= 220));
});
