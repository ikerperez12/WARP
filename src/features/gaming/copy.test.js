import test from 'node:test';
import assert from 'node:assert/strict';
import { getAllCopy } from './copy.js';

function collectKeys(source, prefix = '', bucket = []) {
  Object.entries(source).forEach(([key, value]) => {
    const next = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) collectKeys(value, next, bucket);
    else bucket.push(next);
  });
  return bucket.sort();
}

test('copy keys stay aligned between es and en', () => {
  const copy = getAllCopy();
  assert.deepEqual(collectKeys(copy.es), collectKeys(copy.en));
});
