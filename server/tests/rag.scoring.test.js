import test from 'node:test';
import assert from 'node:assert/strict';
import { cosineSimilarity, lexicalScore } from '../src/services/rag/scoring.utils.js';

test('cosineSimilarity returns high score for matching vectors', () => {
  const value = cosineSimilarity([1, 2, 3], [1, 2, 3]);
  assert.ok(value > 0.99);
});

test('lexicalScore rewards overlapping business terms', () => {
  const score = lexicalScore(
    'what are your pricing plans',
    'our pricing plans include free pro and team'
  );
  assert.ok(score >= 0.4);
});
