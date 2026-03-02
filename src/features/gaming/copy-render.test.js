import test from 'node:test';
import assert from 'node:assert/strict';
import { formatCopy, getCopy } from './copy.js';

test('critical copy paths resolve for both locales', () => {
  for (const lang of ['es', 'en']) {
    const copy = getCopy(lang);
    assert.equal(typeof copy.hud.system, 'string');
    assert.equal(typeof copy.start.lead, 'string');
    assert.equal(typeof copy.pause.title, 'string');
    assert.equal(typeof copy.panel.progressValue, 'string');
    assert.equal(typeof copy.touch.interact, 'string');
    assert.equal(typeof copy.gameOver.securityLead, 'string');
  }
});

test('formatCopy renders progress strings with values', () => {
  const rendered = formatCopy(getCopy('es').panel.progressValue, { completed: 3, total: 5 });
  assert.equal(rendered, '3 / 5');
});
