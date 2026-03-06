import test from 'node:test';
import assert from 'node:assert/strict';
import { toText, toId, toSafeGithubUrl } from './helpers.js';

test('toText - should return the string with normalized whitespace', () => {
  assert.strictEqual(toText('  hello   world  '), 'hello world');
});

test('toText - should return fallback for empty string or only whitespace', () => {
  assert.strictEqual(toText('', 'fallback'), 'fallback');
  assert.strictEqual(toText('   ', 'fallback'), 'fallback');
});

test('toText - should return empty string as default fallback', () => {
  assert.strictEqual(toText(''), '');
});

test('toText - should return fallback for non-string inputs', () => {
  assert.strictEqual(toText(null, 'fallback'), 'fallback');
  assert.strictEqual(toText(undefined, 'fallback'), 'fallback');
  assert.strictEqual(toText(123, 'fallback'), 'fallback');
  assert.strictEqual(toText({}, 'fallback'), 'fallback');
});

test('toId - should convert to lowercase and replace non-alphanumeric with underscores', () => {
  assert.strictEqual(toId('Hello World!'), 'hello_world_');
  assert.strictEqual(toId('Project-123 @#$%'), 'project-123_____');
});

test('toId - should normalize whitespace before conversion', () => {
  assert.strictEqual(toId('  My   ID  '), 'my_id');
});

test('toId - should truncate to 80 characters', () => {
  const longStr = 'a'.repeat(100);
  assert.strictEqual(toId(longStr).length, 80);
});

test('toId - should handle empty or invalid inputs gracefully', () => {
  assert.strictEqual(toId(''), '');
  assert.strictEqual(toId(null), '');
});

test('toSafeGithubUrl - should return the valid https URL', () => {
  const validUrl = 'https://github.com/user/repo';
  assert.strictEqual(toSafeGithubUrl(validUrl), validUrl);
});

test('toSafeGithubUrl - should return fallback for non-https protocol', () => {
  const fallback = 'https://github.com/ikerperez12';
  assert.strictEqual(toSafeGithubUrl('http://github.com/user/repo'), fallback);
  assert.strictEqual(toSafeGithubUrl('ftp://github.com/user/repo'), fallback);
});

test('toSafeGithubUrl - should return fallback for URLs with credentials', () => {
  const fallback = 'https://github.com/ikerperez12';
  assert.strictEqual(toSafeGithubUrl('https://user:pass@github.com/repo'), fallback);
});

test('toSafeGithubUrl - should return fallback for non-string inputs', () => {
  const fallback = 'https://github.com/ikerperez12';
  assert.strictEqual(toSafeGithubUrl(null), fallback);
  assert.strictEqual(toSafeGithubUrl(123), fallback);
});

test('toSafeGithubUrl - should return fallback for invalid URLs', () => {
  const fallback = 'https://github.com/ikerperez12';
  assert.strictEqual(toSafeGithubUrl('not-a-url'), fallback);
  assert.strictEqual(toSafeGithubUrl('/repo'), fallback);
});

test('toSafeGithubUrl - should handle leading/trailing whitespace', () => {
  const url = '  https://github.com/user/repo  ';
  assert.strictEqual(toSafeGithubUrl(url), 'https://github.com/user/repo');
});
